# Les Boucles du Sablier — document de design

Titre de travail. Prototype jouable (v0.3) : `index.html` + `src/` (aussi publié sur https://claude.ai/artifact/Rru3ETP8yeJZAF8kKgF96M).

## Pitch
*Le village se souvient, la mine garde le passé, les mondes sont des époques.*
Le héros, un mineur un peu fou, revit la même journée en boucle. Il oublie tout (niveau, PV), mais le joueur garde la carte, le bestiaire, les trophées et le village. Lore : `docs/lore.md`.

## Décisions prises
- **Thème combiné** :
  - le village est la mémoire collective et porte la progression permanente ;
  - la mine est faite de strates de plus en plus anciennes, avec des traces des boucles précédentes ;
  - les mondes sont des époques d'un même lieu, et le monde tardif modifie le passé (nouveau contenu dans les mondes terminés, à la Loopbound).
- **Chemin façon PowerSeeker** : carte de cases, biomes colorés, niveau sur chaque case, fiche détaillée au clic.
- **Exploration case par case au début**. Plus tard, le **Cartographe** permettra de programmer une route sur les cases connues (mode idle). Précisé par la refonte (2026-11-21) : Hyacinthe Jalon rend la carte chaque matin, et le pilote se débloque à la Bauge du Roi (voir « Refonte de l'expérience »).
- **L'information se gagne** : la fiche d'un monstre se débloque à la première rencontre, ses butins au premier kill.
- **Ré-exploration (farm)** : toute case déjà faite pendant la boucle peut être refaite (combat, récolte, source). Ça coûte du temps de boucle.
- **Source = échanger du temps contre des PV** (v0.3) : +10 % des PV max par seconde jusqu'à être plein, avec la possibilité de reprendre la route avant. Réutilisable. Comme le soin est en pourcentage, une source pleine coûte toujours au plus ~10 s, quels que soient les PV max : le coût en temps reste constant.
- **Trophées uniques** : un butin unique par monstre, obtenu une seule fois, qui donne un bonus permanent.
- **Vrai combat** : scène dédiée, ennemis en vagues, compétences automatiques, retraite.
- **Direction artistique** : pixel art « joli » façon Little Dig, avec pour héros le mineur fou et son sablier fêlé. Voir `docs/art-direction.md`.
- **Outillage** : la suite se fait avec Claude Code, sur un dépôt GitHub déployé sur GitHub Pages. Images avec le Stable Diffusion local de Steven.

## Boucle de jeu (v0.3)
1. Le héros part du village, niveau 1, avec 75 s d'action (davantage avec l'Horloge et le Fragment de sablier).
2. Une case est explorable si elle est découverte et voisine d'une case faite *pendant cette boucle*. Une case déjà faite peut être refaite.
3. Chaque case est découpée en segments : 2 à 3 vagues de combat, récolte 3 × 3 s, source (canalisée) ou trésor.
4. Combat : le héros attaque toutes les 0,9 s la première cible vivante et chaque ennemi a son propre rythme. `dégâts = max(1, puissance × multiplicateur − armure)`, ×1,5 en critique ; `chance de toucher = 85 % + précision − esquive`. Les compétences touchent à coup sûr.
5. Le héros récupère 10 % de ses PV entre deux vagues.
6. La boucle se termine à la mort, quand le temps est écoulé ou sur un retour au village. Une retraite abandonne seulement la case en cours.

## Compétences actives (automatiques)
| Compétence | Recharge | Effet | Déblocage |
|---|---|---|---|
| Coup puissant | 7 s | 250 % sur la cible | dès le départ |
| Tourbillon | 9 s | 120 % sur tous les ennemis | Entraîneur niv 3 |
| Second souffle | 15 s | +25 % des PV max, seulement sous 50 % | Forge niv 2 |

## Village
| Bâtiment | Débloqué à | Effet / niveau | Coût |
|---|---|---|---|
| Entraîneur | 5 ⭐ | +8 PV, +1 puissance | 8 × 1,35ⁿ or |
| Forge | 20 ⭐ | +1 armure, +0,5 puissance | 10 × 1,4ⁿ or + (1+n) minerai |
| Horloge du clocher | 35 ⭐ | +10 s de boucle | 12 × 1,45ⁿ or + (2+n) bois |
| Cartographe | — | (à venir) route programmée | — |

Renommée : +3 × niveau à la première exploration d'une case, +2 / +10 / +50 au premier kill d'un monstre / élite / boss, +5 par trésor.
Notifications : un « ! » sur le village (carte et onglet) seulement si une amélioration est payable (bug corrigé en v0.3), et un toast à chaque nouveau bâtiment ou trophée.

### Problème connu : la renommée ne sert plus après les premières boucles
Elle grimpe vite (environ 270 en fin de contenu) mais ne débloque que trois seuils (5 / 20 / 35). Proposition à implémenter :
- **Rangs du village** : Hameau (0) → Village (40) → Bourg (100) → Ville (200) → Cité (350). Chaque rang débloque un bâtiment (Boutique d'équipement, Cartographe, Puits / mine…) et donne une **faveur au choix entre deux**, avec un bonus permanent (par exemple +10 % d'or ou +5 s de boucle). C'est cohérent avec le lore : plus le village se souvient, plus il t'aide.
- Plus tard, de la renommée gagnée en continu : quêtes de villageois du type « rapporte 5 crocs de loup ».

## Monstres et trophées
Stats au niveau L : `PV = (12 + 8(L−1)) × mult`, `puissance = (3 + 2,4(L−1)) × mult` (pente 1,6 jusqu'au 2026-11-21, voir `### Étape 3a1`), `armure = ⌊(L−1)/2⌋ + bonus`.

| Monstre | Zone | Trophée unique | Chance | Bonus |
|---|---|---|---|---|
| Mulot dentu | Prés | Incisive de mulot | 4 % | +3 % critique |
| Sanglier | Prés | Défense de sanglier | 3 % | +10 PV |
| Sanglier alpha (élite) | Prés | Couronne de boue | 15 % | +1 armure |
| Loup gris | Collines | Croc de loup | 3 % | +4 % esquive |
| Golem de pierre | Collines | Cœur de pierre | 3 % | +1 armure |
| Ours ancien (élite) | Collines | Griffe de l'Ours ancien | 15 % | +2 puissance |
| Gardien du Sablier (boss) | Collines | Fragment de sablier | 100 % | +15 s de boucle |

## Équilibrage (bot, `node tools/sim.js`, 10 parties)
Le boss tombe entre la 8e et la 13e boucle, soit environ 12 à 20 min de jeu en ×1. **Cible (révisée le 2026-11-19) : boss entre la 8e et la 13e boucle, médiane entre 9 et 12.**
Pourquoi : la série `9 13 10 12 9 12 8 9 12 9` est identique depuis le prototype v0.3 (vérifié sur a625c8a → 6f6844a → 3fab3e6 → 69b808d → main) ; le 8 vient d'une graine chanceuse, ce n'est pas une régression. Le remonter par les chiffres pousserait la graine à 13 vers 14 : on élargit la cible plutôt que de déplacer l'écart. À recaler après la mémoire du village (étape 2c), qui changera la courbe de progression.
Depuis la pente 2,4 (2026-11-21, `### Étape 3a1`), la série devient `13 11 14 12 11 10 11 12 11 11` (méd. 11, une graine à 14) ; sur 30 graines, bot par défaut méd. 11 [8-14] 1 hors cible, bot malin méd. 10 [8-12] 0 hors : on juge l'équilibrage sur 30 graines.

## Architecture du code (étape 1 de la feuille de route, faite ; arborescence par domaine le 2026-11-19)
Le jeu est découpé en modules ES natifs, sans build, **un dossier par domaine** (`src/world/`, `hero/`, `enemies/`, `mining/`, `combat/`, `village/`, `intro/`, `modals/`, `shared/`, `app/`). Le suffixe dit le rôle : `*.data.js` (données) ← `*.engine.js` (moteur pur, testable dans Node) ← `*.view.js` (rendu et interactions d'une zone, avec son CSS à côté) ← `app/main.js`. Liste des modules : ci-dessous ; règles des couches : `.claude/rules/javascript/architecture.md`, vérifiées par `npm run lint`. Les deux découpages (v0.3 monolithique → modules, puis modules → domaines) sont mécaniques : aucune règle ni aucun chiffre n'a changé.
- **Sens des imports, sans cycle** : une vue demande un rendu par `requestRender()` (`shared/render.js`, auquel `app/main.js` s'abonne) au lieu d'importer `main.js` ; `world/tick.engine.js` est le seul module qui importe à la fois le combat et l'exploration. Les 8 cycles d'imports de l'ancien découpage ont disparu.
- **Simulation** : `node tools/sim.js` importe chaque `*.data.js` et `*.engine.js` (réunis dans un seul objet `E`). Sortie identique octet pour octet à celle de la v0.3 monolithique (boss aux boucles 9 13 10 12 9 12 8 9 12 9).
- **Sauvegarde** : même clé `boucles-sablier-v01`, même objet `meta` (v1). Vérifié en chargeant une sauvegarde produite par l'ancien moteur.
- **Jouer en local** demande désormais un serveur HTTP (`python -m http.server`), les modules ne se chargeant pas en `file://`.

### Liste des modules (v0.3, découpée en modules)
Modules ES natifs, aucune dépendance livrée au joueur, aucun build, aucune ressource externe (le jeu marche hors ligne). Déployé tel quel sur GitHub Pages.
- `index.html` : squelette HTML, charge d'abord `src/shared/fonts.css` (polices de `assets/fonts/`, woff2 + licences OFL : jamais de Google Fonts ni d'autre CDN), puis les 14 feuilles CSS de zone (dans l'ordre de l'ancien `style.css`, la cascade en dépend ; `hero/hero-panel.css` en dernier) et `src/app/main.js` (`<script type="module">`).
- `src/` : **un dossier par domaine**, en anglais ; le **suffixe dit le rôle** (règles : `.claude/rules/javascript/architecture.md`) : `*.data.js` (données, n'importent que des données) ← `*.engine.js` (moteur **pur**, aucun DOM) ← `*.view.js` (affichage d'une zone, CSS à côté) ← `app/main.js`.
  - `world/` : carte et cases (`world.data.js`), une boucle (`loop.engine.js`), explorer une case (`explore.engine.js`), le pas de 50 ms (`tick.engine.js`, seul à importer combat + exploration), carte (`map.view.js`), fiche de la case à côté de la carte (`explore-panel.view.js`).
  - `hero/` : stats, outils, compétences ; colonne du héros toujours à gauche (`hero-panel.view.js` : portrait, PV, XP, stats, outil, équipement, journal, fin de boucle). `enemies/` : monstres, rangs, composition, bestiaire ; `grids.generated.js` = grilles de pixels **générées** par `tools/sprite_grids.py` (ne pas éditer à la main). `mining/` : combat-minage (strates, veines, creusage, extraction ; vue pixel par pixel `dig.view.js`). `combat/` : coups, compétences, morts, scène. `village/` : bâtiments, forge à recettes (`forge.data.js`, `forge.engine.js`). `intro/` : 5 écrans au premier lancement. `modals/` : fenêtre modale, fin de boucle, fiche d'un monstre.
  - `shared/` (briques de l'UI, n'importent aucune vue) : `state.js` (état partagé `S` — `S.G`, `S.tab` : l'onglet affiché, `S.selected`… ; `startTile()` : case choisie en début de boucle), `dom.js` (`$`, `setHTML`, `anim`, `toast`), `templates.js`, `format.js`, `save.js` (seul accès à `localStorage`, renvoie `{ok, error}`), `rng.js` (`lcg(seed)` pour la simu, `fxRandom` : hasard des effets visuels, jamais celui du jeu), `render.js` (`requestRender()` : une vue demande un rendu sans importer `main.js`).
  - `app/` : assemblage de plusieurs domaines — `main.js` (boucle, rendu, point d'entrée), `events.view.js` (consomme `G.events`), `layout.view.js` (barre du haut, onglets Combat / Carte / Bestiaire / Village et leur contenu).
- Hasards du minage sur `G.mrng`, séparé de `G.rng` (combats déterministes). Un module ES ne peut pas réaffecter une variable importée : tout état d'UI partagé passe par `S`.
- Les sprites sont affichés par l'UI avec repli sur l'emoji si le fichier manque (`spr(clé, emoji)`).
- Outillage (simu, lint, venv, captures, sprites) : `docs/outillage.md`.

## Miner les ennemis (pivot « game changer », 2026-11-19 — étape 1 faite)

### Pourquoi
Retour de Steven après avoir fini la v0.3 : le jeu est plat, il manque de lore, et il est loin de **Little Dig**. L'idée de départ n'était pas d'avoir une mine à part, mais de **miner les ennemis**. Les combats à barre de PV deviennent donc une extraction : chaque monstre est une petite roche vivante, faite de pixels.

Prototype jouable, à part du jeu : `proto/mine-ennemi.html` (en ligne : `/proto/mine-ennemi.html`). Il utilise les vrais sprites.

### La mécanique
- **Le monstre est sa propre grille de pixels** (son sprite). Chaque pixel a de la vie selon sa strate. Le héros creuse automatiquement (idle) ; le joueur peut **cliquer pour viser** une veine.
- **Strates par profondeur** (distance au vide, comme la roche de Little Dig) : contour sombre = croûte (rien) ; surface = **commun** (cuir, fourrure, minerai) ; 30 % les plus profonds = **peu commun** (os, éclat) ; cœur = **rare** (1,5 % des pixels d'un monstre normal, **5 % d'une élite**). Les veines brillantes du sprite (cristal bleu du golem, cœur du Gardien) comptent comme peu commun.
- **On garde ce qu'on extrait.** Le monstre **s'effondre** quand 30 % de ses pixels sont creusés : le reste retombe en poussière, perdu. Le loot n'est plus un tirage au sort : il dépend de **ce qu'on a creusé**.
- **Les outils deviennent les types d'armes** :
  | Outil | Rythme | Motif | Identité | Golem (proto, ×1) |
  |---|---|---|---|---|
  | Pioche | 0,9 s | tunnel de 2 px vers le point visé | atteint le cœur intact | 16 s · 0,35 cristal |
  | Marteau | 1,4 s | cratère de rayon 6 | abat le plus vite, brise 60 % des pixels rares | 11 s · 0,15 cristal |
  | Coutelas | 0,45 s | écorche la surface la plus proche | +50 % de commun, atteint rarement le cœur | 19 s · 0,7 minerai |
- **Éléments** (v3) deviennent des effets de minage : 🔥 le feu consume les strates molles (chair, cuir) en se propageant ; ❄️ le givre fend la pierre (fissures qui détachent des blocs entiers) ; ⚡ la foudre suit les veines brillantes jusqu'au cœur.
- Le **combat reste** : les monstres frappent le héros pendant qu'il creuse ; un monstre à moitié creusé frappe moins fort (moins de masse). Le temps de boucle reste la ressource : creuser proprement prend du temps.

### Le lore qui va avec
- **Les monstres sont faits de temps.** Le sable qui fuit du Sablier fêlé sédimente : les créatures des Prés et des Collines sont des **strates de journées passées** qui ont pris forme. Le mineur fou est le seul qui voit qu'on peut les **creuser**.
- **Des vestiges de tes boucles passées** sont enfouis dans les monstres : ta vieille pioche, une page de ton carnet (« les mulots ont des numéros »), le bouton de ton tablier… Ce qu'une boucle avale, une autre le rend dans la pierre. C'est aussi la **surprise entre boucles** : les vestiges racontent l'histoire, un fragment à la fois, et certains débloquent des souvenirs (lore) au village.
- **Le Gardien du Sablier** a un cœur de sablier : le creuser jusqu'au centre, c'est récupérer le premier fragment.
- La future **mine** (feuille de route) devient la suite logique : le même geste, appliqué à la roche sous le village, où dorment les plus vieilles strates.

### Ce que ça change au plan
- Le **tableau de loot v3** (commun / peu commun / rare) reste la bonne structure : il devient la **composition** des monstres au lieu d'un tirage. Les élites ont un gros cœur rare (5 %) : c'est le « même loot, mais plus de rare » voulu.
- Les **types d'armes** et les **éléments** sortent de la fin du plan : ce sont les outils et les effets du minage, ils arrivent avec.
- **Moteur pur et simulation** : les grilles de pixels sont précalculées depuis les PNG par un outil (`tools/sprite_grids.py` → `src/enemies/grids.generated.js`), pour que le moteur reste sans DOM et que `tools/sim.js` puisse faire creuser le bot dans Node.
- **Équilibrage** : la vie totale des pixels jusqu'à l'effondrement est calée sur les PV actuels des monstres (même durée de combat), cible inchangée (boss entre la 9e et la 13e boucle).

### Découpage proposé
1. **Grilles + combat-minage dans le jeu** : `src/grids.js`, strates, pioche seule, clic pour viser, butin extrait (remplace le tirage), simu recalée.
2. **Outils** pioche / marteau / coutelas (forge et équipement non permanents + mémoire par renommée, v3).
3. **Vestiges et lore** : vestiges enfouis, souvenirs débloqués au village, villageois aux déjà-vu.
4. **Éléments** comme effets de minage, puis améliorations et hauts faits.

### Étape 1 faite : combat-minage dans le jeu (2026-11-19)
Décisions de Steven : « on garde ce qu'on extrait » validé ; il faut un **tableau de composition** ; plus tard, des **améliorations pour viser** (ou non) certains éléments ; les **éléments se récupèrent** pour forger armes et armures (une sorte de mini-jeu, puisqu'une arme ne se forge qu'une fois) ; un peu plus d'**aléatoire** quand on ne clique pas.

Règles en place :
- Chaque monstre est sa grille de pixels (`src/enemies/grids.generated.js`, généré par `tools/sprite_grids.py` depuis les sprites). Les dégâts creusent (`src/mining/dig.engine.js`) ; la mort suit toujours les **PV** (formules inchangées), la grille est calée pour qu'à la mort ~30 % de sa vie de pixels soit creusée.
- **Pioche** pour l'instant : tunnel de ~2 px depuis la surface la plus proche jusqu'au point visé, puis cratère qui s'élargit. **Clic sur un ennemi** = nouveau point visé.
- **Aléatoire à chaque apparition** : veine élémentaire tracée au hasard (2-3 branches) et cible par défaut tirée au hasard (cœur 45 %, veine 35 %, n'importe où 20 %).
- **Extraction à la mort** : pixels creusés / rendement de la strate ; la fraction restante est une chance d'une unité de plus.
- Les hasards du minage passent par un générateur à part (`G.mrng`) : **les combats de la simulation sont identiques à la v0.3** au chiffre près.
- Sauvegarde : `meta.mats` (stock de matériaux) et `bestiary[id].kills` (compteur de victoires) ajoutés avec valeur par défaut, `meta.v` reste 1. Vérifié avec une sauvegarde v0.3.
- UI : monstre dessiné pixel par pixel (veines teintées, cœur qui scintille une fois mis à nu, viseur doré), éclats de pixels, butin flottant, matériaux au village, au bilan de boucle et **composition dans la fiche du bestiaire** (matériaux révélés à la première victoire).

Strates : vie par pixel 1 (croûte, surface), 2 (profondeur, veine), 3 (cœur). Rendement (pixels pour 1 unité) : surface 450, profondeur 300, cœur 220, veine 100. Profondeur = 10 % des pixels les plus profonds ; cœur = 0,5 % (normal), 8 % (élite), 10 % (boss).

#### Tableau de composition (part des pixels)
| Monstre | Rang | Pixels | Croûte | Surface | Profondeur | Cœur | Veine |
|---|---|---|---|---|---|---|---|
| Mulot dentu | Monstre | 1292 | 18 % | 71 % 🟫 Cuir | 10 % 🦴 Os | 0,5 % 🦷 Défense | — |
| Sanglier | Monstre | 1556 | 13 % | 73 % 🟫 Cuir | 10 % 🦴 Os | 0,5 % 🦷 Défense | 3 % 🔥 Braise (au hasard) |
| Sanglier alpha | Élite | 2531 | 14 % | 62 % 🟫 Cuir | 10 % 🦴 Os | 8 % 🦷 Défense | 6 % 🔥 Braise (au hasard) |
| Loup gris | Monstre | 1462 | 23 % | 64 % 🐺 Fourrure | 10 % 🦴 Os | 0,5 % 🐾 Griffe | 3 % ❄️ Givre (au hasard) |
| Golem de pierre | Monstre | 1318 | 21 % | 62 % 🧱 Pierre | 10 % 🔹 Éclat | 0,5 % 💎 Cristal | 7 % ⚡ Étincelle (veines du sprite) |
| Ours ancien | Élite | 1976 | 17 % | 59 % 🐺 Fourrure | 10 % 🦴 Os | 8 % 🐾 Griffe | 6 % ❄️ Givre (au hasard) |
| Gardien du Sablier | Boss | 2951 | 11 % | 66 % 🔹 Éclat | 10 % 💎 Cristal | 10 % ⏳ Sable du sablier | 3 % ⚡ Étincelle (veines du sprite) |

Le golem de pierre donne de la 🧱 Pierre et non du 🪨 Minerai : le minerai des filons reste l'unique source pour la Forge et l'Horloge, l'équilibrage du village ne bouge pas.

#### Simulation (`node tools/sim.js`, 10 parties)
Boss aux boucles 9 13 10 12 9 12 8 9 12 9 (identique à la v0.3). Matériaux extraits au moment du boss (médiane) :
🟫 208 · 🐺 96 · 🧱 29 · 🦴 118 · 🔹 22 · 🦷 11 · 🐾 6 · 💎 1 · 🔥 26 · ❄️ 31 · ⚡ 48 · ⏳ 1.
C'est l'ordre de grandeur visé par la v3 (communs abondants, rares rythmés par les élites). Les essences (🔥 ❄️ ⚡) serviront à forger les armes élémentaires.

#### Pour plus tard
- Améliorations de **visée** : lampe de prospection (révèle le cœur), priorité automatique (veine / cœur / rien), ou au contraire « laisser le hasard ».
- ~~Outils marteau et coutelas~~ : faits, voir l'étape 2a ci-dessous.
- Sprites plus grands en combat (×3) si le minage manque de lisibilité.

### Étape 2a faite : marteau et coutelas (2026-11-19)
Règles en place (`TOOLS` dans `src/hero/hero.data.js`) : on **choisit l'outil avant d'entrer sur une case de combat** (panneau de droite, sous les ennemis). L'action en cours garde l'outil avec lequel elle a commencé ; le choix est mémorisé (`meta.tool`). Combat repris des « Types d'armes » de la v2, motif de creusage repris du prototype :
| Outil | Attaque toutes les | Dégâts | Bonus | Motif de creusage | Effet sur le butin |
|---|---|---|---|---|---|
| ⛏️ Pioche | 0,9 s | ×1 | — | tunnel de ~2 px jusqu'au point visé, puis cratère | atteint le cœur intact |
| 🔨 Marteau | 1,4 s | ×1,5 | ignore 2 d'armure | cratère rond autour de l'impact en surface | **60 % des pixels de cœur se brisent** (perdus, éclats blancs) |
| 🔪 Coutelas | 0,6 s | ×0,7 | +5 % de critique | écorchure large et peu profonde (1 couche de profondeur = 4 px de distance) | **+50 % de matériau commun**, n'atteint presque jamais la profondeur ni le cœur |

Les multiplicateurs s'appliquent aussi aux compétences (Coup puissant, Tourbillon). La pioche vaut ×1 partout et ne tire aucun hasard de plus : **la simulation par défaut est identique octet pour octet**. La casse du marteau est tirée sur `G.mrng`.

#### Simulation (`node tools/sim.js --outils` : le bot garde le même outil toute la partie)
| Outil | Boss à la boucle | Min ×1 | Matériaux au boss (médiane) |
|---|---|---|---|
| ⛏️ Pioche | 9 13 10 12 9 12 8 9 12 9 (méd. 9,5) | 12-20 | 🟫 208 · 🐺 96 · 🧱 29 · 🦴 118 · 🔹 22 · 🦷 11 · 🐾 6 · 💎 1 · 🔥 26 · ❄️ 31 · ⚡ 48 · ⏳ 1 |
| 🔨 Marteau | 8 10 9 12 9 9 9 9 8 8 (méd. 9) | 11-18 | 🟫 222 · 🐺 101 · 🧱 31 · 🦴 96 · 🔹 16 · 🦷 3 · 🐾 2 · 💎 0 · 🔥 22 · ❄️ 27 · ⚡ 32 · ⏳ 1 |
| 🔪 Coutelas | 10 12 12 9 8 11 11 10 10 11 (méd. 10,5) | 13-19 | 🟫 333 · 🐺 150 · 🧱 67 · 🦴 1 · 🔹 3 · 🦷 0 · 🐾 0 · 💎 0 · 🔥 19 · ❄️ 19 · ⚡ 1 · ⏳ 0 |

Lecture : le marteau abat plus vite (surtout golems, ours, boss grâce à l'armure ignorée) mais ruine les rares ; le coutelas est le « farm » de communs ; la pioche reste l'outil des rares et des veines. Les trois restent dans la cible. Le choix prendra tout son sens avec la forge (2b), quand les rares et les essences auront un usage.

#### Pour plus tard
- Sprite du héros selon l'outil (il tient toujours une pioche).
- ~~Bot qui change d'outil selon la case~~ : fait en 2b (`--malin`, ci-dessous).

### Étape 2b faite : forge et outil conseillé (2026-11-20)
#### Décisions de Steven (2026-11-20, après un conseil)
- **Outil conseillé dans le bestiaire** : le carnet compte les victoires **par outil** (`bestiary[id].byTool`, `{}` par défaut). Une note dans le ton du carnet apparaît à la première victoire ou défaite (après une défaite, en négatif : « pas la pioche »). L'outil est **nommé** dès que le monstre a été battu avec **2 outils différents** (le carnet compare tes essais), sinon au filet par rang : normal 10, élite 2, boss 1 (Steven : un boss est difficile à battre par principe ; il sera battu plusieurs fois avec le multi-prestige). Pourquoi : un seuil unique de 10 arrive à la 1re boucle pour le mulot mais jamais avant le boss pour l'ours et le Gardien (mesuré : alpha 1 victoire par boucle, ours ~3 à la 8e boucle).
- **Prix de forge** : prix plein à chaque boucle en 2b ; la « reforge » bon marché (le village garde le patron) est reportée en 3b, avec un conseil élargi.
- **Armes et outils** : l'outil **est** l'arme. Idée de Steven : des **paliers qui se chevauchent** (le coutelas de base monte à +5, un coutelas de palier supérieur monte à +10 et son +3 vaut le +5 du palier de base) ; pareil pour les armures. **Validé le 2026-11-20** : en 2b, la forge fabrique les paliers (le doublon outil / arme disparaît : forger, c'est faire le palier suivant d'un outil) ; les améliorations à l'intérieur d'un palier font l'objet d'une session à part (`PROCHAINES-SESSIONS.md` → 3a2).

#### Dégâts variables (2026-11-20, pour la sensation)
Chaque coup (héros et monstres, compétences comprises) vaut entre **×0,8 et ×1,2** de la puissance, tiré sur `G.rng`, avant l'armure : `dégâts = max(1, arrondi((puissance × mult × tirage − armure) × crit))`. Même moyenne, donc pas un levier d'équilibrage (mesuré sur 30 graines : médiane et fourchette inchangées) ; les leviers seront débattus dans une session dédiée. Simu après l'ajout (les tableaux ci-dessus datent d'avant) :
| Bot | Boss à la boucle | Min ×1 | Matériaux au boss (médiane) |
|---|---|---|---|
| Par défaut (pioche) | 8 9 12 11 9 10 11 9 9 9 (méd. 9) | 13-19 | 🟫 185 · 🐺 84 · 🧱 23 · 🦴 110 · 🔹 20 · 🦷 11 · 🐾 6 · 💎 2 · 🔥 23 · ❄️ 27 · ⚡ 42 · ⏳ 1 |
| Malin | 9 11 10 12 10 8 9 12 11 10 (méd. 10) | 12-18 | 🟫 219 · 🐺 113 · 🧱 41 · 🦴 105 · 🔹 17 · 🦷 5 · 🐾 2 · 💎 1 · 🔥 27 · ❄️ 34 · ⚡ 39 · ⏳ 0 |
| `--outils` marteau seul | 14 10 7 9 8 9 11 8 11 8 | 11-21 | (hors cible aux deux bouts : outil gardé toute la partie, pas un vrai joueur) |

#### Sous-étape 1 faite : bot malin (`node tools/sim.js --malin`, combinable avec `--graines N`)
Le bot choisit l'outil avant chaque case : 🔨 marteau si la case a une élite, le boss ou un golem ; 🔪 coutelas pour farmer une case déjà faite dans la boucle ; ⛏️ pioche sinon. La sortie par défaut est inchangée (références `tools/qa/ref/sim.txt` et `sim-outils.txt` identiques, nouvelle référence `sim-malin.txt`).
| Bot | Boss à la boucle | Min ×1 | Matériaux au boss (médiane) |
|---|---|---|---|
| Par défaut (pioche) | 9 13 10 12 9 12 8 9 12 9 (méd. 9,5) | 12-20 | 🟫 208 · 🐺 96 · 🧱 29 · 🦴 118 · 🔹 22 · 🦷 11 · 🐾 6 · 💎 1 |
| Malin | 10 9 10 10 11 8 8 8 10 **7** (méd. 10) | 11-15 | 🟫 200 · 🐺 99 · 🧱 34 · 🦴 97 · 🔹 14 · 🦷 7 · 🐾 3 · 💎 1 · 🔥 23 · ❄️ 28 · ⚡ 35 · ⏳ 0 |

Lecture : bien choisir son outil fait gagner ~2 boucles au plus rapide et resserre l'écart (11-15 min au lieu de 12-20). Une graine sort de la cible (7e boucle) : **à recaler avec la forge**, qui accélère encore. Le marteau sur les élites coûte des rares (🦷 7 au lieu de 11, 🐾 3 au lieu de 6) : si les recettes demandent des rares, le bon choix sur les élites devient la pioche, ce qui est le but de l'idée 2.

#### Sous-étape 2 faite : forge à recettes, non permanente (2026-11-20)
Décisions de Steven (2026-11-20) : l'outil est l'arme, **chaque outil a ses propres paliers** (la 2b ajoute le palier II de chacun, forgés séparément) ; les recettes ne coûtent **que des matériaux extraits**, jamais d'or (l'or reste pour les bâtiments) ; une recette se **découvre à la première victoire** contre les monstres qui fournissent ses matériaux. Réserve de Steven : reforger à chaque boucle risque d'être répétitif, **à soumettre au joueur du conseil de la 3b** (reforge, mémoire du village) ; en attendant, un bouton « Refaire la même forge ».

Règles en place (`src/village/forge.data.js`, `forge.engine.js`) :
- La forge ouvre avec le bâtiment Forge (20 ⭐). **Un objet par emplacement** : un par outil (palier II), une armure, un accessoire.
- Un objet forgé sert pendant **la boucle suivante** (ou tout de suite si le héros n'est pas encore parti, comme les bâtiments), puis **s'use** à la fin de cette boucle (le bilan de boucle le dit). Prix plein à chaque fois.
- Le palier II d'un outil ne joue que **quand cet outil est en main** : sa puissance s'ajoute à celle du héros avant le multiplicateur de l'outil, son critique et son armure ignorée s'ajoutent à ceux de l'outil.
- « Refaire la même forge » : forge d'un coup la dernière recette de chaque emplacement encore libre, au prix plein.
- Sauvegarde, `meta.v` reste 1 : `meta.equip` (porté pendant la boucle), `meta.forge` (forgé pour la suivante), `meta.recent` (dernières recettes), `{}` par défaut ; une recette inconnue ou au mauvais emplacement est retirée au chargement.

| Emplacement | Objet | Effet | Recette | Découverte | Pousse à… |
|---|---|---|---|---|---|
| ⛏️ Pioche | Pioche à griffes (palier II) | +3 puissance en main | 2 🐾 · 20 🦴 | Ours | pioche sur l'ours |
| 🔨 Marteau | Marteau de carrier (palier II) | +3 puissance, ignore 1 armure de plus | 30 🧱 · 6 🔹 | Golem | farmer les golems |
| 🔪 Coutelas | Coutelas d'os (palier II) | +2 puissance, +5 % critique | 3 🦷 · 15 🦴 | Sanglier alpha | pioche sur les alphas |
| Armure | Tablier de cuir | +15 PV, +1 armure | 60 🟫 | Mulot et Sanglier | coutelas dans les Prés |
| Armure | Manteau de fourrure | +25 PV, +1 armure, +4 % esquive | 50 🐺 · 1 🐾 | Loup et Ours | coutelas sur les loups |
| Armure | Plastron de pierre | +20 PV, +3 armure, −3 % esquive | 25 🧱 · 4 🔹 | Golem | golems |
| Accessoire | Lanterne de mineur | +5 s de boucle | 30 🟫 · 10 🦴 | Sanglier | communs |
| Accessoire | Collier de crocs | +4 % esquive, +3 % critique | 20 🐺 · 1 🦷 · 1 🐾 | Loup, alpha, Ours | rares |
| Accessoire | Sablier de poche | +15 s de boucle | 1 ⏳ | Gardien | après le boss |

Le sablier de poche perd le « +10 % d'or » de la v2 (pas de multiplicateur d'or dans le moteur pour un objet d'après-boss).

Simulation : avant chaque boucle, les bots forgent ce qu'ils peuvent payer, dans l'ordre plastron, manteau, tablier, paliers II, collier, lanterne ; le bot par défaut ne forge que le palier de la pioche (il ne change jamais d'outil). Ils forgent en pratique un ou deux objets par boucle (souvent la lanterne, une armure de temps en temps).
| Bot | Boss à la boucle (10 graines) | Min ×1 | 30 graines (triées) | Matériaux restants au boss (médiane) |
|---|---|---|---|---|
| Par défaut | 7 10 11 13 11 9 10 9 10 10 (méd. 10) | 11-20 | 7 à 13, méd. 10 (avant la forge : 6 à 12, méd. 10) | 🟫 37 · 🐺 31 · 🧱 21 · 🦴 64 · 🔹 20 · 🦷 9 · 🐾 1 · 💎 2 |
| Malin | 6 10 10 10 9 10 8 10 7 9 (méd. 9,5) | 9-16 | 6 à 11, méd. 9 (avant : 7 à 12, méd. 9) | 🟫 39 · 🐺 59 · 🧱 16 · 🦴 40 · 🔹 13 · 🦷 2 · 🐾 0 · 💎 0 |

Lecture : les médianes restent dans la cible (9-12) et la forge ne bouleverse pas l'équilibrage (prix plein, peu d'objets par boucle). Les queues basses (6e-7e boucle) existaient déjà avant la forge sur 30 graines ; la forge en ajoute une pour le malin. À traiter dans la session « leviers d'équilibrage » (`PROCHAINES-SESSIONS.md`), pas en gonflant les recettes. Les matériaux ne s'accumulent plus : ils partent à la forge.

#### Sous-étape 3 faite : outil conseillé dans le bestiaire (2026-11-20)
Règles en place (`toolAdvice` dans `src/enemies/enemies.engine.js`, `ADVICE` et `RANK[rang].net` dans `enemies.data.js`, section « CARNET » de la fiche d'un monstre) :
- Le carnet compte les victoires et les défaites **par outil** (`bestiary[id].byTool = {outil: {w, l}}`, `{}` par défaut au chargement) ; la défaite est notée au monstre qui a fait tomber le héros, avec l'outil de l'action en cours.
- Après la première défaite : note en négatif, « Pas la pioche, en tout cas. » Après la première victoire : « Tombé sous la pioche. », et le carnet attend un autre outil pour comparer.
- L'outil conseillé est **nommé** dès que le monstre a été battu avec **2 outils différents**, ou au filet de victoires de son rang (normal 10, élite 2, boss 1 ; le compteur `kills` existait déjà, une ancienne sauvegarde voit donc l'outil nommé tout de suite pour les monstres déjà beaucoup battus).
- **Interprétation à valider par Steven** : l'outil nommé est fixé par monstre dans les données (idée 1 : golem → marteau, loup → coutelas, élites → pioche), pas déduit des victoires du joueur (qui ne reflètent que ses habitudes). Comparer ses essais *déclenche* le conseil, il ne le *choisit* pas.

| Monstre | Outil conseillé | Note du carnet (provisoire, la session lore des scribes la reprendra) |
|---|---|---|
| Mulot dentu | 🔪 Coutelas | « Tout en cuir, presque rien au cœur : on l'écorche. » |
| Sanglier | 🔪 Coutelas | « Du cuir en pagaille sous la soie : le coutelas en tire moitié plus. » |
| Sanglier alpha | ⛏️ Pioche | « Sa défense dort au cœur : le marteau la brise, la pioche la rapporte. » |
| Loup gris | 🔪 Coutelas | « Vif et sans armure : on le prend de vitesse, la fourrure vient avec. » |
| Golem de pierre | 🔨 Marteau | « La pierre se moque des lames : la masse passe outre l'armure. » |
| Ours ancien | ⛏️ Pioche | « Les griffes sont au fond : creuser droit, sans rien casser. » |
| Gardien du Sablier | 🔨 Marteau | « On ne vient pas pour le sable : on vient pour qu'il tombe. » |

Le carnet ne tire aucun hasard : la simulation est identique octet pour octet.

#### Pour plus tard
- Reforger à chaque boucle peut devenir répétitif (réserve de Steven) : à soumettre au joueur du conseil de la 3b (reforge, mémoire du village).
- Le bot malin suit sa propre règle (marteau sur les élites) ; un bot qui suit le carnet (pioche sur les élites pour les rares) mesurerait mieux l'idée 2.

### Étape 3a1 : leviers d'équilibrage — conseil et mesures (2026-11-20)
Mesures faites sur une copie du moteur (banc jetable, chiffres injectés). **Pente 2,4 et bot moyen codés le 2026-11-21** (sous-étapes 1 et 2, voir « Pente 2,4 dans le jeu » et « Bot moyen » plus bas) ; le reste n'est pas codé.
#### Conseil élargi
- **Accord** des quatre voix : le premier levier est la **puissance des monstres par niveau** (le levier « mort ») ; les PV des monstres sont le levier « temps ». Les dégâts variables ne sont pas un levier (même moyenne), les rencontres aléatoires viennent en dernier.
- Le conteur : « le temps qui s'écoule, c'est le Sablier qui gagne ; la mort, c'est le monde qui mord » ; lore : plus on creuse, plus le temps sédimenté est dense et rend les coups ; pas de « +secondes » sur une armure (le temps appartient à l'Horloge et au Sablier) ; rencontres en « graine du jour » qui revient (« mardi, il y a toujours le blaireau »). Le joueur : 25 à 40 % de morts après la 3e boucle, au-delà de 50 % le joueur croit perdre son temps ; armures qui changent la façon de jouer ; un bot « moyen » en plus du bot malin. Le sceptique : un seul chiffre d'abord (la pente), épines et déplacement sont de la puissance ou du temps déguisés, rencontres aléatoires = variance en plus ; mesurer la part de morts **et** la médiane.
- **Désaccord** : les épines (puissance déguisée pour le sceptique ; vrai lien survie / vitesse pour le joueur et le conteur).

#### Mesures (30 graines, deux bots ; « morts » = part des boucles finies par la mort à partir de la 3e)
« 3a2 » = approchée par +0,6 de puissance par niveau de Forge (jusqu'à +5), gratuite : borne haute.
| Réglage | Bot par défaut | Bot malin | Morts |
|---|---|---|---|
| Aujourd'hui (pente 1,6) | méd. 10 [7-13], 3 hors cible | méd. 9 [6-11], 6 hors | 7-9 % |
| idem + 3a2 | méd. 8, 8 hors | méd. 8, 14 hors | 9 % |
| Pente 2,0 | méd. 10, 1 hors | méd. 9, 4 hors | 27-30 % |
| Pente 2,2 | méd. 10, 1 hors | méd. 9, 3 hors | 41-48 % |
| **Pente 2,4** | **méd. 11 [8-14], 1 hors** | **méd. 10 [8-12], 0 hors** | 56 % |
| **Pente 2,4 + 3a2** | **méd. 10, 0 hors** | **méd. 10, 1 hors** | 61-65 % |
| Pente 2,2, PV par niveau 8 → 9 (+ 3a2) | méd. 12, 3 hors (11, 2 hors) | méd. 10, 1 hors (10, 0 hors) | 40 % (47 %) |
| Pente 2,5 et plus | le bot par défaut sort par le haut | | 70 % et plus |
| Courbes de même valeur au niveau 8 : `8,08 × ln L` / `(L−1)^0,8` / `(L−1)^1,2` | méd. 18 / 13 / 10 | méd. 17 / 12 / 9 (+ 3a2 : 8, 11 hors) | 90 / 70 / 40 % |

Lecture :
- **La survie reprend un rôle** : à pente 2,4, +2 d'armure de départ fait gagner 2 boucles au malin et divise ses morts par 2,5 (22 % au lieu de 57 %) ; à pente 1,6, la même armure ne sert presque qu'aux boucles 1-2. Conséquence pour la 3a2 : les niveaux d'armure compteront, il faudra des pas petits.
- **Tout se joue aux niveaux 2 à 5** : une courbe concave (log) durcit les premières cases et fait un mur, une convexe laisse le début facile et ne laisse plus de marge. La droite à 2,4 est la meilleure, avec un seul chiffre.
- **Épines** (30 % des dégâts reçus renvoyés, en permanence) : une boucle gagnée, comme un bon objet ; 60 % : trop fort (12 graines hors cible pour le malin). Elles ne marchent que si le héros encaisse.
- **Marche** (0,5 s par case aujourd'hui) : deux fois plus vite fait gagner une boucle à pente 1,6, presque rien à pente 2,4 (la mort domine) : levier faible pour l'instant.
- La part de morts du bot (56 %) est une borne haute : il ne bat jamais en retraite.

#### Décisions de Steven (2026-11-20)
- **Pente de puissance des monstres 1,6 → 2,4** (`monsterStats`), une sous-étape à elle seule.
- **Bot « moyen »** validé (un humain joue moins bien que le bot malin) ; règle fixée et **codée le 2026-11-21** (voir « Bot moyen » plus bas).
- **Dernier Grain** (idée du conteur) : un pari dans les **10 derniers pour cent du sablier** (pas sous 25 % de PV : à pente 2,4, il se déclencherait presque à chaque boucle) : plus de puissance, mais la boucle s'arrête au prochain coup reçu. Chiffres à mesurer.
- **Effets par emplacement** : pas d'épines sur l'armure actuelle seule ; une liste d'effets, chaque emplacement a les siens (épines sur le torse, vitesse sur les bottes…). Le héros a des **habits de base** qu'on améliore ; la permanence d'une boucle à l'autre arrive **vers la 3e-5e boucle**, débloquée en parlant aux PNJ et par des quêtes secondaires, présentées au joueur comme du **confort de jeu**. Pour rendre une quête, il faut **revenir au village pendant la boucle** : le village devient une case à part où l'on passe sans finir la boucle (aujourd'hui, rentrer au village finit la boucle, et les matériaux gardés se rendent gratuitement entre deux boucles). Le chemin du retour coûte donc du temps ; des **compétences qui se gardent d'une boucle à l'autre** (façon Increlution) rendent peu à peu les quêtes faisables. À travailler avec la 3b. Rappel mesuré : la marche (0,5 s par case) pèse peu aujourd'hui ; le retour ne coûtera vraiment que si elle compte davantage.
- **Permanence et horloges** : le « une boucle de gagnée » des niveaux permanents a été mesuré en 3a2 à pente 1,6, quand plus de 90 % des boucles finissent par le temps. À pente 2,4, la mort domine : une puissance permanente fait toujours avancer plus loin avant la fin du temps, et une armure ou des PV permanents font tenir plus longtemps avant la mort. La permanence accélère donc quelle que soit l'horloge qui arrête la boucle, mais ce n'est pas encore mesuré à pente 2,4.
- **Plus tard** : un palier par zone plus une courbe douce dans la zone (demande la zone dans le calcul des stats, à mesurer quand les mondes arriveront) ; rencontres en zones en « graine du jour » déterministe ; compétences de déplacement (à revoir quand la marche comptera).

#### Pente 2,4 dans le jeu (sous-étape 1, faite le 2026-11-21)
`monsterStats` (`src/enemies/enemies.engine.js`) : puissance `3 + 2,4(L−1)` au lieu de `3 + 1,6(L−1)`, rien d'autre. Vrai code, 30 graines (`node tools/sim.js --graines 30`, la part de morts comptée avec une copie de la simu, la simu ne l'affiche pas) : **aucun écart avec le banc**.
| | Bot par défaut | Bot malin | Morts (boucles 3 et +) |
|---|---|---|---|
| Avant (pente 1,6), vérifié | méd. 10 [7-13], 3 hors cible | méd. 9 [6-11], 6 hors | 7,0 % / 8,6 % |
| **Pente 2,4** | **méd. 11 [8-14], 1 hors** (une graine à 14) | **méd. 10 [8-12], 0 hors** | **55,9 % / 56,7 %** |
- 10 graines (sortie par défaut, références de `tools/qa/ref/`) : `13 11 14 12 11 10 11 12 11 11` (méd. 11 ; avant `9 13 10 12 9 12 8 9 12 9`). La graine à 14 est la 3e (23757) : elle est dans les 10 graines de la sortie par défaut.
- `--outils` (un outil gardé toute la partie, 10 graines) : l'ordre s'inverse. Marteau méd. 10 [9-12] (avant 9 [7-11]), pioche 11 [10-14] (avant 10 [7-13]), **coutelas 13 [11-13]** (avant 10 [8-11]) : le coutelas, rapide mais léger, souffre le plus de monstres qui frappent plus fort. Tout reste entre 8 et 13 sauf la graine à 14 de la pioche.

#### Bot moyen (sous-étape 2, faite le 2026-11-21 : `node tools/sim.js --moyen`, combinable avec `--graines N`)
Un humain attentif mais imparfait (`tools/sim-moyen.js`, règle validée par Steven). Son hasard vient d'un générateur à part (`lcg(graine ^ 0x9e3779b9)`), jamais `G.rng` ni `G.mrng` : à décisions égales, les combats sont les mêmes.
1. **Outil** : si le carnet nomme l'outil du monstre principal de la case (l'élite ou le boss s'il y en a un, sinon le monstre le plus fréquent), il le suit une fois sur deux, sinon il garde le sien (pioche au départ).
2. **Route** : comme les autres bots (case neuve du plus bas niveau, sinon farm de la plus haute), mais une fois sur quatre il refarme la case déjà faite de plus haut niveau au lieu d'avancer ; sous 30 % de PV en combat, il bat en retraite de la case, une fois par boucle au plus. Rentrer au village ne sert à rien : le moteur traite le retour comme la mort (on garde ses gains), on perd seulement le temps qui reste.
3. **Village** : il achète, tiré au hasard parmi ce qu'il peut payer, jusqu'à ne plus rien pouvoir payer ; il forge dans un ordre tiré au hasard (une recette par emplacement, palier II de son outil du moment seulement).

30 graines, pente 2,4 (« morts » = part des boucles finies par la mort à partir de la 3e, affichée par `--moyen`) :
| Bot | Boss à la boucle | Morts |
|---|---|---|
| Par défaut (rappel) | méd. 11 [8-14], 1 hors | 55,9 % |
| Malin (rappel) | méd. 10 [8-12], 0 hors | 56,7 % |
| **Moyen** | **méd. 12 [9-14], 3 hors** (trois graines à 14) | **13,4 %** |
| Moyen sans retraite (mesure seule) | méd. 11 [8-14], 1 hors | 17,9 % |
| Moyen sans farm une fois sur quatre (mesure seule) | méd. 12 [9-14], 5 hors | 49,7 % |
- 10 graines (référence `tools/qa/ref/sim-moyen.txt`) : `12 10 13 12 9 12 11 12 12 11` (méd. 12).

Lecture :
- Le bot moyen reste dans la cible, mais **au bord haut** (médiane 12, la borne) : un humain moyen met deux boucles de plus que le malin. Tout levier qui ralentit doit donc se mesurer avec lui, sinon il sortira par le haut le premier.
- **Les morts baissent à cause du farm, pas de la retraite** : refarmer une fois sur quatre fait monter le héros en niveau sur des cases sûres, et la boucle finit par le temps. Sans ce farm, on retrouve presque les 56 % des autres bots, qui avancent toujours. 13 % est sous la fourchette du joueur du conseil (25 à 40 %) ; la bonne valeur pour un vrai joueur se situe sans doute entre les deux bots.
- La retraite coûte un peu de temps et ne sauve presque rien : à pente 2,4, un héros sous 30 % de PV meurt à la case suivante (il ne récupère que 10 % de PV entre deux vagues).

### Étape 3a2 : améliorations dans les paliers — conseil et mesures (2026-11-20, en attente des leviers)
Rien n'est codé : mesures faites sur une copie du moteur (banc jetable), à refaire dans le vrai code quand la 3a2 reprendra.
#### Conseil élargi
- **Accord** des quatre voix : coûts en **matériaux seuls** (la décision de la 2b tient, l'or reste aux bâtiments) ; **plafond = niveau du bâtiment Forge** (l'or gagne un usage visible) ; si les niveaux sont perdus avec l'objet, **les refaire d'un clic** (« Refaire la même forge » rejoue aussi les niveaux).
- Le conteur : +3 par palier suffit ; « le forgeron garde le geste, pas l'arme » ; habiller les niveaux en mots (coutelas « émoussé, vif, rasoir ») plutôt qu'un « +3 » nu. Le joueur : chevauchement lisible si l'écran montre la **puissance totale** ; rares au dernier niveau seulement ; refaire +1…+5 chaque boucle est une corvée dès la 3e boucle. Le sceptique : niveaux perdus = taxe de clics ; attendre la 3b, ou palier I seul, permanent, sans rares (déjà épuisés au boss).
- **Décision de Steven** : faire d'abord la session **« Leviers d'équilibrage »** ; la permanence des niveaux demande une raison de lore, une **barre de relation avec le forgeron** (il garde tes armes parce qu'il te connaît), à voir avec la 3b.

#### Mesures (30 graines, deux bots)
Modèle mesuré : palier I jusqu'à +5, palier II jusqu'à +10, plafond = niveau du bâtiment Forge, niveau n → n+1 = 2 × (n+1) (palier I) ou 3 × (n+1) (palier II) du matériau courant de l'outil (pioche 🦴, marteau 🧱, coutelas 🟫 ; armure : son matériau), + 1 rare au dernier niveau ; le bot achète tout ce qu'il peut après la forge.
| Gain par niveau (outil / armure) | Niveaux | Bot par défaut | Bot malin |
|---|---|---|---|
| Sans amélioration (aujourd'hui) | — | méd. 10, 7-13, 3 hors cible | méd. 9, 6-11, 6 hors cible |
| +1 puissance / +3 PV +0,2 armure | perdus | méd. 8, 7 hors cible | méd. 7, 17 hors cible |
| idem | permanents | méd. 8, 10 hors cible | méd. 7, 16 hors cible |
| outils seuls (armures sans niveaux) | perdus | méd. 8 | méd. 7 |
| +0,6 palier I, +0,3 palier II / +2 PV (le +5 du palier I = le palier II nu) | perdus | méd. 9 | méd. 8, 9 hors cible |
| +0,3 palier I, +0,15 palier II / +2 PV | perdus | méd. 9, 3 hors cible | méd. 9, 6 hors cible |
| idem | permanents | méd. 8 | méd. 8 |

Lecture :
- **Seules les améliorations d'outil comptent.** Les niveaux d'armure ne déplacent pas le boss. Raison mesurée : à partir de la 3e boucle, plus de 90 % des boucles finissent **par le temps, pas par la mort** (218 sur 234 pour le bot par défaut, 190 sur 207 pour le malin ; aux boucles 1-2, presque toutes finissent par la mort). Survivre ne sert presque à rien, tuer vite sert à tout : PV et armure sont aujourd'hui des stats mortes.
- Le plafond Forge bride déjà (bâtiment au niveau 1-3 quand les niveaux s'achètent : +1 à +3 atteints), et pourtant +0,4 à +1,2 de puissance avance le boss d'une boucle : le bot malin est déjà au bord bas de la cible.
- Seuls des pas d'environ +0,3 restent dans la cible, et ils ne se sentent pas (+1,5 au +5, sur environ 27 de puissance au boss). Le chevauchement voulu (le +3 du palier II vaut le +5 du palier I) est alors impossible : le palier II nu (+3) dépasse de loin le palier I à +5.
- Les niveaux permanents coûtent une boucle de plus partout.

#### Idées de Steven à porter aux leviers (2026-11-20)
- **Armures utiles** : des modificateurs qui font gagner du temps ou rendent le danger réel (épines…), pour qu'elles entrent dans le min-max.
- **Compétences de déplacement ou d'exploration** : un levier pour ralentir ou accélérer la progression.
- **Rencontres** : sur une case, le monstre n'est pas déjà là ; il apparaît avec une chance (des zones plutôt que des cases fixes).

## Refonte de l'expérience (R0, conseil du 2026-11-21 ; R1 faite)
### Pourquoi
En rejouant (21/11), Steven trouve le jeu **inexpliqué**, pas ennuyeux : on ne sait pas pourquoi le héros part combattre, ni pourquoi il mine les monstres au lieu de les tuer (« l'équivalent d'un ta gueule c'est magique ») ; au début d'une boucle, la première chose affichée est une case inaccessible avec un bouton grisé ; les monstres semblent posés dans un cadre et le minage se voit mal. Vision complète : `PROCHAINES-SESSIONS.md` → « R. Refonte de l'expérience ».

### Conseil (quatre voix)
- **Accords** : la raison du minage vient du **personnage** (il est mineur, il voit des strates), pas d'une règle du monde ; une explication ne sert à rien si le minage ne se voit pas, donc l'écran (R1) passe avant la scène (R2) ; rien de ce qui a été découvert ne se perd ; le pilote automatique ne doit **pas** attendre le Gardien du Sablier (la fin du contenu, boucle 10 en médiane).
- **Le sceptique** voulait une simple ligne au lieu d'une scène, une carte qui ne se rend pas, et voit la R4 comme « un nouveau jeu ». Retenu de lui : la carte reste connue, une sortie de secours au lieu du bouton de fin de boucle supprimé (la simu connaît un cas « bloqué », `tools/sim.js`), mesurer le coût de la marche avant de la promettre, un bot de plus pour le pilote.
- **Le joueur** : une scène jouée, pas lue ; un départ en moins de 3 s à la 10e boucle ; pilote tôt.
- **Le conteur** : les répliques de la scène, le géomètre qui garde la carte, « le pilote, c'est le pointillé ».

### Décisions de Steven (2026-11-21)
1. **Le minage expliqué par une scène jouée au premier combat** (R2). Une bulle par geste, 20 s au plus, deux bulles courtes, passables d'un clic mais pas d'un bloc : le premier coup fissure le monstre et des pixels partent vers l'inventaire (« Du temps tassé. Ça se creuse, ça. »), puis le joueur clique lui-même sur le cœur (« On ne tue pas ça. On le descend. »). Au cœur, un vestige : la **clé de la lampe de Grésille**, dans le **Mulot dentu** (premier vestige de `lore.md`). Une seule fois par sauvegarde. Texte dans `lore.md` → « Le premier combat ».
2. **Le cartographe, Hyacinthe Jalon**, vieux géomètre du hameau (lore dans `lore.md`). La carte ne s'efface jamais : il garde ce qui est **tracé** (cases découvertes, niveaux, fiches) ; seul l'état de la boucle repart de zéro (cases faites, récoltes). **C'est lui qui lance la boucle** : chaque matin, on va chercher la carte. La première fois, une vraie scène ; ensuite, il ne reparle que s'il a du neuf (annotation du village, zone). Avec la renommée, le village annote la carte, puis elle est prête d'avance. **Critère du joueur : moins de 3 s entre le début de la boucle et le départ, à la 10e boucle.**
3. **La matinée, des actions enchaînées** (idée de Steven, à la manière des actions combinées de Terraformental) : la première fois, le joueur fait chaque geste lui-même (parler au cartographe, au forgeron…, partir vers la zone 1) ; ensuite, l'enchaînement devient un seul bouton **« Même matinée »** (le germe existe : « Refaire la même forge »). Différence avec Terraformental, où les actions combinées sont fixées par le jeu : ici, c'est la matinée du joueur qui est rejouée. Premier automatisme, dès la 2e boucle.
4. **« Rentrer » remplace « Rentrer au village (fin de boucle) »** (précisé par Steven le 21/11) : rentrer au village, rien de plus. Le héros revient à pied et la marche coûte du temps de sablier : au joueur de juger si ça vaut le coup. À terme, le joueur peut **épingler UNE recette** pour ne pas avoir à se souvenir de ce qu'il lui manque (« faut pas être méchant non plus »).
7. **Trois PNJ du matin, avec un nom** (conseil des noms du 21/11, noms vérifiés sur le web) : **Hyacinthe Jalon**, le cartographe (genre volontairement indéterminable), rend la carte ; **Honorine Mailloche**, la forgeronne, rend les outils et garde **le coffre** ; **Philémon Basane**, le tanneur, donne **le sac**. Parti pris assumé : des noms de famille faits de mots rares liés au métier (jalon, mailloche = gros maillet, basane = cuir de mouton tanné), pour reconnaître d'un coup d'œil qui fait quoi (le joueur : une signature du village, pas un tic tant que ce sont des mots rares et pas les noms de métier ; ne pas ajouter un quatrième PNJ sur la même recette sans variation). Lore dans `lore.md`.
8. **Le sac et le coffre** : aujourd'hui, tout ce qui est gagné (or, bois, minerai, matériaux, renommée) va au village dès le gain et se garde même à la mort (`addRes`, `src/world/loop.engine.js`) ; seul l'équipement forgé se perd. Demain : le tanneur donne chaque matin un sac (une sorte de sac sans fond) dont **la capacité grandit** ; au-delà, le butin est perdu. « Rentrer » sert à vider le sac dans **le coffre de la forgeronne**, qui garde tout d'une boucle à l'autre (le matin : « Tiens, je me souvenais pas qu'il y avait autant de choses là-dedans. »). C'est une perte qui n'existe pas aujourd'hui : à chiffrer avec les trois bots. À trancher en R3 : ce que devient le sac à la fin de la boucle, si l'or passe par le sac, la capacité de départ et sa croissance.
9. **La matinée coûte du temps de sablier** (à la manière de Terraformental) : environ 5 s par PNJ, soit 15 s pour les trois ; l'action combinée (« Même matinée ») descend à 10 s, et **une compétence sociale** à 5 s pour les trois. Ce coût est distinct du critère du joueur (moins de 3 s réelles de clics pour partir). 15 s sur une boucle de 75 s, c'est 20 % : chiffres à mesurer en R3. La compétence sociale ouvre aussi des **quêtes principales, secondaires et cachées** selon les compétences : avec la 3b (PNJ, quêtes, compétences qui se gardent).
5. **Le pilote automatique se débloque à la première victoire sur la Bauge du Roi** (le Repaire de niveau 4 des Prés de l'Aube, avec le Sanglier alpha : le « boss » de la zone 1). Lore : Jalon trace en pointillé le chemin d'hier sur la carte, et le héros le suit par habitude, sans s'en souvenir (« Tu as suivi un chemin tout droit, tu devrais te l'épargner. »). Il suit la route sur les cases connues et s'arrête devant une case inconnue ou un boss. Il reste toutes les Collines grises à jouer avec lui. Boucle où tombe la Bauge : **pas encore mesurée** (estimée 3e-5e), à mesurer avec les trois bots en R5 ; un 4e bot « pilote » arrive avec lui.
6. **Ordre : R1 écran → R2 scène → R3 village, cartographe, matinée et « Rentrer » → R4 zones → R5 pilote.** Chaque étape finit sur une partie jouable jusqu'au Gardien. Les chiffres ne bougent pas avant R3 (marche du retour, mesurée avec les trois bots) ; le rééquilibrage vient avec R4. Dernier Grain (3a1) et 3a2 restent en pause jusqu'après R4.

### R1, livraison 1 faite : la disposition (2026-11-21)
Aucun chiffre ni moteur touché (`npm run check` : les quatre références de la simu identiques).
- **Héros toujours à gauche** (`src/hero/hero-panel.view.js`) : portrait, PV, XP, stats et choix de l'outil en haut ; équipement porté (un emplacement par ligne), journal et « Rentrer au village (fin de boucle) » en bas.
- **Une seule barre d'onglets** : Combat / Carte / Bestiaire / Village (Village et le bouton de fin de boucle partent en R3). `S.view` et l'ancien onglet « Exploration » disparaissent : `S.tab` vaut `combat`, `map`, `bestiary` ou `village`. Une boucle s'ouvre sur la Carte ; le Combat s'ouvre quand le héros part sur une case et rend la main à la Carte à la fin de la case, seulement si le joueur regardait le combat. Pastille rouge sur Combat si un combat tourne pendant qu'on regarde un autre onglet.
- **Fiche de case à côté de la carte**, réduite à la zone (nom, biome, niveau, vagues, ennemis ou ressource, bouton, indication) ; dessous sur écran moyen.
- **Plus de bouton grisé** : une case où le héros ne peut pas aller n'affiche que la raison. En début de boucle, au chargement et après une réinitialisation, la case choisie est la première accessible jamais faite, sinon la première accessible (`startTile()`, `shared/state.js`). Avant, la sélection de la boucle précédente restait, souvent une case des Collines devenue inaccessible.
- **Écran étroit** (≤ 860 px) : le haut de la colonne du héros devient une bande au-dessus des onglets, le bas passe sous leur contenu ; ≤ 640 px : cases de carte de 38 px, barre du haut compacte ; ≤ 420 px : onglets en icônes seules. Captures `etroit-carte.png` et `etroit-combat.png` (390 px de large).
- Livraison 2 (combat en diagonale) : section suivante.

### R1, livraison 2 faite : le combat en diagonale (2026-11-21)
Vue seule, aucun chiffre ni moteur touché (`npm run check` : les quatre références identiques).
- **Diagonale façon Pokémon** (`index.html`, `src/combat/scene.css`) : titre de la case en haut à gauche, monstres en haut à droite, héros en bas à gauche, « Battre en retraite » en bas à droite. Plus de cadre autour des monstres : une plaque (niveau, nom, PV, élan) au-dessus du sprite, posé sur une ombre au sol. La plaque du héros porte ses PV, son élan, l'outil et les compétences. Les coups partent en diagonale (le héros vers le haut à droite, le monstre vers le bas à gauche).
- **Grille plus grande, en échelle entière** (`digScale`, `src/mining/dig.view.js`) : ×4, sinon ×3, sinon ×2, le plus grand où toute la vague tient dans la zone des monstres (largeur des grilles et des plaques, hauteur de la plus haute). Recalculé quand la zone change de taille. Exemple : deux Mulots dentus en ×4 sur grand écran, en ×2 sur téléphone.
- **Pixels creusés visibles** : un pixel retiré reste en silhouette pâle (`f9e6cf` de la palette, translucide), on voit où le héros a creusé. Les éclats suivent l'échelle de la grille (2 pixels, 3 pour ceux du marteau).
- **Téléphone** (≤ 640 px) : une seule colonne (titre, monstres, héros), héros en ×1 (64 px), compétences de 40 px, la retraite passe sous le héros.
- Capture `combat-creuse.png` (`tools/screenshot.py`) : un Mulot dentu entamé, trou en silhouette pâle.

### Mis de côté (à reproposer)
- La carte garde la place de toutes ses cases, même cachées : beaucoup de vide au début, surtout sur téléphone. Piste de Steven (21/11) : un **dézoom progressif** (la carte s'agrandit à mesure que les cases se découvrent). À voir en R3 avec la carte de Jalon (repris dans le prompt de R3) ; Steven testera et on ajustera.
- Une phrase qui dit pourquoi le héros part le matin (à trancher avec R2, repris dans son prompt).
- La règle du conteur « une trace à l'encre pèse plus qu'un souvenir » pourrait aussi expliquer le carnet du bestiaire gardé par le village (repris dans le prompt de la session lore).

## Équipement, forge et mémoire du village — PROPOSITION v3 (étape 2, en attente de validation)

### Décisions de Steven (2026-11-12)
- Un objet se forge **une fois** puis s'**améliore** à la forge.
- **Même structure de loot pour tous les monstres** (3 ou 4 butins selon le type), mais les élites ont un butin commun plus faible et un butin rare bien plus fréquent. **Chaque monstre lâche au moins un matériau**, en quantité aléatoire.
- **Éléments par infusion** ; changer l'élément d'une arme déjà infusée coûte un peu moins cher.
- **Permanence progressive** : au début, l'équipement ne survit pas à la boucle ; le village apprend à s'en souvenir emplacement par emplacement, puis il retient aussi les améliorations.
- La **renommée** doit servir à quelque chose : piste des rangs du village et des **hauts faits**.

### Butins par type de monstre
Chaque victoire tire chaque ligne indépendamment. Si aucun matériau ne tombe, le monstre lâche **1 matériau commun** (garantie). L'or reste lâché comme aujourd'hui. Le trophée unique reste à part.

| Type | Commun | Peu commun | Rare |
|---|---|---|---|
| Bête des Prés | 🟫 Cuir | 🦴 Os | 🦷 Défense |
| Bête des Collines | 🐺 Fourrure | 🦴 Os | 🐾 Griffe |
| Pierre | 🪨 Minerai | 🔹 Éclat | 💎 Cristal |
| Boss | 🔹 Éclat | 💎 Cristal | ⏳ Sable du sablier |

| Monstre | Rang | Commun | Peu commun | Rare |
|---|---|---|---|---|
| Mulot dentu | normal | Cuir 60 % ×1 | Os 20 % ×1 | Défense 2 % ×1 |
| Sanglier | normal | Cuir 60 % ×1-2 | Os 30 % ×1 | Défense 4 % ×1 |
| Sanglier alpha | élite | Cuir 40 % ×1-2 | Os 50 % ×1-2 | Défense 45 % ×1 |
| Loup gris | normal | Fourrure 60 % ×1 | Os 25 % ×1 | Griffe 2 % ×1 |
| Golem de pierre | normal | Minerai 60 % ×1 | Éclat 30 % ×1 | Cristal 3 % ×1 |
| Ours ancien | élite | Fourrure 40 % ×1-3 | Os 50 % ×1-2 | Griffe 45 % ×1 |
| Gardien du Sablier | boss | Éclat 100 % ×2-3 | Cristal 100 % ×1 | Sable 100 % ×2 |

Stock attendu au moment du boss (victoires médianes du bot) : ~210 🟫, ~105 🐺, ~56 🪨 (en plus des filons), ~86 🦴, ~9 🦷, ~4 🐾, ~3 💎. Les communs alimentent surtout les améliorations, les rares rythment les recettes. Les coûts des tableaux ci-dessous seront recalés par la simulation une fois ce loot en place.

### Mémoire du village : la permanence se débloque avec la renommée
Au début, un objet forgé ne dure **qu'une boucle** : il faut le reforger (les matériaux, eux, sont gardés par le village). À chaque seuil de renommée, le forgeron **se souvient** d'un emplacement de plus. La renommée retrouve ainsi un rôle, cohérent avec le lore (« la renommée, c'est la mémoire que le village a de toi »).

| Renommée | Rang du village | Le village se souvient… | Atteint vers (bot, boucle) |
|---|---|---|---|
| 0 | Hameau | de rien : l'équipement se perd à la fin de la boucle | 1 |
| 40 | Village | de ton **arme** | 2-3 |
| 100 | Bourg | de ton **armure** | 4 |
| 150 | Ville | de ton **accessoire** | 5-6 |
| 220 | Cité | de tes **améliorations** (avant, elles retombent à +0 à chaque boucle) | 8-9 |

Les rangs pourront aussi débloquer d'autres bâtiments et des faveurs (étape 3 de la feuille de route) : ce tableau en est la première brique.

### Éléments : infusion et réinfusion
- Une arme a **un seul élément** à la fois ; on n'a qu'un exemplaire de chaque arme.
- **Infuser** une arme neutre coûte le prix plein ; **réinfuser** une arme qui a déjà un élément coûte **15 % de moins** (arrondi), car la forge a déjà « ouvert » le métal.
- Pour avoir à la fois un coutelas de feu et un coutelas de givre, il faudrait deux exemplaires : non prévu dans cette version, on change d'élément selon la zone visée.

| Infusion | Prix plein | Réinfusion (−15 %) | Disponible |
|---|---|---|---|
| 🔥 Feu | 20 🪙 · 6 🪵 | 17 🪙 · 5 🪵 | dès la Forge |
| ❄️ Givre | 40 🪙 · 4 🐺 · 2 🔹 | 34 🪙 · 3 🐺 · 2 🔹 | Loup et Golem vaincus |
| ⚡ Foudre | 80 🪙 · 1 💎 · 3 🔹 | 68 🪙 · 1 💎 · 3 🔹 | Golem ×10 et Ours vaincus |

Faiblesses et résistances : voir la v2 (Feu contre les bêtes des Prés et le loup ; Givre contre l'alpha et les golems ; Foudre contre l'ours et le Gardien).

### Hauts faits (première liste)
Chaque haut fait donne de la renommée une fois (donc de la mémoire), parfois un petit bonus. Ils demandent un compteur de victoires par monstre (`bestiary[id].kills`), utile aussi pour les recettes.
| Haut fait | Condition | Récompense |
|---|---|---|
| Dératiseur | 50 mulots vaincus | +10 ⭐ |
| Chasseur de meute | 100 loups vaincus | +15 ⭐ |
| Casseur de cailloux | 50 golems vaincus | +15 ⭐, +5 % de minerai |
| Roi déchu | Sanglier alpha vaincu 5 fois | +20 ⭐ |
| Sans un regard en arrière | finir une boucle sans retraite ni repos à la source | +10 ⭐ |
| Collectionneur | 3 trophées uniques | +15 ⭐ |
| Maître forgeron | un objet à +5 | +25 ⭐ |
| Élémentaliste | vaincre un monstre avec chacun des 3 éléments | +20 ⭐ |
| Briseur de sablier | vaincre le Gardien | +50 ⭐ (en plus de l'actuel) |

### Inchangé depuis la v2
Types d'armes (rapide / équilibrée / lourde), liste des objets, amélioration +1 à +5 (niveau max = niveau du bâtiment Forge) : les coûts en matériaux seront recalés sur le nouveau loot. Cible de simulation : boss entre la 8e et la 13e boucle, médiane 9-12 (révisée le 2026-11-19).

### Sauvegarde
Champs avec valeur par défaut au chargement, `meta.v` reste 1 : `meta.mats = {}`, `meta.items = {}` (objets permanents, avec `lvl` et `elem`), `meta.equip`, `bestiary[id].kills = 0`, `meta.feats = {}`. Les objets non encore mémorisés vivent dans `run` (perdus en fin de boucle).

### Découpage proposé (une mécanique à la fois, chacune jouable)
1. Compteurs de victoires + nouveau loot (3 butins, garantie, quantités) + stock de matériaux affiché.
2. Forge + équipement, non permanents, et mémoire du village par la renommée.
3. Améliorations +1 à +5 (permanentes au rang Cité).
4. Types d'armes.
5. Éléments, infusion et réinfusion.
6. Hauts faits.

## Équipement et forge — PROPOSITION v2 (remplacée en partie par la v3 ci-dessus : loot, permanence, éléments)

### Retours de Steven (2026-11-12)
- Un objet se forge **une fois**, puis s'**améliore à la forge**. Question ouverte : l'amélioration survit-elle d'une boucle à l'autre ?
- Plusieurs **types d'armes** avec des stats et des attributs différents, dont des **éléments**.
- Avant de choisir la règle de déblocage des recettes : voir le tableau de loot ci-dessous.

### Tableau de loot (mesuré avec le bot de `tools/sim.js`, 10 parties, sans équipement)
| Monstre | Rang | Cases (niv) | Stats niv min → max (PV / pui / arm) | XP | Butin actuel | Trophée (chance) | 1re victoire (boucle) | Victoires avant le boss | Victoires / boucle en fin de partie |
|---|---|---|---|---|---|---|---|---|---|
| Mulot dentu | normal | Prés 1-3 | 10 / 2,7 / 0 → 24 / 5,6 / 1 | 4-12 | 1-2 🪙 | Incisive (4 %) | 1 | 118 (94-142) | 11 |
| Sanglier | normal | Prés 2-4 | 25 / 4,8 / 1 → 45 / 8,2 / 2 | 8-16 | 2-4 🪙, 🪵 15 % | Défense (3 %) | 1 | 81 (67-109) | 8 |
| Sanglier alpha | élite | Prés 4 | 108 / 10,5 / 3 | 48 | 10-15 🪙, 1-3 🪵 50 % | Couronne de boue (15 %) | 3 (2-3) | 8 (7-11) | 1 |
| Loup gris | normal | Collines 3-7 | 25 / 6,2 / 1 → 54 / 12,6 / 3 | 12-28 | 2-4 🪙 | Croc (3 %) | 2 (1-3) | 112 (83-147) | 16 |
| Golem de pierre | normal | Collines 4-7 | 54 / 7,8 / 3 → 90 / 12,6 / 5 | 16-28 | 3-5 🪙, 🪨 40 % | Cœur de pierre (3 %) | 4 (2-4) | 64 (40-80) | 10 |
| Ours ancien | élite | Collines 7 | 192 / 17,6 / 5 | 84 | 20-30 🪙, 1-2 🪨 50 % | Griffe (15 %) | 7 (5-8) | 5 (3-6) | 1 |
| Gardien du Sablier | boss | Sommet 8 | 408 / 22,7 / 6 | 160 | 80-100 🪙 | Fragment (100 %) | 10 (8-13) | 1 | — |

À retenir : un monstre normal tombe **~100 fois** avant le boss, une élite **~1 fois par boucle**. Les matériaux des normaux doivent donc être rares ou très demandés ; ceux des élites rythment la progression.

### Matériaux (taux revus pour ces volumes)
| Matériau | Source (chance, quantité) | Stock attendu au moment du boss |
|---|---|---|
| 🟫 Cuir | Mulot 20 %, Sanglier 30 % (1) | ~48 |
| 🦷 Défense d'alpha | Sanglier alpha 100 % (1) | ~8 |
| 🐺 Fourrure | Loup gris 25 % (1) | ~28 |
| 🔹 Éclat de pierre | Golem 30 % (1) | ~19 |
| 🐾 Griffe d'ours | Ours ancien 100 % (1) | ~5 |
| ⏳ Sable du sablier | Gardien 100 % (2) | après le boss |

### Types d'armes
Puissance de référence 16, cible sans armure puis avec 5 d'armure :
| Type | Attaque toutes les | Dégâts par coup | Particularité | Dégâts / s (arm 0 → arm 5) |
|---|---|---|---|---|
| Équilibrée (pioche) | 0,9 s | ×1 | — | 17,8 → 12,2 |
| Rapide (coutelas) | 0,6 s | ×0,7 | +5 % critique | 18,7 → 10,3 |
| Lourde (marteau) | 1,4 s | ×1,5 | ignore 2 d'armure | 17,1 → 15,0 |

Le rapide domine contre les nuées sans armure (Prés), le lourd contre les golems et l'ours.

### Éléments
Un élément s'**infuse** dans une arme à la forge (un seul à la fois, remplaçable). Il multiplie le coup entier : `dégâts = max(1, puissance × multiplicateur × élément − armure)`, ×1,5 sur une faiblesse, ×0,5 sur une résistance.

| Monstre | Faible à | Résiste à |
|---|---|---|
| Mulot, Sanglier | 🔥 Feu | — |
| Sanglier alpha | ❄️ Givre | 🔥 Feu (boue cuite) |
| Loup gris | 🔥 Feu | ❄️ Givre (fourrure) |
| Golem de pierre | ❄️ Givre (le gel fend la pierre) | 🔥 Feu |
| Ours ancien | ⚡ Foudre | ❄️ Givre |
| Gardien du Sablier | ⚡ Foudre (la foudre change le sable en verre) | 🔥 Feu, ❄️ Givre |

| Infusion | Coût | Disponible |
|---|---|---|
| 🔥 Feu | 20 🪙 · 6 🪵 | dès la Forge |
| ❄️ Givre | 40 🪙 · 3 🐺 · 2 🔹 | Loup et Golem vaincus |
| ⚡ Foudre | 80 🪙 · 1 🐾 · 3 🔹 | Ours vaincu |

### Objets
| Emplacement | Objet | Type | Bonus de base | Coût de forge | Débloqué par |
|---|---|---|---|---|---|
| Arme | Vieille pioche | équilibrée | +0 | offerte | départ |
| Arme | Coutelas d'os | rapide | +2 puissance, +5 % critique | 30 🪙 · 2 🦷 · 4 🟫 | Sanglier alpha |
| Arme | Marteau de carrier | lourde | +3 puissance | 60 🪙 · 6 🔹 · 4 🪨 | Golem |
| Arme | Pioche à griffes | équilibrée | +5 puissance, +5 % critique | 120 🪙 · 2 🐾 · 5 🔹 | Ours ancien |
| Armure | Tablier de cuir | — | +15 PV, +1 armure | 20 🪙 · 6 🟫 | Mulot et Sanglier |
| Armure | Manteau de fourrure | — | +25 PV, +1 armure, +4 % esquive | 50 🪙 · 8 🐺 · 4 🟫 | Loup gris |
| Armure | Plastron de pierre | — | +20 PV, +3 armure, −3 % esquive | 90 🪙 · 8 🔹 · 4 🪨 | Golem |
| Accessoire | Lanterne de mineur | — | +5 s de boucle | 30 🪙 · 4 🪵 · 3 🪨 | dès la Forge |
| Accessoire | Collier de crocs | — | +4 % esquive, +3 % critique | 50 🪙 · 6 🐺 · 1 🐾 | Loup et Ours |
| Accessoire | Sablier de poche | — | +10 s de boucle, +10 % d'or | 200 🪙 · 2 ⏳ | Gardien |

### Amélioration à la forge (+1 à +5)
- Gain par niveau : arme **+1 puissance** ; armure **+6 PV et +0,5 armure** ; accessoire **+20 % de son bonus de base**.
- Coût du niveau n → n+1 (n = 0 à 4) : `20 × 1,6ⁿ` 🪙 + `2 × (n+1)` matériaux de la zone de l'objet ; les niveaux +4 et +5 demandent aussi 1 matériau d'élite de la zone (🦷 Prés, 🐾 Collines).
- Total pour un objet des Prés à +5 : 316 🪙, 30 🟫, 2 🦷. C'est le débouché principal des matériaux de farm.
- Le niveau max d'un objet est celui du bâtiment Forge (plafonné à 5) : le bâtiment existant garde un rôle.

### Persistance de l'amélioration (à trancher)
| Option | Principe | Pour | Contre |
|---|---|---|---|
| **A (recommandée)** | Objet et niveaux permanents | Cohérent avec le lore (le village et le forgeron se souviennent), standard des jeux idle, simple à sauvegarder | La puissance monte vite : se règle par les coûts |
| B | Objet permanent, niveaux remis à zéro à chaque boucle | Tension à chaque boucle | Demande des ressources « de boucle » séparées ; refaire les mêmes améliorations à chaque boucle devient répétitif |
| C | A + un affûtage temporaire en cours de boucle (ex. pierre à aiguiser trouvée en exploration : +2 puissance jusqu'à la fin de la boucle) | Garde A et ajoute de petites décisions en boucle | Une mécanique de plus, à faire dans une étape suivante |

### Déblocage des recettes (à trancher, voir le tableau de loot)
| Option | Règle | Arrivée des recettes (boucle médiane) |
|---|---|---|
| 1 | 1re victoire contre chaque monstre requis | Prés : 1-3 · Golem : 4 · Ours : 7 |
| 2 | Compteur : 10 victoires (normal), 2 (élite) | Prés : 1-2 · Alpha : ~4 · Golem : ~5 · Ours : ~8 |

Avec l'option 2, un seuil d'élite au-delà de 2 repousse les armes de l'Ours après le boss. Elle demande un compteur `bestiary[id].kills` (nouveau champ, défaut 0).

### Équilibrage
- Cible : **boss entre la 8e et la 13e boucle, médiane 9-12** dans `node tools/sim.js`. Le bot forgera, améliorera et infusera selon une règle simple : l'arme la plus forte contre la zone visée, puis les améliorations les moins chères.
- Leviers dans l'ordre : chances de drop, puis coûts d'amélioration, puis bonus des objets. Les bâtiments ne bougent pas.

### Sauvegarde
Nouveaux champs avec valeur par défaut au chargement, `meta.v` reste 1 : `meta.mats = {}`, `meta.items = {vieille_pioche:{lvl:0}}`, `meta.equip = {arme:'vieille_pioche', armure:null, accessoire:null}`, l'élément dans `meta.items[id].elem`, et `bestiary[id].kills` si l'option 2 est retenue.

### Découpage proposé (une mécanique à la fois)
1. Matériaux + forge + équipement (sans types ni éléments) : jouable, simu dans la cible.
2. Améliorations +1 à +5.
3. Types d'armes (vitesse, multiplicateur, perce-armure).
4. Éléments et infusions.

## Backlog
Voir la feuille de route dans `docs/INDEX.md` et les prompts dans `PROCHAINES-SESSIONS.md`. Faits : découpage du code, combat-minage (étape 1), outils (2a), forge à recettes et outil conseillé (2b). Prochaines étapes : améliorations dans les paliers (3a2), puis mémoire du village par la renommée (3b).
