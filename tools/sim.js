// Simulation headless : un bot joue les boucles avec le moteur pur (src/**/*.engine.js), sans DOM
import * as worldData from '../src/world/world.data.js';
import * as heroData from '../src/hero/hero.data.js';
import * as enemiesData from '../src/enemies/enemies.data.js';
import * as miningData from '../src/mining/mining.data.js';
import * as villageData from '../src/village/village.data.js';
import * as loop from '../src/world/loop.engine.js';
import * as exploreEngine from '../src/world/explore.engine.js';
import * as tickEngine from '../src/world/tick.engine.js';
import * as hero from '../src/hero/hero.engine.js';
import * as enemies from '../src/enemies/enemies.engine.js';
import * as strata from '../src/mining/strata.engine.js';
import * as digEngine from '../src/mining/dig.engine.js';
import * as combat from '../src/combat/combat.engine.js';
import * as village from '../src/village/village.engine.js';
import {lcg} from '../src/shared/rng.js';
const E = {
  ...worldData,
  ...heroData,
  ...enemiesData,
  ...miningData,
  ...villageData,
  ...loop,
  ...exploreEngine,
  ...tickEngine,
  ...hero,
  ...enemies,
  ...strata,
  ...digEngine,
  ...combat,
  ...village,
};

function runBot(seed, maxLoops = 60, verbose = false, tool = null) {
  const rng = lcg(seed);
  const mrng = lcg(seed ^ 0x5bd1e995); // minage
  const G = E.createGame(null, rng, mrng);
  if (tool) E.setTool(G, tool); // --outils : le bot garde cet outil toute la partie
  let totalTime = 0,
    bossLoop = null;
  for (let loop = 1; loop <= maxLoops; loop++) {
    // boucle : explorer la case accessible de plus bas niveau (récolte en dernier choix)
    while (!G.run.over) {
      if (!G.run.action) {
        let opts = E.TILES.filter(t => E.isExplorable(G, t.id) && !G.run.completed.has(t.id)).sort(
          (a, b) => (a.type === 'wood' || a.type === 'ore') - (b.type === 'wood' || b.type === 'ore') || a.lvl - b.lvl,
        );
        if (!opts.length) opts = E.TILES.filter(t => E.isExplorable(G, t.id) && t.waves).sort((a, b) => b.lvl - a.lvl); // farm
        if (!opts.length) {
          G.run.over = {reason: 'stuck', gains: G.run.gains};
          break;
        }
        E.explore(G, opts[0].id);
      }
      const before = G.run.timeLeft;
      E.tick(G, 0.5);
      G.events.length = 0;
      totalTime += before - G.run.timeLeft;
    }
    G.events.length = 0;
    const o = G.run.over,
      h = G.run.hero;
    if (G.meta.bossKilled && !bossLoop) bossLoop = loop;
    if (verbose)
      console.log(
        `B${String(loop).padStart(2)} ${o.reason.padEnd(6)} lvl${h.lvl} cases:${G.run.completed.size - 1} maxNiv:${G.run.maxTile} ⭐${G.meta.renown} 🪙${G.meta.gold} 🪵${G.meta.wood} 🪨${G.meta.ore} upg:${JSON.stringify(G.meta.upgrades)} 🏆${Object.keys(G.meta.trophies).length}`,
      );
    if (bossLoop) break;
    // achats : le moins cher d'abord, en boucle
    let bought = true;
    while (bought) {
      bought = false;
      const ks = Object.keys(E.UPGRADES)
        .filter(k => E.upgradeState(G, k).ok)
        .sort((a, b) => E.upgradeState(G, a).cost.gold - E.upgradeState(G, b).cost.gold);
      if (ks.length) {
        E.buy(G, ks[0]);
        bought = true;
      }
    }
    E.newLoop(G);
  }
  return {bossLoop, totalTime: Math.round(totalTime), mats: {...G.meta.mats}};
}
const med = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => s * 7919);
const matsLine = res =>
  Object.keys(E.MATS)
    .map(k => `${E.MATS[k].icon} ${med(res.map(r => r.mats[k] || 0))}`)
    .join('  ');
if (process.argv.includes('--outils')) {
  // node tools/sim.js --outils : la même partie avec chaque outil gardé du début à la fin
  for (const k in E.TOOLS) {
    const res = SEEDS.map(s => runBot(s, 60, false, k));
    console.log(
      `\n${E.TOOLS[k].icon} ${E.TOOLS[k].name} — boss à la boucle : ${res.map(r => r.bossLoop).join(' ')} | min ×1 : ${res.map(r => (r.totalTime / 60).toFixed(0)).join(' ')}`,
    );
    console.log('   matériaux au boss (médiane) :', matsLine(res));
  }
} else {
  runBot(42, 60, true);
  const res = SEEDS.map(s => runBot(s));
  console.log(
    '\nBoss vaincu à la boucle :',
    res.map(r => r.bossLoop).join(' '),
    '| temps de jeu ×1 (min) :',
    res.map(r => (r.totalTime / 60).toFixed(0)).join(' '),
  );
  console.log('Matériaux extraits au boss (médiane) :', matsLine(res));
}
