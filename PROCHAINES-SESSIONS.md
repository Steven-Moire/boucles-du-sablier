# Prochaines sessions — une conversation par sujet

La conversation du 12 au 19/11/2026 a dépassé 600 k tokens de contexte. La suite se fait en **trois conversations dédiées**, chacune repartant de `docs/INDEX.md` (qui résume tout) sans relire l'historique.

**Démarrer une conversation** : dans VS Code, nouvelle conversation Claude Code (ou `claude` dans un terminal ouvert à la racine du dépôt), puis coller le prompt de la section voulue. L'ordre conseillé : **Lore → Graphismes → Gameplay** (le lore donne les noms et le texte que l'intro affiche), mais elles sont indépendantes.

Rappels valables partout :
- Stable Diffusion (Forge) doit tourner pour toute génération d'image : API sur http://127.0.0.1:7860.
- Jouer en local : `python -m http.server` puis http://localhost:8000.
- Vérifier : `node tools/sim.js` (boss entre la 9e et la 13e boucle) et `.venv/bin/python tools/screenshot.py` depuis WSL (aucune erreur JS).
- Le hook de budget prévient dès 150 k tokens : à ce moment-là, clore la conversation et en ouvrir une autre.

---

## 1. Lore

**État** : le mineur est décidé (« le Radoteur », vrai nom Anselme Tardif révélé par la scène de la boulangère, nom gravé au dos de sa pioche). Trois noms de lieux proposés par le conseil, **à confirmer** : Les Heurelles (hameau), Grésille (mine), Griselune (lieu secret / époque tardive). Points de vigilance sur les noms dans `docs/lore.md`.

**Prompt à coller** :
```
Lis docs/INDEX.md, puis docs/lore.md en entier (il est court). On travaille le lore des Boucles du Sablier.
1. Je confirme / modifie la répartition des lieux : [Les Heurelles = hameau, Grésille = mine, Griselune = lieu secret] (à compléter).
2. Vérifie qu'aucune vraie commune ni aucun lieu-dit français ne porte ces trois noms (recherche web), et dis-moi ce que tu trouves.
3. Écris le texte final des 5 écrans de l'intro (voir docs/lore.md → L'accroche) avec les noms retenus : une ou deux phrases courtes par écran, ton mélancolique mais drôle.
4. Propose avec /conseil 5 vestiges de boucles passées à cacher dans les monstres, et 6 répliques de déjà-vu de villageois qui évoluent avec la renommée (du « Radoteur » moqueur au « Anselme » tendre).
Mets à jour docs/lore.md et docs/INDEX.md, commit et push. Ne touche pas au code du jeu.
```

**Fichiers utiles** : `docs/INDEX.md`, `docs/lore.md`, `docs/design.md` → section `### Le lore qui va avec`, skill `/conseil`.

---

## 2. Graphismes

**État** : sprites v2 du héros et des 7 monstres (Juggernaut XI + LoRA Pixel Art XL), fonds de combat v1. **Intro** : 5 scènes générées dans `sd_raw/intro_*`, **génération terminée** (30 images : 3 variantes par scène et par réglage, `pxl_*` = Juggernaut + LoRA, `v1_turbo_*` = DreamShaper Turbo sans LoRA), à trier. Pour d'autres variantes : `python tools/sd_generate.py intro_<scène> -n 3 --seed <nouvelle seed>`.

**Prompt à coller** :
```
Lis docs/INDEX.md puis docs/art-direction.md (court) et tools/sprites.json. On travaille les graphismes des Boucles du Sablier ; Forge tourne sur :7860.
1. Intro : fais une planche de contrôle des variantes de sd_raw/intro_* (pxl_ et v1_turbo_), montre-la-moi, propose la meilleure par scène. Après mon choix, note les seeds dans sprites.json et lance `python tools/sd_generate.py --build`.
2. Intègre l'intro au jeu : 5 écrans au premier lancement (image + texte, passer avec un clic, bouton « Passer »), avec le texte de docs/lore.md (s'il n'est pas encore écrit, mets un texte provisoire marqué TODO). Ne la rejoue pas si une sauvegarde existe.
3. Héros : régénère-le avec une vraie pioche sur l'épaule (il tient une lampe-bâton), même pipeline.
4. Icônes de cases de la carte en 32×32 (combat, repaire, boss, bosquet, filon, source, trésor, village, puits) pour remplacer les emojis, avec repli sur l'emoji.
Vérifie avec tools/screenshot.py (WSL), mets à jour docs/art-direction.md et docs/INDEX.md, commit et push à chaque étape.
```

**Commandes utiles** :
- générer : `python tools/sd_generate.py <asset> -n 4` (ou `--profile v1_turbo` pour les fonds) ;
- construire les sprites retenus : `python tools/sd_generate.py --build` ;
- après tout changement de sprite de monstre : `python tools/sprite_grids.py`, puis `node tools/sim.js`.

---

## 3. Gameplay

**État** : combat-minage en place (les monstres se creusent pixel par pixel, pioche seule, clic pour viser, matériaux extraits, composition dans le bestiaire). Combats et équilibrage identiques à la v0.3. Prochaine étape validée : **outils + forge + équipement non permanent + mémoire du village par la renommée**.

**Prompt à coller** :
```
Lis docs/INDEX.md, puis dans docs/design.md seulement les sections « Miner les ennemis » et « Équipement, forge et mémoire du village — PROPOSITION v3 » (et dans la v2 : « Types d'armes » et « Objets »). Lis CLAUDE.md pour l'architecture (src/dig.js, src/engine.js, src/ui/digview.js).
On attaque l'étape 2 du combat-minage, une mécanique à la fois, jouable à chaque étape :
a) marteau et coutelas comme outils (motifs du prototype proto/mine-ennemi.html), choix de l'outil avant une case ;
b) forge : objets forgés avec les matériaux extraits, équipement non permanent ;
c) mémoire du village par la renommée (rangs Hameau → Cité : arme, armure, accessoire, puis améliorations deviennent permanentes).
Avant de coder (a), annonce-moi le périmètre (fichiers touchés) en 5 lignes. Garde la simu dans la cible (boss 9e-13e boucle), la sauvegarde compatible, mets à jour docs/design.md et docs/INDEX.md, commit et push à la fin de chaque sous-étape.
```

**Commandes utiles** : `node tools/sim.js` après chaque changement de chiffres ; `.venv/bin/python tools/screenshot.py` (WSL) ; prototype à comparer : `/proto/mine-ennemi.html`.
