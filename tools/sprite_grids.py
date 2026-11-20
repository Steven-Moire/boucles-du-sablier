"""Précalcule la grille de pixels de chaque monstre pour le combat-minage → src/enemies/grids.generated.js.

Le moteur (src/mining/strata.engine.js) reste pur : il ne lit jamais d'image, il lit ces grilles.
Pour chaque pixel opaque du sprite : profondeur (distance au vide, en 4-voisinage),
contour sombre (croûte) et veine brillante (pixel très saturé et lumineux, ex. cristal du golem).

Encodage d'une grille : une chaîne de w × h caractères, ligne par ligne :
  '.' vide · 'c' croûte · 'v' veine brillante · sinon chr(48 + profondeur)

  python tools/sprite_grids.py        (à relancer après tout changement de sprite de monstre)

Dépendance : pillow
"""

import colorsys
import json
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MONSTERS = ['mulot', 'sanglier', 'sanglier_alpha', 'loup', 'golem', 'ours', 'gardien']
DARK = 0.2  # luminosité sous laquelle un pixel est un contour (croûte)
VEIN_SAT = 0.7  # saturation et luminosité minimales d'une veine brillante
VEIN_HUES = ((165, 250), (38, 60))  # cyan / bleu, or
NEIGHBORS = ((1, 0), (-1, 0), (0, 1), (0, -1))  # 4-voisinage


def is_vein(r, g, b):
    """Pixel très saturé, lumineux, cyan/bleu ou or : une veine visible dans le sprite."""
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    h *= 360
    return s >= VEIN_SAT and v >= VEIN_SAT and any(a < h < b for a, b in VEIN_HUES)


def is_edge(solid, x, y):
    """Pixel qui touche le vide ou le bord de l'image : profondeur 1."""
    h, w = len(solid), len(solid[0])
    return any(not (0 <= x + dx < w and 0 <= y + dy < h) or not solid[y + dy][x + dx] for dx, dy in NEIGHBORS)


def depths(solid):
    """Profondeur de chaque pixel opaque : distance au vide en 4-voisinage (parcours en largeur)."""
    h, w = len(solid), len(solid[0])
    depth = [[0] * w for _ in range(h)]
    q = deque()
    for y in range(h):
        for x in range(w):
            if solid[y][x] and is_edge(solid, x, y):
                depth[y][x] = 1
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in NEIGHBORS:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and solid[ny][nx] and not depth[ny][nx]:
                depth[ny][nx] = depth[y][x] + 1
                q.append((nx, ny))
    return depth


def cell(rgba, is_solid, depth):
    """Caractère d'un pixel : vide, croûte, veine brillante ou profondeur."""
    if not is_solid:
        return '.'
    r, g, b, _ = rgba
    if colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)[2] < DARK:
        return 'c'
    if is_vein(r, g, b):
        return 'v'
    return chr(48 + min(depth, 40))


def grid(path):
    """Grille encodée d'un sprite (voir l'en-tête du module)."""
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    px = im.load()
    solid = [[px[x, y][3] >= 128 for x in range(w)] for y in range(h)]
    depth = depths(solid)
    cells = ''.join(cell(px[x, y], solid[y][x], depth[y][x]) for y in range(h) for x in range(w))
    return {'w': w, 'h': h, 'cells': cells}


def main():
    """Écrit src/enemies/grids.generated.js et affiche la taille de chaque grille."""
    grids = {m: grid(ROOT / 'assets' / 'sprites' / f'{m}.png') for m in MONSTERS}
    body = ',\n'.join(f'  {m}: {json.dumps(g)}' for m, g in grids.items())
    js = (
        '// Généré par tools/sprite_grids.py depuis assets/sprites/ — ne pas éditer à la main.\n'
        "// '.' vide · 'c' croûte · 'v' veine brillante · sinon chr(48 + profondeur)\n"
        f'export const GRIDS = {{\n{body}\n}};\n'
    )
    (ROOT / 'src' / 'enemies' / 'grids.generated.js').write_text(js, encoding='utf-8', newline='\n')
    for m, g in grids.items():
        print(m, g['w'], 'x', g['h'], 'opaques', sum(c != '.' for c in g['cells']))


if __name__ == '__main__':
    main()
