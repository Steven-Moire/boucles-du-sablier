"""Capture rapide du jeu dans Chromium (vérif visuelle après une modif).

  pip install playwright && playwright install chromium
  python tools/screenshot.py            -> screenshots/intro.png, intro2.png, map.png, combat.png

Captures déterministes : horloge de Playwright (le temps n'avance que quand on le demande) et
Math.random remplacé par un générateur à graine fixe avant le chargement du jeu. Deux lancements
sur le même code donnent les mêmes images, au pixel près (comparer avec tools/qa/compare_shots.py).
"""
import asyncio
import functools
import http.server
import threading
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'screenshots'
# même générateur congruentiel que src/rng.js (lcg), graine fixe
SEEDED_RANDOM = """
(() => { let s = 12345;
  Math.random = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; })();
"""


def serve():
    """Les modules ES ne se chargent pas en file:// : on sert le dossier en HTTP sur un port libre."""
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


async def main():
    OUT.mkdir(exist_ok=True)
    srv = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1280, 'height': 900})
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        await pg.add_init_script(SEEDED_RANDOM)
        await pg.clock.install(time=0)
        await pg.goto(f'http://127.0.0.1:{srv.server_port}/index.html', wait_until='networkidle')
        await pg.clock.run_for(800)
        # navigateur neuf = pas de sauvegarde : l'intro s'affiche, on la capture puis on la passe
        await pg.screenshot(path=str(OUT / 'intro.png'), animations='disabled')
        await pg.click('#intro')
        await pg.clock.run_for(700)
        await pg.screenshot(path=str(OUT / 'intro2.png'), animations='disabled')
        await pg.click('.in-skip')
        await pg.clock.run_for(300)
        await pg.screenshot(path=str(OUT / 'map.png'), animations='disabled')
        await pg.click('#speed button[data-s="2"]')
        await pg.dblclick('.tile[data-id="4,5"]')
        await pg.clock.run_for(2500)
        await pg.screenshot(path=str(OUT / 'combat.png'), animations='disabled')
        await b.close()
        srv.shutdown()
        print('erreurs JS :', errors or 'aucune')

asyncio.run(main())
