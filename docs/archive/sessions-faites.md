# Sessions faites — archive

Prompts déjà exécutés et état des sessions au moment où ils l'ont été, retirés de `PROCHAINES-SESSIONS.md` pour qu'il ne contienne que la suite. Les décisions encore en vigueur restent dans `PROCHAINES-SESSIONS.md` ; ici, c'est l'historique (« qu'est-ce qu'on avait décidé, et pourquoi ? »).

---

## Contexte de départ (19/11/2026)

La conversation du 12 au 19/11/2026 a dépassé 600 k tokens de contexte. La suite a été découpée en conversations dédiées, chacune repartant de `docs/INDEX.md`.
Premier ordre conseillé : **Lore → Graphismes → Gameplay** (le lore donne les noms et le texte que l'intro affiche), sessions indépendantes. Remplacé le 19/11 au soir par **Qualité du code → Gameplay 3a → 3b**, Graphismes et Lore en parallèle.

---

## Graphismes — session du 19/11 (faite)

**État avant la session** : sprites v2 du héros et des 7 monstres (Juggernaut XI + LoRA Pixel Art XL), fonds de combat v1. **Intro** : 5 scènes générées dans `sd_raw/intro_*` (30 images : 3 variantes par scène et par réglage, `pxl_*` = Juggernaut + LoRA, `v1_turbo_*` = DreamShaper Turbo sans LoRA). Pour d'autres variantes : `python tools/sd_generate.py intro_<scène> -n 3 --seed <nouvelle seed>`.

**Résultat** : les 4 points faits (intro choisie et intégrée, héros v3 avec pioche, icônes de cases 32×32, commit 837d438).

**Prompt exécuté** :
```
Lis docs/INDEX.md puis docs/art-direction.md (court) et tools/sprites.json. On travaille les graphismes des Boucles du Sablier ; Forge tourne sur :7860.
1. Intro : fais une planche de contrôle des variantes de sd_raw/intro_* (pxl_ et v1_turbo_), montre-la-moi, propose la meilleure par scène. Après mon choix, note les seeds dans sprites.json et lance `python tools/sd_generate.py --build`.
2. Intègre l'intro au jeu : 5 écrans au premier lancement (image + texte, passer avec un clic, bouton « Passer »), avec le texte de docs/lore.md (s'il n'est pas encore écrit, mets un texte provisoire marqué TODO). Ne la rejoue pas si une sauvegarde existe.
3. Héros : régénère-le avec une vraie pioche sur l'épaule (il tient une lampe-bâton), même pipeline.
4. Icônes de cases de la carte en 32×32 (combat, repaire, boss, bosquet, filon, source, trésor, village, puits) pour remplacer les emojis, avec repli sur l'emoji.
Vérifie avec tools/screenshot.py (WSL), mets à jour docs/art-direction.md et docs/INDEX.md, commit et push à chaque étape.
```

---

## Gameplay — session du 19/11 (faite)

- **Point 0** : le boss à la 8e boucle existe depuis la v0.3 → cible élargie à 8e-13e boucle, médiane 9-12.
- **Étape 2a** : marteau et coutelas, choix de l'outil avant chaque case, `node tools/sim.js --outils` (commit 3bdead3). Détails : `docs/design.md` → « Étape 2a faite : marteau et coutelas ».
- Icône d'attaque hors combat corrigée (montre l'outil choisi).

---

## Qualité du code — lot 0 du 19/11 (fait, commit 9ad320e)

`eslint.config.js` (règles SonarQube, couches, cycles), `npm run lint` / `npm run check`, simu de référence (`tools/qa/check-sim.js`), captures déterministes (`tools/screenshot.py` + `tools/qa/compare_shots.py`), règles locales `.claude/rules/javascript/`, hook `js-lint-guard`, skill `/js-quality`. Le lint signalait 71 problèmes.

**État constaté avant le lot 0** : ~1 500 lignes, fichiers petits (le plus gros : `src/engine.js`, 263 lignes) mais lignes très denses. SonarQube for IDE signalait surtout de la complexité cognitive au-delà de 15 (`consumeEvents` dans main.js : 41, `renderScene` dans scene.js : 61, `tileHTML` dans panel.js : 35, `fightStep` dans engine.js : 30, `runBot` dans sim.js : 27), des ternaires et templates imbriqués, des `a && a.b` au lieu de `a?.b`. HTML construit dans des chaînes JS, CSS dans un seul fichier de 226 lignes. Rien n'avait été touché exprès pendant le gameplay (règle « zéro refactoring passant »).

**Premier prompt (inventaire), remplacé par le plan en lots** :
```
Lis docs/INDEX.md, CLAUDE.md (architecture et règles), puis .claude/rules/common/coding-style.md. On ne change AUCUN comportement : refactoring pur des Boucles du Sablier.
1. Inventaire d'abord : liste les avertissements SonarQube (getDiagnostics sur src/ et tools/) par fichier et par règle, et propose un plan en lots (un lot = un sujet, un commit), sans rien modifier. Attends mon accord.
2. Lots proposés (à ajuster) : a) complexité cognitive ≤ 15 en extrayant des fonctions (consumeEvents → table de gestionnaires par type d'événement, renderScene, tileHTML, fightStep, runBot) ; b) ternaires imbriqués et templates imbriqués → petites fonctions de rendu ; c) chaînage optionnel ; d) organisation : gabarits HTML des panneaux dans des fonctions/modules dédiés (src/ui/templates/ ?), CSS découpé par zone (src/styles/ : base, carte, scène, panneau, modales) chargé depuis index.html, sans outil de build.
3. Garde-fous à chaque lot : `node tools/sim.js` et `node tools/sim.js --outils` identiques octet pour octet à avant (compare avec un fichier de référence), `tools/screenshot.py` sans erreur JS et captures identiques à l'œil, moteur toujours sans DOM, sauvegarde inchangée.
Mets à jour CLAUDE.md (architecture) et docs/INDEX.md si des fichiers bougent, commit par lot, demande-moi avant de pousser.
```

## Qualité du code — lot 2 du 19/11 (fait, commit a648497)

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

## Qualité du code — comptes rendus des lots 0 à 3 et de la session A (19/11)

Comptes rendus retirés de `PROCHAINES-SESSIONS.md` (section 4) une fois les lots faits.

