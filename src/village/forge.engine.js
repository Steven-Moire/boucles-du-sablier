// Moteur pur (aucun DOM) : forger un palier d'outil, une armure ou un accessoire avec les matériaux extraits.
// meta.equip : ce que le héros porte pendant la boucle en cours ; meta.forge : forgé pour la boucle suivante ;
// meta.recent : dernière recette forgée par emplacement (« refaire la même forge »). Rien n'est permanent en 2b.
import {RECIPES, SLOTS} from './forge.data.js';
import {UPGRADES} from './village.data.js';

const TOOL_STATS = ['pow', 'crit', 'pierce'];
const HERO_STATS = ['hp', 'arm', 'dodge', 'crit', 'loopTime'];

// la forge ouvre avec le bâtiment Forge (même seuil de renommée)
export const forgeOpen = meta => meta.renown >= UPGRADES.forge.req;
export const recipeUnlocked = (meta, id) => RECIPES[id].unlock.every(m => meta.bestiary[m]?.killed);
// fresh : le héros n'est pas encore parti, l'objet sert tout de suite ; sinon il sert à la boucle suivante
const forgeTarget = (meta, fresh) => (fresh ? meta.equip : meta.forge);
const canPay = (mats, cost) => Object.keys(cost).every(k => (mats[k] || 0) >= cost[k]);
function pay(mats, cost) {
  for (const k in cost) mats[k] -= cost[k];
}

export function recipeState(G, id, fresh) {
  const r = RECIPES[id],
    m = G.meta,
    taken = forgeTarget(m, fresh)[r.slot] || null;
  const unlocked = forgeOpen(m) && recipeUnlocked(m, id);
  return {r, unlocked, taken, ok: unlocked && !taken && canPay(m.mats, r.cost)};
}
export function forgeItem(G, id, fresh) {
  const s = recipeState(G, id, fresh);
  if (!s.ok) return false;
  pay(G.meta.mats, s.r.cost);
  forgeTarget(G.meta, fresh)[s.r.slot] = id;
  G.meta.recent[s.r.slot] = id;
  return true;
}
// « refaire la même forge » : les dernières recettes de chaque emplacement encore libre, payées d'un coup
export function repeatPlan(G, fresh) {
  const m = G.meta,
    target = forgeTarget(m, fresh);
  const ids = Object.values(m.recent).filter(id => !target[RECIPES[id].slot] && recipeUnlocked(m, id));
  const cost = {};
  for (const id of ids) for (const k in RECIPES[id].cost) cost[k] = (cost[k] || 0) + RECIPES[id].cost[k];
  return {ids, cost, ok: forgeOpen(m) && ids.length > 0 && canPay(m.mats, cost)};
}
export function repeatForge(G, fresh) {
  const p = repeatPlan(G, fresh);
  if (!p.ok) return false;
  for (const id of p.ids) forgeItem(G, id, fresh);
  return true;
}
// bonus de l'armure et de l'accessoire portés (les paliers d'outil ne comptent que l'outil en main)
export function equipBonus(equip) {
  const s = {};
  for (const k of HERO_STATS) s[k] = 0;
  for (const slot of ['armure', 'accessoire']) {
    const b = RECIPES[equip[slot]]?.bonus || {};
    for (const k of HERO_STATS) s[k] += b[k] || 0;
  }
  return s;
}
// bonus du palier forgé pour l'outil toolKey (0 partout sans palier : pioche de base = v0.3)
export function toolBonus(equip, toolKey) {
  const r = RECIPES[equip[toolKey]];
  const s = {tier: r ? r.tier : 1};
  for (const k of TOOL_STATS) s[k] = r?.bonus[k] || 0;
  return s;
}
// sauvegarde : ne garde que des recettes connues, à leur emplacement (valeur par défaut {})
export function cleanSlots(o) {
  const out = {};
  for (const slot in o || {}) if (SLOTS[slot] && RECIPES[o[slot]]?.slot === slot) out[slot] = o[slot];
  return out;
}
// début d'une nouvelle boucle : ce qui a été forgé pour elle est porté, l'ancien équipement est perdu
export function wearForged(meta) {
  meta.equip = meta.forge;
  meta.forge = {};
}
