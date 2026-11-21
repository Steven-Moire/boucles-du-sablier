import {TILES, VILLAGE} from '../world/world.data.js';
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
  tab: 'place', // onglet affiché à droite du héros : place (le lieu : village ou combat), map ou bestiary
  zone: 'jalon', // zone du village dont la fiche est ouverte (village/village.view.js)
  farView: false, // village regardé de loin pendant que le héros est en route (jusqu'à « Rentrer », R3c)
  selected: null,
  modalMode: null,
  backTimer: null,
  lastSceneTile: null,
  scene: null, // scène du premier combat en cours : {step, tgt, e, killed, timer} (lore/scene.view.js)
  heartHint: null, // monstre dont le cœur clignote à travers la chair pendant la scène
};
export const anyUpgrade = () => Object.keys(UPGRADES).some(k => upgradeState(S.G, k).ok);
// le héros est au village : début de boucle, ou retraite depuis une case voisine (il ne rentre pas encore à pied)
export const atVillage = () => !S.G.run.action && S.G.run.heroAt === VILLAGE;
// l'onglet du lieu montre le village (le héros y est, ou on le regarde de loin), sinon le combat
export const villageShown = () => atVillage() || S.farView;
export const combatShown = () => S.tab === 'place' && !villageShown();
// zone du village où se paie chaque bâtiment
export const UPGRADE_ZONE = {entraineur: 'entrainement', forge: 'mailloche', horloge: 'horloge'};
// ouvre le village dans l'onglet du lieu (de loin si le héros est en route), sur une amélioration payable s'il y en a
export function openVillage() {
  S.tab = 'place';
  S.farView = !atVillage();
  const k = Object.keys(UPGRADES).find(u => upgradeState(S.G, u).ok);
  if (k) S.zone = UPGRADE_ZONE[k];
}
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
