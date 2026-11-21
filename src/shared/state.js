import {TILES} from '../world/world.data.js';
import {UPGRADES} from '../village/village.data.js';
import {createGame} from '../world/loop.engine.js';
import {upgradeState} from '../village/village.engine.js';
import {isExplorable} from '../world/explore.engine.js';
import {readMeta, writeMeta} from './save.js';

// ======================= INTERFACE =======================
// renvoie {ok, error} : le jeu continue même si la sauvegarde échoue (voir save.js)
export const saveMeta = () => writeMeta(S.G.meta);

// état de l'interface partagé entre modules (un module ES ne peut pas réaffecter une variable importée)
const savedMeta = readMeta().meta;
// partie de l'interface : les scènes jouées (lore/scene.engine.js) n'existent que là, jamais dans la simu
export const newUiGame = meta => Object.assign(createGame(meta), {scenes: true});
export const hadSave = savedMeta !== null; // l'intro ne se joue qu'au tout premier lancement
export const S = {
  G: newUiGame(savedMeta),
  gameSpeed: 1,
  tab: 'map', // onglet affiché à droite du héros : combat, map, bestiary ou village
  selected: null,
  modalMode: null,
  backTimer: null,
  lastSceneTile: null,
  scene: null, // scène du premier combat en cours : {step, tgt, e, killed, timer} (lore/scene.view.js)
  heartHint: null, // monstre dont le cœur clignote à travers la chair pendant la scène
};
export const anyUpgrade = () => Object.keys(UPGRADES).some(k => upgradeState(S.G, k).ok);
export const loopFresh = () => {
  const r = S.G.run;
  return !r.over && !r.action && r.completed.size === 1 && r.timeLeft === r.timeMax;
};
// case choisie en début de boucle : la première accessible jamais faite, sinon la première accessible
// (jamais une case inaccessible, qui n'aurait qu'un bouton grisé)
export function startTile() {
  const r = S.G.run,
    ok = TILES.filter(t => isExplorable(S.G, t.id) && !r.completed.has(t.id));
  return (ok.find(t => !S.G.meta.everCompleted[t.id]) || ok[0] || TILES[0]).id;
}
S.selected = startTile();