**Fait le 19/11** (lot 0, commit 9ad320e, détails dans l'archive) : ESLint + règles SonarQube, `npm run check` (simu de référence), captures déterministes, règles `.claude/rules/javascript/`, skill `/js-quality`. Le lint signale 71 problèmes.
**Fait le 19/11 (suite)** : lot Prettier (commit 754ae90 ; `npm run format`, `prettier --check` dans `npm run lint`) et lot 1 hygiène (`src/rng.js` → `lcg(seed)`, `src/ui/save.js` → `{ok, error}`, `anim()` sans `void` dans `state.js`, `fxRandom` pour les effets visuels : la capture du combat est désormais identique au pixel près d'un lancement à l'autre). Lint : 71 → 51 problèmes (26 ternaires imbriqués, 8 cycles, 7 complexités, 6 templates imbriqués, 4 tailles). Reste un bruit de rendu sur le bouton « Passer » de l'intro (0,001 %, sans doute le chargement de la police), à surveiller.
**Fait le 19/11 (lot 2)** : arborescence par domaine appliquée telle que validée plus haut (moteur, données, vues et CSS découpés, `shared/render.js` + `requestRender()`). Lint : 51 → 41 problèmes (0 cycle ; restent 26 ternaires imbriqués, 7 complexités, 6 templates imbriqués, 2 fonctions trop longues). Simu identique, captures identiques au pixel près. Bruit des captures **corrigé à la source** (session A, 19/11, `tools/screenshot.py` seul, jeu inchangé) : l'horloge de Playwright, seulement installée, suivait le temps réel (un lancement lent jouait un tick de plus : combat 0,3 %) → mise en pause ; polices, images, fond de scène (`has-bg`) et animations CSS finies attendus avant chaque capture ; rendu de Chromium figé par des options de lancement (le bouton « Passer », en position fixe, sortait à 1/255 près au hasard). Preuve : 14 lancements de suite identiques, le premier après la modification compris. **Plus de bruit connu : une différence = une vraie régression.** La police reste chargée depuis Google Fonts (mêmes fichiers à chaque lancement, vérifié) ; l'héberger dans le dépôt serait un lot à part.
**Fait le 19/11 (lot 3, session B)** : complexité de l'UI. `renderScene` (61, 109 lignes) découpée en morceaux de rendu (fond, titre, ennemis ou message, barres, héros, compétences, retraite) avec tables `PHASE_ICON` / `PHASE_TEXT` ; `consumeEvents` (41) → deux tables de gestionnaires (`FX_HANDLERS`, seulement sur la scène, et `HANDLERS`, toujours) ; `tileHTML` (35, 66 lignes), `renderMap` (26) et `villageHTML` (19) en petits gabarits à retours anticipés (`RANK_CLASS`, `RESOURCE_NOTES`). Aucun gabarit partagé par deux zones : `shared/templates.js` inchangé. Lint : 41 → 15 problèmes (restent 2 complexités, moteur et simu ; 11 ternaires imbriqués ; 3 templates imbriqués, dont `logHTML`), aucune nouvelle alerte. Simu identique, 4 captures identiques au pixel près, aucune erreur JS. Puis (commit `test(qa)`) 5e capture `village.png` dans `tools/screenshot.py`, prise après le combat (les 4 autres ne bougent pas) : identique entre le `village.view.js` d'avant le lot 3 et celui d'après. **Les références des prochains lots comptent donc 5 captures.** Limite : à ce moment de la partie, tous les bâtiments sont verrouillés, la capture ne montre ni bâtiment débloqué ni niveau maximum (relecture seulement pour ces branches).

## Qualité du code — prompts A et B du 19/11 (faits, commits 14ce5f3 et b5ab51a)

**A. Captures fiables (avant le lot 3)** :
```
Lis docs/INDEX.md, CLAUDE.md, .claude/rules/javascript/testing.md, puis la section « 4. Qualité du code » de PROCHAINES-SESSIONS.md (décisions du 19/11). Sujet : supprimer le bruit des captures à la source, sans toucher au jeu (src/ et index.html inchangés). Ne lis que tools/screenshot.py et tools/qa/compare_shots.py.
Constat : au premier lancement après un changement, intro et intro2 diffèrent de 0,001 % sur le bouton « Passer » (zone 1190,14 → 1264,41) et combat de 0,3 % sur la scène (199,70 → 1199,755) ; les lancements suivants sont identiques, et l'ancien code fait pareil. Hypothèses : police Silkscreen chargée depuis Google Fonts (réseau), fond de scène bg_*.png appliqué seulement s'il est déjà chargé (sceneBgOk, classe has-bg sur #sceneView).
1. Dans tools/screenshot.py, avant chaque capture : attendre document.fonts.ready, attendre que toutes les <img> soient complete ; pour le combat, attendre #sceneView.has-bg puis avancer l'horloge d'un tick pour qu'un rendu ait lieu. Vérifie d'abord dans le script ce qui est déjà attendu.
2. Preuve : 5 lancements de suite comparés à une référence, 5 × « identique », y compris le premier juste après la modification (vide le cache si le navigateur en a un).
3. Si la police reste instable : ne l'héberge pas toi-même (changement du jeu livré), propose-le-moi comme lot séparé.
Mets à jour la ligne « bruit connu » de PROCHAINES-SESSIONS.md et .claude/rules/javascript/testing.md (une différence = une vraie régression). Commit test(qa), demande-moi avant de pousser.
```

**B. Lot 3 : complexité de l'UI** (fait le 19/11) :
```
Lis docs/INDEX.md, CLAUDE.md, .claude/rules/javascript/coding-style.md et sonarqube.md, puis la section « 4. Qualité du code » de PROCHAINES-SESSIONS.md (garde-fous communs). Lot 3 : ramener la complexité cognitive à ≤ 15 et les fonctions à ≤ 50 lignes dans l'UI, refactoring pur. Ne lis que les fichiers cités.
Cibles (npm run lint au commit a648497) : renderScene 61 et 109 lignes (src/combat/scene.view.js), consumeEvents 41 (src/app/events.view.js → table de gestionnaires {type: fonction}), tileHTML 35 et 66 lignes (src/world/explore-panel.view.js), renderMap 26 (src/world/map.view.js), villageHTML 19 (src/village/village.view.js).
Corrections attendues : extraire des fonctions courtes (un morceau de gabarit = une fonction), retours anticipés, tables de correspondance. Les ternaires et templates imbriqués de ces fonctions peuvent tomber au passage ; le reste est pour le lot 5. Un gabarit utilisé par deux zones va dans src/shared/templates.js.
Avant : captures de référence avec le tools/screenshot.py actuel (pas de captures d'avant 14ce5f3). Après : npm run check:sim identique, npm run lint en baisse sans nouvelle alerte, captures identiques (le combat compris), aucune erreur JS. Commit refactor(qualite), demande-moi avant de pousser.
```

## Qualité du code — lot 4 du 19/11 (session C, faite)

**Fait le 19/11 (lot 4)** : complexité du moteur et de la simu, refactoring pur. `fightStep` (30, `src/combat/combat.engine.js`) → trois étapes à sortie anticipée (`heroAttacks`, `autoSkills`, `enemiesAttack`) ; compétences automatiques en table `SKILL_EFFECTS` {coup, tourbillon, souffle}, recharge et condition du souffle (sous 50 %) dans `skillReady` ; coups d'un ennemi dans `enemyAttacks`. Ordre des tirages de `G.rng` / `G.mrng` et sorties anticipées (`resolveDeaths`, mort du héros) inchangés. `runBot` (27, `tools/sim.js`) → `pickTile`, `playLoop` (le temps reste additionné tick par tick sur le total, pour ne pas changer l'arrondi flottant), `logLoop`, `buyAll`. Lint : 15 → 13 problèmes, plus aucune complexité. Simu identique (`sim.txt`, `sim-outils.txt`), 5 captures identiques, aucune erreur JS.

