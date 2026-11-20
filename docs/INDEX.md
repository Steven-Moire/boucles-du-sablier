# Index des docs — à lire en premier

Ce fichier résume tous les docs en une page. **Lire celui-ci d'abord**, puis seulement la section utile d'un doc (chercher le titre avec Grep, lire avec offset/limit), jamais un doc entier sans raison. À tenir à jour à chaque changement de doc.

## État du jeu en une minute (2026-11-20)
- **v0.3 + combat-minage** : carte à cases (Prés de l'Aube, Collines grises), boucle de 75 s, village (Entraîneur, Forge, Horloge), bestiaire, trophées.
- **Combat-minage (fait)** : les monstres sont des grilles de pixels qu'on creuse ; on garde ce qu'on extrait (cuir, os, défense, fourrure, griffe, pierre, éclat, cristal, essences 🔥 ❄️ ⚡, sable). Clic pour viser.
- **Outils (étape 2a, faite)** : ⛏️ pioche (atteint le cœur), 🔨 marteau (lourd, ignore 2 d'armure, brise 60 % du cœur), 🔪 coutelas (rapide, +50 % de commun), choisis avant chaque case de combat (`meta.tool`).
- **Équilibrage** : cible révisée le 2026-11-19 = boss entre la 8e et la 13e boucle, médiane 9-12 (`node tools/sim.js` ; `--outils` pour comparer les outils). Le 8 existait depuis la v0.3.
- **Étape 2b faite** (`### Étape 2b faite` dans `design.md`) : bot malin (`node tools/sim.js --malin`), dégâts variables, **forge à recettes** (palier II de chaque outil, armures, accessoires ; matériaux extraits seulement ; perdus en fin de boucle ; « Refaire la même forge » ; `src/village/forge.*.js`), **outil conseillé** dans la fiche du bestiaire (carnet : victoires et défaites par outil, outil nommé après 2 outils ou au filet 10 / 2 / 1). Boss méd. 10 (défaut) et 9 (malin) sur 30 graines. Ensuite : améliorations dans les paliers (3a2), puis mémoire du village par la renommée (3b).
- **Lore décidé** : le mineur est « le Radoteur », vrai nom Anselme Tardif révélé par une scène (voir `lore.md`). Lieux confirmés : Les Heurelles (hameau), Grésille (mine), Griselune (lieu secret), aucune vraie commune ni lieu-dit de ces noms trouvés. **Texte final des 5 écrans de l'intro** écrit dans `lore.md`.
- **Retenus provisoirement** (à ajuster en testant) : 5 vestiges dans les monstres, 6 répliques de déjà-vu par rang de renommée, carnet des vestiges (`lore.md`).
- **Intro intégrée** : 5 écrans au premier lancement et après « Réinitialiser la sauvegarde » (`src/intro/intro.view.js`, images `assets/sprites/intro_*.png`, seeds dans `sprites.json`), passable d'un clic ou avec « Passer ». **Héros v3** avec une vraie pioche, **icônes de cases 32×32** sur la carte (repli emoji).
- **Code rangé par domaine** (2026-11-19, lot 2 qualité) : `src/<domaine>/` avec suffixes `.data.js` / `.engine.js` / `.view.js` et CSS à côté de sa vue, point d'entrée `src/app/main.js` (liste dans `design.md` → `### Liste des modules`).
- **Contexte Claude allégé** (2026-11-20, session 0) : `CLAUDE.md` ramené de 11,8 à 3,1 Ko (règles absolues et pointeurs), détail dans `docs/outillage.md` et `design.md` ; règles d'atlas hors sujet rangées dans `.claude/rules-atlas/` (local, non chargé).
- Prompts des prochaines conversations : `PROCHAINES-SESSIONS.md` (qualité du code finie, sessions A à J et leurs décisions archivées ; ordre conseillé : contexte Claude (0) → améliorations 3a2 → mémoire 3b ; héros selon l'outil en parallèle). Sessions déjà faites (prompts exécutés, état d'avant) : `docs/archive/sessions-faites.md`.

## docs/design.md — design et formules (long : lire par section)
| Section (titre à chercher) | Contenu | Statut |
|---|---|---|
| `## Pitch`, `## Décisions prises` | Le concept, les choix fondateurs | à jour |
| `## Boucle de jeu (v0.3)`, `## Compétences actives`, `## Village`, `## Monstres et trophées` | Règles et formules de la v0.3 | à jour |
| `## Équilibrage` | Cible de la simu (révisée : 8e-13e, médiane 9-12) et pourquoi | à jour |
| `## Architecture du code` | Découpage par domaine (`src/world/`, `hero/`…), suffixes de rôle, sens des imports, **liste des modules** (`### Liste des modules`) | à jour |
| `## Miner les ennemis` | Pivot, mécanique, lore, **étape 1 faite** : règles, **tableau de composition**, résultats de simu ; **étape 2a faite** (`### Étape 2a faite : marteau et coutelas`) : tableau des outils, simu par outil ; **étape 2b faite** (`### Étape 2b faite`) : décisions, bot malin, **forge** (tableau des recettes, simu), **outil conseillé** (carnet) | **référence actuelle** |
| `## Équipement, forge et mémoire du village — PROPOSITION v3` | Loot unifié, mémoire par renommée (Hameau → Cité), réinfusion −15 %, hauts faits, découpage | validé, à coder (loot remplacé par la composition) |
| `## Équipement et forge — PROPOSITION v2` | Tableau de loot mesuré, types d'armes, éléments (faiblesses), objets, améliorations +1 à +5 | **en partie dépassé** (garder : types d'armes, faiblesses, objets, améliorations) |
| `## Backlog` | Renvoi vers la feuille de route | à jour |

## docs/lore.md — lore (court)
Le mineur (Radoteur → Anselme Tardif, scène de la boulangère, pioche gravée), l'accroche et **le texte final des 5 écrans de l'intro**, les lieux (confirmés, vérifiés), **5 vestiges, 6 répliques de déjà-vu et le carnet des vestiges** (retenus provisoirement), les points de vigilance pour les noms, pourquoi le village se souvient et pas le héros, le Sablier et ses fragments, le ton (mélancolique mais drôle), le bestiaire comme carnet gardé par le village (à valider), la fin provisoire (réparer le Sablier). Le lore « monstres faits de temps sédimenté » et les vestiges sont dans `design.md` → `## Miner les ennemis` → `### Le lore qui va avec`.

## docs/art-direction.md — direction artistique (court)
Pixel art façon Little Dig, le héros, tailles des sprites, palette Endesga 64, pipeline Stable Diffusion (Juggernaut XI + LoRA Pixel Art XL), retouche img2img / inpainting, suivi des assets (seeds dans `tools/sprites.json`, intro comprise).

## docs/outillage.md — commandes et outils (court, à lire avant de toucher à `tools/` ou aux venv)
Jouer en local, simu et cible d'équilibrage, venv WSL et Windows, dépendances Python verrouillées (`requirements-dev.in` → `.txt`), lint et mise en forme (`npm run lint` / `format` / `check`), `tools/qa/`, captures Playwright, sprites avec Forge (`sd_generate.py`, `pixelize.py`, `sprite_grids.py`).

## Feuille de route (ordre proposé)
1. ~~**Découper le code**~~ : fait (dossiers par domaine `src/world/`, `src/hero/`…, suffixes `.data.js` / `.engine.js` / `.view.js`, `tools/sim.js` importe le moteur).
2. **Équipement + forge à recettes** : emplacements arme / armure / accessoire, matériaux propres à chaque zone (raison de farmer), recettes débloquées par le bestiaire.
3. **Donner un vrai rôle à la renommée** : rangs du village (Hameau → Village → Bourg…) qui débloquent bâtiments et « faveurs » au choix. Voir `docs/design.md`.
4. **La mine** (façon Little Dig) : grille de pixels à creuser, strates = époques, restes des boucles passées, mineraux rares pour la forge.
5. **Cartographe** : route programmée sur les cases connues (mode idle).
6. **Intégration des sprites** (Stable Diffusion local de Steven + `tools/pixelize.py`) et du lore.
7. **Mondes / époques**, puis le monde tardif qui modifie les précédents.

## Ailleurs
- `CLAUDE.md` : langue, couches, règles absolues (venv, uniformité, sauvegarde, une mécanique à la fois), pointeurs.
- `tools/sprites.json` : prompts, modèles et seeds de tous les visuels (sprites, fonds, intro).
- Polices : servies avec le jeu, plus aucune ressource externe (hors ligne, rien envoyé à Google). `assets/fonts/` : Inter (un woff2 variable pour les graisses 400 à 800) et Silkscreen 400 / 700, sous-ensemble `latin` seul (couvre tout le français du jeu), licences SIL OFL 1.1 à côté ; déclarées dans `src/shared/fonts.css`, chargée en premier par `index.html` et par le prototype.
- Qualité du code : `npm run lint` (`eslint.config.js`, règles SonarQube, couches, puis `prettier --check`, puis `ruff check` et `ruff format --check` sur le Python de `tools/`, config `ruff.toml`, ruff du venv lancé par `tools/qa/ruff.js` : `.venv-win/` sous Windows), `npm run format` (Prettier et ruff écrivent la mise en forme) et `npm run check` (+ tests du moteur `npm test` dans `tests/`, + simu comparée aux références de `tools/qa/ref/`) ; règles détaillées dans `.claude/rules/javascript/` (local), audit complet avec le skill `/js-quality`.
- `proto/mine-ennemi.html` : prototype du minage avec marteau et coutelas.
