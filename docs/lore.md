# Lore — brouillon (à retravailler ensemble)

> Tout ceci est une proposition. Les noms entre [crochets] restent à choisir.

## L'accroche
Au pied des Collines grises, le hameau des Heurelles vit de sa mine, Grésille. Le Radoteur creuse plus profond que tout le monde, obsédé par une veine qui scintille dans les strates les plus anciennes. Un matin, sa pioche perce une chambre oubliée. Au centre se trouve un immense **Sablier** de pierre et de verre. Un coup de pioche de trop le fêle.
Depuis, la journée recommence.

## L'intro : texte final des 5 écrans (2026-11-19)
Une image par écran (`sd_raw/intro_*`, clé dans `tools/sprites.json`), un clic pour passer.
1. **`intro_hameau`** — « Au pied des Collines grises, le hameau des Heurelles vit de sa mine, Grésille. On y compte mal les jours, mais on y creuse bien. »
2. **`intro_veine`** — « On l'appelle le Radoteur : depuis trente ans, il ne parle que de sa veine. Il creuse plus profond que tout le monde, et parle à sa pioche, qui a le bon goût de ne jamais répondre. »
3. **`intro_chambre`** — « Un matin, la roche cède sur une chambre oubliée. Au milieu, un Sablier plus vieux que le village. »
4. **`intro_fele`** — « Un coup de pioche de trop. Le verre se fend, et le sable s'envole jusqu'au hameau. »

Ce que l'intro pose, et ce qu'elle laisse au jeu (décidé le 2026-11-19) : l'écran 2 explique le surnom (il date d'**avant** la boucle, d'où l'ironie), l'écran 4 montre le déclencheur et le sable qui retombe sur le village (pourquoi ils se souviennent). Pourquoi lui oublie tout (voir plus bas) se découvre en jouant. Texte retenu, à ajuster en testant.
5. **`intro_reveil`** — « Le lendemain, c'était hier. Le Radoteur ne s'en souvient pas. Le village, un peu. »

## Pourquoi le village se souvient, et pas le héros
Le sable qui s'échappe de la fissure retombe sur le hameau. À chaque boucle, les habitants gardent un peu plus de souvenirs, flous mais tenaces, du mineur et de ce qu'il a fait. Lui, en revanche, se réveille chaque matin l'esprit « rembobiné » : il était le plus près de la fissure quand elle a cédé, c'est donc lui que le temps a le plus rembobiné.
→ C'est ce qui justifie la mécanique : **la renommée, c'est la mémoire que le village a de toi.** Plus les gens se souviennent, plus ils t'aident : l'entraîneur reprend là où vous en étiez, le forgeron garde tes plans.
→ C'est aussi une inversion des histoires de boucle classiques (Majora's Mask, Outer Wilds), où c'est le héros qui se souvient.

## Le Sablier et ses fragments
- Le Gardien du Sablier, au sommet des Collines, garde le premier **fragment**. C'est déjà le trophée du boss dans la v0.3.
- La **mine** descend dans le temps : chaque strate est une époque plus ancienne du même lieu. On y retrouve les restes de ses boucles passées : sa propre pioche, des notes griffonnées.
- Chaque **monde** est une époque (préhistoire, âge du bronze, avenir…) avec son morceau du Sablier.
- **Le monde tardif** : en réparant le Sablier, le passé change, et du nouveau contenu apparaît dans les mondes déjà terminés.

## Le mineur : « le Radoteur », puis Anselme Tardif (décidé le 2026-11-19)
- Au début, tout le monde l'appelle **« le Radoteur »** : le village l'a rangé dans une case, le vieux fou qui répète. Le surnom se dit avec de plus en plus de tendresse à mesure que la mémoire du village monte.
- Son vrai nom, **Anselme Tardif**, est révélé tard (vers la 8e à 10e boucle), comme une récompense de lore. « Tardif » est un clin d'œil assumé : à ce moment, le joueur connaît déjà le thème, ce n'est pas un spoiler.
- **La révélation est une scène, pas une notification** : au début d'une boucle, dans un moment calme, une habitante qu'il croise chaque matin (la boulangère) lui lance « Bonjour, Anselme », sans prévenir. Ensuite seulement, le nom change à l'écran pour de bon, et un **haut fait secret** s'allume en écho (affiché « ??? » dans la liste avant). Un indice discret prépare le moment (« Ils hésitent sur ton nom… »). Après, certains villageois changent leur façon de l'appeler.
- **Son nom est gravé au dos de sa pioche depuis le début, illisible** ; il devient lisible à la révélation. Se marie avec les vestiges retrouvés dans les monstres.

