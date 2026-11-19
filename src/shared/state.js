import {TILES} from '../world/world.data.js';
import {UPGRADES} from '../village/village.data.js';
import {createGame} from '../world/loop.engine.js';
import {upgradeState} from '../village/village.engine.js';
import {readMeta, writeMeta} from './save.js';

// ======================= INTERFACE =======================
// renvoie {ok, error} : le jeu continue même si la sauvegarde échoue (voir save.js)
export const saveMeta = () => writeMeta(S.G.meta);

// état de l'interface partagé entre modules (un module ES ne peut pas réaffecter une variable importée)
const savedMeta = readMeta().meta;
export const hadSave = savedMeta !== null; // l'intro ne se joue qu'au tout premier lancement
export const S = {
  G: createGame(savedMeta),
  gameSpeed: 1,
  tab: 'explore',
  view: 'map',
  selected: TILES[2].id,
  modalMode: null,
  backTimer: null,
  lastSceneTile: null,
};
export const anyUpgrade = () => Object.keys(UPGRADES).some(k => upgradeState(S.G, k).ok);
export const loopFresh = () => {
  const r = S.G.run;
  return !r.over && !r.action && r.completed.size === 1 && r.timeLeft === r.timeMax;
};