**C. Lot 4 : complexité du moteur et de la simu** :
```
Lis docs/INDEX.md, CLAUDE.md, .claude/rules/javascript/architecture.md, coding-style.md et sonarqube.md, puis la section « 4. Qualité du code » de PROCHAINES-SESSIONS.md (garde-fous communs). Lot 4 : complexité cognitive ≤ 15, refactoring pur. Ne lis que les fichiers cités.
Cibles : fightStep 30 (src/combat/combat.engine.js : attaque de base, compétences automatiques → table {clé: gestionnaire}, ennemis) et runBot 27 (tools/sim.js : choix de la case, boucle de jeu, achats).
Piège : l'ordre des tirages de G.rng et G.mrng ne doit pas changer d'un seul appel (sinon la simu diverge) ; garder les sorties anticipées de fightStep (resolveDeaths, mort du héros) exactement aux mêmes endroits. Le moteur reste pur (aucun import de vue, shared/ ou app/).
Après : npm run check:sim identique (sim.txt et sim-outils.txt), npm run lint en baisse, captures identiques, aucune erreur JS. Commit refactor(qualite), demande-moi avant de pousser.
```

## Qualité du code — lot 5 du 19/11 (session D, faite)

**Fait le 19/11 (lot 5)** : ternaires et templates imbriqués, `onerror` en ligne, refactoring pur. Ternaires → tables ou petites fonctions à retours anticipés : `PANES` dans `renderPane` (tout autre onglet → bestiaire, comme avant), `targetPool` (`dig.engine.js`, mêmes seuils 0,45 / 0,8, aucun tirage ajouté), `layerOf` (`strata.engine.js`), `trophyTag` / `killTag` / `seenMonHTML` / `unknownMonHTML` / `trophySource` (`bestiary.view.js`), `dropQty` / `dropHTML` / `dropsHTML` (`monster.view.js`, espaces du gabarit gardés tels quels), `logLine` (`explore-panel.view.js`). `onerror` retiré de `spr()` et de l'image du héros d'`index.html` : un seul écouteur `error` en phase de capture sur `document` (`watchSprites()`, `src/shared/dom.js`, appelé par `main.js` avant le premier rendu), filtré sur `img.spr`, qui remplace l'image par son `alt` (`replaceWith`, nœud texte : même rendu que `outerHTML = alt` pour un emoji, sans analyse HTML) ; les images déjà en échec à l'appel (le héros d'`index.html` peut échouer avant le chargement des modules) sont remplacées tout de suite (`complete && naturalWidth === 0`). Vérifié en retirant `heros.png` et `tile_combat.png` : captures identiques entre l'ancien et le nouveau code (et bien différentes des références normales : le test portait). Lint : 13 → 0 problème. Simu identique, 5 captures identiques, aucune erreur JS.

**D. Lot 5 : ternaires, templates imbriqués et onerror en ligne** :
```
Lis docs/INDEX.md, CLAUDE.md, .claude/rules/javascript/sonarqube.md et dom-security.md, puis la section « 4. Qualité du code » de PROCHAINES-SESSIONS.md (garde-fous communs). Lot 5, refactoring pur. Liste d'abord les alertes restantes avec npm run lint (sonarjs/no-nested-conditional, sonarjs/no-nested-template-literals) et ne lis que ces fichiers, plus src/shared/templates.js et index.html.
Corrections attendues : ternaire imbriqué → petite fonction à retours anticipés ou table {clé: valeur}[k] ; template imbriqué → fonction qui renvoie le morceau (badge(n)).
onerror en ligne (validé par Steven pour ce lot) : spr() dans src/shared/templates.js et l'image du héros dans index.html. Les remplacer par un seul écouteur délégué (l'événement error ne remonte pas : document.addEventListener('error', …, true), filtré sur img.spr) qui remplace l'image par son alt, comme aujourd'hui. Même rendu exigé quand un sprite manque : vérifie-le en renommant temporairement un sprite, capture, puis remets-le.
Après : npm run check:sim identique, npm run lint sans ces deux règles, captures identiques, aucune erreur JS. Commit refactor(qualite), demande-moi avant de pousser.
```

## Qualité du code — lots 6 à 8 du 19/11 (session E, faite)

**Fait le 19/11 (lot 6, `3d9c974`)** : chaînage optionnel (S6582), refactoring pur. 16 motifs `a && a.b` → `a?.b` dans 10 fichiers de `src/` (aucun dans `tools/`) ; chaque valeur ne sert que de condition ou de booléen (ni affichage, ni sauvegarde). `a?.id === t.id` (`templates.js`) est sûr : chaque case reçoit son `id` au chargement (`world.data.js`). **Gardé tel quel** : `explore-panel.view.js`, `a && a.tool !== cur` (`a?.tool !== cur` vaudrait `true` sans action en cours : faux positif si SonarQube for IDE le signale). Diagnostics de VS Code périmés (pointaient vers `src/ui/digview.js`) : recherche du motif à la place, sur une ou plusieurs lignes.

**Fait le 19/11 (lot 8, `3de8953`)** : `max-lines` par suffixe dans `eslint.config.js`, comme le tableau de `coding-style.md` : `*.engine.js` 250, `*.view.js` 200, `app/main.js` 60, `tools/**/*.js` 200, `max-lines-per-function` 20 pour `*.data.js` (lignes vides et commentaires non comptés) ; les autres fichiers gardent 300. Vérifié par `eslint --print-config` fichier par fichier. Lint propre sans relever de seuil.

**Fait le 19/11 (lot 7)** : Python de `tools/`, refactoring pur, après accord de Steven sur l'inventaire (ruff 0.16.0 de la machine, complexité cognitive estimée à la lecture). Complexité : `sprite_grids.grid` (~30) → `is_edge`, `depths` (parcours en largeur), `cell` ; `pixelize.remove_bg` (~25 avec `grow` imbriquée) → `Fill` (dataclass gelée : pixels, taille, couleur des bords, tolérance), `grow`, `row_means`, `is_hole`, `fill_holes`, `border`, `dist` (mêmes ordres de parcours, même pile). Docstrings sur toutes les fonctions et classes (internes comprises), une instruction par ligne (4 `;`), imports triés (`screenshot.py`, `pixelize.py`), constante `RGBA` (7 fois), `lambda` affectées → `def`, `zip(strict=True)`, `asyncio.run` de `screenshot.py` sous `if __name__ == '__main__'`. Mis de côté (hors règles SonarQube) : E501 (pas de config ruff) et PLR2004 (seuils d'image). Vérifié par un script de test qui écrit dans un dossier ignoré : `--build` complet des 24 assets, 5 variantes de `pixelize`, `lab` / `nearest`, `compare_shots` (identique, différent, absent, `--tol`, sans argument) : sorties et empreintes identiques avant / après ; `grids.generated.js` identique octet pour octet ; 5 captures identiques, aucune erreur JS ; `npm run check` propre.

