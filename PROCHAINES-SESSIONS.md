# Prochaines sessions — une conversation par sujet

La conversation du 12 au 19/11/2026 a dépassé 600 k tokens de contexte. La suite se fait en **trois conversations dédiées**, chacune repartant de `docs/INDEX.md` (qui résume tout) sans relire l'historique.

**Démarrer une conversation** : dans VS Code, nouvelle conversation Claude Code (ou `claude` dans un terminal ouvert à la racine du dépôt), puis coller le prompt de la section voulue. Mise à jour du 19/11 (soir) : ordre conseillé désormais **Qualité du code (4) → Gameplay 3a → 3b**, Graphismes (héros selon l'outil) et Lore en parallèle. Ancien ordre : **Lore → Graphismes → Gameplay** (le lore donne les noms et le texte que l'intro affiche), mais elles sont indépendantes.

Rappels valables partout :
- Stable Diffusion (Forge) doit tourner pour toute génération d'image : API sur http://127.0.0.1:7860.
- Jouer en local : `python -m http.server` puis http://localhost:8000.
- Vérifier : `node tools/sim.js` (boss entre la 8e et la 13e boucle, médiane 9-12) et `.venv/bin/python tools/screenshot.py` depuis WSL (aucune erreur JS).
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

**Fait le 19/11** : les 4 points du prompt ci-dessous (intro choisie et intégrée, héros v3 avec pioche, icônes de cases). Reste possible : pioche vraiment sur l'épaule (retouche à la main ou inpainting), ombres grises sous quelques sprites, fonds de scène v2, bâtiments du village.

**État avant cette session** : sprites v2 du héros et des 7 monstres (Juggernaut XI + LoRA Pixel Art XL), fonds de combat v1. **Intro** : 5 scènes générées dans `sd_raw/intro_*`, **génération terminée** (30 images : 3 variantes par scène et par réglage, `pxl_*` = Juggernaut + LoRA, `v1_turbo_*` = DreamShaper Turbo sans LoRA), à trier. Pour d'autres variantes : `python tools/sd_generate.py intro_<scène> -n 3 --seed <nouvelle seed>`.

**Prompt à coller** :
```
Lis docs/INDEX.md puis docs/art-direction.md (court) et tools/sprites.json. On travaille les graphismes des Boucles du Sablier ; Forge tourne sur :7860.
1. Intro : fais une planche de contrôle des variantes de sd_raw/intro_* (pxl_ et v1_turbo_), montre-la-moi, propose la meilleure par scène. Après mon choix, note les seeds dans sprites.json et lance `python tools/sd_generate.py --build`.
2. Intègre l'intro au jeu : 5 écrans au premier lancement (image + texte, passer avec un clic, bouton « Passer »), avec le texte de docs/lore.md (s'il n'est pas encore écrit, mets un texte provisoire marqué TODO). Ne la rejoue pas si une sauvegarde existe.
3. Héros : régénère-le avec une vraie pioche sur l'épaule (il tient une lampe-bâton), même pipeline.
4. Icônes de cases de la carte en 32×32 (combat, repaire, boss, bosquet, filon, source, trésor, village, puits) pour remplacer les emojis, avec repli sur l'emoji.
Vérifie avec tools/screenshot.py (WSL), mets à jour docs/art-direction.md et docs/INDEX.md, commit et push à chaque étape.
```

**Prochain prompt (héros selon l'outil, le plus important des graphismes)** — depuis le 19/11 le héros choisit pioche, marteau ou coutelas avant chaque case (`TOOLS` dans `src/data.js`, `meta.tool`), mais son sprite tient toujours une pioche :
```
Lis docs/INDEX.md puis docs/art-direction.md (court), tools/sprites.json (entrée du héros v3, pxl_1202) et dans docs/design.md la section « Étape 2a faite : marteau et coutelas ». Forge tourne sur :7860.
1. Génère deux variantes du héros v3, même pose, même tenue, même palette : une avec un marteau de forgeron, une avec un coutelas. Pars du héros v3 en img2img / inpainting (zone de l'outil seulement) pour qu'il reste reconnaissable ; montre-moi une planche de contrôle (3-4 variantes par outil) avant de choisir.
2. Après mon choix : seeds dans sprites.json, `python tools/sd_generate.py --build` → assets/sprites/hero_marteau.png et hero_coutelas.png (48×48, palette docs/palette.hex).
3. Intègre-les : la scène de combat affiche le sprite de l'outil de l'action en cours (`actionTool(G)` dans src/engine.js), repli sur le héros pioche si le fichier manque (spr()). Garde la séparation moteur / UI.
Vérifie avec tools/screenshot.py (WSL), mets à jour docs/art-direction.md et docs/INDEX.md, commit, et demande-moi avant de pousser.
```

**Commandes utiles** :
- générer : `python tools/sd_generate.py <asset> -n 4` (ou `--profile v1_turbo` pour les fonds) ;
- construire les sprites retenus : `python tools/sd_generate.py --build` ;
- après tout changement de sprite de monstre : `python tools/sprite_grids.py`, puis `node tools/sim.js`.

---

## 3. Gameplay

**Fait le 19/11** : point 0 (le boss à la 8e boucle existe depuis la v0.3 → cible élargie à 8e-13e, médiane 9-12) et étape 2a (marteau et coutelas, choix avant chaque case, `node tools/sim.js --outils`), commit 3bdead3. Icône d'attaque hors combat corrigée (montre l'outil choisi).

