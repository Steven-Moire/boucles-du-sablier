# Index des docs — à lire en premier

Ce fichier résume tous les docs en une page. **Lire celui-ci d'abord**, puis seulement la section utile d'un doc (chercher le titre avec Grep, lire avec offset/limit), jamais un doc entier sans raison. À tenir à jour à chaque changement de doc.

## État du jeu en une minute (2026-11-19)
- **v0.3 + combat-minage** : carte à cases (Prés de l'Aube, Collines grises), boucle de 75 s, village (Entraîneur, Forge, Horloge), bestiaire, trophées.
- **Combat-minage (fait)** : les monstres sont des grilles de pixels qu'on creuse ; on garde ce qu'on extrait (cuir, os, défense, fourrure, griffe, pierre, éclat, cristal, essences 🔥 ❄️ ⚡, sable). Pioche seule pour l'instant, clic pour viser.
- **Équilibrage** : boss entre la 9e et la 13e boucle (`node tools/sim.js`), inchangé depuis la v0.3.
- **Prochaine étape** : outils (pioche / marteau / coutelas) + forge + équipement non permanent + mémoire du village par la renommée.
- **Lore décidé** : le mineur est « le Radoteur », vrai nom Anselme Tardif révélé par une scène (voir `lore.md`). Lieux confirmés : Les Heurelles (hameau), Grésille (mine), Griselune (lieu secret), aucune vraie commune ni lieu-dit de ces noms trouvés. **Texte final des 5 écrans de l'intro** écrit dans `lore.md`.
- **Retenus provisoirement** (à ajuster en testant) : 5 vestiges dans les monstres, 6 répliques de déjà-vu par rang de renommée, carnet des vestiges (`lore.md`).
- **Questions ouvertes** : trier les images de l'intro (30 images dans `sd_raw/intro_*`). Prompts des prochaines conversations : `PROCHAINES-SESSIONS.md`.

## docs/design.md — design et formules (long : lire par section)
| Section (titre à chercher) | Contenu | Statut |
|---|---|---|
| `## Pitch`, `## Décisions prises` | Le concept, les choix fondateurs | à jour |
| `## Boucle de jeu (v0.3)`, `## Compétences actives`, `## Village`, `## Monstres et trophées` | Règles et formules de la v0.3 | à jour |
| `## Équilibrage` | Cible de la simu | à jour |
| `## Architecture du code` | Découpage en modules | à jour |
| `## Miner les ennemis` | Pivot, mécanique, lore, **étape 1 faite** : règles, **tableau de composition**, résultats de simu, « pour plus tard » | **référence actuelle** |
| `## Équipement, forge et mémoire du village — PROPOSITION v3` | Loot unifié, mémoire par renommée (Hameau → Cité), réinfusion −15 %, hauts faits, découpage | validé, à coder (loot remplacé par la composition) |
| `## Équipement et forge — PROPOSITION v2` | Tableau de loot mesuré, types d'armes, éléments (faiblesses), objets, améliorations +1 à +5 | **en partie dépassé** (garder : types d'armes, faiblesses, objets, améliorations) |
| `## Backlog` | Renvoi vers la feuille de route | à jour |

## docs/lore.md — lore (court)
Le mineur (Radoteur → Anselme Tardif, scène de la boulangère, pioche gravée), l'accroche et **le texte final des 5 écrans de l'intro**, les lieux (confirmés, vérifiés), **5 vestiges, 6 répliques de déjà-vu et le carnet des vestiges** (retenus provisoirement), les points de vigilance pour les noms, pourquoi le village se souvient et pas le héros, le Sablier et ses fragments, le ton (mélancolique mais drôle), questions ouvertes (carnet du héros, fin). Le lore « monstres faits de temps sédimenté » et les vestiges sont dans `design.md` → `## Miner les ennemis` → `### Le lore qui va avec`.

## docs/art-direction.md — direction artistique (court)
Pixel art façon Little Dig, le héros, tailles des sprites, palette Endesga 64, pipeline Stable Diffusion (Juggernaut XI + LoRA Pixel Art XL), suivi des assets (seeds dans `tools/sprites.json`).

## Ailleurs
- `CLAUDE.md` : architecture du code, commandes, règles de travail, feuille de route.
- `tools/sprites.json` : prompts, modèles et seeds de tous les visuels (sprites, fonds, intro).
- `proto/mine-ennemi.html` : prototype du minage avec marteau et coutelas.
