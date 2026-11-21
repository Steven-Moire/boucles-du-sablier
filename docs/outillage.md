# Outillage — commandes, venv, qualité, sprites

À lire avant de toucher à `tools/`, aux venv, aux dépendances Python ou aux sprites. Les règles absolues (venv, uniformité) sont dans `CLAUDE.md`.

## Jouer et équilibrer
- Jouer en local : `python -m http.server` puis http://localhost:8000 (les modules ES ne se chargent **pas** en ouvrant `index.html` en `file://`).
- Équilibrage : `node tools/sim.js` → affiche la trace d'une partie, la boucle où le boss tombe sur 10 graines, puis les matériaux extraits au boss (médiane).
  **Cible actuelle : boss entre la 8e et la 13e boucle, médiane entre 9 et 12 (~12-20 min en ×1).** Relancer après toute modif de chiffres.
  `node tools/sim.js --outils` : la même partie avec chaque outil (pioche / marteau / coutelas) gardé du début à la fin.
  `node tools/sim.js --malin` : bot qui choisit l'outil selon la case. `node tools/sim.js --moyen` : bot « humain moyen » (`tools/sim-moyen.js` : carnet suivi une fois sur deux, farm une fois sur quatre, retraite sous 30 % de PV, achats et forge au hasard ; son hasard ne touche jamais `G.rng` ni `G.mrng`), affiche aussi la part de boucles finies par la mort à partir de la 3e.
  `--graines N` (avec la sortie par défaut, `--malin` ou `--moyen`) : N parties au lieu de 10, les 10 premières restent les mêmes ; juger l'équilibrage sur `--graines 30`.

## Environnements Python
- **WSL** : `uv venv .venv && uv pip sync -p .venv --require-hashes requirements-dev.txt && .venv/bin/playwright install chromium` (une fois : `sudo .venv/bin/playwright install-deps chromium`). Installe aussi ruff. `sync` rend le venv conforme au fichier verrouillé (paquets en trop retirés), `--require-hashes` refuse tout fichier téléchargé dont le hash diffère.
- **Windows** (pour Forge et `npm run lint`) : `uv venv -p 3.12 .venv-win && uv pip sync -p .venv-win --require-hashes requirements-dev.txt` (même fichier ; playwright y est installé sans servir, les captures se font sous WSL). `.venv/` est le venv WSL, le même dossier vu des deux côtés : d'où un dossier à part.
- **Dépendances** : `requirements-dev.in` (paquets directs, versions exactes, source qu'on édite) → `requirements-dev.txt` (généré : graphe complet, transitives comprises, avec hashes, valable pour WSL 3.10 et Windows 3.12) par `uv pip compile --universal --generate-hashes --python-version 3.10 requirements-dev.in -o requirements-dev.txt`, depuis la racine.
- **`requirements-dev.txt` est généré, jamais édité à la main.** Changer une version : modifier `requirements-dev.in`, regénérer (`uv pip compile`, commande ci-dessus), refaire `uv pip sync --require-hashes` dans `.venv` et `.venv-win`, le tout dans le même commit.

## Qualité du code
- `package.json` : `"type": "module"` pour Node, scripts de vérification, et `devDependencies` de lint seulement (ESLint + règles SonarQube, versions exactes, jamais importées par `src/`). `eslint.config.js` : bonnes pratiques, règles SonarQube, séparation des couches (le moteur n'a pas les globals navigateur), cycles d'imports interdits.
- `npm install` une fois (outils de lint, ~60 Mo dans `node_modules/`, non versionné), puis `npm run lint` et `npm run check` (lint + tests du moteur `npm test`, `tests/*.test.js` avec `node:test` + simu identique aux références).
- Mise en forme : Prettier (`.prettierrc.json`, guillemets simples, largeur 120) et, pour le Python de `tools/`, ruff (`ruff.toml` : mêmes réglages, règles D1, I, C901, E, F, W, B, SIM, UP, Python 3.10) ; `npm run format` écrit les deux, `npm run lint` vérifie les deux (`ruff check` et `ruff format --check`) ; jamais de mise en forme à la main.
- `npm run lint` et `format` lancent le ruff du venv par `tools/qa/ruff.js` (`.venv-win/` sous Windows, seul système où Node est installé ; `.venv/` ailleurs), jamais celui du PATH : venv absent = erreur avec la commande pour le créer.
- Refactoring : les références ne bougent pas ; changement de gameplay voulu : `node tools/qa/check-sim.js --update` dans le même commit.

## `tools/qa/`
- `check-sim.js` : simu comparée octet pour octet aux références de `tools/qa/ref/` (`sim.txt`, `sim-outils.txt`, `sim-malin.txt`, `sim-moyen.txt`).
- `compare_shots.py` : captures comparées pixel par pixel.
- `ruff.js` : lance le ruff du venv pour `npm run lint` / `format` ; même sortie sous Windows et sous WSL (chemins écrits avec des `/`, sans couleurs).
- `check-tools.sh` : sorties et empreintes des scripts Python de `tools/`, à lancer avant / après une modif : `bash tools/qa/check-tools.sh <étiquette>` sous WSL, `bash tools/qa/check-tools.sh <étiquette> .venv-win/Scripts/python.exe` depuis Git Bash sous Windows. Sous Windows, `log.txt` est identique à WSL, mais comparer les PNG avec `compare_shots.py`, pas les empreintes : le Pillow Windows compresse avec zlib-ng.

## Vérification visuelle
`.venv/bin/python tools/screenshot.py` (Playwright) → `screenshots/` (5 écrans du jeu en 1280 × 900, `etroit-carte.png` et `etroit-combat.png` en 390 × 844 pour l'écran de téléphone, + `proto.png`, le prototype), et liste les erreurs JS et les requêtes externes (Chromium hors ligne : seul le serveur local répond, attendu `aucune`). Captures déterministes (horloge Playwright, `Math.random` à graine fixe) ; comparer à des captures d'avant : `.venv/bin/python tools/qa/compare_shots.py <dossier> [--tol 0.05]`.

## Sprites (Stable Diffusion Forge)
- Prompts et seeds retenues dans `tools/sprites.json`. Forge tourne sous Windows (API sur :7860) → lancer depuis Windows :
  `.venv-win\Scripts\python tools/sd_generate.py <nom> -n 6` (variantes brutes dans `sd_raw/`), noter la meilleure seed dans `sprites.json`, puis `.venv-win\Scripts\python tools/sd_generate.py --build` (→ `assets/sprites/`).
- À la main : `.venv-win\Scripts\python tools/pixelize.py <image SD> assets/sprites/<nom>.png --size 48 --palette docs/palette.hex --bg auto --outline`.
- Après tout changement d'un sprite de monstre : `.venv-win\Scripts\python tools/sprite_grids.py` (Windows, ou `.venv/bin/python` sous WSL ; régénère `src/enemies/grids.generated.js`, à ne jamais éditer à la main), puis relancer la simu.
- Pipeline artistique (modèle, LoRA, palette, retouches) : `docs/art-direction.md`.
