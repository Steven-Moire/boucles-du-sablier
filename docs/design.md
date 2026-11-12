# Les Boucles du Sablier — document de design

Titre de travail. Prototype jouable (v0.3) : `index.html` (aussi publié sur https://claude.ai/artifact/Rru3ETP8yeJZAF8kKgF96M).

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

## Backlog
Voir la feuille de route dans `CLAUDE.md`. Prochaines étapes : découper le code, ajouter l'équipement et la forge à recettes, donner un rôle à la renommée, puis la mine.
