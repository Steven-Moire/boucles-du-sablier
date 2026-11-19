# Les Boucles du Sablier — contexte pour Claude Code

Jeu incrémental / idle à boucle temporelle, jouable dans le navigateur. Projet perso de Steven (AI engineer Python/web, pas game dev) : on avance par petits incréments jouables.
**Toujours répondre en français.** Les textes du jeu sont en français.

## État actuel (v0.3, découpé en modules)
Modules ES natifs, aucune dépendance livrée au joueur, aucun build. Déployé tel quel sur GitHub Pages.
- `index.html` : squelette HTML, charge les 13 feuilles CSS de zone (dans l'ordre de l'ancien `style.css`, la cascade en dépend) et `src/app/main.js` (`<script type="module">`).
- `src/` : **un dossier par domaine**, en anglais ; le **suffixe dit le rôle** (règles : `.claude/rules/javascript/architecture.md`) :
  `*.data.js` (données, n'importent que des données) ← `*.engine.js` (moteur **pur**, aucun DOM) ← `*.view.js` (affichage d'une zone, CSS à côté) ← `app/main.js`.
  - `world/` : carte et cases (`world.data.js`), une boucle (`loop.engine.js`), explorer une case (`explore.engine.js`), le pas de 50 ms (`tick.engine.js`, seul à importer combat + exploration), carte (`map.view.js`), onglet Exploration (`explore-panel.view.js`).
  - `hero/` : stats, outils, compétences. `enemies/` : monstres, rangs, composition, bestiaire ; `grids.generated.js` = grilles de pixels **générées** par `tools/sprite_grids.py` (ne pas éditer à la main). `mining/` : combat-minage (strates, veines, creusage, extraction ; vue pixel par pixel `dig.view.js`). `combat/` : coups, compétences, morts, scène. `village/` : bâtiments. `intro/` : 5 écrans au premier lancement. `modals/` : fenêtre modale, fin de boucle, fiche d'un monstre.
  - `shared/` (briques de l'UI, n'importent aucune vue) : `state.js` (état partagé `S` — `S.G`, `S.tab`, `S.view`…), `dom.js` (`$`, `setHTML`, `anim`, `toast`), `templates.js`, `format.js`, `save.js` (seul accès à `localStorage`, renvoie `{ok, error}`), `rng.js` (`lcg(seed)` pour la simu, `fxRandom` : hasard des effets visuels, jamais celui du jeu), `render.js` (`requestRender()` : une vue demande un rendu sans importer `main.js`).
  - `app/` : assemblage de plusieurs domaines — `main.js` (boucle, rendu, point d'entrée), `events.view.js` (consomme `G.events`), `layout.view.js` (barre du haut, onglets, panneau de droite).
  Hasards du minage sur `G.mrng`, séparé de `G.rng` (combats déterministes). Un module ES ne peut pas réaffecter une variable importée : tout état d'UI partagé passe par `S`.
- `package.json` : `"type": "module"` pour Node, scripts de vérification, et `devDependencies` de lint seulement (ESLint + règles SonarQube, versions exactes, jamais importées par `src/`). `eslint.config.js` : bonnes pratiques, règles SonarQube, séparation des couches (le moteur n'a pas les globals navigateur), cycles d'imports interdits.
- `tools/qa/` : `check-sim.js` (simu comparée octet pour octet aux références de `tools/qa/ref/`), `compare_shots.py` (captures comparées pixel par pixel).
- **Docs : lire `docs/INDEX.md` d'abord** (résumé de tout + où se trouve chaque sujet), puis seulement la section utile. Design complet et formules : `docs/design.md` (long, lire par section). Direction artistique : `docs/art-direction.md`. Lore (brouillon) : `docs/lore.md`.
- **Conversations courtes** : une conversation par sujet (gameplay, graphismes, lore…). Un hook prévient quand le contexte devient lourd (150 k tokens, puis tous les 150 k) : proposer alors un plan découpé en conversations dédiées.

## Commandes
- Jouer en local : `python -m http.server` puis http://localhost:8000 (les modules ES ne se chargent **pas** en ouvrant `index.html` en `file://`).
- Équilibrage : `node tools/sim.js` → affiche la trace d'une partie, la boucle où le boss tombe sur 10 graines, puis les matériaux extraits au boss (médiane).
  **Cible actuelle : boss entre la 8e et la 13e boucle, médiane entre 9 et 12 (~12-20 min en ×1).** Relancer après toute modif de chiffres.
  `node tools/sim.js --outils` : la même partie avec chaque outil (pioche / marteau / coutelas) gardé du début à la fin.
- Environnement Python (WSL) : `uv venv .venv && uv pip install -p .venv -r requirements-dev.txt && .venv/bin/playwright install chromium` (une fois : `sudo .venv/bin/playwright install-deps chromium`).
- Qualité du code : `npm install` une fois (outils de lint, ~60 Mo dans `node_modules/`, non versionné), puis `npm run lint` et `npm run check` (lint + simu identique aux références). Mise en forme : Prettier (`.prettierrc.json`, guillemets simples, largeur 120), `npm run format` pour écrire, `npm run lint` la vérifie ; jamais de mise en forme à la main. Refactoring : les références ne bougent pas ; changement de gameplay voulu : `node tools/qa/check-sim.js --update` dans le même commit.
- Vérif visuelle : `.venv/bin/python tools/screenshot.py` (Playwright) → `screenshots/`, et liste les erreurs JS. Captures déterministes (horloge Playwright, `Math.random` à graine fixe) ; comparer à des captures d'avant : `.venv/bin/python tools/qa/compare_shots.py <dossier> [--tol 0.05]`.
- Sprites : prompts et seeds retenues dans `tools/sprites.json`. Forge tourne sous Windows (API sur :7860) → lancer depuis Windows :
  `python tools/sd_generate.py <nom> -n 6` (variantes brutes dans `sd_raw/`), noter la meilleure seed dans `sprites.json`, puis `python tools/sd_generate.py --build` (→ `assets/sprites/`).
  À la main : `python tools/pixelize.py <image SD> assets/sprites/<nom>.png --size 48 --palette docs/palette.hex --bg auto --outline`.
- Les sprites sont affichés par l'UI avec repli sur l'emoji si le fichier manque (`spr(clé, emoji)`).
- Après tout changement d'un sprite de monstre : `python tools/sprite_grids.py` (régénère `src/enemies/grids.generated.js`), puis relancer la simu.

## Règles de travail
- Une mécanique à la fois, chaque étape doit rester jouable. Mettre à jour `docs/design.md` (décisions, formules, résultats de simu) à chaque changement de gameplay.
- **`PROCHAINES-SESSIONS.md` ne contient que ce qui reste à faire.** Quand une session se termine, dans le même commit que son travail : déplacer son prompt et son compte rendu (« Fait le … ») dans `docs/archive/sessions-faites.md`, et ne laisser à sa place qu'une ligne d'état courte (ce qui est fait, chiffres utiles pour la suite, décisions encore en vigueur).
- Garder la séparation moteur / UI : le moteur reçoit un `rng` injectable (simu déterministe) et émet des `G.events` que l'UI consomme (animations, toasts).
- Sauvegarde : `localStorage` clé `boucles-sablier-v01`, objet `meta` versionné (`meta.v`). Tout nouveau champ doit avoir une valeur par défaut au chargement (migration douce), ne jamais casser une sauvegarde existante.
- Pas de build tant que ce n'est pas nécessaire : modules ES natifs, compatibles GitHub Pages sans outil. Le moteur et les données n'importent jamais une vue, ni `src/shared/`, ni `src/app/` (vérifié par `npm run lint`).
- Pixel art : `image-rendering: pixelated`, tailles multiples de 16, palette unique (voir art-direction).

## Feuille de route (ordre proposé)
1. ~~**Découper le code**~~ : fait (dossiers par domaine `src/world/`, `src/hero/`…, suffixes `.data.js` / `.engine.js` / `.view.js`, `tools/sim.js` importe le moteur).
2. **Équipement + forge à recettes** : emplacements arme / armure / accessoire, matériaux propres à chaque zone (raison de farmer), recettes débloquées par le bestiaire.
3. **Donner un vrai rôle à la renommée** : rangs du village (Hameau → Village → Bourg…) qui débloquent bâtiments et « faveurs » au choix. Voir `docs/design.md`.
4. **La mine** (façon Little Dig) : grille de pixels à creuser, strates = époques, restes des boucles passées, mineraux rares pour la forge.
5. **Cartographe** : route programmée sur les cases connues (mode idle).
6. **Intégration des sprites** (Stable Diffusion local de Steven + `tools/pixelize.py`) et du lore.
7. **Mondes / époques**, puis le monde tardif qui modifie les précédents.
