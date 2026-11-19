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


def b64png(img):
    """Encode une image PIL en PNG base64 pour l'API."""
    import io
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return base64.b64encode(buf.getvalue()).decode()


def img2img_fields(a):
    """Champs img2img : 'init' (chemin sous sd_raw/), 'denoise', et 'mask' [x0, y0, x1, y1] optionnel (inpainting)."""
    from PIL import Image, ImageDraw
    init = Image.open(RAW / a['init']).convert('RGB')
    fields = {'init_images': [b64png(init)], 'denoising_strength': a.get('denoise', 0.6)}
    if a.get('mask'):
        mask = Image.new('L', init.size, 0)
        ImageDraw.Draw(mask).rectangle(a['mask'], fill=255)
        fields.update({'mask': b64png(mask), 'mask_blur': 6, 'inpainting_fill': 1,
                       'inpaint_full_res': True, 'inpaint_full_res_padding': 48})
    return fields


def generate(spec, name, n, url, seed0=None, profile=None):
    a = spec['assets'][name]
    cfg = spec['profiles'][profile] if profile else spec['model']
    lora = f" <lora:{cfg['lora']}>" if cfg.get('lora') else ''
    w, h = a.get('gen', spec['gen_size'])
    style = spec.get('style_' + a['kind'], spec['style_sprite'])  # style_bg, style_icon, sinon style_sprite
    base = seed0 if seed0 is not None else a.get('seed_base', 1000)
    for i in range(n):
        seed = base + i
        tag = profile or cfg.get('name')
        dst = RAW / name / (f'{tag}_{seed}.png' if tag else f'{seed}.png')
        if dst.exists():
            print('déjà là', dst.relative_to(ROOT)); continue
        payload = {
            'prompt': f"{cfg.get('prefix', '')}{style}, {a['prompt']}{lora}", 'negative_prompt': spec['negative'] + (', ' + a['negative_extra'] if a.get('negative_extra') else ''),
            'seed': seed, 'width': w, 'height': h, 'steps': cfg['steps'], 'cfg_scale': cfg['cfg'],
            'sampler_name': cfg['sampler'], 'scheduler': cfg.get('scheduler', 'Automatic'),
            'override_settings': {'sd_model_checkpoint': cfg['checkpoint']},
        }
        endpoint = 'txt2img'
        if a.get('init'):
            payload.update(img2img_fields(a))
            endpoint = 'img2img'
        img = post(url.rstrip('/') + f'/sdapi/v1/{endpoint}', payload)['images'][0]
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(base64.b64decode(img.split(',', 1)[-1]))
        print('écrit', dst.relative_to(ROOT))


def build(spec):
    sys.path.insert(0, str(ROOT / 'tools'))
    from pixelize import pixelize
    for name, a in spec['assets'].items():
        if a.get('seed') is None or a.get('build') is False:
            continue
        src = RAW / name / f"{a['seed']}.png"
        if not src.exists():
            print('manquant', src.relative_to(ROOT)); continue
        dst = OUT / f'{name}.png'
        sprite = a['kind'] != 'bg'
        px = spec.get('pixelize', {})
        size = pixelize(src, dst, a['size'], ROOT / spec['palette'], colors=a.get('colors', px.get('colors', 16) if sprite else 32),
                        sat=a.get('sat', px.get('sat', 1.35)),
                        bg='auto' if sprite else None, tol=a.get('tol', 120), crop=sprite, line=sprite)
        print('écrit', dst.relative_to(ROOT), size)


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('names', nargs='*', help='assets à générer (clés de sprites.json)')
    p.add_argument('--all', action='store_true')
    p.add_argument('-n', type=int, default=4, help='nombre de variantes')
    p.add_argument('--seed', type=int, help='première seed (défaut : seed_base de l\'asset)')
    p.add_argument('--profile', help="profil de modèle (clé de 'profiles' dans sprites.json) ; fichiers bruts préfixés par son nom")
    p.add_argument('--build', action='store_true', help='pixelise les seeds retenues vers assets/sprites/')
    p.add_argument('--url', default='http://127.0.0.1:7860')
    args = p.parse_args()
    spec = json.loads(SPEC.read_text(encoding='utf-8'))
    if args.build:
        build(spec)
    else:
        for name in (spec['assets'] if args.all else args.names):
            generate(spec, name, args.n, args.url, args.seed, args.profile)
