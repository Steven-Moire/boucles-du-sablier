# Prochaines sessions — une conversation par sujet

Chaque conversation repart de `docs/INDEX.md` (qui résume tout) sans relire l'historique. Ce qui est déjà fait (prompts exécutés, état d'avant) est archivé dans `docs/archive/sessions-faites.md`.

**Démarrer une conversation** : dans VS Code, nouvelle conversation Claude Code (ou `claude` dans un terminal ouvert à la racine du dépôt), puis coller le prompt de la section voulue. Ordre conseillé : **Gameplay 3a → 3a2 → 3b** (qualité du code faite), Graphismes (héros selon l'outil) et Lore en parallèle.

Rappels valables partout :
- Stable Diffusion (Forge) doit tourner pour toute génération d'image : API sur http://127.0.0.1:7860.
- Jouer en local : `python -m http.server` puis http://localhost:8000.
- Vérifier : `node tools/sim.js` (boss entre la 8e et la 13e boucle, médiane 9-12) et `.venv/bin/python tools/screenshot.py` depuis WSL (aucune erreur JS).
- Le hook de budget prévient dès 150 k tokens : à ce moment-là, clore la conversation et en ouvrir une autre.

---

## 1. Lore

**État (20/11)** : sessions faites (prompt d'origine dans `docs/archive/sessions-faites.md`) : mineur décidé (« le Radoteur », vrai nom Anselme Tardif), lieux confirmés et vérifiés (Les Heurelles, Grésille, Griselune), texte final des 5 écrans de l'intro (intégré au jeu), 5 vestiges et 6 répliques de déjà-vu **retenus provisoirement**, carnet des vestiges. Tout est dans `docs/lore.md`.

**Prochaine session lore — prompt à coller** :
```
Lis docs/INDEX.md, puis docs/lore.md en entier (il est court) et, dans docs/design.md, seulement « Étape 2b en cours » (outil conseillé dans le bestiaire). On travaille le lore des Boucles du Sablier.
1. Scribes du carnet (idée du conseil du 20/11) : un scribe par rang de monstre (le boulanger pour les normaux, une vieille pour les élites, un enfant pour le boss), chacun avec sa voix pour écrire les notes et l'outil conseillé du bestiaire, à relier à la question ouverte « le bestiaire est son carnet, gardé par le village » de docs/lore.md. Tour de table avec /conseil élargi : noms des scribes (points de vigilance des noms dans docs/lore.md, vérifier qu'aucun n'est une vraie commune), leur ton, et 2 notes d'exemple par monstre (une après une victoire, une « en négatif » après une défaite : « pas la pioche »).
2. Relis les 5 vestiges et les 6 répliques de déjà-vu retenus provisoirement : à garder, ajuster ou remplacer ?
Mets à jour docs/lore.md et docs/INDEX.md, commit, demande-moi avant de pousser. Ne touche pas au code du jeu.
```

**Fichiers utiles** : `docs/INDEX.md`, `docs/lore.md`, `docs/design.md` → `### Le lore qui va avec` et `### Étape 2b en cours`, skill `/conseil`.

---

## 2. Graphismes

**Fait le 19/11** (détails dans l'archive) : intro intégrée, héros v3 avec pioche, icônes de cases 32×32. Reste possible : pioche vraiment sur l'épaule (retouche à la main ou inpainting), ombres grises sous quelques sprites, fonds de scène v2, bâtiments du village.

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

**Fait le 19/11** (détails dans l'archive) : cible élargie à 8e-13e boucle (médiane 9-12), étape 2a (marteau et coutelas, commit 3bdead3).

**Idées validées par Steven le 19/11** (à caser dans 3a / 3b, puis après) :
1. Outil conseillé par monstre dans le bestiaire (golem → marteau, loup → coutelas, élites → pioche) ;
2. Commandes de forge qui poussent à farmer avec un outil précis (3 🦷 → pioche sur les alphas, 300 🟫 → coutelas dans les Prés) ;
3. Visée utile : « lampe de prospection » au village qui révèle le cœur, cliquer devient payant ;
4. Route programmée (Cartographe) avec un outil par case — le vrai virage idle vers la v2, après 3b ;
5. Vestiges dans les cœurs : brisés au marteau, récupérés à la pioche.
Aussi : un **bot qui change d'outil selon la case** dans `tools/sim.js` (aujourd'hui le bot garde un seul outil toute la partie, donc la simu ne mesure pas un joueur qui choisit bien) — à faire en 3a, pour que l'équilibrage de la forge tienne compte des bons choix.

**En cours le 20/11 (3a)** : sous-étape 1 faite (bot malin `--malin`), dégâts variables ×0,8-1,2 (pour la sensation), option `--graines N` de la simu. Boss méd. 9 (bot par défaut) et 10 (malin) sur 10 graines ; sur 30 graines, le bot par défaut tombe parfois à 6 et le malin à 7 : juger l'équilibrage avec `--graines 30`. Décisions du conseil dans `docs/design.md` → `### Étape 2b en cours`. **Reste : sous-étapes 2 (forge des paliers) et 3 (outil conseillé)**, prompt 3a ci-dessous.

**Sujets reportés le 20/11 (à caser)** :
- **Multi-prestige** façon Increlution : un seul boss ne fait pas un vrai jeu ; la boucle est un premier prestige, il en faut d'autres au-dessus (conseil élargi, avant les mondes / époques de la feuille de route).
- **Leviers d'équilibrage** (conseil élargi) : quels leviers utiliser pour tenir la cible (PV et puissance des monstres, coûts du village, temps de boucle, forge…), et ceux qui n'en sont pas (les dégâts variables gardent la moyenne). Avec `node tools/sim.js --graines 30` et les deux bots.
- **Scribes du carnet** : casé dans la section 1 (Lore).

**Ordre conseillé (20/11)** : 3a → 3a2 → 3b (la session 4, qualité du code, est faite). La session graphismes « héros selon l'outil » est indépendante.

### 3a. Forge et équipement non permanent
```
Lis docs/INDEX.md, puis dans docs/design.md seulement : « Étape 2a faite : marteau et coutelas », « Équipement, forge et mémoire du village — PROPOSITION v3 » et, dans la v2, « Types d'armes », « Objets », « Amélioration à la forge ». Lis la section « 3. Gameplay » de PROCHAINES-SESSIONS.md (idées validées). Lis CLAUDE.md pour l'architecture.
Étape 2b du combat-minage, une mécanique à la fois, jouable à chaque étape :
1. (fait le 20/11 : bot malin `--malin`, dégâts variables, `--graines N`) Lis aussi dans docs/design.md « Étape 2b en cours » (décisions du conseil : l'outil est l'arme, forger = fabriquer le palier suivant d'un outil ou d'une armure ; prix plein à chaque boucle, la reforge est pour la 3b).
2. Forge : objets (arme, armure, accessoire) forgés avec les matériaux extraits, recettes qui demandent des rares ou beaucoup de communs (idée 2), équipement perdu à la fin de la boucle (non permanent).
3. Outil conseillé par monstre dans la fiche du bestiaire (idée 1), règle décidée dans « Étape 2b en cours » : victoires par outil, note dès la 1re victoire ou défaite, outil nommé après 2 outils différents ou au filet (normal 10, élite 2, boss 1).
Avant de coder, annonce-moi le périmètre (fichiers touchés) en 5 lignes. Simu dans la cible (boss 8e-13e boucle, médiane 9-12, avec le bot par défaut et le bot malin, vérifier aussi avec --graines 30), sauvegarde compatible (valeurs par défaut au chargement), docs/design.md et docs/INDEX.md à jour, commit à chaque sous-étape et demande-moi avant de pousser.
```

### 3a2. Améliorations à l'intérieur des paliers (après 3a)
Décidé le 20/11 : en 3a, la forge fabrique des **paliers** d'outils et d'armures (l'outil est l'arme). Idée de Steven : des paliers qui se chevauchent, le palier de base monte à +5, le suivant à +10 et son +3 vaut le +5 du palier de base, et ainsi de suite.
```
Lis docs/INDEX.md, puis dans docs/design.md seulement « Étape 2b » (décisions, forge et paliers faits) et, dans la v2, « Amélioration à la forge ». Lis CLAUDE.md pour l'architecture.
Avant de coder, tour de table avec /conseil (élargi) sur les améliorations à l'intérieur des paliers : niveaux max par palier (+5, +10, +15 ?), chevauchement (le +3 d'un palier vaut le max du palier d'avant ?), coûts (or + matériaux, rares pour les derniers niveaux), lien avec le niveau du bâtiment Forge, ce qui arrive aux améliorations en fin de boucle (perdues tant que la 3b ne les rend pas permanentes). Propose-moi des chiffres mesurés avec la simu avant de les coder.
Puis une mécanique à la fois, jouable à chaque étape. Simu dans la cible (bot par défaut et bot malin), sauvegarde compatible (valeurs par défaut au chargement), docs/design.md et docs/INDEX.md à jour, commit à chaque sous-étape, demande-moi avant de pousser.
```

### 3b. Mémoire du village par la renommée
```
Lis docs/INDEX.md, puis dans docs/design.md seulement « Équipement, forge et mémoire du village — PROPOSITION v3 » (sous-sections « Mémoire du village », « Hauts faits », « Sauvegarde ») et la partie forge faite en 2b. Lis CLAUDE.md pour l'architecture.
Étape 2c : les rangs du village (Hameau → Cité) rendent permanents, dans l'ordre, l'arme, l'armure, l'accessoire, puis les améliorations. Une mécanique à la fois, jouable à chaque étape.
Avant de coder, conseil élargi sur la « reforge » (reportée de la 2b) : prix plein à chaque boucle (fait en 2b) ou première forge chère puis reforge à ~25 % parce que le village garde le patron (`meta.known`), avec reforge automatique en lot au début de la boucle ? Le sceptique objecte que la permanence (dès la 2e-6e boucle) rend la reforge transitoire ; le conteur et le joueur y voient la mémoire du village rendue concrète, et utile pour les emplacements pas encore mémorisés.
Puis recale la cible d'équilibrage : la permanence accélère la progression, propose-moi une nouvelle cible chiffrée avec la simu (bot par défaut et bot malin) avant de toucher aux chiffres.
Annonce le périmètre en 5 lignes avant de coder, sauvegarde compatible, docs/design.md et docs/INDEX.md à jour, commit à chaque sous-étape et demande-moi avant de pousser.
```
### 3c. Prévenir le joueur quand la sauvegarde est impossible (petit, à faire après la session 4)
Décidé le 19/11 pendant la session qualité : aujourd'hui, si `localStorage` est bloqué (navigation privée, quota plein), le jeu continue sans rien dire et la progression est perdue à la fermeture.
```
Lis docs/INDEX.md, CLAUDE.md (architecture), puis .claude/rules/javascript/architecture.md (section Sauvegarde) et le module de sauvegarde (shared/save, il renvoie {ok, error}).
Quand la sauvegarde échoue, préviens le joueur une seule fois par session (toast : « Sauvegarde impossible : ta progression sera perdue à la fermeture (navigation privée ?) »), sans bloquer le jeu, et retente aux sauvegardes suivantes ; si elle refonctionne, dis-le aussi une fois.
Vérifie en simulant l'échec (localStorage qui lève une exception, via tools/screenshot.py ou un test), npm run check, aucune erreur JS. Mets à jour docs/design.md et docs/INDEX.md, commit, demande-moi avant de pousser.
```

### 3d. Choix de la langue : français / anglais (après la session 4)
Décidé le 19/11 : le code et les dossiers sont en anglais, les textes du jeu en français ; le joueur doit pouvoir passer en anglais.
```
Lis docs/INDEX.md, CLAUDE.md (architecture), .claude/rules/javascript/ (coding-style, dom-security), et docs/lore.md (le ton : mélancolique mais drôle).
Ajoute le choix de langue français / anglais :
1. Inventaire d'abord : compte les textes du jeu par fichier (gabarits des vues, données : noms de cases, monstres, compétences, bâtiments, journal du moteur, intro) et propose un format (un fichier de textes par langue, clés par domaine) et la façon de traduire le journal émis par le moteur sans que le moteur dépende de la langue. Attends mon accord.
2. Bouton de langue dans la barre du haut, langue par défaut celle du navigateur, choix gardé dans la sauvegarde (valeur par défaut au chargement, ancienne sauvegarde compatible).
3. Traduction anglaise de tous les textes, en gardant le ton ; les noms propres du lore (Les Heurelles, Grésille, Griselune, le Radoteur, Anselme Tardif) restent en français sauf avis contraire.
Simu identique (npm run check : le moteur ne change pas de comportement), captures dans les deux langues sans erreur JS ni texte qui déborde, docs/design.md et docs/INDEX.md à jour, commit par étape, demande-moi avant de pousser.
```

Ensuite (conversations à part) : visée utile (idée 3), vestiges dans les cœurs (idée 5, avec le lore), Cartographe (idée 4).

**Commandes utiles** : `node tools/sim.js` après chaque changement de chiffres ; `.venv/bin/python tools/screenshot.py` (WSL) ; prototype à comparer : `/proto/mine-ennemi.html`.
