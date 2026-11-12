"""Génère les images brutes via l'API de Stable Diffusion Forge / A1111 (lancé avec --api).

Les assets (prompt, taille, seed retenue) sont décrits dans tools/sprites.json.
Les images brutes vont dans sd_raw/<nom>/<seed>.png (non versionné) ; on choisit ensuite
la meilleure variante, on note sa seed dans sprites.json, puis :
  python tools/sd_generate.py --build      -> pixelise les seeds retenues dans assets/sprites/

Exemples :
  python tools/sd_generate.py heros loup -n 6       # 6 variantes de chaque
  python tools/sd_generate.py --all -n 4
  python tools/sd_generate.py --build

Dépendance : pillow (pour --build). L'API est sur http://127.0.0.1:7860 par défaut (--url).
"""
import argparse
import base64
import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / 'tools' / 'sprites.json'
RAW = ROOT / 'sd_raw'
OUT = ROOT / 'assets' / 'sprites'


def post(url, payload):
    req = urllib.request.Request(url, json.dumps(payload).encode(), {'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.load(r)


def generate(spec, name, n, url, seed0=None):
    a = spec['assets'][name]
    cfg = spec['model']
    w, h = a.get('gen', spec['gen_size'])
    style = spec['style_bg'] if a['kind'] == 'bg' else spec['style_sprite']
    base = seed0 if seed0 is not None else a.get('seed_base', 1000)
    for i in range(n):
        seed = base + i
        dst = RAW / name / f'{seed}.png'
        if dst.exists():
            print('déjà là', dst.relative_to(ROOT)); continue
        payload = {
            'prompt': f"{style}, {a['prompt']}", 'negative_prompt': spec['negative'],
            'seed': seed, 'width': w, 'height': h, 'steps': cfg['steps'], 'cfg_scale': cfg['cfg'],
            'sampler_name': cfg['sampler'], 'scheduler': cfg.get('scheduler', 'Automatic'),
            'override_settings': {'sd_model_checkpoint': cfg['checkpoint']},
        }
        img = post(url.rstrip('/') + '/sdapi/v1/txt2img', payload)['images'][0]
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(base64.b64decode(img.split(',', 1)[-1]))
        print('écrit', dst.relative_to(ROOT))


def build(spec):
    sys.path.insert(0, str(ROOT / 'tools'))
    from pixelize import pixelize
    for name, a in spec['assets'].items():
        if a.get('seed') is None:
            continue
        src = RAW / name / f"{a['seed']}.png"
        if not src.exists():
            print('manquant', src.relative_to(ROOT)); continue
        dst = OUT / f'{name}.png'
        sprite = a['kind'] != 'bg'
        size = pixelize(src, dst, a['size'], ROOT / spec['palette'], colors=a.get('colors', 16 if sprite else 24),
                        bg='auto' if sprite else None, tol=a.get('tol', 120), crop=sprite, line=sprite)
        print('écrit', dst.relative_to(ROOT), size)


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('names', nargs='*', help='assets à générer (clés de sprites.json)')
    p.add_argument('--all', action='store_true')
    p.add_argument('-n', type=int, default=4, help='nombre de variantes')
    p.add_argument('--seed', type=int, help='première seed (défaut : seed_base de l\'asset)')
    p.add_argument('--build', action='store_true', help='pixelise les seeds retenues vers assets/sprites/')
    p.add_argument('--url', default='http://127.0.0.1:7860')
    args = p.parse_args()
    spec = json.loads(SPEC.read_text(encoding='utf-8'))
    if args.build:
        build(spec)
    else:
        for name in (spec['assets'] if args.all else args.names):
            generate(spec, name, args.n, args.url, args.seed)
