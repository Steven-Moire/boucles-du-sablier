// Bot « moyen » de la simu (node tools/sim.js --moyen) : un humain attentif mais imparfait.
// 1. outil : suit l'outil nommé par le carnet pour le monstre principal de la case une fois sur deux, sinon garde le sien ;
// 2. route : avance comme les autres bots, mais une fois sur quatre refarme une case déjà faite ; sous 30 % de PV
//    en combat, bat en retraite de la case (une fois par boucle au plus) ;
// 3. village : achète et forge dans un ordre tiré au hasard (palier II de son outil du moment seulement).
// Son hasard vient d'un générateur à part : jamais G.rng ni G.mrng, les combats ne changent pas à décisions égales.
import {TILES} from '../src/world/world.data.js';
import {MONSTERS} from '../src/enemies/enemies.data.js';
import {RECIPES} from '../src/village/forge.data.js';
import {UPGRADES} from '../src/village/village.data.js';
import {isExplorable, retreat} from '../src/world/explore.engine.js';
import {toolAdvice} from '../src/enemies/enemies.engine.js';
import {setTool} from '../src/hero/hero.engine.js';
import {buy, upgradeState} from '../src/village/village.engine.js';
import {forgeItem} from '../src/village/forge.engine.js';
import {lcg} from '../src/shared/rng.js';

const FOLLOW_ADVICE = 0.5,
  FARM_INSTEAD = 0.25,
  RETREAT_HP = 0.3;

// rnd : le hasard du bot ; retreated : retraite déjà faite dans la boucle en cours
export const makeAverageBot = seed => ({rnd: lcg((seed ^ 0x9e3779b9) >>> 0), retreated: false});

// la case déjà faite dans la boucle, avec des combats, de plus haut niveau
function bestFarm(G) {
  const done = TILES.filter(t => t.waves && G.run.completed.has(t.id) && isExplorable(G, t.id));
  return done.sort((a, b) => b.lvl - a.lvl)[0] ?? null;
}
// tile : la case que choisiraient les autres bots
export function averageTile(G, bot, tile) {
  if (!tile || G.run.completed.has(tile.id)) return tile;
  if (bot.rnd() >= FARM_INSTEAD) return tile;
  return bestFarm(G) ?? tile;
}
// monstre principal : une élite ou le boss s'il y en a, sinon le plus fréquent de la case
function mainMonster(tile) {
  const ids = tile.waves.flat();
  const strong = ids.find(id => MONSTERS[id].rank !== 'normal');
  if (strong) return strong;
  const count = id => ids.filter(x => x === id).length;
  return [...new Set(ids)].sort((a, b) => count(b) - count(a))[0];
}
export function averageTool(G, bot, tile) {
  if (!tile.waves) return;
  const id = mainMonster(tile),
    advice = toolAdvice(id, G.meta.bestiary[id]);
  if (advice?.kind === 'named' && bot.rnd() < FOLLOW_ADVICE) setTool(G, advice.tool);
}
// après chaque tick
export function averageWatch(G, bot) {
  const a = G.run.action,
    h = G.run.hero;
  if (bot.retreated || a?.phase !== 'fight' || h.hp >= RETREAT_HP * h.maxHp) return;
  retreat(G);
  bot.retreated = true;
}
// mélange de Fisher-Yates avec le hasard du bot
function shuffle(bot, list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(bot.rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// achats tant qu'il peut payer, chacun tiré au hasard parmi ceux qu'il peut payer ; puis forge dans un ordre au hasard
// (appelé entre deux boucles : la retraite redevient possible)
export function averageVillage(G, bot) {
  bot.retreated = false;
  for (;;) {
    const ks = Object.keys(UPGRADES).filter(k => upgradeState(G, k).ok);
    if (!ks.length) break;
    buy(G, ks[Math.floor(bot.rnd() * ks.length)]);
  }
  for (const id of shuffle(bot, Object.keys(RECIPES))) {
    const r = RECIPES[id];
    if (r.tier > 1 && r.slot !== G.meta.tool) continue;
    forgeItem(G, id, false);
  }
}