## Le premier combat : pourquoi il mine (décidé le 2026-11-21, conseil de la refonte R0)
La raison vient du personnage, pas d'une règle du monde : il est mineur, il ne sait pas faire autre chose, et il voit des strates là où les autres voient une bête. « Temps sédimenté » reste une intuition du héros, jamais un exposé.
Scène **jouée** sur le premier Mulot dentu (une bulle par geste, 20 s au plus, voir `design.md` → « Refonte de l'expérience ») :
1. Le premier coup fissure le monstre, des pixels partent vers l'inventaire. Le Radoteur : « Du temps tassé. Ça se creuse, ça. »
2. Le joueur clique lui-même sur le cœur. Le Radoteur : « On ne tue pas ça. On le descend. »
3. Au cœur : la clé de la lampe de Grésille (premier vestige). Il la range sans se demander à qui elle était.
Réplique en réserve (conteur) : « Regarde-moi ça, on dirait du mardi tassé sur du jeudi. »

## Le cartographe : Hyacinthe Jalon (décidé le 2026-11-21)
- **Qui** : un vieux géomètre du hameau, qui a relevé la mine et les environs avant la fissure. Il mesure, il ne creuse pas : il était à la surface, loin de la fissure.
- **Pourquoi lui se souvient** : il ne se souvient pas de tout, seulement de ce qui s'est tracé (chemins, distances, noms de lieux). Il dessine à l'encre, et **une trace à l'encre pèse plus qu'un souvenir**. Il garde la carte, pas l'histoire : il parle de la carte, jamais du temps (le village se souvient « un peu »).
- **Le geste qui lance la journée** : chaque matin, il tend le rouleau. « Prends. C'est la même qu'hier. Moi aussi, je préférerais qu'elle change. »
- **Avec la renommée** : la carte se couvre d'annotations du village (« Ne pas boire ici. », « Il a dit qu'il y avait de l'or. Il y avait des cailloux. ») ; puis elle est prête d'avance : « Je l'ai refaite cette nuit. J'ai pas pu m'en empêcher. »
- **Le pointillé** (le pilote automatique, après la première victoire sur la Bauge du Roi) : Jalon trace le chemin d'hier, et le héros le suit par habitude, comme il parle à sa pioche. « Tu as suivi un chemin tout droit, tu devrais te l'épargner. » La mémoire de ses boucles est dans le tracé, pas dans sa tête.
- **Genre volontairement indéterminable** : Hyacinthe est un vieux prénom porté par des hommes comme par des femmes (« Placide », retenu d'abord, se lit masculin). Dans les textes, éviter les accords qui trancheraient (« Jalon » seul, tournures neutres).

## Les deux autres PNJ du matin (décidés le 2026-11-21, conseil des noms)
Même parti pris que Jalon : un prénom d'époque et un nom de famille fait d'un mot rare lié au métier, pour reconnaître d'un coup d'œil qui fait quoi.
- **Honorine Mailloche, la forgeronne** (la mailloche est un gros maillet ; le nom tire un peu vers le comique, c'est assumé). Rend les outils et garde **le coffre**, la seule chose qui traverse les boucles. Le matin : « Tiens, je me souvenais pas qu'il y avait autant de choses là-dedans. » Réplique en réserve (conteur) : « C'est toi qui les as mises ? Ah non, c'est moi. Évidemment. »
- **Philémon Basane, le tanneur** (la basane est une peau de mouton tannée). Donne chaque matin **le sac**, qui grandit. Répliques en réserve (conteur) : « Voilà ton sac. Il est plus grand qu'hier. Il est toujours plus grand qu'hier, je ne sais pas comment je fais. » ; « Un sac sans fond, ça existe. Je l'ai cousu. Ne me demande pas où va le fond. »
- **Noms vérifiés** (recherche web, 2026-11-21) : aucune personne connue, marque ni commune « Hyacinthe Jalon », « Honorine Mailloche », « Philémon Basane » ; « mailloche » n'existe que comme nom d'outil (verrerie, percussion) ; homonyme proche de Jalon : la commune de Jâlons (Marne), avec accent et « s », sans risque. Écartés : « Garnier » (marque de cosmétiques), « Anselme … » (le vrai nom du héros), « Fauvel » (le *Roman de Fauvel*), « Maroquin » (maroquinerie de luxe), « Craon » (vraie commune), Mâchefer et Alun (mots trop bruts).

## Les lieux (confirmés par Steven le 2026-11-19)
Répartition proposée par le conseil (2 voix sur 3 pour chacun), confirmée telle quelle :
- **Les Heurelles : le hameau.** On y compte mal les jours ; c'est là qu'Anselme se réveille chaque matin. Doux, pluriel, un peu moqueur, crédible comme vrai toponyme : il tient d'être lu à chaque boucle.
- **Grésille : la mine.** Le grès (sable devenu pierre), le crissement sous la pioche, le Sablier qui crépite sous terre.
- **Griselune : un lieu secret ou une époque tardive.** Mystérieux, presque trop beau pour être vrai : le contraste est voulu. Placé loin de Grésille (même attaque « Gr- ») et des Collines grises (même racine).
- La chambre du Sablier garde un nom nu : « la Chambre ».
Accroche possible : « Aux Heurelles, on compte mal les jours ; à Grésille, on les creuse ; et sous la lune de Griselune, ils s'entassent. »
**Vérification (recherche web, 2026-11-19)** : aucune commune ni aucun lieu-dit trouvé sous ces trois noms. Les homonymes les plus proches, sans risque de confusion : Les Hérolles (lieu-dit de Coulonges, Vienne), Grézillé (commune déléguée de Gennes-Val-de-Loire, Maine-et-Loire), le quartier des Grésilles à Dijon (au pluriel, avec un « s »), Griselles (communes de Côte-d'Or et du Loiret). Il n'existe pas d'annuaire complet des lieux-dits : un micro-toponyme cadastral reste possible, mais rien d'assez connu pour gêner.

## Vestiges et déjà-vu (proposés par le conseil, retenus provisoirement le 2026-11-19)
Conseil à quatre voix (Claude, conteur, joueur, sceptique). Steven garde tout pour l'instant, **carnet des vestiges compris**, et ajustera en testant. Rien n'est encore en jeu.

### 5 vestiges cachés dans les monstres
Règle du sceptique, adoptée par la synthèse : **des objets banals et un peu drôles, un seul qui fait mal** ; un vestige est un reste d'une journée passée, pas un message adressé au joueur ; le lien avec Anselme reste suggéré, jamais expliqué.
| # | Vestige | Monstre | Texte affiché | Souvenir au village | Voix |
|---|---|---|---|---|---|
| 1 | Clé de la lampe de Grésille | Mulot dentu (dès la boucle 1-2 : le plus fréquent, sert de tuto) | « Elle ouvre la lampe de la mine. Tu l'as perdue un matin. Lequel ? » | Le veilleur de la mine : « Quelqu'un descendait toujours avant l'aube. » | conteur, joueur (placement), sceptique (une clé) |
| 2 | Croûton de pain | Sanglier | « Encore croustillant. Ça ne devrait pas. » | La boulangère met un pain de côté, sans savoir pour qui (prépare la révélation du nom) | **3 voix** (Claude, conteur, sceptique) |
| 3 | Page de carnet et crayon rongé | Loup gris | « Mulot n° 212. Il m'a reconnu. » | Un enfant se met à numéroter les poules | **3 voix** (Claude, conteur, joueur) |
| 4 | Un gant de laine, seul | Golem de pierre | « Taille large. Ravaudé trois fois, chaque fois par une main différente. » | (le seul qui fait mal) le village l'a raccommodé à chaque boucle sans le savoir | **3 voix** sur le gant (conteur, joueur, sceptique), 2 sur le Golem |
| 5 | La pioche gravée, nom presque lisible | Ours ancien (élite, vers la boucle 7-9, juste avant la révélation) | « Un nom, au dos. Presque lisible. » | Débloque la scène « Bonjour, Anselme » | **3 voix** (Claude, conteur, joueur) |
- Le **Gardien du Sablier ne cache aucun vestige** (sceptique) : il garde le fragment, c'est assez.
- Écartés : le sablier miniature (un clin d'œil au temps de trop), le gant d'enfant (pathos qui casse le ton), le bouton de tablier (gardé en réserve pour une suite).
- Lisibilité (joueur) : un **Carnet des vestiges** avec 5 silhouettes grisées « ? » et un indice sur le monstre hôte (« quelque chose brille dans un loup ») ; un pixel qui scintille dans le sable récompense la visée au clic. Les vestiges survivent à la boucle. Risque : un vestige trop tardif ou trop facile à rater passe inaperçu.

### 6 répliques de déjà-vu, une par rang de renommée
Rangs : Hameau (0) → Village (40) → Bourg (100) → Ville (200) → Cité (350), puis après la révélation du nom.
1. **Hameau**, le veilleur : « Encore toi, le Radoteur ? Tu radotes même ton chemin. »
2. **Village**, le forgeron : « Pas la peine de me dire où est la mine. Tu y vas tous les jours. »
3. **Bourg**, un enfant : « Tu comptes les mulots ? Moi aussi. J'en suis à onze. »
4. **Ville**, la boulangère : « Je garde un pain pour toi. Va savoir pourquoi. »
5. **Cité**, l'entraîneur : « Tu me dis toujours la même chose. Je commence à l'aimer. »
6. **Après la révélation**, le veilleur : « Bonne journée, Anselme. Celle-ci, je la garde. »
- Garde-fou du sceptique : une réplique vue 50 fois devient du bruit. **Une seule par boucle, à l'arrivée au village**, et à terme 1 ou 2 variantes par rang tirées au hasard.
- Variantes en réserve : « T'as déjà dit ça. Hier. Ou demain ? » (joueur), « Ta pioche, tu la poses toujours au même endroit. Je me demande si c'est toi ou elle. » (sceptique), « Bonjour, Anselme. Tu as l'air fatigué. » (joueur).

## Points de vigilance pour tous les noms
- Pas de mièvrerie : les diminutifs en -ette, -ou, -ille basculent vite dans le gnangnan ; rester mélancolique.
- Vérifier qu'un nom n'est pas celui d'une vraie commune avant de l'adopter.
- Éviter toute confusion avec Sablier, Tardif, Radoteur et les biomes existants (Prés de l'Aube, Collines grises, Puits ancien).
- Un seul clin d'œil au temps à la fois : le titre et le héros portent déjà le thème.

## Ton
Mélancolique mais drôle. Le mineur est un peu fou à force de revivre la même journée : il parle à sa pioche et numérote les mulots. Les villageois ont des déjà-vu de plus en plus précis (« On s'est déjà parlé, non ? Tu vas encore me demander du minerai… »).

## Questions ouvertes
- Vestiges, répliques et carnet retenus provisoirement : à revoir une fois en jeu.
- **Le bestiaire est « son carnet »** (Steven : oui, le héros le garde). Explication proposée, à valider : **c'est le village qui le garde**. Chaque matin, le veilleur (ou la boulangère) le lui rend : « Tiens, tu l'as encore oublié hier. » La mémoire reste dehors, chez les autres, ce qui respecte l'inversion. Le geste évolue avec la renommée, de la méfiance (« c'est à vous, ça ? ») à l'habitude.
- **Fin provisoire (2026-11-19)** : réparer le Sablier en réunissant ses fragments. « Apprendre à vivre avec la boucle » reste possible plus tard (seconde fin, ou fin secrète à Griselune).
