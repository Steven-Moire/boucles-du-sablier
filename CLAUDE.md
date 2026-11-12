# Les Boucles du Sablier — contexte pour Claude Code

Jeu incrémental / idle à boucle temporelle, jouable dans le navigateur. Projet perso de Steven (AI engineer Python/web, pas game dev) : on avance par petits incréments jouables.
**Toujours répondre en français.** Les textes du jeu sont en français.

## État actuel (v0.3, découpé en modules)
Modules ES natifs, aucune dépendance, aucun build. Déployé tel quel sur GitHub Pages.
- `index.html` : squelette HTML, charge `src/style.css` et `src/ui/main.js` (`<script type="module">`).
- `src/data.js` : données (biomes, types de cases, cases, monstres, rangs, compétences, bâtiments, formules de base).
- `src/engine.js` : moteur **pur** (aucun accès au DOM), importe `data.js`. `tools/sim.js` l'importe directement pour faire jouer un bot dans Node.
- `src/ui/` : `state.js` (état partagé `S` — `S.G`, `S.tab`, `S.view`… —, sauvegarde, helpers), `map.js`, `scene.js`, `panel.js` (barre du haut + panneau de droite), `modals.js`, `main.js` (événements, rendu, boucle principale ; point d'entrée).
  Un module ES ne peut pas réaffecter une variable importée : tout état d'UI partagé passe par `S`.
- `package.json` : seulement `"type": "module"` pour Node (pas de dépendances).
- Design complet et formules : `docs/design.md`. Direction artistique : `docs/art-direction.md`. Lore (brouillon) : `docs/lore.md`.

## Commandes
- Jouer en local : `python -m http.server` puis http://localhost:8000 (les modules ES ne se chargent **pas** en ouvrant `index.html` en `file://`).
- Équilibrage : `node tools/sim.js` → affiche la trace d'une partie puis la boucle où le boss tombe sur 10 graines.
  **Cible actuelle : boss entre la 9e et la 13e boucle (~15-20 min en ×1).** Relancer après toute modif de chiffres.
- Environnement Python (WSL) : `uv venv .venv && uv pip install -p .venv -r requirements-dev.txt && .venv/bin/playwright install chromium` (une fois : `sudo .venv/bin/playwright install-deps chromium`).
- Vérif visuelle : `.venv/bin/python tools/screenshot.py` (Playwright) → `screenshots/`, et liste les erreurs JS.
- Sprites : prompts et seeds retenues dans `tools/sprites.json`. Forge tourne sous Windows (API sur :7860) → lancer depuis Windows :
  `python tools/sd_generate.py <nom> -n 6` (variantes brutes dans `sd_raw/`), noter la meilleure seed dans `sprites.json`, puis `python tools/sd_generate.py --build` (→ `assets/sprites/`).
  À la main : `python tools/pixelize.py <image SD> assets/sprites/<nom>.png --size 48 --palette docs/palette.hex --bg auto --outline`.
- Les sprites sont affichés par l'UI avec repli sur l'emoji si le fichier manque (`spr(clé, emoji)`).

## Règles de travail
- Une mécanique à la fois, chaque étape doit rester jouable. Mettre à jour `docs/design.md` (décisions, formules, résultats de simu) à chaque changement de gameplay.
- Garder la séparation moteur / UI : le moteur reçoit un `rng` injectable (simu déterministe) et émet des `G.events` que l'UI consomme (animations, toasts).
- Sauvegarde : `localStorage` clé `boucles-sablier-v01`, objet `meta` versionné (`meta.v`). Tout nouveau champ doit avoir une valeur par défaut au chargement (migration douce), ne jamais casser une sauvegarde existante.
- Pas de build tant que ce n'est pas nécessaire : modules ES natifs, compatibles GitHub Pages sans outil. Le moteur et les données n'importent jamais rien de `src/ui/`.
- Pixel art : `image-rendering: pixelated`, tailles multiples de 16, palette unique (voir art-direction).

## Feuille de route (ordre proposé)
1. ~~**Découper le code**~~ : fait (`src/data.js`, `src/engine.js`, `src/ui/*.js`, `tools/sim.js` importe le moteur).
2. **Équipement + forge à recettes** : emplacements arme / armure / accessoire, matériaux propres à chaque zone (raison de farmer), recettes débloquées par le bestiaire.
3. **Donner un vrai rôle à la renommée** : rangs du village (Hameau → Village → Bourg…) qui débloquent bâtiments et « faveurs » au choix. Voir `docs/design.md`.
4. **La mine** (façon Little Dig) : grille de pixels à creuser, strates = époques, restes des boucles passées, mineraux rares pour la forge.
5. **Cartographe** : route programmée sur les cases connues (mode idle).
6. **Intégration des sprites** (Stable Diffusion local de Steven + `tools/pixelize.py`) et du lore.
7. **Mondes / époques**, puis le monde tardif qui modifie les précédents.
