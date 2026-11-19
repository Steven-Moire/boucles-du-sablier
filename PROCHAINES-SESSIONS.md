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

**Fait le 19/11** (lot 0, commit 9ad320e, détails dans l'archive) : ESLint + règles SonarQube, `npm run check` (simu de référence), captures déterministes, règles `.claude/rules/javascript/`, skill `/js-quality`. Le lint signale 71 problèmes.
**Décisions de Steven** : tout en anglais (dossiers, fichiers, code), fichiers en `kebab-case` avec suffixe de rôle (`.data.js`, `.engine.js`, `.view.js`, CSS à côté de sa vue), dossiers par domaine (`world/`, `hero/`, `enemies/`, `combat/`, `village/`, `intro/`, `modals/`, `shared/`), Python de `tools/` inclus, imports circulaires corrigés, aucun `NOSONAR` (de vraies corrections), mise en forme par Prettier comme `ruff format` dans atlas (jamais à la main).
**Fait le 19/11 (suite)** : lot Prettier (commit 754ae90 ; `npm run format`, `prettier --check` dans `npm run lint`) et lot 1 hygiène (`src/rng.js` → `lcg(seed)`, `src/ui/save.js` → `{ok, error}`, `anim()` sans `void` dans `state.js`, `fxRandom` pour les effets visuels : la capture du combat est désormais identique au pixel près d'un lancement à l'autre). Lint : 71 → 51 problèmes (26 ternaires imbriqués, 8 cycles, 7 complexités, 6 templates imbriqués, 4 tailles). Reste un bruit de rendu sur le bouton « Passer » de l'intro (0,001 %, sans doute le chargement de la police), à surveiller.
**Ordre des lots restants** (un commit chacun) : 2 arborescence par domaine + découpage de engine/data/style.css → 3 complexité UI → 4 complexité moteur et simu → 5 ternaires et templates → 6 chaînage optionnel → 7 Python de tools/ → 8 limites `max-lines` par suffixe dans `eslint.config.js` (`*.engine.js` 250, `*.view.js` 200, `main.js` 60, `tools/` 200, comme le tableau de `.claude/rules/javascript/coding-style.md` ; décidé le 19/11).

**Lot 2 : arborescence cible VALIDÉE par Steven le 19/11** (ne pas la reproposer, l'appliquer). Les numéros de ligne renvoient à `src/style.css` tel qu'au commit f0ecec6.
```
index.html                      charge src/app/main.js + les CSS ci-dessous, liés DANS CET ORDRE (= ordre d'origine de style.css) :
                                app/layout.css, shared/sprites.css, world/map.css, combat/scene.css, combat/scene-fx.css,
                                app/panel.css, village/village.css, enemies/bestiary.css, modals/modal.css, shared/toast.css,
                                mining/dig.css, world/explore-panel.css, intro/intro.css
src/
  app/                          assemblage de plusieurs domaines (un peu fourre-tout assumé : à auditer de temps en temps)
    main.js                     boucle 50 ms, render(), onRender(() => {consumeEvents(); render()}), lancement de l'intro (~35 l.)
                                importe aussi les vues qui posent leurs écouteurs au chargement (map, scene, layout, modal)
    events.view.js              consumeEvents : table type → effet (ex-ui/main.js)
    layout.view.js              renderTop + écouteurs vitesse/onglets de vue, renderTabs + écouteur, renderPane + écouteur #pane (ex-ui/panel.js)
    layout.css                  style.css 1-234 (variables, reset, .bar, .app, barre du haut, minuteur, onglets) + .foot (1222-1237)
    panel.css                   style.css 711-951 (onglets, .sec, .row, .btn, .note, .segs, .divh, .enemy, .log)
  shared/                       briques du bas : n'importent AUCUNE vue
    render.js                   NOUVEAU : onRender(fn) / requestRender() (remplace tous les import de main.js → supprime les 8 cycles)
    state.js                    S, hadSave, saveMeta, loopFresh, anyUpgrade (ex-ui/state.js)
    dom.js                      $, setHTML, anim, toast (ex-ui/state.js)
    templates.js                spr (ex-state.js), segBar (ex-scene.js, utilisé par la scène ET le panneau)
    format.js                   fmt, pct (ex-state.js), gotText (ex-digview.js, utilisé par events et modals)
    save.js                     ← src/ui/save.js (tel quel)
    rng.js                      ← src/rng.js (lcg) + fxRandom (ex-state.js)
    sprites.css                 style.css 474-526 (.spr et variantes, toutes zones) — bloc déplacé plus haut dans la cascade
    toast.css                   style.css 1188-1221
  world/
    world.data.js               BASE_LOOP_TIME, REST_RATE, BIOMES, TYPES, RES, TILES, tid, TILE_MAP, VILLAGE, neighbors
    loop.engine.js              newMeta, createGame, startLoop, log, addRes, randInt, endLoop, newLoop, abandon
    explore.engine.js           isExplorable, canExplore, buildSegments, explore, retreat, finishSegment, nextSegment,
                                completeTile, segFill (ex-ui/map.js, calcul pur) — n'importe PAS combat/
    tick.engine.js              tick, step (seuls à importer combat + explore : casse step ↔ fightStep ↔ nextSegment)
    map.view.js                 ← ui/map.js sans segFill
    map.css                     style.css 235-381
    explore-panel.view.js       heroHTML, tileHTML, toolsHTML, logHTML, exploreHTML (ex-ui/panel.js, onglet Exploration)
    explore-panel.css           style.css 1275-1297 (.tools)
  hero/
    hero.data.js                HERO_BASE, HERO_PER_LVL, xpNeeded, SKILLS, TOOLS, DEFAULT_TOOL
    hero.engine.js              heroBase, heroAtLevel, skillUnlocked, actionTool, heroEvery, setTool
  enemies/
    enemies.data.js             MONSTERS, RANK, COMPOSITION (quel monstre donne quel matériau)
    grids.generated.js          ← src/grids.js (sortie de tools/sprite_grids.py)
    enemies.engine.js           monsterStats
    bestiary.view.js            bestiaryHTML (ex-ui/panel.js)
    bestiary.css                style.css 987-1045 (.mon, .tag, .troph)
  mining/                       combat-minage, réutilisé plus tard par la mine (étape 4 de la feuille de route)
    mining.data.js              STRATA, DIG, MATS
    strata.engine.js            baseStrata, composition (ex-dig.js)
    dig.engine.js               carveVein, pickTarget, aimDig, makeDig, dig, extract + leurs aides (ex-dig.js)
    dig.view.js                 ← ui/digview.js sans gotText
    dig.css                     style.css 1238-1274
  combat/
    combat.engine.js            strike, aimAt, firstAlive, fightStep, resolveDeaths, onKill
    scene.view.js               ← ui/scene.js sans segBar, + préchargement SCENE_BG/sceneBgOk (ex-state.js)
    scene.css                   style.css 382-473 + 527-598
    scene-fx.css                style.css 599-710 (nombres flottants, compétences, retraite)
  village/
    village.data.js             UPGRADES
    village.engine.js           canAfford, upgradeState, buy
    village.view.js             villageHTML, costHTML (ex-ui/panel.js)
    village.css                 style.css 952-986 + .mats (1298-1307)
  intro/
    intro.view.js               ← ui/intro.js
    intro.css                   style.css 1308-1393
  modals/
    modal.view.js               écouteur #modal, closeModal, bouton de réinitialisation
    loop-end.view.js            openLoopEnd, openBoss
    monster.view.js             openMonster, compositionHTML
    modal.css                   style.css 1046-1187
```
Supprimés : `src/data.js`, `src/engine.js`, `src/dig.js`, `src/rng.js`, `src/grids.js`, `src/style.css`, `src/ui/`.
Règles du déplacement : fonctions déplacées telles quelles, mêmes noms (seul `segFill` change de couche). Tout `consumeEvents(); render()` ou `render()` d'une vue devient `requestRender()` (sans effet de bord : `G.events` est toujours vide à ces moments-là). `tools/sim.js` : seuls les imports changent (`import * as` de chaque module, réunis dans `E`). `eslint.config.js` : couches repérées par suffixe (`*.data.js` → seulement `*.data.js` ; `*.engine.js` → ni globals navigateur, ni `*.view.js`, `shared/`, `app/` ; vues → jamais `app/main.js` ; `shared/` → aucune vue) et `src/**/*.generated.js` ignoré. `tools/sprite_grids.py` : seulement le chemin de sortie (→ `src/enemies/grids.generated.js`) et les commentaires de chemin (+ celui de `tools/screenshot.py`). Si une capture diffère à cause des 3 blocs CSS déplacés (`.spr`, `.foot`, `.mats`), les remettre à leur place d'origine.

**Prompt de reprise (lot 2 : appliquer l'arborescence validée)** :
```
Lis docs/INDEX.md, CLAUDE.md, .claude/rules/javascript/architecture.md et coding-style.md, puis la section « 4. Qualité du code » de PROCHAINES-SESSIONS.md : l'arborescence cible du lot 2 y est VALIDÉE, applique-la sans la reproposer. Refactoring pur : AUCUN changement de comportement. Ne lis que les fichiers que tu déplaces.
Avant : captures de référence (tools/screenshot.py sous WSL, copiées dans le scratchpad). Après : npm run check:sim (identique), npm run lint (problèmes en baisse, prettier --check propre, 0 cycle), captures comparées (tools/qa/compare_shots.py : identiques, le combat compris), aucune erreur JS.
Mets à jour au fil du travail CLAUDE.md (architecture et commandes), docs/INDEX.md, la section « ## Architecture du code » de docs/design.md, tools/sim.js, eslint.config.js et tools/sprite_grids.py (chemin). Commit, demande-moi avant de pousser.
```
