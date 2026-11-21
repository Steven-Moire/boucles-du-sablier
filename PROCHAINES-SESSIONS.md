# Prochaines sessions — une conversation par sujet

Chaque conversation repart de `docs/INDEX.md` (qui résume tout) sans relire l'historique. Ce qui est déjà fait (prompts exécutés, état d'avant) est archivé dans `docs/archive/sessions-faites.md`.

**Démarrer une conversation** : dans VS Code, nouvelle conversation Claude Code (ou `claude` dans un terminal ouvert à la racine du dépôt), puis coller le prompt de la section voulue. Ordre conseillé (21/11) : **Gameplay R (refonte de l'expérience : R0 conseil, R1 écran…) → 3a1 Dernier Grain → 3a2 → 3b** (qualité du code faite), Graphismes (héros selon l'outil) et Lore en parallèle.

Rappels valables partout :
- Stable Diffusion (Forge) doit tourner pour toute génération d'image : API sur http://127.0.0.1:7860.
- Jouer en local : `python -m http.server` puis http://localhost:8000.
- Vérifier : `node tools/sim.js` (boss entre la 8e et la 13e boucle, médiane 9-12) et `.venv/bin/python tools/screenshot.py` depuis WSL (aucune erreur JS).
- Le hook de budget prévient dès 150 k tokens : à ce moment-là, clore la conversation et en ouvrir une autre.

---

## 0. Contexte Claude (fait le 20/11)
**État** : `CLAUDE.md` à 3,1 Ko (règles absolues, pointeurs), détail dans `docs/outillage.md` et `docs/design.md` → `### Liste des modules` ; règles d'atlas hors sujet dans `.claude/rules-atlas/` (local). Compte rendu dans `docs/archive/sessions-faites.md`.

---

## 1. Lore

