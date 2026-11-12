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
- **Exploration case par case au début**. Plus tard, le **Cartographe** permettra de programmer une route sur les cases connues (mode idle).
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
Stats au niveau L : `PV = (12 + 8(L−1)) × mult`, `puissance = (3 + 1,6(L−1)) × mult`, `armure = ⌊(L−1)/2⌋ + bonus`.

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
Le boss tombe entre la 8e et la 13e boucle, soit environ 12 à 20 min de jeu en ×1. Cible à conserver : 9 à 13 boucles.

## Architecture du code (étape 1 de la feuille de route, faite)
Le jeu est découpé en modules ES natifs, sans build : `src/data.js` (données), `src/engine.js` (moteur pur, testable dans Node), `src/ui/*.js` (rendu et interactions). Le découpage est mécanique : aucune règle ni aucun chiffre n'a changé.
- **Simulation** : `node tools/sim.js` importe `src/engine.js` et `src/data.js`. Sortie identique octet pour octet à celle de la v0.3 monolithique (boss aux boucles 9 13 10 12 9 12 8 9 12 9).
- **Sauvegarde** : même clé `boucles-sablier-v01`, même objet `meta` (v1). Vérifié en chargeant une sauvegarde produite par l'ancien moteur.
- **Jouer en local** demande désormais un serveur HTTP (`python -m http.server`), les modules ne se chargeant pas en `file://`.

## Équipement et forge à recettes — PROPOSITION (étape 2, en attente de validation)

### Principes
- **Le village garde les objets** : une fois forgé, un objet appartient au village pour toujours (`meta.items`). Le héros oublie son niveau, pas son équipement. Cela colle au lore (« le forgeron garde tes plans »).
- **3 emplacements** : arme (puissance, critique), armure (PV, armure, esquive), accessoire (utilitaire : temps de boucle, butin). Un objet par emplacement, on change librement au village entre deux boucles.
- **Matériaux propres à chaque zone**, lâchés par les monstres : c'est la raison de refaire une zone déjà terminée (farm).
- **Recettes débloquées par le bestiaire** : une recette apparaît à la forge quand **tous les monstres qui donnent ses matériaux ont été vaincus au moins une fois** (`bestiary[id].killed`, déjà sauvegardé). Le bestiaire affiche « Sert à : … » dans la fiche du monstre.
- **Paliers par niveau de Forge** (le bâtiment existant) : palier 1 à Forge niv 1, palier 2 à Forge niv 3, palier 3 à Forge niv 5. Le bâtiment Forge garde ses bonus actuels.
- Un objet se forge **une seule fois** (pas de niveaux d'objet dans cette version).

### Matériaux (nouveaux butins)
| Matériau | Zone | Source (chance, quantité) |
|---|---|---|
| 🟫 Cuir | Prés | Mulot (35 %, 1) · Sanglier (50 %, 1) |
| 🦷 Défense d'alpha | Prés | Sanglier alpha (100 %, 1) |
| 🐺 Fourrure | Collines | Loup gris (50 %, 1) |
| 🔹 Éclat de pierre | Collines | Golem de pierre (50 %, 1) |
| 🐾 Griffe d'ours | Collines | Ours ancien (100 %, 1) |
| ⏳ Sable du sablier | Sommet | Gardien du Sablier (100 %, 2) |

Le bois et le minerai existants servent aussi. L'or reste le coût principal.

### Recettes
| Emplacement | Objet | Bonus | Coût | Débloquée par | Palier |
|---|---|---|---|---|---|
| Arme | Pioche affûtée | +2 puissance | 15 🪙 · 2 🪵 · 2 🪨 | dès la Forge | 1 |
| Arme | Coutelas de défense | +3 puissance, +3 % critique | 40 🪙 · 2 🦷 · 3 🟫 | Sanglier alpha vaincu | 1 |
| Arme | Pioche à griffes | +5 puissance, +5 % critique | 120 🪙 · 2 🐾 · 4 🔹 · 3 🪨 | Ours ancien vaincu | 2 |
| Armure | Tablier de cuir | +15 PV, +1 armure | 20 🪙 · 4 🟫 | Mulot ou Sanglier vaincu | 1 |
| Armure | Manteau de fourrure | +30 PV, +1 armure, +3 % esquive | 60 🪙 · 5 🐺 · 3 🟫 | Loup gris vaincu | 2 |
| Armure | Plastron de pierre | +25 PV, +3 armure | 100 🪙 · 6 🔹 · 4 🪨 | Golem vaincu | 2 |
| Accessoire | Lanterne de mineur | +5 s de boucle | 30 🪙 · 2 🪵 · 3 🪨 | dès la Forge | 1 |
| Accessoire | Collier de crocs | +4 % esquive, +3 % critique | 50 🪙 · 4 🐺 · 1 🐾 | Loup + Ours vaincus | 2 |
| Accessoire | Sablier de poche | +10 s de boucle, +10 % d'or | 200 🪙 · 2 ⏳ | Gardien vaincu | 3 |

Ordres de grandeur : le Tablier de cuir vaut à peu près un niveau de Forge plus deux niveaux d'Entraîneur en PV, pour ~20 🪙 et un peu de farm. La Pioche à griffes (+5 puissance) vaut ~5 niveaux d'Entraîneur : c'est l'objet qui rend le boss abordable, mais elle demande d'avoir battu l'Ours, deux fois pour 2 griffes.

### Équilibrage
- Cible inchangée : **boss entre la 9e et la 13e boucle** dans `node tools/sim.js`. Le bot forgera l'objet le plus fort payable par emplacement, après ses achats au village.
- Leviers si la simu sort de la cible : chances de drop des matériaux d'abord (elles règlent le temps de farm), puis bonus des objets. Les coûts des bâtiments ne bougent pas.
- Les nouvelles stats passent par `heroBase()` comme les trophées : aucun changement dans le combat.

### Sauvegarde
Nouveaux champs avec valeur par défaut au chargement, `meta.v` reste 1 : `meta.mats = {}` (stock de matériaux), `meta.items = {}` (objets forgés), `meta.equip = {arme:null, armure:null, accessoire:null}`.

### Interface
- Onglet Village → section Forge : liste des recettes connues (grisées si non payables), « ??? » pour celles pas encore révélées avec l'indice « Vaincs … », bouton FORGER.
- Section Équipement : 3 emplacements, choix parmi les objets forgés.
- Barre du haut : les matériaux n'y sont pas (trop nombreux), ils sont dans la section Forge.

## Backlog
Voir la feuille de route dans `CLAUDE.md`. Prochaines étapes : découper le code, ajouter l'équipement et la forge à recettes, donner un rôle à la renommée, puis la mine.
