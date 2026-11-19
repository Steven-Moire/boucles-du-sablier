"""Compare les captures de tools/screenshot.py à un dossier de référence, pixel par pixel.

  python tools/qa/compare_shots.py <dossier_reference> [dossier_captures] [--tol 0.05]

Affiche, pour chaque image, la part de pixels différents et la zone qui a changé.
Code de sortie 1 si une image manque ou diffère de plus de --tol % de ses pixels (0 par défaut).
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent.parent


def compare(ref: Path, got: Path) -> tuple[float, tuple[int, int, int, int] | None]:
    """Renvoie la part de pixels différents (0 à 1) et le rectangle qui les contient."""
    a, b = Image.open(ref).convert('RGB'), Image.open(got).convert('RGB')
    if a.size != b.size:
        return 1.0, (0, 0, *b.size)
    diff = ImageChops.difference(a, b)
    box = diff.getbbox()
    if box is None:
        return 0.0, None
    changed = diff.convert('L').point(lambda v: 255 if v else 0).histogram()[255]
    return changed / (a.width * a.height), box


def main() -> int:
    """Compare chaque image de référence à la capture du même nom."""
    args = sys.argv[1:]
    tol = 0.0
    if '--tol' in args:
        k = args.index('--tol')
        tol = float(args[k + 1]) / 100
        del args[k:k + 2]
    if not args:
        print(__doc__)
        return 2
    ref_dir = Path(args[0])
    got_dir = Path(args[1]) if len(args) > 1 else ROOT / 'screenshots'
    failed = 0
    for ref in sorted(ref_dir.glob('*.png')):
        got = got_dir / ref.name
        if not got.exists():
            print(f'{ref.name} : capture absente')
            failed += 1
            continue
        part, box = compare(ref, got)
        print(f'{ref.name} : identique' if box is None else f'{ref.name} : {part:.3%} des pixels différents, zone {box}')
        failed += part > tol
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
