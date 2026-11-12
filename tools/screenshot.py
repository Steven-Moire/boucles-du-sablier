"""Capture rapide du jeu dans Chromium (vérif visuelle après une modif).

  pip install playwright && playwright install chromium
  python tools/screenshot.py            -> screenshots/map.png, screenshots/combat.png
"""
import asyncio
import functools
import http.server
import threading
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'screenshots'


def serve():
    """Les modules ES ne se chargent pas en file:// : on sert le dossier en HTTP sur un port libre."""
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a: None
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
        await pg.goto(f'http://127.0.0.1:{srv.server_port}/index.html')
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=str(OUT / 'map.png'))
        await pg.click('#speed button[data-s="2"]')
        await pg.dblclick('.tile[data-id="4,5"]')
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path=str(OUT / 'combat.png'))
        await b.close()
        srv.shutdown()
        print('erreurs JS :', errors or 'aucune')

asyncio.run(main())
