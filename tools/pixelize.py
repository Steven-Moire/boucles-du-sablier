"""Transforme une image Stable Diffusion en vrai sprite pixel art.

Étapes : détourage optionnel (remplissage depuis les bords) -> recadrage sur le sujet
-> réduction à la taille cible (alpha prémultiplié, pas de halo) -> réduction à N couleurs
(aplats) puis verrouillage sur la palette (.hex Lospec) -> contour sombre optionnel
-> agrandissement xN pour l'aperçu.

Exemples :
  python tools/pixelize.py sd_mineur.png assets/sprites/hero.png --size 64 --palette docs/palette.hex --bg auto
  python tools/pixelize.py sd_loup.png assets/sprites/loup.png --size 48 --bg auto --outline --preview 4

Dépendance : pip install pillow
"""

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

RGBA = 'RGBA'
BG_STEP = 18  # écart de couleur maximal entre deux voisins du fond (pas du remplissage)


def load_palette(path):
    """Couleurs RGB d'un fichier .hex (une couleur par ligne, '#' facultatif)."""
    cols = []
    for line in Path(path).read_text().splitlines():
        line = line.strip().lstrip('#')
        if len(line) == 6:
            cols.append(tuple(int(line[i : i + 2], 16) for i in (0, 2, 4)))
    if not cols:
        raise SystemExit(f'Palette vide : {path}')
    return cols