**État (20/11)** : sessions faites (prompt d'origine dans `docs/archive/sessions-faites.md`) : mineur décidé (« le Radoteur », vrai nom Anselme Tardif), lieux confirmés et vérifiés (Les Heurelles, Grésille, Griselune), texte final des 5 écrans de l'intro (intégré au jeu), 5 vestiges et 6 répliques de déjà-vu **retenus provisoirement**, carnet des vestiges. Tout est dans `docs/lore.md`.

**Prochaine session lore — prompt à coller** :
```
Lis docs/INDEX.md, puis docs/lore.md en entier (il est court) et, dans docs/design.md, seulement « Étape 2b faite » (sous-étape 3 : outil conseillé et notes du carnet). On travaille le lore des Boucles du Sablier.
1. Scribes du carnet (idée du conseil du 20/11) : un scribe par rang de monstre (le boulanger pour les normaux, une vieille pour les élites, un enfant pour le boss), chacun avec sa voix pour écrire les notes et l'outil conseillé du bestiaire, à relier à la question ouverte « le bestiaire est son carnet, gardé par le village » de docs/lore.md. Tour de table avec /conseil élargi : noms des scribes (points de vigilance des noms dans docs/lore.md, vérifier qu'aucun n'est une vraie commune), leur ton, et 2 notes d'exemple par monstre (une après une victoire, une « en négatif » après une défaite : « pas la pioche »).
2. Relis les 5 vestiges et les 6 répliques de déjà-vu retenus provisoirement : à garder, ajuster ou remplacer ?
Mets à jour docs/lore.md et docs/INDEX.md, commit, demande-moi avant de pousser. Ne touche pas au code du jeu.
```

**Fichiers utiles** : `docs/INDEX.md`, `docs/lore.md`, `docs/design.md` → `### Le lore qui va avec` et `### Étape 2b faite`, skill `/conseil`.

---

## 2. Graphismes

**Fait le 19/11** (détails dans l'archive) : intro intégrée, héros v3 avec pioche, icônes de cases 32×32. Reste possible : pioche vraiment sur l'épaule (retouche à la main ou inpainting), ombres grises sous quelques sprites, fonds de scène v2, bâtiments du village.

**Prochain prompt (héros selon l'outil, le plus important des graphismes)** — depuis le 19/11 le héros choisit pioche, marteau ou coutelas avant chaque case (`TOOLS` dans `src/hero/hero.data.js`, `meta.tool`), mais son sprite tient toujours une pioche :
```
Lis docs/INDEX.md puis docs/art-direction.md (court), tools/sprites.json (entrée du héros v3, pxl_1202) et dans docs/design.md la section « Étape 2a faite : marteau et coutelas ». Forge tourne sur :7860.
1. Génère deux variantes du héros v3, même pose, même tenue, même palette : une avec un marteau de forgeron, une avec un coutelas. Pars du héros v3 en img2img / inpainting (zone de l'outil seulement) pour qu'il reste reconnaissable ; montre-moi une planche de contrôle (3-4 variantes par outil) avant de choisir.
2. Après mon choix : seeds dans sprites.json, `.venv-win\Scripts\python tools/sd_generate.py --build` (Windows) → assets/sprites/hero_marteau.png et hero_coutelas.png (48×48, palette docs/palette.hex).
3. Intègre-les : la scène de combat affiche le sprite de l'outil de l'action en cours (`actionTool(G)` dans src/hero/hero.engine.js), repli sur le héros pioche si le fichier manque (spr()). Garde la séparation moteur / UI.
Vérifie avec tools/screenshot.py (WSL), mets à jour docs/art-direction.md et docs/INDEX.md, commit, et demande-moi avant de pousser.
```

**Commandes utiles** :
- générer (Windows, Forge) : `.venv-win\Scripts\python tools/sd_generate.py <asset> -n 4` (ou `--profile v1_turbo` pour les fonds) ;
- construire les sprites retenus : `.venv-win\Scripts\python tools/sd_generate.py --build` ;
- après tout changement de sprite de monstre : `.venv-win\Scripts\python tools/sprite_grids.py` (ou `.venv/bin/python` sous WSL), puis `node tools/sim.js`.

---

## 3. Gameplay

**Fait le 19/11** (détails dans l'archive) : cible élargie à 8e-13e boucle (médiane 9-12), étape 2a (marteau et coutelas, commit 3bdead3).

**Idées validées par Steven le 19/11** (à caser dans 3a / 3b, puis après) :
1. Outil conseillé par monstre dans le bestiaire (golem → marteau, loup → coutelas, élites → pioche) ;
2. Commandes de forge qui poussent à farmer avec un outil précis (3 🦷 → pioche sur les alphas, 300 🟫 → coutelas dans les Prés) ;
3. Visée utile : « lampe de prospection » au village qui révèle le cœur, cliquer devient payant ;
4. Route programmée (Cartographe) avec un outil par case — le vrai virage idle vers la v2, après 3b ;
5. Vestiges dans les cœurs : brisés au marteau, récupérés à la pioche.

**Fait le 20/11 (3a, étape 2b)** (détails dans l'archive et dans `docs/design.md` → `### Étape 2b faite`) : bot malin `--malin`, dégâts variables, `--graines N`, forge à recettes (palier II de chaque outil, armures, accessoires ; matériaux seulement ; perdus en fin de boucle ; « Refaire la même forge »), outil conseillé dans le bestiaire. Boss méd. 10 (défaut) et 9 (malin) sur 30 graines, queues basses à 6-7 déjà présentes avant la forge : juger l'équilibrage avec `--graines 30`. Encore en vigueur : prix plein à chaque boucle, reforge reportée en 3b ; Steven craint que reforger à chaque boucle soit répétitif, **à soumettre au joueur du conseil de la 3b**. À valider : l'outil conseillé est fixé par monstre dans les données (pas déduit des victoires).

**Sujets reportés le 20/11 (à caser)** :
- **Multi-prestige** façon Increlution : un seul boss ne fait pas un vrai jeu ; la boucle est un premier prestige, il en faut d'autres au-dessus (conseil élargi, avant les mondes / époques de la feuille de route).
- **Scribes du carnet** : casé dans la section 1 (Lore).
- **Courbe de puissance par zone** (21/11, décision « plus tard » de la 3a1) : un palier par zone plus une courbe douce dans la zone, ce qui donne une difficulté qui accélère d'un monde à l'autre. À mesurer à l'arrivée des mondes / époques (8 niveaux aujourd'hui : une formule à plusieurs chiffres s'ajusterait au bot, pas au joueur).

**Ordre conseillé (21/11, révisé)** : refonte de l'expérience (R) → fin de la 3a1 (Dernier Grain) → 3a2 → 3b (la session 4, qualité du code, est faite). La session graphismes « héros selon l'outil » est indépendante (à revoir avec R1 : héros vu en diagonale).

### R. Refonte de l'expérience (21/11, avant la suite de la 3a ; 3a1 sous-étape 3 et 3a2 en pause)
**Constat de Steven en rejouant (21/11)** : les bots disent si les règles tiennent, pas si le jeu se comprend. On ne sait pas pourquoi le héros part combattre, ni pourquoi il mine les monstres au lieu de les tuer « normalement » (« l'équivalent d'un ta gueule c'est magique ») ; le minage n'est pas ennuyeux, il est inexpliqué. Au début d'une boucle, la première chose affichée est une case inaccessible avec un bouton grisé.

**Vision de Steven** (à trancher avec le conseil, puis à coder une étape à la fois) :
- **Un idle orienté aventure** : le début se joue au clic, puis un **pilote automatique** se débloque (par exemple après le premier boss de la zone 1), qui suit un itinéraire (le cartographe à route programmée de la feuille de route).
- **Écran** : le héros toujours à gauche (stats, armures, équipement) ; en haut les onglets **Combat / Carte / Bestiaire** ; la fiche de case ne garde que les infos de la zone ; **plus d'onglet Village**.
- **Combat plus grand, en diagonale façon Pokémon** : héros en bas à gauche, monstres en haut à droite. Aujourd'hui les monstres semblent « posés dans un cadre » et le minage se voit mal.
- **Le village est un lieu** : on y entre, des zones en surbrillance (forge, cartographe, salle d'entraînement), chacune avec son PNJ à qui parler. Pour s'améliorer, on retourne au village. Suppression du bouton « Rentrer au village (fin de boucle) » (le suicide), puisqu'il n'y a pas de blocage possible (à vérifier dans le code : la simu prévoit un cas « stuck »).
- **Le cartographe rend la carte** : elle repart de zéro à chaque boucle, et la première chose à faire au village est d'aller lui parler pour l'avoir et « commencer » le jeu (même logique que la forge pour les outils ; colle au lore : le héros oublie, le village se souvient).
- **Les zones** : la prairie est à une certaine distance du village ; dedans, on ne voit plus le village, juste une flèche « retourner au village ». La zone est un lieu avec des endroits cliquables, comme le village (le bosquet pour le bois, s'enfoncer dans la forêt, se reposer au puits ou à la mare). Des niveaux dans la zone (par exemple 1 à 3). On n'a plus « 3 vagues par case » : des ennemis **bloquent la route**, il faut en battre un certain nombre pour aller plus loin.

**Découpage proposé (chaque étape reste jouable)** :
- **R0, conseil** : lore du minage, cartographe, pilote automatique, ordre des étapes.
- **R1, l'écran** (aucun chiffre ne bouge, ne dépend d'aucune décision de lore) : héros à gauche, onglets Combat / Carte / Bestiaire, fiche de zone allégée, combat en diagonale.
- **R2, le lore du minage** : une scène au premier combat.
- **R3, le village comme lieu** : scène et PNJ, le cartographe donne la carte, retour au village en marchant, fin de l'onglet Village et du bouton de fin de boucle.
- **R4, les zones** : distance, endroits cliquables, niveaux, ennemis qui bloquent la route ; rééquilibrage avec les trois bots (défaut, malin, moyen). Ensuite seulement : Dernier Grain et 3a2.

**R0 — conseil** :
```
Lis docs/INDEX.md, docs/lore.md, puis dans docs/design.md seulement « Pitch », « Décisions prises », « Miner les ennemis » (« Pourquoi », « Le lore qui va avec ») et « Étape 3a1 » (décisions). Lis la section « R. Refonte de l'expérience » de PROCHAINES-SESSIONS.md (vision de Steven).
Réunis le conseil (/conseil) sur la refonte : 1) pourquoi le héros mine les monstres au lieu de les tuer (une scène au premier combat, dans le ton de lore.md) ; 2) le cartographe qui rend la carte à chaque boucle (ce qu'il garde, comment il lance le jeu) ; 3) le pilote automatique (quand il se débloque, par exemple après le premier boss de la zone 1, et ce qu'il fait) ; 4) l'ordre des étapes R1 à R4 et ce qui reste jouable entre deux.
Rends les positions et une recommandation, attends mes décisions, puis note-les dans docs/design.md (nouvelle section « Refonte de l'expérience »), écris les prompts de R2 à R4 dans PROCHAINES-SESSIONS.md, docs/INDEX.md à jour, commit, demande-moi avant de pousser.
```
**R1 — l'écran** (possible avant R0) :
```
Lis docs/INDEX.md, docs/art-direction.md, puis dans docs/design.md seulement « Architecture du code » (liste des modules). Lis la section « R. Refonte de l'expérience » de PROCHAINES-SESSIONS.md.
Étape R1, l'écran, sans changer aucun chiffre du jeu : héros toujours à gauche (stats, équipement, outil) ; onglets en haut Combat / Carte / Bestiaire ; fiche de case réduite aux infos de la zone ; combat en diagonale façon Pokémon (héros en bas à gauche, monstres en haut à droite, grille de minage plus grande), lisible aussi sur écran étroit. L'onglet Village et le bouton « Rentrer au village (fin de boucle) » restent pour l'instant (ils partent avec R3).
Propose-moi d'abord une maquette ASCII de l'écran (large et étroit) et la liste des fichiers touchés, et attends mon accord. Simu identique (npm run check : aucune référence ne bouge), captures sans erreur JS (screenshot.py sous WSL), docs/design.md et docs/INDEX.md à jour, commit, demande-moi avant de pousser.
```

### 3a1. Leviers d'équilibrage (avant 3a2)
**Conseil et mesures faits le 20/11** (`docs/design.md` → `### Étape 3a1`) : pente de puissance des monstres 1,6 → 2,4 retenue (les deux bots dans la cible avec et sans la 3a2, la mort revient, l'armure compte), **codée le 21/11**. Bot moyen codé le 21/11, Dernier Grain au sablier, effets par emplacement renvoyés en 3b.
**Sous-étape 1 — pente 2,4 : faite le 21/11** (compte rendu dans `docs/archive/sessions-faites.md`, résultats dans `docs/design.md` → `### Étape 3a1` → « Pente 2,4 dans le jeu »).
**Sous-étape 2 — bot moyen : faite le 21/11** (compte rendu dans `docs/archive/sessions-faites.md`, résultats dans `docs/design.md` → `### Étape 3a1` → « Bot moyen »).
**Sous-étape 3 — Dernier Grain** (**en pause** depuis le 21/11 : après la refonte R, qui change le jeu à équilibrer) :
```
Lis docs/INDEX.md, docs/lore.md (le ton), puis dans docs/design.md seulement « Boucle de jeu », « Compétences actives » et « Étape 3a1 » (décision : Dernier Grain dans les 10 derniers pour cent du sablier). Lis docs/design.md « Architecture du code ».
Le Dernier Grain : dans les 10 derniers pour cent du temps de boucle, le joueur peut engager un pari (plus de puissance, mais la boucle s'arrête au prochain coup reçu). Propose-moi d'abord les chiffres (bonus de puissance, déclenchement manuel ou automatique, ce que fait chaque bot) mesurés avec node tools/sim.js --graines 30 (défaut, malin, moyen), et un texte dans le ton (le conteur l'a nommé « le Dernier Grain »).
Moteur pur (événement dans G.events, l'UI l'affiche), sauvegarde compatible, simu dans la cible, docs/design.md et docs/INDEX.md à jour, commit, demande-moi avant de pousser.
```

### 3a2. Améliorations à l'intérieur des paliers (après 3a1 ; **en pause** depuis le 21/11, après la refonte R)
**Conseil et mesures faits le 20/11** (`docs/design.md` → `### Étape 3a2`) : matériaux seuls, plafond = niveau du bâtiment Forge, niveaux refaits d'un clic s'ils sont perdus ; en attente des leviers (seuls des pas de +0,3 tiennent la cible aujourd'hui, et ils ne se sentent pas). La permanence des niveaux passe par une barre de relation avec le forgeron (lore), à voir avec la 3b.
```
Lis docs/INDEX.md, puis dans docs/design.md seulement « Étape 2b faite » (décisions, forge et paliers), « Étape 3a2 » (conseil, mesures) et ce que la session des leviers (3a1) a décidé. Lis docs/design.md « Architecture du code » pour l'architecture.
Le conseil est fait : reprends ses accords (matériaux seuls, plafond = niveau du bâtiment Forge, « Refaire la même forge » rejoue les niveaux) et refais les mesures du tableau de la 3a2 dans le vrai code, avec les nouveaux leviers : propose-moi des pas qui se sentent et gardent la cible, avec le chevauchement (le +3 d'un palier vaut le max du palier d'avant) si c'est possible, et la façon d'afficher les niveaux (en mots, idée du conteur, ou en nombres avec la puissance totale, idée du joueur).
À pente 2,4, l'ordre des outils s'est inversé (`node tools/sim.js --outils` : marteau méd. 10, pioche 11, coutelas 13, contre 9 / 10 / 10 à pente 1,6, voir « Pente 2,4 dans le jeu » dans « Étape 3a1 ») : le coutelas, léger, souffre le plus des monstres qui frappent fort. Dis-moi si ses améliorations doivent compenser, et vérifie que l'outil conseillé du bestiaire (fixé par monstre dans les données) reste juste.
Puis une mécanique à la fois, jouable à chaque étape. Simu dans la cible (bot par défaut et bot malin), sauvegarde compatible (valeurs par défaut au chargement), docs/design.md et docs/INDEX.md à jour, commit à chaque sous-étape, demande-moi avant de pousser.
```

### 3b. Mémoire du village par la renommée
```
Lis docs/INDEX.md, puis dans docs/design.md seulement « Équipement, forge et mémoire du village — PROPOSITION v3 » (sous-sections « Mémoire du village », « Hauts faits », « Sauvegarde ») et « Étape 2b faite » (forge, sous-étape 2 ; réserve de Steven : reforger à chaque boucle peut devenir répétitif, à poser au joueur du conseil). Lis docs/design.md « Architecture du code » pour l'architecture.
Lis aussi « Étape 3a1 » (décisions de Steven : effets par emplacement, habits de base, PNJ et quêtes secondaires).
Étape 2c : les rangs du village (Hameau → Cité) rendent permanents, dans l'ordre, l'arme, l'armure, l'accessoire, puis les améliorations. Idée de Steven (20/11) : la permanence des améliorations passe par une barre de relation avec le forgeron (il garde tes armes parce qu'il te connaît), à relier aux rangs. Une mécanique à la fois, jouable à chaque étape.
Idée de Steven (20/11, après la 3a1), à mettre au centre du conseil : le héros a des habits de base (torse, bottes…) qu'on améliore, chaque emplacement avec ses effets propres (épines sur le torse, vitesse sur les bottes…, liste d'effets à proposer et à mesurer : épines à 30 % = une boucle gagnée, à 60 % trop fort). La permanence d'une boucle à l'autre arrive vers la 3e-5e boucle, parce que le héros a parlé aux PNJ et fait des quêtes secondaires ; le jeu dit clairement au joueur que les quêtes secondaires donnent du confort de jeu. Pour rendre une quête, il faut revenir au village pendant la boucle : le village devient une case où l'on passe sans finir la boucle, le retour coûte du temps, et des compétences qui se gardent d'une boucle à l'autre (façon Increlution) rendent peu à peu les quêtes faisables, pour qu'aucune ne reste bloquée parce que l'exploration prend trop de temps. Questions au conseil (élargi) : le découpage proposé (1. emplacements et liste d'effets, 2. PNJ, relation et quêtes, village en case de passage, 3. compétences qui se gardent, 4. déblocage de la permanence) tient-il, et dans quel ordre ? les recettes actuelles (tablier, manteau, plastron) deviennent-elles des améliorations des habits de base ? que coûte une quête en temps de boucle (la marche pèse peu aujourd'hui) ? quelle permanence à quelle boucle, mesurée avec la simu à pente 2,4, où la mort domine (le gain d'une boucle de la 3a2 était mesuré à pente 1,6) ?
Avant de coder, conseil élargi sur la « reforge » (reportée de la 2b) : prix plein à chaque boucle (fait en 2b) ou première forge chère puis reforge à ~25 % parce que le village garde le patron (`meta.known`), avec reforge automatique en lot au début de la boucle ? Le sceptique objecte que la permanence (dès la 2e-6e boucle) rend la reforge transitoire ; le conteur et le joueur y voient la mémoire du village rendue concrète, et utile pour les emplacements pas encore mémorisés.
Puis recale la cible d'équilibrage : la permanence accélère la progression, propose-moi une nouvelle cible chiffrée avec la simu (bot par défaut et bot malin) avant de toucher aux chiffres.
Annonce le périmètre en 5 lignes avant de coder, sauvegarde compatible, docs/design.md et docs/INDEX.md à jour, commit à chaque sous-étape et demande-moi avant de pousser.
```
### 3c. Prévenir le joueur quand la sauvegarde est impossible (petit, à faire après la session 4)
Décidé le 19/11 pendant la session qualité : aujourd'hui, si `localStorage` est bloqué (navigation privée, quota plein), le jeu continue sans rien dire et la progression est perdue à la fermeture.
```
Lis docs/INDEX.md, docs/design.md « Architecture du code », puis .claude/rules/javascript/architecture.md (section Sauvegarde) et le module de sauvegarde (shared/save, il renvoie {ok, error}).
Quand la sauvegarde échoue, préviens le joueur une seule fois par session (toast : « Sauvegarde impossible : ta progression sera perdue à la fermeture (navigation privée ?) »), sans bloquer le jeu, et retente aux sauvegardes suivantes ; si elle refonctionne, dis-le aussi une fois.
Vérifie en simulant l'échec (localStorage qui lève une exception, via tools/screenshot.py ou un test), npm run check, aucune erreur JS. Mets à jour docs/design.md et docs/INDEX.md, commit, demande-moi avant de pousser.
```

### 3d. Choix de la langue : français / anglais (après la session 4)
Décidé le 19/11 : le code et les dossiers sont en anglais, les textes du jeu en français ; le joueur doit pouvoir passer en anglais.
```
Lis docs/INDEX.md, docs/design.md « Architecture du code », .claude/rules/javascript/ (coding-style, dom-security), et docs/lore.md (le ton : mélancolique mais drôle).
Ajoute le choix de langue français / anglais :
1. Inventaire d'abord : compte les textes du jeu par fichier (gabarits des vues, données : noms de cases, monstres, compétences, bâtiments, journal du moteur, intro) et propose un format (un fichier de textes par langue, clés par domaine) et la façon de traduire le journal émis par le moteur sans que le moteur dépende de la langue. Attends mon accord.
2. Bouton de langue dans la barre du haut, langue par défaut celle du navigateur, choix gardé dans la sauvegarde (valeur par défaut au chargement, ancienne sauvegarde compatible).
3. Traduction anglaise de tous les textes, en gardant le ton ; les noms propres du lore (Les Heurelles, Grésille, Griselune, le Radoteur, Anselme Tardif) restent en français sauf avis contraire.
Simu identique (npm run check : le moteur ne change pas de comportement), captures dans les deux langues sans erreur JS ni texte qui déborde, docs/design.md et docs/INDEX.md à jour, commit par étape, demande-moi avant de pousser.
```

Ensuite (conversations à part) : visée utile (idée 3), vestiges dans les cœurs (idée 5, avec le lore), Cartographe (idée 4).
Reportés par la 3a1 (20/11, mesures dans `docs/design.md` → `### Étape 3a1`) : courbe des monstres par zone (un palier par zone plus une courbe douce dans la zone, quand les mondes arriveront) ; rencontres en zones en « graine du jour » déterministe (idée du conteur) ; compétences de déplacement (levier faible tant que la mort domine).

**Commandes utiles** : `node tools/sim.js` après chaque changement de chiffres ; `.venv/bin/python tools/screenshot.py` (WSL) ; prototype à comparer : `/proto/mine-ennemi.html`.