**Idées validées par Steven le 19/11** (à caser dans 3a / 3b, puis après) :
1. Outil conseillé par monstre dans le bestiaire (golem → marteau, loup → coutelas, élites → pioche) ;
2. Commandes de forge qui poussent à farmer avec un outil précis (3 🦷 → pioche sur les alphas, 300 🟫 → coutelas dans les Prés) ;
3. Visée utile : « lampe de prospection » au village qui révèle le cœur, cliquer devient payant ;
4. Route programmée (Cartographe) avec un outil par case — le vrai virage idle vers la v2, après 3b ;
5. Vestiges dans les cœurs : brisés au marteau, récupérés à la pioche.
Aussi : un **bot qui change d'outil selon la case** dans `tools/sim.js` (aujourd'hui le bot garde un seul outil toute la partie, donc la simu ne mesure pas un joueur qui choisit bien) — à faire en 3a, pour que l'équilibrage de la forge tienne compte des bons choix.

**Ordre conseillé** : d'abord la session 4 (qualité du code, simu identique), puis 3a, puis 3b. La session graphismes « héros selon l'outil » est indépendante.

### 3a. Forge et équipement non permanent
```
Lis docs/INDEX.md, puis dans docs/design.md seulement : « Étape 2a faite : marteau et coutelas », « Équipement, forge et mémoire du village — PROPOSITION v3 » et, dans la v2, « Types d'armes », « Objets », « Amélioration à la forge ». Lis la section « 3. Gameplay » de PROCHAINES-SESSIONS.md (idées validées). Lis CLAUDE.md pour l'architecture.
Étape 2b du combat-minage, une mécanique à la fois, jouable à chaque étape :
1. Bot malin dans tools/sim.js : il choisit l'outil selon la case (marteau sur les élites et les golems, coutelas en farm de communs, pioche sinon), en option `--malin`, la sortie par défaut reste identique.
2. Forge : objets (arme, armure, accessoire) forgés avec les matériaux extraits, recettes qui demandent des rares ou beaucoup de communs (idée 2), équipement perdu à la fin de la boucle (non permanent).
3. Outil conseillé par monstre dans la fiche du bestiaire, révélé après N victoires (idée 1).
Avant de coder, annonce-moi le périmètre (fichiers touchés) en 5 lignes. Simu dans la cible (boss 8e-13e boucle, médiane 9-12, avec le bot par défaut et le bot malin), sauvegarde compatible (valeurs par défaut au chargement), docs/design.md et docs/INDEX.md à jour, commit à chaque sous-étape et demande-moi avant de pousser.
```

### 3b. Mémoire du village par la renommée
```
Lis docs/INDEX.md, puis dans docs/design.md seulement « Équipement, forge et mémoire du village — PROPOSITION v3 » (sous-sections « Mémoire du village », « Hauts faits », « Sauvegarde ») et la partie forge faite en 2b. Lis CLAUDE.md pour l'architecture.
Étape 2c : les rangs du village (Hameau → Cité) rendent permanents, dans l'ordre, l'arme, l'armure, l'accessoire, puis les améliorations. Une mécanique à la fois, jouable à chaque étape.
Puis recale la cible d'équilibrage : la permanence accélère la progression, propose-moi une nouvelle cible chiffrée avec la simu (bot par défaut et bot malin) avant de toucher aux chiffres.
Annonce le périmètre en 5 lignes avant de coder, sauvegarde compatible, docs/design.md et docs/INDEX.md à jour, commit à chaque sous-étape et demande-moi avant de pousser.
```
Ensuite (conversations à part) : visée utile (idée 3), vestiges dans les cœurs (idée 5, avec le lore), Cartographe (idée 4).

**Commandes utiles** : `node tools/sim.js` après chaque changement de chiffres ; `.venv/bin/python tools/screenshot.py` (WSL) ; prototype à comparer : `/proto/mine-ennemi.html`.

---

## 4. Qualité du code (à faire avant 3a)

**État** : ~1 500 lignes, fichiers petits (le plus gros : `src/engine.js`, 263 lignes) mais lignes très denses. SonarQube for IDE signale surtout de la complexité cognitive au-delà de 15 (`consumeEvents` dans main.js : 41, `renderScene` dans scene.js : 61, `tileHTML` dans panel.js : 35, `fightStep` dans engine.js : 30, `runBot` dans sim.js : 27), des ternaires et templates imbriqués, des `a && a.b` au lieu de `a?.b`. HTML construit dans des chaînes JS, CSS dans un seul fichier de 226 lignes. Rien n'a été touché exprès pendant le gameplay (règle « zéro refactoring passant »).

**Prompt à coller** :
```
Lis docs/INDEX.md, CLAUDE.md (architecture et règles), puis .claude/rules/common/coding-style.md. On ne change AUCUN comportement : refactoring pur des Boucles du Sablier.
1. Inventaire d'abord : liste les avertissements SonarQube (getDiagnostics sur src/ et tools/) par fichier et par règle, et propose un plan en lots (un lot = un sujet, un commit), sans rien modifier. Attends mon accord.
2. Lots proposés (à ajuster) : a) complexité cognitive ≤ 15 en extrayant des fonctions (consumeEvents → table de gestionnaires par type d'événement, renderScene, tileHTML, fightStep, runBot) ; b) ternaires imbriqués et templates imbriqués → petites fonctions de rendu ; c) chaînage optionnel ; d) organisation : gabarits HTML des panneaux dans des fonctions/modules dédiés (src/ui/templates/ ?), CSS découpé par zone (src/styles/ : base, carte, scène, panneau, modales) chargé depuis index.html, sans outil de build.
3. Garde-fous à chaque lot : `node tools/sim.js` et `node tools/sim.js --outils` identiques octet pour octet à avant (compare avec un fichier de référence), `tools/screenshot.py` sans erreur JS et captures identiques à l'œil, moteur toujours sans DOM, sauvegarde inchangée.
Mets à jour CLAUDE.md (architecture) et docs/INDEX.md si des fichiers bougent, commit par lot, demande-moi avant de pousser.
```
