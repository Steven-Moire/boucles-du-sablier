"""Capture rapide du jeu dans Chromium (vérif visuelle après une modif).

  pip install playwright && playwright install chromium
  python tools/screenshot.py            -> screenshots/map.png, screenshots/combat.png
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'screenshots'


async def main():
    OUT.mkdir(exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1280, 'height': 900})
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        await pg.goto((ROOT / 'index.html').as_uri())
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=str(OUT / 'map.png'))
        await pg.click('#speed button[data-s="2"]')
        await pg.dblclick('.tile[data-id="4,5"]')
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path=str(OUT / 'combat.png'))
        await b.close()
        print('erreurs JS :', errors or 'aucune')

asyncio.run(main())
