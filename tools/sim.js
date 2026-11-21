// Simulation headless : un bot joue les boucles avec le moteur pur (src/**/*.engine.js), sans DOM
import * as worldData from '../src/world/world.data.js';
import * as heroData from '../src/hero/hero.data.js';
import * as enemiesData from '../src/enemies/enemies.data.js';
import * as miningData from '../src/mining/mining.data.js';
import * as villageData from '../src/village/village.data.js';
import * as forgeData from '../src/village/forge.data.js';
import * as loop from '../src/world/loop.engine.js';
import * as exploreEngine from '../src/world/explore.engine.js';
import * as tickEngine from '../src/world/tick.engine.js';
import * as hero from '../src/hero/hero.engine.js';
import * as enemies from '../src/enemies/enemies.engine.js';
import * as strata from '../src/mining/strata.engine.js';
import * as digEngine from '../src/mining/dig.engine.js';
import * as combat from '../src/combat/combat.engine.js';
import * as village from '../src/village/village.engine.js';
import * as forge from '../src/village/forge.engine.js';
import {lcg} from '../src/shared/rng.js';
import {averageTile, averageTool, averageVillage, averageWatch, makeAverageBot} from './sim-moyen.js';
const E = {
  ...worldData,
  ...heroData,
  ...enemiesData,
  ...miningData,
  ...villageData,
  ...forgeData,
  ...loop,
  ...exploreEngine,
  ...tickEngine,
  ...hero,
  ...enemies,
  ...strata,
  ...digEngine,
  ...combat,
  ...village,
  ...forge,
};