**E. Lots 6 à 8 : chaînage optionnel, Python de tools/, max-lines** (un commit par lot, conversation à couper si le budget est atteint) :
```
Lis docs/INDEX.md, CLAUDE.md, .claude/rules/javascript/sonarqube.md et coding-style.md, .claude/rules/python/sonarqube.md, puis la section « 4. Qualité du code » de PROCHAINES-SESSIONS.md (garde-fous communs). Trois lots, un commit chacun, refactoring pur.
Lot 6, chaînage optionnel (S6582, hors lint : getDiagnostics de VS Code sur src/ et tools/, ou recherche des motifs a && a.b) : a?.b?.c, en vérifiant chaque fois que la valeur ne sert pas telle quelle (a && a.x vaut null/false, a?.x vaut undefined : comparaisons, affichage, JSON de la sauvegarde).
Lot 7, Python de tools/ : inventaire d'abord (complexité, docstrings, littéraux dupliqués, imbrication selon .claude/rules/python/sonarqube.md ; outils disponibles dans requirements-dev.txt ; déjà repéré : ruff I001, imports non triés en tête de tools/screenshot.py), propose-moi la liste avant de corriger. Garde-fous : sprite_grids.py régénère src/enemies/grids.generated.js identique octet pour octet, screenshot.py et compare_shots.py donnent les mêmes résultats.
Lot 8, max-lines par suffixe dans eslint.config.js, comme le tableau de coding-style.md : *.engine.js 250, *.view.js 200, app/main.js 60, tools/**/*.js 200 (et max-lines-per-function 20 pour *.data.js) ; lint propre sans relever de seuil (au lot 2, tous les fichiers étaient déjà sous leur limite).
Après chaque lot : npm run check (lint + simu), captures identiques, aucune erreur JS. Demande-moi avant de pousser.
```

## Qualité du code — configuration ruff du 19/11 (session G, faite)

**Fait le 19/11 (session G)** : configuration ruff, refactoring pur, après accord de Steven sur la config proposée. `ruff.toml` : `line-length = 120` (comme Prettier), `target-version = "py310"` (le `.venv` WSL tourne en 3.10.12, Windows en 3.12), règles D1, I, C901 (seuil par défaut 10), E, F, W, B, SIM, UP, `quote-style = "single"` (sinon 208 chaînes passaient en guillemets doubles), `extend-exclude = ["*.md"]` (ruff 0.16 formate aussi le Python des blocs Markdown, qui reste à Prettier ; ajouté en cours de session, signalé à Steven). `ruff==0.16.0` dans `requirements-dev.txt` (version de la machine et du lot 7 ; 0.17.6 existe, non retenue). `npm run lint` lance aussi `ruff check .` et `ruff format --check .`, `npm run format` lance `ruff format .` ; `ruff` doit être dans le PATH (sous WSL : activer le `.venv`). Avant mise en forme : 7 E501, rien d'autre ; `ruff format` (5 fichiers) les coupe tous, plus aucun problème. Vérifié avec un script de test sous WSL (`.venv`, Python 3.10) qui écrit dans `screenshots/qa-<étiquette>/` (ignoré) : `--build` des 24 assets (sortie redirigée), `--help` de `sd_generate.py` et `pixelize.py`, 5 variantes de `pixelize`, `lab` / `nearest`, `sprite_grids.py`, `compare_shots` (identique, différent, absent, `--tol`, sans argument : codes 0, 1, 1, 0, 2) : 37 empreintes et journaux identiques avant / après (au nom du dossier près) ; `grids.generated.js` identique octet pour octet ; 5 captures identiques, aucune erreur JS ; `npm run check` propre. Repéré : `pillow` et `playwright` non épinglés (session H). Script de test gardé dans le dépôt : `tools/qa/check-tools.sh` (commit suivant).

**G. Configuration ruff pour `tools/`** (validée le 19/11, prochaine session) :
```
Lis docs/INDEX.md, CLAUDE.md, .claude/rules/python/sonarqube.md, puis la section « 4. Qualité du code » de PROCHAINES-SESSIONS.md (garde-fous communs) et le compte rendu du lot 7 dans docs/archive/sessions-faites.md (méthode de vérification des scripts). Refactoring pur.
1. ruff.toml : line-length = 120 comme Prettier, règles du lot 7 (D1, I, C901, E, F, W, B, SIM, UP), version de ruff épinglée dans requirements-dev.txt (vérifier qu'elle existe sur PyPI). Propose-moi la config avant de l'écrire, avec ce que ruff signale encore.
2. ruff format pour la mise en forme (jamais à la main), puis ruff check et ruff format --check branchés sur npm run lint. Un commit pour la config, un commit de mise en forme seule.
3. Vérifie : sorties des scripts identiques avant / après (script de test du lot 7 : --build dans un dossier ignoré, variantes de pixelize, compare_shots), grids.generated.js identique octet pour octet, captures identiques, aucune erreur JS, npm run check. Mets à jour CLAUDE.md (commandes) et docs/INDEX.md, demande-moi avant de pousser.
```

## Polices dans le dépôt du 19/11 (session F, faite)