def lab(c):
    """sRGB (0-255) -> CIELAB (D65) : distance perceptuelle, garde les bruns bruns au lieu de les griser."""

    def lin(v):
        """Composante sRGB (0-255) -> linéaire (0-1)."""
        v /= 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

    def f(t):
        """Fonction de compression de CIELAB."""
        return t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116

    r, g, b = (lin(v) for v in c)
    x, y, z = (
        (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047,
        r * 0.2126 + g * 0.7152 + b * 0.0722,
        (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883,
    )
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


def nearest(c, cols):
    """Couleur de cols la plus proche de c à l'œil (distance dans CIELAB)."""
    lc = lab(c)
    return min(cols, key=lambda p: sum((a - b) ** 2 for a, b in zip(lab(p), lc, strict=True)))


def dist(a, b):
    """Distance entre deux couleurs RGB (somme des écarts)."""
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def border(w, h):
    """Coordonnées des pixels des bords : haut et bas, puis gauche et droite."""
    return [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]


@dataclass(frozen=True)
class Fill:
    """Image réduite du détourage : pixels, taille, couleur médiane des bords et tolérance."""

    px: object
    w: int
    h: int
    ref: tuple
    tol: int

    def near_ref(self, c):
        """Couleur assez proche de celle des bords pour appartenir au fond."""
        return dist(c, self.ref) <= self.tol


def grow(fill, stack, mark, val):
    """Étend une région de proche en proche depuis stack (vidée), marque val dans mark, renvoie la région."""
    px, w, h = fill.px, fill.w, fill.h
    region = list(stack)
    while stack:
        x, y = stack.pop()
        c = px[x, y]
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not mark[ny * w + nx]:
                n = px[nx, ny]
                if dist(n, c) <= BG_STEP and fill.near_ref(n):
                    mark[ny * w + nx] = val
                    stack.append((nx, ny))
                    region.append((nx, ny))
    return region


def row_means(fill, bg):
    """Couleur moyenne du fond déjà détouré, ligne par ligne."""
    rows = {}
    for y in range(fill.h):
        cs = [fill.px[x, y] for x in range(fill.w) if bg[y * fill.w + x]]
        if cs:
            rows[y] = tuple(sum(c[i] for c in cs) / len(cs) for i in range(3))
    return rows


def is_hole(fill, region, rows):
    """Région assez grande, presque toute de la couleur du fond de ses lignes : un trou fermé."""
    if len(region) < fill.w * fill.h // 800:
        return False
    ok = [dist(fill.px[rx, ry], rows[ry]) <= 30 for rx, ry in region if ry in rows]
    return bool(ok) and sum(ok) > 0.9 * len(region)


def fill_holes(fill, bg):
    """Ajoute au fond les trous fermés (entre les jambes, sous un bras…) : zones lisses de la couleur du fond."""
    w = fill.w
    rows = row_means(fill, bg)
    seen = bytearray(bg)
    for y in range(fill.h):
        for x in range(w):
            if seen[y * w + x] or not fill.near_ref(fill.px[x, y]):
                continue
            seen[y * w + x] = 2
            region = grow(fill, [(x, y)], seen, 2)
            if is_hole(fill, region, rows):
                for rx, ry in region:
                    bg[ry * w + rx] = 1


def remove_bg(img, tol, work=384):
    """Rend transparent le fond connecté aux bords, même en dégradé ou vignette (fonds de SD).

    Remplissage de proche en proche : un pixel rejoint le fond si sa couleur est proche de celle
    de son voisin déjà dans le fond (pas `step`) ET pas trop loin de la couleur des bords (`tol`).
    Le dégradé passe, le contour du sujet fait barrage. Calcul sur une version réduite, masque agrandi.
    """
    img = img.convert(RGBA)
    small = img.convert('RGB').resize((work, work * img.height // img.width), Image.Resampling.BOX)
    w, h = small.size
    px = small.load()
    edge = border(w, h)
    colors = [px[x, y] for x, y in edge]
    ref = tuple(sorted(c[i] for c in colors)[len(colors) // 2] for i in range(3))  # médiane des bords
    fill = Fill(px, w, h, ref, tol)
    bg = bytearray(w * h)
    stack = [(x, y) for x, y in edge if fill.near_ref(px[x, y])]
    for x, y in stack:
        bg[y * w + x] = 1
    grow(fill, stack, bg, 1)
    fill_holes(fill, bg)
    mask = Image.frombytes('L', (w, h), bytes(0 if b else 255 for b in bg)).resize(img.size, Image.Resampling.NEAREST)
    img.putalpha(mask)
    return img


def outline(img, color):
    """Ajoute un contour d'un pixel autour des pixels opaques (à l'extérieur)."""
    a = img.getchannel('A')
    grown = a.filter(ImageFilter.MaxFilter(3))
    ring = Image.new(RGBA, img.size, color + (255,))
    out = Image.new(RGBA, img.size, (0, 0, 0, 0))
    out.paste(ring, mask=grown)
    out.alpha_composite(img)
    return out


def pixelize(src, dst, size, palette=None, colors=16, bg=None, tol=120, preview=1, crop=True, line=False, sat=1.35):
    """Pixelise src vers dst (voir l'en-tête du module) et renvoie la taille de l'image écrite."""
    img = Image.open(src).convert(RGBA)
    if bg == 'auto':
        img = remove_bg(img, tol)
    if crop and img.getbbox():
        img = img.crop(img.getchannel('A').point(lambda a: 255 if a > 128 else 0).getbbox())
    inner = size - 2 if line else size
    w, h = img.size
    scale = inner / max(w, h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    small = img.convert('RGBa').resize((nw, nh), Image.Resampling.BOX).convert(RGBA)
    alpha = small.getchannel('A').point(lambda a: 255 if a > 128 else 0)  # alpha binaire
    rgb = ImageEnhance.Color(small.convert('RGB')).enhance(sat)  # pixel art = couleurs franches, évite le gris
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    if palette:
        cols = load_palette(palette)
        flat = q.getpalette()[: colors * 3]
        mapped = [c for i in range(0, len(flat), 3) for c in nearest(tuple(flat[i : i + 3]), cols)]
        q.putpalette(mapped + [0] * (768 - len(mapped)))
    out = q.convert(RGBA)
    out.putalpha(alpha)
    if line:
        pad = Image.new(RGBA, (nw + 2, nh + 2), (0, 0, 0, 0))
        pad.paste(out, (1, 1))
        dark = min(load_palette(palette), key=sum) if palette else (34, 28, 40)
        out = outline(pad, dark)
    if preview > 1:
        out = out.resize((out.width * preview, out.height * preview), Image.Resampling.NEAREST)
    Path(dst).parent.mkdir(parents=True, exist_ok=True)
    out.save(dst)
    return out.size


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('src')
    p.add_argument('dst')
    p.add_argument('--size', type=int, default=64, help='taille cible du côté le plus long, en pixels (32, 48, 64…)')
    p.add_argument('--palette', help='fichier .hex (une couleur par ligne), ex. palette Lospec')
    p.add_argument(
        '--colors', type=int, default=16, help='nombre de couleurs (aplats) avant verrouillage sur la palette'
    )
    p.add_argument('--bg', choices=['auto'], help='auto : détoure le fond connecté aux bords')
    p.add_argument('--tol', type=int, default=120, help='tolérance du détourage')
    p.add_argument('--no-crop', action='store_true', help='ne pas recadrer sur le sujet')
    p.add_argument(
        '--outline', action='store_true', help="contour sombre d'un pixel (couleur la plus sombre de la palette)"
    )
    p.add_argument('--sat', type=float, default=1.35, help='saturation avant verrouillage palette (1 = inchangée)')
    p.add_argument('--preview', type=int, default=1, help='agrandissement xN (1 = taille réelle, à garder pour le jeu)')
    a = p.parse_args()
    print(
        'écrit',
        a.dst,
        pixelize(a.src, a.dst, a.size, a.palette, a.colors, a.bg, a.tol, a.preview, not a.no_crop, a.outline, a.sat),
    )
