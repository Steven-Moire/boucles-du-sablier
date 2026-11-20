# Les Boucles du Sablier — contexte pour Claude Code

**Toujours répondre en français.** Les textes du jeu sont en français.
Jeu incrémental / idle à boucle temporelle, jouable dans le navigateur. Projet perso de Steven (AI engineer Python/web, pas game dev) : on avance par petits incréments jouables.
Modules ES natifs, aucun build, aucune dépendance livrée au joueur, aucune ressource externe (hors ligne, jamais de CDN ni de Google Fonts) ; déployé tel quel sur GitHub Pages.

## Couches (`src/<domaine>/`, le suffixe dit le rôle)
`*.data.js` (données) ← `*.engine.js` (moteur **pur**, aucun DOM) ← `*.view.js` (une zone, CSS à côté) ← `app/main.js`. Briques de l'UI dans `shared/` (état partagé `S`, seul accès à `localStorage` dans `save.js`). Le moteur et les données n'importent jamais une vue, ni `src/shared/`, ni `src/app/` (vérifié par `npm run lint`). Le moteur reçoit un `rng` injectable (simu déterministe ; minage sur `G.mrng`) et émet des `G.events` que l'UI consomme. Liste des modules : `docs/design.md` « ## Architecture du code ».

## Règles absolues
- **Python toujours dans un venv**, depuis un fichier épinglé (`==` exact, `requirements-dev.txt`, généré, jamais édité à la main) ; jamais de `pip install` dans un Python global (Windows ou WSL), même pour un essai : venv jetable dans le scratchpad. Aucune exception sans accord explicite de Steven.
- **Uniformité, gravée dans le marbre.** Un même outil donne la même sortie sous Windows et sous WSL (UTF-8, chemins en `/`, fins de ligne LF, même format), un même sujet se traite de la même façon partout (commandes, fichiers, docs). Un écart repéré **se corrige dans la session en cours**, même hors sujet (on l'annonce, on ne le fait pas en silence). Seule raison de reporter : contexte proche de la limite, et alors une ligne de `PROCHAINES-SESSIONS.md`. Jamais « repéré, non corrigé ».
- **Sauvegarde** : `localStorage` clé `boucles-sablier-v01`, objet `meta` versionné (`meta.v`). Tout nouveau champ a une valeur par défaut au chargement : ne jamais casser une sauvegarde existante.
- **Une mécanique à la fois**, chaque étape reste jouable ; `node tools/sim.js` après toute modif de chiffres (cible dans `docs/outillage.md`) ; `docs/design.md` mis à jour à chaque changement de gameplay.
- Pixel art : `image-rendering: pixelated`, tailles multiples de 16, palette unique (`docs/art-direction.md`).

## Où lire
- **`docs/INDEX.md` d'abord** (résumé de tout, feuille de route, où est chaque sujet), puis seulement la section utile. `docs/design.md` est long : lire par section.
- **Lire `docs/outillage.md` avant de toucher à `tools/` ou aux venv** (commandes, venv WSL / Windows, lint, captures, Forge et sprites).
- `PROCHAINES-SESSIONS.md` ne contient que ce qui reste à faire : en fin de session, dans le même commit, déplacer prompt et compte rendu (« Fait le … ») dans `docs/archive/sessions-faites.md`, ne laisser qu'une ligne d'état.
- Une conversation par sujet ; au hook de budget (150 k tokens, puis tous les 150 k), proposer un plan découpé en conversations dédiées.