**Fait le 19/11 (session F)** : Silkscreen et Inter servies avec le jeu, après accord de Steven sur la liste. Inventaire mesuré dans Chromium (parcours de `screenshot.py` prolongé : 5 écrans d'intro, fiche de case, combat, chaque onglet, fin de boucle ; police et graisse calculées de chaque élément à texte, fichiers chargés) : Inter 400 à 800 toutes utilisées, Silkscreen 400 et 900 (un `<b>` dans un élément en 700 : le fichier 700 sert) ; seul le sous-ensemble `latin` est chargé, et tous les caractères de `index.html` et `src/**/*.js` y sont (accents, `« » · × – — … › œ`), les emoji passent par la police système. Licences : SIL OFL 1.1 pour les deux (dépôt `google/fonts`). Fichiers : **exactement les woff2 `latin` que servait Google** (Inter v20, un seul fichier variable pour les 5 graisses, 47 Ko ; Silkscreen v6 400 et 700, 8 et 7 Ko) et les deux `OFL.txt`, dans `assets/fonts/` ; `src/shared/fonts.css` recopie les `@font-face` de Google à l'URL près (même `unicode-range`, `font-display: swap`, Inter déclaré par graisse sur le même fichier), chargée avant `layout.css`. `proto/mine-ennemi.html` pointe aussi sur `fonts.css` (uniformité, demandée par Steven) : son titre et ses étiquettes Silkscreen en gras passent du faux gras fabriqué par Chrome (le prototype ne chargeait que le 400) au vrai Silkscreen 700, différence montrée à Steven. Vérifié : captures de référence prises avant ; avec `fonts.googleapis.com` et `fonts.gstatic.com` introuvables (`--host-resolver-rules` de Chromium), 5 captures identiques, aucune requête externe, aucune requête échouée, aucune erreur JS ; `npm run check` propre ; commentaire de `tools/screenshot.py` mis à jour, `check-tools.sh` identique avant / après.

**Suite le 19/11 (décidé par Steven après la session F)** : `tools/screenshot.py` tourne hors ligne pour de bon (`--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1` : sans l'`EXCLUDE`, le serveur local était bloqué lui aussi) et affiche `requêtes externes : …` à la fin ; il capture aussi le prototype (`proto.png`, page à part après les 5 écrans du jeu, même graine et même horloge en pause). Vérifié : 5 captures du jeu identiques aux références prises avant, `proto.png` identique d'un lancement à l'autre, aucune erreur JS, aucune requête externe ; une page piège (Google Fonts + script de CDN) voit ses 2 requêtes listées ; `check-tools.sh` identique avant / après ; lint propre.

**F. Polices dans le dépôt (avant la publication GitHub Pages puis itch.io)** : décidé le 19/11. Aujourd'hui Silkscreen et Inter viennent de Google Fonts : le jeu dépend du réseau (jeu téléchargé depuis itch, joué hors ligne) et envoie l'IP du joueur à Google (RGPD).
```
Lis docs/INDEX.md, CLAUDE.md, .claude/rules/javascript/testing.md, puis index.html et src/app/layout.css (variables --pix et --body). Changement du jeu livré, rendu identique attendu.
1. Inventaire : graisses et sous-ensembles vraiment utilisés (index.html charge Silkscreen 400/700 et Inter 400 à 800) ; vérifie les licences (SIL OFL attendue) et propose-moi la liste avant de télécharger.
2. Fichiers woff2 dans assets/fonts/ avec leur licence, @font-face dans une feuille CSS chargée en premier (même font-display: swap), liens Google Fonts retirés d'index.html.
3. Vérifie : le jeu se charge sans réseau externe (Playwright qui bloque fonts.googleapis.com et fonts.gstatic.com), captures comparées aux références prises avant (différences de lissage possibles : montre-les-moi avant de reprendre de nouvelles références), aucune erreur JS, npm run check.
Mets à jour docs/INDEX.md et CLAUDE.md, commit, demande-moi avant de pousser.
```

## Qualité du code — épingles Python du 19/11 (session H, faite)

**Fait le 19/11 (session H)** : `.venv` WSL relevé (`uv pip freeze`) : pillow 12.3.0, playwright 1.65.1, greenlet 3.5.6, **ruff absent** (ajouté au fichier en session G sans réinstallation) ; PyPI : pillow 12.3.0, playwright 1.65.2, ruff 0.17.6. Épingles validées par Steven : `pillow==12.3.0`, `playwright==1.65.1` (celle des captures de référence), `ruff==0.16.0` (inchangée) ; `greenlet` non épinglé (seule dépendance de playwright 1.65.1, `pyee` a disparu). `.venv` recréé (`uv venv --clear` puis la commande de CLAUDE.md, inchangée). Vérifié : 6 captures identiques aux références prises avant, aucune erreur JS, aucune requête externe ; `check-tools.sh avant` / `apres` : `log.txt` et `sha.txt` identiques ; Pillow 11.0.0 (version du Python Windows) dans un venv jetable du scratchpad : empreintes identiques à 12.3.0, journaux identiques au chemin de l'interpréteur près ; `npm run check` sous Windows (Node absent sous WSL, ruff 0.16.0 de Windows) : lint 0, simu identique. Décision de Steven : toujours un venv, rien installé en global (le cas du Python Windows est resté en suspens dans `PROCHAINES-SESSIONS.md`).

**H. Épingler `pillow` et `playwright`** (petit, repéré pendant la session G) : `requirements-dev.txt` ne fixe que ruff ; Pillow (11.0.0 sous Windows, 12.3.0 dans le `.venv` WSL) et Playwright suivent la dernière version, alors que les sorties de `pixelize.py` et les captures dépendent de leurs versions.
```
Lis docs/INDEX.md, CLAUDE.md et la section « 4. Qualité du code » de PROCHAINES-SESSIONS.md (garde-fous communs). Pas de changement du jeu.
1. Versions installées dans le .venv WSL (pip freeze), versions disponibles sur PyPI (pip index versions) : propose-moi les épingles (== exact, versions du .venv sauf raison contraire) avant d'écrire.
2. requirements-dev.txt mis à jour, .venv réinstallé depuis le fichier.
3. Vérifie : captures identiques aux références prises avant, aucune erreur JS, sorties de sd_generate.py --build et de pixelize identiques (`bash tools/qa/check-tools.sh avant` puis `apres` sous WSL), npm run check. Mets à jour CLAUDE.md si la commande d'installation change, commit, demande-moi avant de pousser.
```

## Qualité du code — venv Windows du 20/11 (session I, faite)

**Fait le 20/11 (session I)** : choix validés par Steven : `.venv-win/` (ignoré par `.gitignore`, `.prettierignore` et `eslint.config.js`, car le paquet playwright contient du JavaScript), `requirements-dev.txt` tel quel (une seule source d'épingles ; playwright installé sans servir), Python 3.12.10 (celui qui produisait les sorties actuelles). Branchement de ruff tranché par le skill `conseil-technique` (4 voix ; 3 pour un lanceur, contre ma position de départ, le chemin explicite) : `tools/qa/ruff.js` lance `.venv-win/Scripts/ruff.exe` sous Windows, `.venv/bin/ruff` ailleurs, sans shell, transmet arguments et code de sortie, et échoue avec la commande de création si le venv manque ; **jamais de repli sur le PATH** (il masquerait un venv absent) ; pas de contrôle de version (doublon de l'épingle). Mesuré : npm lance ses scripts dans cmd.exe, où un chemin à `/` sans guillemets échoue et un exécutable absent donne « Le chemin d'accès spécifié est introuvable ». Vérifié : méthode de `check-tools.sh` depuis Windows (copie du script avec l'interpréteur en paramètre), Python global (Pillow 11.0.0) contre `.venv-win` (Pillow 12.3.0) : journaux identiques, `grids.generated.js` identique, **empreintes des 37 PNG toutes différentes mais pixels identiques** (`compare_shots.py`) : le Pillow 12.3.0 de Windows embarque zlib-ng (global : zlib 1.3.1, WSL : 1.2.11, où les empreintes globales et WSL coïncident) ; `npm run check` sous Windows sans Python global dans le PATH : lint 0, simu identique ; lanceur testé avec une vraie erreur ruff (code 1) et venv renommé (message clair, code 1) ; sous WSL, `check-tools.sh` avant / après identique, 6 captures identiques, aucune erreur JS, aucune requête externe. Repéré : `sprite_grids.py` lancé sous Windows écrit `grids.generated.js` en CRLF (contenu identique, normalisé par git). Décidé en cours de session : fichier verrouillé avec hashes dans une session J à part.

**I. Venv Windows** (règle absolue de `CLAUDE.md`, décidée par Steven le 19/11 après la session H) : sous Windows, `sd_generate.py` et `npm run lint` utilisaient le Python global 3.12 (Pillow 11.0.0, ruff 0.16.0, greenlet, requests en global).
```
Lis docs/INDEX.md, CLAUDE.md (règle absolue du venv) et la section « 4. Qualité du code » de PROCHAINES-SESSIONS.md (garde-fous communs). Pas de changement du jeu ; ne désinstalle rien du Python global de Windows sans mon accord.
1. Propose-moi avant d'écrire : nom du venv Windows (ex. `.venv-win/`, à ignorer dans .gitignore), fichier installé (requirements-dev.txt tel quel, ou un fichier à part sans playwright), version de Python, et comment npm run lint trouve le ruff du venv sous Windows sans PATH global (script npm, chemin explicite, activation).
2. Crée le venv depuis le fichier épinglé, branche-le (CLAUDE.md : commandes sd_generate.py, pixelize, lint sous Windows ; retire la mention « ruff dans le PATH : sous Windows, celui de Python » et l'écart encore ouvert de la règle absolue).
3. Vérifie : sorties de sd_generate.py --build et de pixelize identiques à celles du Python global (même méthode que check-tools.sh, depuis Windows), npm run check sous Windows avec le ruff du venv, captures et check-tools.sh sous WSL inchangés. Liste-moi ensuite les paquets du Python global devenus inutiles (désinstallation seulement avec mon accord). Commit, demande-moi avant de pousser.
```

## Qualité du code — fichier verrouillé avec hashes du 20/11 (session J, faite)

**Fait le 20/11 (session J)** : choix validés par Steven. `requirements-dev.in` (pillow 12.3.0, playwright 1.65.1, ruff 0.16.0, avec la commande de génération en commentaire) ; `requirements-dev.txt` généré depuis la racine par `uv pip compile --universal --generate-hashes --python-version 3.10 requirements-dev.in -o requirements-dev.txt` (uv 0.13.0) : 4 paquets (`greenlet==3.5.6` via playwright), 193 hashes ; essayé d'abord dans deux venvs jetables (Windows 3.12.10, WSL 3.10.12), `uv pip sync --require-hashes` passe sur les deux. `.venv` et `.venv-win` recréés (`uv venv --clear` puis `uv pip sync -p <venv> --require-hashes requirements-dev.txt`, Chromium réinstallé sous WSL) : mêmes 4 paquets qu'avant, rien retiré. Règle dans `CLAUDE.md` : fichier généré, jamais édité à la main (modifier le `.in`, regénérer, resynchroniser les deux venvs, même commit) ; commandes d'installation et message de `tools/qa/ruff.js` passés à `uv pip sync --require-hashes`. `check-tools.sh` prend l'interpréteur en 2e argument (défaut `.venv/bin/python`). `sprite_grids.py` écrit `grids.generated.js` avec `newline='\n'` : plus de CRLF sous Windows. Vérifié : sous WSL, `check-tools.sh avant` / `apres` : `log.txt` et `sha.txt` identiques, 6 captures identiques, aucune erreur JS, aucune requête externe ; depuis Windows (`bash tools/qa/check-tools.sh win .venv-win/Scripts/python.exe`) : pixels identiques à WSL dans les 5 dossiers (`compare_shots.py`), `grids.generated.js` à la même empreinte, `git status` propre ; `npm run check` sous Windows : lint 0, simu identique. Écarts Windows / WSL du `log.txt`, d'abord laissés « hors périmètre » puis corrigés à la demande de Steven (règle d'uniformité gravée dans `CLAUDE.md`) : encodage cp1252 de la console redirigée (`export PYTHONUTF8=1` dans `check-tools.sh`), `\` des chemins de `sd_generate.py` (`.as_posix()`), `*` de `sha256sum` (`-t`), et `\r\n` écrits par Python sous Windows, cachés par `diff` / `cmp` / `grep` de Git Bash et trouvés en lisant les octets (`tr -d '\r'` dans `run()`). Après correction : `log.txt` Windows identique à WSL octet pour octet (au nom de l'interpréteur près), `sha.txt` au même format, log et empreintes WSL inchangés.

**J. Fichier verrouillé avec hashes** (décidé par Steven le 20/11, pendant la session I) : `requirements-dev.txt` n'épingle que les 3 paquets directs ; `greenlet` (dépendance de playwright) suit la dernière version (3.5.6 dans les deux venvs, 3.5.5 dans le Python global) et aucun hash ne garantit que le fichier téléchargé est celui attendu.
```
Lis docs/INDEX.md, CLAUDE.md (règle absolue du venv) et la section « 4. Qualité du code » de PROCHAINES-SESSIONS.md (garde-fous communs), puis le § « --require-hashes » de .claude/rules/common/github-actions-security.md. Pas de changement du jeu.
1. Propose-moi avant d'écrire : requirements-dev.in (les 3 épingles actuelles, source lisible), requirements-dev.txt généré par uv pip compile --universal --generate-hashes (le même fichier sert à Windows 3.12 et WSL 3.10 : vérifie qu'il couvre les deux), installation par uv pip sync --require-hashes (venv conforme au fichier, paquets en trop retirés), la règle à écrire dans CLAUDE.md (fichier généré, jamais édité à la main), comment lancer check-tools.sh depuis Windows (interpréteur en paramètre), et la correction des fins de ligne de sprite_grids.py (sous Windows il écrit grids.generated.js en CRLF : contenu identique, mais git status le montre modifié).
2. Écris les fichiers, recrée .venv (WSL) et .venv-win (Windows) depuis le fichier verrouillé, mets à jour les commandes de CLAUDE.md et le message de tools/qa/ruff.js.
3. Vérifie : check-tools.sh sous WSL et depuis Windows (Windows : comparer les pixels, le Pillow Windows compresse avec zlib-ng), captures identiques, aucune erreur JS, npm run check sous Windows. Commit, demande-moi avant de pousser.
```

## Qualité du code — état final de la section 4 de PROCHAINES-SESSIONS.md (20/11, toutes les sessions faites)

**État au 19/11** (lots 0 à 8 faits ; comptes rendus et prompts A à E dans `docs/archive/sessions-faites.md`) : ESLint + règles SonarQube, limites de taille par suffixe, `npm run check` (lint + simu de référence), captures déterministes **sans bruit connu : une différence = une vraie régression**, 5 captures de référence (`village.png` comprise ; tous les bâtiments y sont verrouillés, relire à la main les branches « débloqué » et « niveau max »). Lint : **0 problème**, chaînage optionnel fait (lot 6), Python de `tools/` propre (lot 7).
**Décisions de Steven** : tout en anglais (dossiers, fichiers, code), fichiers en `kebab-case` avec suffixe de rôle (`.data.js`, `.engine.js`, `.view.js`, CSS à côté de sa vue), dossiers par domaine (`world/`, `hero/`, `enemies/`, `combat/`, `village/`, `intro/`, `modals/`, `shared/`), Python de `tools/` inclus, imports circulaires corrigés, aucun `NOSONAR` (de vraies corrections), mise en forme par Prettier comme `ruff format` dans atlas (jamais à la main).
**Lots** : tous faits (0 à 8), configuration ruff faite (G), polices dans le dépôt faites (F), épingles Python faites (H), venv Windows fait (I), fichier verrouillé avec hashes fait (J). Plus aucune session de qualité en attente.
**Décision de Steven (19/11, après le lot 8)** : `max-lines` à 1000 pour les `*.data.js` (avant : 300 par défaut, alors que le tableau de `coding-style.md` disait « illimité »). Pourquoi : la taille d'une table de données ne coûte rien à lire, on découpe par sujet (une zone, une famille de monstres) et pas au nombre de lignes ; 1000 est le défaut de SonarQube (S104), un garde-fou contre l'absurde. La logique reste bornée à 20 lignes par fonction. Commentaire dans `eslint.config.js`, tableau de `coding-style.md` mis à jour. Plus gros fichier de données à ce jour : `world.data.js`, 158 lignes.

**Décisions de Steven (19/11, après le lot 2)** : lots 3 à 8 confirmés ; le `onerror` en ligne (`spr()` dans `src/shared/templates.js`, image du héros dans `index.html`) se traite avec le lot 5 ; le bruit des captures se **corrige à la source** (session A), on ne le masque pas en relançant.
Ordre des conversations : A à J faites, archivées ; la suite est le gameplay 3a.

Garde-fous communs (à rappeler dans chaque prompt) : refactoring pur, aucun changement de comportement ; `npm run check:sim` identique ; `npm run lint` en baisse (jamais de `NOSONAR`, `eslint-disable` ni seuil relevé) ; captures de référence prises **avant** (`tools/screenshot.py` sous WSL, version 14ce5f3 ou plus récente : les captures de l'ancien script ne sont plus comparables, le combat avait un tick de moins ; copiées dans le scratchpad), comparées **après** avec `tools/qa/compare_shots.py` : identiques ; aucune erreur JS ; commit, demander avant de pousser.

**E. Lots 6 à 8** : faits le 19/11 (compte rendu et prompt dans `docs/archive/sessions-faites.md`). Lint à 0 problème avec les limites `max-lines` par suffixe ; un seul `a && a.b` gardé volontairement (`explore-panel.view.js`, `a && a.tool !== cur`) ; Python de `tools/` propre pour ruff (hors E501 et PLR2004).

**G. Configuration ruff** : faite le 19/11 (compte rendu et prompt dans `docs/archive/sessions-faites.md`). `ruff.toml` (120, guillemets simples, Python 3.10, règles du lot 7, Markdown exclu : il reste à Prettier), `ruff==0.16.0` dans `requirements-dev.txt`, `ruff check` et `ruff format --check` dans `npm run lint`. Python de `tools/` : 0 problème.

**H. Épingles Python** : faite le 19/11 (compte rendu et prompt dans `docs/archive/sessions-faites.md`). `requirements-dev.txt` : `pillow==12.3.0`, `playwright==1.65.1`, `ruff==0.16.0` (versions du `.venv` WSL, `greenlet` laissé à playwright) ; `.venv` recréé depuis le fichier. Pillow 11.0.0 et 12.3.0 donnent des sorties identiques (`check-tools.sh`).

**I. Venv Windows** : faite le 20/11 (compte rendu et prompt dans `docs/archive/sessions-faites.md`). `.venv-win/` (Python 3.12.10, `requirements-dev.txt` tel quel), `npm run lint` / `format` lancent ruff par `tools/qa/ruff.js` (jamais celui du PATH). Le Pillow 12.3.0 de Windows compresse avec zlib-ng : PNG aux octets différents, pixels identiques (comparer avec `compare_shots.py`, pas les empreintes). Rien désinstallé du Python global.

**J. Fichier verrouillé avec hashes** : faite le 20/11 (compte rendu et prompt dans `docs/archive/sessions-faites.md`). `requirements-dev.in` (3 épingles, source éditée) → `requirements-dev.txt` **généré** (`uv pip compile --universal --generate-hashes --python-version 3.10`, 4 paquets dont `greenlet==3.5.6`, valable WSL 3.10 et Windows 3.12), venvs installés par `uv pip sync --require-hashes`. `check-tools.sh <étiquette> [python]` se lance aussi depuis Windows ; `sprite_grids.py` écrit en LF partout.

**F. Polices dans le dépôt** : faite le 19/11 (compte rendu et prompt dans `docs/archive/sessions-faites.md`). `assets/fonts/` (Inter variable + Silkscreen 400 / 700, `latin`, OFL), `src/shared/fonts.css` chargée en premier par `index.html` et le prototype ; plus aucune requête externe, captures du jeu identiques.

## Lore — prompt d'origine de la section 1 (fait le 19/11, archivé le 20/11)
Fait : lieux confirmés et vérifiés, texte final des 5 écrans de l'intro, 5 vestiges et 6 répliques de déjà-vu (retenus provisoirement), tout dans `docs/lore.md`.

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

## Gameplay 3a — forge et outil conseillé du 20/11 (faite, étape 2b)

**État avant la session** : sous-étape 1 faite (bot malin `--malin`, dégâts variables ×0,8-1,2, `--graines N`) ; boss méd. 9 (défaut) et 10 (malin) sur 10 graines.

**Résultat** : sous-étape 2 (forge à recettes non permanente, commit 95c9959) et sous-étape 3 (outil conseillé dans le carnet du bestiaire). Décisions de Steven pendant la session : chaque outil a ses propres paliers (palier II de chacun), recettes en matériaux seulement, découvertes à la première victoire ; « Refaire la même forge » en attendant la 3b. Premiers tests du moteur avec `node:test` (`tests/`, `npm test`, inclus dans `npm run check`). Aussi : prompt de la session 0 (alléger CLAUDE.md et les règles d'atlas, mesures à l'appui).

**Prompt exécuté** :
```
Lis docs/INDEX.md, puis dans docs/design.md seulement : « Étape 2a faite : marteau et coutelas », « Équipement, forge et mémoire du village — PROPOSITION v3 » et, dans la v2, « Types d'armes », « Objets », « Amélioration à la forge ». Lis la section « 3. Gameplay » de PROCHAINES-SESSIONS.md (idées validées). Lis CLAUDE.md pour l'architecture.
Étape 2b du combat-minage, une mécanique à la fois, jouable à chaque étape :
1. (fait le 20/11 : bot malin `--malin`, dégâts variables, `--graines N`) Lis aussi dans docs/design.md « Étape 2b en cours » (décisions du conseil : l'outil est l'arme, forger = fabriquer le palier suivant d'un outil ou d'une armure ; prix plein à chaque boucle, la reforge est pour la 3b).
2. Forge : objets (arme, armure, accessoire) forgés avec les matériaux extraits, recettes qui demandent des rares ou beaucoup de communs (idée 2), équipement perdu à la fin de la boucle (non permanent).
3. Outil conseillé par monstre dans la fiche du bestiaire (idée 1), règle décidée dans « Étape 2b en cours » : victoires par outil, note dès la 1re victoire ou défaite, outil nommé après 2 outils différents ou au filet (normal 10, élite 2, boss 1).
Avant de coder, annonce-moi le périmètre (fichiers touchés) en 5 lignes. Simu dans la cible (boss 8e-13e boucle, médiane 9-12, avec le bot par défaut et le bot malin, vérifier aussi avec --graines 30), sauvegarde compatible (valeurs par défaut au chargement), docs/design.md et docs/INDEX.md à jour, commit à chaque sous-étape et demande-moi avant de pousser.
```

## Contexte Claude — alléger CLAUDE.md et les règles du 20/11 (session 0, faite)

**Fait le 20/11 (session 0)** : règles chargées à chaque requête passées de 45,8 Ko à 0,6 Ko (seul `common/git-workflow.md` reste sans filtre ; `python/sonarqube.md` et `python/coding-style.md` filtrés sur `tools/**/*.py`, ce dernier réécrit « ruff seul, `ruff.toml` fait foi » après avis du conseil technique : black / isort redondants avec `ruff format` et la règle `I`, annotations et dataclasses frozen retirées faute d'outil qui les vérifie ; checklist de `python/sonarqube.md` purgée de mypy / `make test` ; 17 règles d'atlas déplacées dans `.claude/rules-atlas/` avec un `LISEZMOI.md`, dont `common/coding-style.md` dont l'immutabilité contredit le moteur qui mute `G` et `S`). `CLAUDE.md` de 11,8 à 3,1 Ko : commandes, venv, qualité, `tools/qa/` et sprites dans le nouveau `docs/outillage.md` ; liste des modules dans `docs/design.md` → `### Liste des modules` ; feuille de route dans `docs/INDEX.md`. Chaque ligne de l'ancien `CLAUDE.md` vérifiée retrouvée ailleurs. Hors `.claude/` (non versionné), commit seul. Ensuite, à la demande de Steven : `## Backlog` de `design.md` mis à jour (ancienne phrase, périmée : « Voir la feuille de route dans `CLAUDE.md`. Prochaines étapes : découper le code, ajouter l'équipement et la forge à recettes, donner un rôle à la renommée, puis la mine. ») ; section « faux positifs XML namespace / `# NOSONAR` » retirée de `python/sonarqube.md` (contredit « jamais de NOSONAR »), rangée dans `.claude/rules-atlas/python/sonarqube-xml-namespace.md`.

