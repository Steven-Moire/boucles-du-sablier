"""Transforme une image Stable Diffusion en vrai sprite pixel art.

Étapes : détourage optionnel par couleur de fond -> réduction "nearest" à la taille cible
-> quantification sur une palette fixe (fichier .hex de Lospec) -> agrandissement xN pour l'aperçu.

Exemples :
  python tools/pixelize.py sd_mineur.png assets/sprites/hero.png --size 64 --palette docs/palette.hex
  python tools/pixelize.py sd_loup.png assets/sprites/loup.png --size 48 --bg auto --preview 4

Dépendance : pip install pillow
"""
import argparse
from pathlib import Path
from PIL import Image


def load_palette(path):
    cols = []
    for line in Path(path).read_text().splitlines():
        line = line.strip().lstrip('#')
        if len(line) == 6:
            cols.append(tuple(int(line[i:i + 2], 16) for i in (0, 2, 4)))
    if not cols:
        raise SystemExit(f'Palette vide : {path}')
    pal_img = Image.new('P', (1, 1))
    flat = [c for rgb in cols for c in rgb]
    pal_img.putpalette(flat + flat[:3] * (256 - len(cols)))   # complète avec la 1re couleur
    return pal_img, len(cols)


def remove_bg(img, tol):
    """Rend transparents les pixels proches de la couleur du coin haut-gauche (fond uni de SD)."""
    img = img.convert('RGBA')
    bg = img.getpixel((0, 0))[:3]
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) <= tol:
                px[x, y] = (r, g, b, 0)
    return img


def pixelize(src, dst, size, palette=None, colors=24, bg=None, tol=60, preview=1):
    img = Image.open(src).convert('RGBA')
    if bg == 'auto':
        img = remove_bg(img, tol)
    # garde le ratio, côté le plus long = size
    w, h = img.size
    scale = size / max(w, h)
    small = img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.Resampling.BOX)
    alpha = small.getchannel('A').point(lambda a: 255 if a > 128 else 0)   # alpha binaire, pas de demi-pixels
    rgb = small.convert('RGB')
    if palette:
        pal_img, _ = load_palette(palette)
        q = rgb.quantize(palette=pal_img, dither=Image.Dither.NONE)
    else:
        q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    out = q.convert('RGBA')
    out.putalpha(alpha)
    if preview > 1:
        out = out.resize((out.width * preview, out.height * preview), Image.Resampling.NEAREST)
    Path(dst).parent.mkdir(parents=True, exist_ok=True)
    out.save(dst)
    return out.size


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('src'); p.add_argument('dst')
    p.add_argument('--size', type=int, default=64, help='taille cible du côté le plus long, en pixels (32, 48, 64…)')
    p.add_argument('--palette', help='fichier .hex (une couleur par ligne), ex. palette Lospec')
    p.add_argument('--colors', type=int, default=24, help='nombre de couleurs si pas de palette')
    p.add_argument('--bg', choices=['auto'], help='auto : détoure le fond uni')
    p.add_argument('--tol', type=int, default=60, help='tolérance du détourage')
    p.add_argument('--preview', type=int, default=1, help='agrandissement xN (1 = taille réelle, à garder pour le jeu)')
    a = p.parse_args()
    print('écrit', a.dst, pixelize(a.src, a.dst, a.size, a.palette, a.colors, a.bg, a.tol, a.preview))