const isHarvest = t => t.type === 'wood' || t.type === 'ore';
// case à explorer : la case accessible non faite de plus bas niveau (récolte en dernier choix), sinon farmer la plus haute
function pickTile(G) {
  const fresh = E.TILES.filter(t => E.isExplorable(G, t.id) && !G.run.completed.has(t.id)).sort(
    (a, b) => isHarvest(a) - isHarvest(b) || a.lvl - b.lvl,
  );
  if (fresh.length) return fresh[0];
  const farm = E.TILES.filter(t => E.isExplorable(G, t.id) && t.waves).sort((a, b) => b.lvl - a.lvl);
  return farm[0] ?? null;
}
// bot malin (--malin) : l'outil selon la case — marteau sur les élites, le boss et les golems,
// coutelas pour farmer une case déjà faite dans la boucle, pioche sinon
const tileMonsters = tile => tile.waves.flat().map(id => E.MONSTERS[id]);
function smartTool(G, tile) {
  if (!tile.waves) return E.DEFAULT_TOOL;
  const hard = tileMonsters(tile).some(m => m.rank !== 'normal') || tile.waves.flat().includes('golem');
  if (hard) return 'marteau';
  return G.run.completed.has(tile.id) ? 'coutelas' : 'pioche';
}
// choix de la case et de l'outil quand le héros n'a rien à faire ; renvoie false si aucune case n'est possible
function startAction(G, smart, avg) {
  let tile = pickTile(G);
  if (avg) tile = averageTile(G, avg, tile);
  if (!tile) return false;
  if (smart) E.setTool(G, smartTool(G, tile));
  if (avg) averageTool(G, avg, tile);
  E.explore(G, tile.id);
  return true;
}
// joue une boucle jusqu'à sa fin ; renvoie le temps de jeu total (ajouté tick par tick, comme avant)
// avg : le bot moyen (--moyen, tools/sim-moyen.js), null pour les autres
function playLoop(G, totalTime, smart = false, avg = null) {
  let time = totalTime;
  while (!G.run.over) {
    if (!G.run.action && !startAction(G, smart, avg)) {
      G.run.over = {reason: 'stuck', gains: G.run.gains};
      break;
    }
    const before = G.run.timeLeft;
    E.tick(G, 0.5);
    G.events.length = 0;
    if (avg) averageWatch(G, avg);
    time += before - G.run.timeLeft;
  }
  G.events.length = 0;
  return time;
}
function logLoop(G, loop) {
  const o = G.run.over,
    h = G.run.hero;
  console.log(
    `B${String(loop).padStart(2)} ${o.reason.padEnd(6)} lvl${h.lvl} cases:${G.run.completed.size - 1} maxNiv:${G.run.maxTile} ⭐${G.meta.renown} 🪙${G.meta.gold} 🪵${G.meta.wood} 🪨${G.meta.ore} upg:${JSON.stringify(G.meta.upgrades)} 🏆${Object.keys(G.meta.trophies).length} équipé:${Object.values(G.meta.equip).join(',') || '-'}`,
  );
}
// achats : le moins cher d'abord, en boucle
function buyAll(G) {
  for (;;) {
    const ks = Object.keys(E.UPGRADES)
      .filter(k => E.upgradeState(G, k).ok)
      .sort((a, b) => E.upgradeState(G, a).cost.gold - E.upgradeState(G, b).cost.gold);
    if (!ks.length) return;
    E.buy(G, ks[0]);
  }
}
// forge (2b) : avant chaque boucle, le bot forge dans cet ordre ce qu'il peut payer (une recette par emplacement) ;
// le bot par défaut ne forge que le palier de son outil (il n'en change jamais), le malin les trois paliers
const FORGE_ORDER = ['plastron', 'manteau', 'tablier', 'pioche2', 'marteau2', 'coutelas2', 'collier', 'lanterne'];
function forgeAll(G, smart) {
  for (const id of FORGE_ORDER) {
    const r = E.RECIPES[id];
    if (!smart && r.tier > 1 && r.slot !== G.meta.tool) continue;
    E.forgeItem(G, id, false);
  }
}
// entre deux boucles : achats et forge, au hasard pour le bot moyen
function betweenLoops(G, smart, avg) {
  if (avg) {
    averageVillage(G, avg);
    return;
  }
  buyAll(G);
  forgeAll(G, smart);
}
// deaths / late : boucles finies par la mort et boucles jouées, à partir de la 3e
function runBot(seed, maxLoops = 60, verbose = false, tool = null, smart = false, average = false) {
  const rng = lcg(seed);
  const mrng = lcg(seed ^ 0x5bd1e995); // minage
  const G = E.createGame(null, rng, mrng);
  if (tool) E.setTool(G, tool); // --outils : le bot garde cet outil toute la partie
  const avg = average ? makeAverageBot(seed) : null;
  let totalTime = 0,
    bossLoop = null,
    deaths = 0,
    late = 0;
  for (let loop = 1; loop <= maxLoops; loop++) {
    totalTime = playLoop(G, totalTime, smart, avg);
    late += loop >= 3 ? 1 : 0;
    deaths += loop >= 3 && G.run.over.reason === 'death' ? 1 : 0;
    if (G.meta.bossKilled) bossLoop = loop;
    if (verbose) logLoop(G, loop);
    if (bossLoop) break;
    betweenLoops(G, smart, avg);
    E.newLoop(G);
  }
  return {bossLoop, totalTime: Math.round(totalTime), mats: {...G.meta.mats}, deaths, late};
}
const med = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
// --graines N : N parties au lieu de 10 (les 10 premières restent les mêmes, sortie par défaut inchangée)
const argAfter = flag => process.argv[process.argv.indexOf(flag) + 1];
const N_SEEDS = process.argv.includes('--graines') ? Math.max(1, Number.parseInt(argAfter('--graines'), 10) || 10) : 10;
const SEEDS = Array.from({length: N_SEEDS}, (_, i) => (i + 1) * 7919);
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
  // node tools/sim.js --malin : le bot choisit l'outil selon la case (sortie par défaut : pioche partout)
  // node tools/sim.js --moyen : un humain attentif mais imparfait (tools/sim-moyen.js)
  const smart = process.argv.includes('--malin'),
    average = !smart && process.argv.includes('--moyen');
  if (smart) console.log('Bot malin : marteau sur élites, boss et golems, coutelas en farm, pioche sinon.');
  if (average)
    console.log('Bot moyen : carnet suivi une fois sur deux, farm une fois sur quatre, retraite sous 30 % PV.');
  runBot(42, 60, true, null, smart, average);
  const res = SEEDS.map(s => runBot(s, 60, false, null, smart, average));
  console.log(
    '\nBoss vaincu à la boucle :',
    res.map(r => r.bossLoop).join(' '),
    '| temps de jeu ×1 (min) :',
    res.map(r => (r.totalTime / 60).toFixed(0)).join(' '),
  );
  console.log('Matériaux extraits au boss (médiane) :', matsLine(res));
  if (average) {
    const sum = f => res.reduce((n, r) => n + r[f], 0);
    console.log(`Boucles finies par la mort (3e et +) : ${((100 * sum('deaths')) / sum('late')).toFixed(1)} %`);
  }
}