**Prompt d'origine (section 0)** :
Décidé le 20/11 : mesuré à chaque requête ~3,5 k tokens pour `CLAUDE.md` (11,6 Ko) et ~13 k pour les règles d'atlas sans filtre `paths:` (`.claude/rules/common/*` 27,5 Ko, `python/import_cascade.md` et `python/sonarqube.md` 14,7 Ko, `everything-claude-code-guardrails.md` 2,3 Ko), en grande partie hors sujet (FastAPI, microservices, CI GitHub Actions, SQL). Les règles `javascript/` ont déjà leur filtre `paths:`.
```
Lis CLAUDE.md, CLAUDE.local.md, docs/INDEX.md et la liste de .claude/rules/ (taille et en-tête de chaque fichier, pas tout le contenu).
Allège le contexte chargé à chaque requête, sans rien perdre :
1. Règles d'atlas (.claude/ n'est pas versionné : pas de retour git) : un filtre `paths:` sur celles qui servent parfois (ex. python/sonarqube.md et python/coding-style.md sur tools/**/*.py) ; déplace dans .claude/rules-atlas/ (pas de suppression) celles qui ne servent jamais ici (import_cascade, fastapi, github-actions-security, common/security, patterns, performance…). Montre-moi la liste « garder / filtrer / déplacer » avant de toucher.
2. CLAUDE.md ramené à ~3 Ko : langue, projet en 3 lignes, couches, règles absolues (venv, uniformité, sauvegarde, moteur pur), pointeurs. Le détail part dans des fichiers versionnés : commandes Python, venv, Forge et sprites → docs/outillage.md ; liste des modules → docs/design.md « ## Architecture du code » ; feuille de route → docs/INDEX.md. CLAUDE.md dit « lire docs/outillage.md avant de toucher à tools/ ou aux venv ».
3. Vérifie que rien n'est perdu (chaque ligne de l'ancien CLAUDE.md retrouvée quelque part), mesure les tailles avant / après, mets à jour docs/INDEX.md, commit, demande-moi avant de pousser.
```

