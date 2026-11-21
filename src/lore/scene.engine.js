// Moteur pur (aucun DOM) : scène jouée du premier combat (R2). Aucun tirage au hasard ici : G.rng et G.mrng
// ne bougent pas. La scène ne se joue que si l'UI l'a demandée (G.scenes) : la simu ne la voit jamais.
// Pendant une bulle, le moteur se suspend (G.run.hold) : ni coup, ni sablier ; la suite reprend telle quelle.
import {FIRST_FIGHT, VESTIGES} from './lore.data.js';
import {log} from '../world/loop.engine.js';

const pending = G => G.scenes && !G.meta.scenes.premierCombat;

// premier coup du héros qui creuse le premier Mulot dentu : la scène commence, le jeu se suspend
export function sceneOnHit(G, src, tgtKey, def, idx) {
  const r = G.run;
  if (src !== 'hero' || r.scene || def.id !== FIRST_FIGHT.monster || !idx.length || !pending(G)) return;
  r.scene = {e: def};
  r.hold = true;
  G.events.push({type: 'scene', key: 'coup', tgt: tgtKey, idx: idx.slice(), w: def.dig.w});
}

// mort de ce Mulot-là : la clé, gardée d'une boucle à l'autre ; le jeu se suspend le temps de la bulle
export function sceneOnKill(G, e, tgtKey) {
  const r = G.run;
  if (r.scene?.e !== e) return;
  r.scene = null;
  r.hold = true;
  const id = FIRST_FIGHT.vestige;
  G.meta.scenes.premierCombat = true;
  G.meta.vestiges[id] ||= G.meta.loop; // déjà trouvée (scène rejouée) : rien de plus
  log(G, `${VESTIGES[id].icon} ${VESTIGES[id].name}. ${FIRST_FIGHT.stow}`, 'g');
  G.events.push({type: 'vestige', id, tgt: tgtKey});
}

// l'UI a fini sa bulle : le jeu reprend là où il s'était arrêté
export function resumeScene(G) {
  G.run.hold = false;
}

// depuis le bestiaire : la scène se rejouera au prochain Mulot dentu (la clé n'est pas redonnée)
export function replayScene(meta) {
  meta.scenes.premierCombat = false;
}
