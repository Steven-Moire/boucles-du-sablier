"""Capture rapide du jeu dans Chromium (vérif visuelle après une modif).

  pip install playwright && playwright install chromium
  python tools/screenshot.py            -> screenshots/intro.png, intro2.png, map.png, combat.png, village.png,
                                           etroit-carte.png, etroit-combat.png (téléphone, 390 px de large),
                                           proto.png (prototype du minage)

Hors ligne : seul le serveur local répond, toute requête vers un autre domaine est listée à la fin.

Captures déterministes : horloge de Playwright en pause (le temps du jeu n'avance que par run_for),
Math.random remplacé par un générateur à graine fixe avant le chargement du jeu, polices, images et
animations CSS attendues avant chaque capture, rendu de Chromium figé (CHROMIUM_ARGS). Deux
lancements sur le même code donnent les mêmes images, au pixel près, le premier compris (comparer
avec tools/qa/compare_shots.py) : une différence est une vraie régression.
"""

import asyncio
import functools
import http.server
import threading
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'screenshots'
# même générateur congruentiel que src/shared/rng.js (lcg), graine fixe
SEEDED_RANDOM = """
(() => { let s = 12345;
  Math.random = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; })();
"""


TICK_MS = 50  # pas du moteur (src/world/tick.engine.js)
# rendu identique d'un lancement à l'autre : rendu logiciel, couleurs sRGB fixes, compositeur sans
# fil parallèle ni rastérisation partielle (sinon le bouton « Passer » de l'intro, en position fixe,
# était composé tantôt à part, tantôt avec la page : 1/255 d'écart au hasard)
CHROMIUM_ARGS = [
    '--disable-gpu',
    '--force-color-profile=srgb',
    '--disable-partial-raster',
    '--run-all-compositor-stages-before-draw',
    '--disable-threaded-animation',
    '--disable-threaded-scrolling',
    '--disable-checker-imaging',
    # hors ligne : aucun nom de domaine ne se résout, seul le serveur local (127.0.0.1) répond. Le jeu
    # est livré sans ressource externe ; une police ou un script d'un CDN ajouté par erreur échoue ici
    # et apparaît dans « requêtes externes » au lieu de passer inaperçu.
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
]
LOCAL = 'http://127.0.0.1:'
# attend les polices (Silkscreen, Inter : assets/fonts/), toutes les <img> du document, puis la fin
# des animations CSS finies (fondu de l'intro) : elles suivent le temps réel, pas l'horloge de Playwright
WAIT_ASSETS = """
async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].filter(i => !i.complete)
    .map(i => new Promise(ok => { i.addEventListener('load', ok); i.addEventListener('error', ok); })));
  await Promise.all(document.getAnimations()
    .filter(a => a.effect.getComputedTiming().endTime !== Infinity).map(a => a.finished.catch(() => {})));
}
"""


async def shoot(pg, name):
    """Capture une fois polices et images chargées, rien n'est laissé au temps réel."""
    await pg.evaluate(WAIT_ASSETS)
    await pg.screenshot(path=str(OUT / f'{name}.png'), animations='disabled')


def serve():
    """Les modules ES ne se chargent pas en file:// : on sert le dossier en HTTP sur un port libre."""

    class Quiet(http.server.SimpleHTTPRequestHandler):
        """Serveur de fichiers qui n'écrit rien sur la console."""

        def log_message(self, *args):
            """Journal des requêtes coupé : seules les erreurs JS comptent."""

    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


async def open_page(b, port, path, errors, external, viewport=None):
    """Ouvre une page du dépôt : hasard à graine fixe, horloge en pause, erreurs JS et requêtes externes notées."""
    pg = await b.new_page(viewport=viewport or {'width': 1280, 'height': 900})
    pg.on('pageerror', lambda e: errors.append(f'{path} : {e}'))
    pg.on('request', lambda r: None if r.url.startswith(LOCAL) else external.append(f'{path} : {r.url}'))
    await pg.add_init_script(SEEDED_RANDOM)
    await pg.clock.install(time=0)
    # installée seule, l'horloge suit le temps réel : un lancement lent (cache froid) jouait des
    # ticks de plus. En pause, le temps du jeu n'avance que par run_for.
    await pg.clock.pause_at(0)
    await pg.goto(f'{LOCAL}{port}/{path}', wait_until='networkidle')
    return pg


async def main():
    """Joue l'intro, la carte, un combat, le village, carte et combat en étroit, le prototype ; liste les erreurs."""
    OUT.mkdir(exist_ok=True)
    srv = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch(args=CHROMIUM_ARGS)
        errors, external = [], []
        pg = await open_page(b, srv.server_port, 'index.html', errors, external)
        await pg.clock.run_for(800)
        # navigateur neuf = pas de sauvegarde : l'intro s'affiche, on la capture puis on la passe
        await shoot(pg, 'intro')
        await pg.click('#intro')
        await pg.clock.run_for(700)
        await shoot(pg, 'intro2')
        await pg.click('.in-skip')
        await pg.clock.run_for(300)
        await shoot(pg, 'map')
        await pg.click('#speed button[data-s="2"]')
        await pg.dblclick('.tile[data-id="4,5"]')
        await pg.clock.run_for(2500)
        # le fond de scène n'est posé qu'une fois son image chargée, au rendu suivant
        await pg.wait_for_selector('#sceneView.has-bg', state='attached')
        await pg.clock.run_for(TICK_MS)
        await shoot(pg, 'combat')
        # onglet Village du panneau de droite (après le combat : les captures d'avant ne bougent pas)
        await pg.click('#tabs button[data-t="village"]')
        await pg.clock.run_for(TICK_MS)
        await shoot(pg, 'village')
        # écran étroit (téléphone), dans sa propre page : les captures d'avant ne bougent pas
        pg = await open_page(b, srv.server_port, 'index.html', errors, external, {'width': 390, 'height': 844})
        await pg.clock.run_for(800)
        await pg.click('.in-skip')
        await pg.clock.run_for(300)
        await shoot(pg, 'etroit-carte')
        await pg.click('#speed button[data-s="2"]')
        await pg.dblclick('.tile[data-id="4,5"]')
        await pg.clock.run_for(2500)
        await pg.wait_for_selector('#sceneView.has-bg', state='attached')
        await pg.clock.run_for(TICK_MS)
        await shoot(pg, 'etroit-combat')
        # prototype du minage (proto/), dans sa propre page : les captures du jeu ne bougent pas
        pg = await open_page(b, srv.server_port, 'proto/mine-ennemi.html', errors, external)
        await pg.clock.run_for(800)
        await shoot(pg, 'proto')
        await b.close()
        srv.shutdown()
        print('erreurs JS :', errors or 'aucune')
        print('requêtes externes :', external or 'aucune')


if __name__ == '__main__':
    asyncio.run(main())
