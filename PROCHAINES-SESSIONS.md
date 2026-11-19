# Prochaines sessions — une conversation par sujet

Chaque conversation repart de `docs/INDEX.md` (qui résume tout) sans relire l'historique. Ce qui est déjà fait (prompts exécutés, état d'avant) est archivé dans `docs/archive/sessions-faites.md`.

**Démarrer une conversation** : dans VS Code, nouvelle conversation Claude Code (ou `claude` dans un terminal ouvert à la racine du dépôt), puis coller le prompt de la section voulue. Ordre conseillé : **Qualité du code (4) → Gameplay 3a → 3b**, Graphismes (héros selon l'outil) et Lore en parallèle.

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

---

## 4. Qualité du code (à faire avant 3a)

**État au 19/11** (lots 0 à 8 faits ; comptes rendus et prompts A à E dans `docs/archive/sessions-faites.md`) : ESLint + règles SonarQube, limites de taille par suffixe, `npm run check` (lint + simu de référence), captures déterministes **sans bruit connu : une différence = une vraie régression**, 5 captures de référence (`village.png` comprise ; tous les bâtiments y sont verrouillés, relire à la main les branches « débloqué » et « niveau max »). Lint : **0 problème**, chaînage optionnel fait (lot 6), Python de `tools/` propre (lot 7).
**Décisions de Steven** : tout en anglais (dossiers, fichiers, code), fichiers en `kebab-case` avec suffixe de rôle (`.data.js`, `.engine.js`, `.view.js`, CSS à côté de sa vue), dossiers par domaine (`world/`, `hero/`, `enemies/`, `combat/`, `village/`, `intro/`, `modals/`, `shared/`), Python de `tools/` inclus, imports circulaires corrigés, aucun `NOSONAR` (de vraies corrections), mise en forme par Prettier comme `ruff format` dans atlas (jamais à la main).
**Lots** : tous faits (0 à 8). Reste à décider : configuration ruff (G).

**Décisions de Steven (19/11, après le lot 2)** : lots 3 à 8 confirmés ; le `onerror` en ligne (`spr()` dans `src/shared/templates.js`, image du héros dans `index.html`) se traite avec le lot 5 ; le bruit des captures se **corrige à la source** (session A), on ne le masque pas en relançant.
Ordre des conversations : **F**, puis **G** si Steven la valide (A à E faites, archivées).

Garde-fous communs (à rappeler dans chaque prompt) : refactoring pur, aucun changement de comportement ; `npm run check:sim` identique ; `npm run lint` en baisse (jamais de `NOSONAR`, `eslint-disable` ni seuil relevé) ; captures de référence prises **avant** (`tools/screenshot.py` sous WSL, version 14ce5f3 ou plus récente : les captures de l'ancien script ne sont plus comparables, le combat avait un tick de moins ; copiées dans le scratchpad), comparées **après** avec `tools/qa/compare_shots.py` : identiques ; aucune erreur JS ; commit, demander avant de pousser.

**E. Lots 6 à 8** : faits le 19/11 (compte rendu et prompt dans `docs/archive/sessions-faites.md`). Lint à 0 problème avec les limites `max-lines` par suffixe ; un seul `a && a.b` gardé volontairement (`explore-panel.view.js`, `a && a.tool !== cur`) ; Python de `tools/` propre pour ruff (hors E501 et PLR2004).

**G. Configuration ruff pour `tools/`** (à décider, idée du 19/11) : `ruff.toml` avec `line-length = 120` comme Prettier et les règles du lot 7 (`D1`, `I`, `C901`, `E`, `F`, `W`, `B`, `SIM`, `UP`), puis `ruff format` pour la mise en forme (jamais à la main), branché sur `npm run lint` ; un commit de mise en forme seul, sorties des scripts identiques (même méthode qu'au lot 7).

**F. Polices dans le dépôt (avant la publication GitHub Pages puis itch.io)** : décidé le 19/11. Aujourd'hui Silkscreen et Inter viennent de Google Fonts : le jeu dépend du réseau (jeu téléchargé depuis itch, joué hors ligne) et envoie l'IP du joueur à Google (RGPD).
```
Lis docs/INDEX.md, CLAUDE.md, .claude/rules/javascript/testing.md, puis index.html et src/app/layout.css (variables --pix et --body). Changement du jeu livré, rendu identique attendu.
1. Inventaire : graisses et sous-ensembles vraiment utilisés (index.html charge Silkscreen 400/700 et Inter 400 à 800) ; vérifie les licences (SIL OFL attendue) et propose-moi la liste avant de télécharger.
2. Fichiers woff2 dans assets/fonts/ avec leur licence, @font-face dans une feuille CSS chargée en premier (même font-display: swap), liens Google Fonts retirés d'index.html.
3. Vérifie : le jeu se charge sans réseau externe (Playwright qui bloque fonts.googleapis.com et fonts.gstatic.com), captures comparées aux références prises avant (différences de lissage possibles : montre-les-moi avant de reprendre de nouvelles références), aucune erreur JS, npm run check.
Mets à jour docs/INDEX.md et CLAUDE.md, commit, demande-moi avant de pousser.
```
