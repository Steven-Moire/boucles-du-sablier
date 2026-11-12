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
Types d'armes (rapide / équilibrée / lourde), liste des objets, amélioration +1 à +5 (niveau max = niveau du bâtiment Forge) : les coûts en matériaux seront recalés sur le nouveau loot. Cible de simulation inchangée : boss entre la 9e et la 13e boucle.

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
- Cible inchangée : **boss entre la 9e et la 13e boucle** dans `node tools/sim.js`. Le bot forgera, améliorera et infusera selon une règle simple : l'arme la plus forte contre la zone visée, puis les améliorations les moins chères.
- Leviers dans l'ordre : chances de drop, puis coûts d'amélioration, puis bonus des objets. Les bâtiments ne bougent pas.

### Sauvegarde
Nouveaux champs avec valeur par défaut au chargement, `meta.v` reste 1 : `meta.mats = {}`, `meta.items = {vieille_pioche:{lvl:0}}`, `meta.equip = {arme:'vieille_pioche', armure:null, accessoire:null}`, l'élément dans `meta.items[id].elem`, et `bestiary[id].kills` si l'option 2 est retenue.

### Découpage proposé (une mécanique à la fois)
1. Matériaux + forge + équipement (sans types ni éléments) : jouable, simu dans la cible.
2. Améliorations +1 à +5.
3. Types d'armes (vitesse, multiplicateur, perce-armure).
4. Éléments et infusions.

## Backlog
Voir la feuille de route dans `CLAUDE.md`. Prochaines étapes : découper le code, ajouter l'équipement et la forge à recettes, donner un rôle à la renommée, puis la mine.
