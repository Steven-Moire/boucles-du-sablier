# Index des docs — à lire en premier

Ce fichier résume tous les docs en une page. **Lire celui-ci d'abord**, puis seulement la section utile d'un doc (chercher le titre avec Grep, lire avec offset/limit), jamais un doc entier sans raison. À tenir à jour à chaque changement de doc.

## État du jeu en une minute (2026-11-19)
- **v0.3 + combat-minage** : carte à cases (Prés de l'Aube, Collines grises), boucle de 75 s, village (Entraîneur, Forge, Horloge), bestiaire, trophées.
- **Combat-minage (fait)** : les monstres sont des grilles de pixels qu'on creuse ; on garde ce qu'on extrait (cuir, os, défense, fourrure, griffe, pierre, éclat, cristal, essences 🔥 ❄️ ⚡, sable). Clic pour viser.
- **Outils (étape 2a, faite)** : ⛏️ pioche (atteint le cœur), 🔨 marteau (lourd, ignore 2 d'armure, brise 60 % du cœur), 🔪 coutelas (rapide, +50 % de commun), choisis avant chaque case de combat (`meta.tool`).
- **Équilibrage** : cible révisée le 2026-11-19 = boss entre la 8e et la 13e boucle, médiane 9-12 (`node tools/sim.js` ; `--outils` pour comparer les outils). Le 8 existait depuis la v0.3.
- **Prochaine étape** : forge + équipement non permanent (2b), puis mémoire du village par la renommée (2c).
- **Lore décidé** : le mineur est « le Radoteur », vrai nom Anselme Tardif révélé par une scène (voir `lore.md`). Lieux confirmés : Les Heurelles (hameau), Grésille (mine), Griselune (lieu secret), aucune vraie commune ni lieu-dit de ces noms trouvés. **Texte final des 5 écrans de l'intro** écrit dans `lore.md`.
- **Retenus provisoirement** (à ajuster en testant) : 5 vestiges dans les monstres, 6 répliques de déjà-vu par rang de renommée, carnet des vestiges (`lore.md`).
- **Intro intégrée** : 5 écrans au premier lancement et après « Réinitialiser la sauvegarde » (`src/intro/intro.view.js`, images `assets/sprites/intro_*.png`, seeds dans `sprites.json`), passable d'un clic ou avec « Passer ». **Héros v3** avec une vraie pioche, **icônes de cases 32×32** sur la carte (repli emoji).
- **Code rangé par domaine** (2026-11-19, lot 2 qualité) : `src/<domaine>/` avec suffixes `.data.js` / `.engine.js` / `.view.js` et CSS à côté de sa vue, point d'entrée `src/app/main.js` (liste dans `CLAUDE.md`).
- Prompts des prochaines conversations : `PROCHAINES-SESSIONS.md` (qualité du code : reste la session J, fichier verrouillé avec hashes ; ordre conseillé : J → forge 3a → mémoire 3b ; héros selon l'outil en parallèle). Sessions déjà faites (prompts exécutés, état d'avant) : `docs/archive/sessions-faites.md`.

## docs/design.md — design et formules (long : lire par section)
| Section (titre à chercher) | Contenu | Statut |
|---|---|---|
| `## Pitch`, `## Décisions prises` | Le concept, les choix fondateurs | à jour |
| `## Boucle de jeu (v0.3)`, `## Compétences actives`, `## Village`, `## Monstres et trophées` | Règles et formules de la v0.3 | à jour |
| `## Équilibrage` | Cible de la simu (révisée : 8e-13e, médiane 9-12) et pourquoi | à jour |
| `## Architecture du code` | Découpage par domaine (`src/world/`, `hero/`…), suffixes de rôle, sens des imports | à jour |
| `## Miner les ennemis` | Pivot, mécanique, lore, **étape 1 faite** : règles, **tableau de composition**, résultats de simu ; **étape 2a faite** (`### Étape 2a faite : marteau et coutelas`) : tableau des outils, simu par outil | **référence actuelle** |
| `## Équipement, forge et mémoire du village — PROPOSITION v3` | Loot unifié, mémoire par renommée (Hameau → Cité), réinfusion −15 %, hauts faits, découpage | validé, à coder (loot remplacé par la composition) |
| `## Équipement et forge — PROPOSITION v2` | Tableau de loot mesuré, types d'armes, éléments (faiblesses), objets, améliorations +1 à +5 | **en partie dépassé** (garder : types d'armes, faiblesses, objets, améliorations) |
| `## Backlog` | Renvoi vers la feuille de route | à jour |

## docs/lore.md — lore (court)
Le mineur (Radoteur → Anselme Tardif, scène de la boulangère, pioche gravée), l'accroche et **le texte final des 5 écrans de l'intro**, les lieux (confirmés, vérifiés), **5 vestiges, 6 répliques de déjà-vu et le carnet des vestiges** (retenus provisoirement), les points de vigilance pour les noms, pourquoi le village se souvient et pas le héros, le Sablier et ses fragments, le ton (mélancolique mais drôle), le bestiaire comme carnet gardé par le village (à valider), la fin provisoire (réparer le Sablier). Le lore « monstres faits de temps sédimenté » et les vestiges sont dans `design.md` → `## Miner les ennemis` → `### Le lore qui va avec`.

## docs/art-direction.md — direction artistique (court)
Pixel art façon Little Dig, le héros, tailles des sprites, palette Endesga 64, pipeline Stable Diffusion (Juggernaut XI + LoRA Pixel Art XL), retouche img2img / inpainting, suivi des assets (seeds dans `tools/sprites.json`, intro comprise).

## Ailleurs
- `CLAUDE.md` : architecture du code, commandes, règles de travail, feuille de route.
- `tools/sprites.json` : prompts, modèles et seeds de tous les visuels (sprites, fonds, intro).
- Polices : servies avec le jeu, plus aucune ressource externe (hors ligne, rien envoyé à Google). `assets/fonts/` : Inter (un woff2 variable pour les graisses 400 à 800) et Silkscreen 400 / 700, sous-ensemble `latin` seul (couvre tout le français du jeu), licences SIL OFL 1.1 à côté ; déclarées dans `src/shared/fonts.css`, chargée en premier par `index.html` et par le prototype.
- Qualité du code : `npm run lint` (`eslint.config.js`, règles SonarQube, couches, puis `prettier --check`, puis `ruff check` et `ruff format --check` sur le Python de `tools/`, config `ruff.toml`, ruff du venv lancé par `tools/qa/ruff.js` : `.venv-win/` sous Windows), `npm run format` (Prettier et ruff écrivent la mise en forme) et `npm run check` (+ simu comparée aux références de `tools/qa/ref/`) ; règles détaillées dans `.claude/rules/javascript/` (local), audit complet avec le skill `/js-quality`.
- `proto/mine-ennemi.html` : prototype du minage avec marteau et coutelas.
