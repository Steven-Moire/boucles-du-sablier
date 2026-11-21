// Moteur pur (aucun DOM) : une boucle, du réveil au village jusqu'à sa fin. rng injectable, émet des G.events.
import {VILLAGE, neighbors} from './world.data.js';
import {DEFAULT_TOOL, SKILLS, TOOLS} from '../hero/hero.data.js';
import {UPGRADES} from '../village/village.data.js';
import {heroAtLevel, heroBase} from '../hero/hero.engine.js';
import {cleanSlots, wearForged} from '../village/forge.engine.js';

// ======================= MOTEUR =======================
export function newMeta() {
  const m = {
    v: 1,
    loop: 1,
    renown: 0,
    gold: 0,
    wood: 0,
    ore: 0,
    upgrades: {},
    discovered: {},
    everCompleted: {},
    bestiary: {},
    chests: {},
    trophies: {},
    mats: {},
    equip: {},
    forge: {},
    recent: {},
    bossKilled: false,
    tool: DEFAULT_TOOL,
    scenes: {}, // scènes déjà jouées (R2 : premierCombat)
    vestiges: {}, // vestiges trouvés : id -> boucle de la trouvaille
  };
  m.discovered[VILLAGE] = true;
  neighbors(VILLAGE).forEach(n => (m.discovered[n] = true));
  return m;
}
// mrng : hasards du minage (veines, cible, extraction), séparés de rng pour que les combats ne changent pas
export function createGame(meta, rng, mrng) {
  meta = meta || newMeta();
  meta.trophies = meta.trophies || {};
  meta.mats = meta.mats || {};
  if (!TOOLS[meta.tool]) meta.tool = DEFAULT_TOOL; // sauvegardes d'avant les outils
  // forge (2b) : sauvegardes d'avant la forge, ou recette inconnue
  meta.equip = cleanSlots(meta.equip);
  meta.forge = cleanSlots(meta.forge);
  meta.recent = cleanSlots(meta.recent);
  for (const id in meta.bestiary) meta.bestiary[id].byTool ||= {}; // carnet par outil (2b)
  meta.scenes ||= {}; // sauvegardes d'avant R2 : la scène du premier combat se joue une fois
  meta.vestiges ||= {};
  const G = {meta, rng: rng || Math.random, mrng: mrng || Math.random, run: null, events: []};
  startLoop(G);
  return G;
}
export function startLoop(G) {
  const base = heroBase(G.meta);
  const hero = heroAtLevel(base, 1);
  hero.hp = hero.maxHp;
  hero.xp = 0;
  const skillT = {};
  for (const k in SKILLS) skillT[k] = 0;
  G.run = {
    hero,
    base,
    skillT,
    timeMax: base.loopTime,
    timeLeft: base.loopTime,
    completed: new Set([VILLAGE]),
    heroAt: VILLAGE,
    action: null,
    over: null,
    log: [],
    gains: {renown: 0, gold: 0, wood: 0, ore: 0, tiles: 0, monsters: 0, kills: 0, trophies: 0, mats: {}},
    maxTile: 0,
  };
  log(G, `Boucle ${G.meta.loop} : le héros se réveille au village.`, 'b');
}
export function log(G, text, cls) {
  G.run.log.unshift({text, cls});
  if (G.run.log.length > 50) G.run.log.pop();
}
export function addRes(G, res, n) {
  if (!n) return;
  const before = G.meta[res];
  G.meta[res] += n;
  G.run.gains[res] += n;
  if (res === 'renown')
    for (const k in UPGRADES) {
      const q = UPGRADES[k].req;
      if (before < q && G.meta.renown >= q) G.events.push({type: 'unlock', key: k});
    }
}
export const randInt = (G, a, b) => a + Math.floor(G.rng() * (b - a + 1));
export function endLoop(G, reason, enemyName) {
  const r = G.run;
  if (r.over) return;
  r.over = {
    reason,
    enemyName,
    loop: G.meta.loop,
    lvl: r.hero.lvl,
    gains: {...r.gains},
    tilesDone: r.completed.size - 1,
  };
  r.action = null;
  G.events.push({type: 'loopEnd'});
}
export function newLoop(G) {
  G.meta.loop++;
  wearForged(G.meta); // l'équipement de la boucle finie est perdu, celui forgé pour celle-ci est porté
  startLoop(G);
}
export function abandon(G) {
  if (!G.run.over) endLoop(G, 'return');
}
