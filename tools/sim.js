// Simulation headless : un bot joue les boucles avec le moteur extrait de index.html
const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || "index.html", "utf8");
const code = html.split('/*ENGINE_START*/')[1].split('/*ENGINE_END*/')[0];
const E = new Function(code + '; return {createGame, explore, tick, newLoop, buy, upgradeState, isExplorable, TILES, TILE_MAP, UPGRADES};')();

function runBot(seed, maxLoops = 60, verbose = false){
  let s = seed; const rng = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const G = E.createGame(null, rng);
  let totalTime = 0, bossLoop = null;
  for (let loop = 1; loop <= maxLoops; loop++){
    // boucle : explorer la case accessible de plus bas niveau (récolte en dernier choix)
    while (!G.run.over){
      if (!G.run.action){
        let opts = E.TILES.filter(t => E.isExplorable(G, t.id) && !G.run.completed.has(t.id))
          .sort((a, b) => (a.type === 'wood' || a.type === 'ore') - (b.type === 'wood' || b.type === 'ore') || a.lvl - b.lvl);
        if (!opts.length) opts = E.TILES.filter(t => E.isExplorable(G, t.id) && t.waves).sort((a, b) => b.lvl - a.lvl);  // farm
        if (!opts.length){ G.run.over = {reason:'stuck', gains:G.run.gains}; break; }
        E.explore(G, opts[0].id);
      }
      const before = G.run.timeLeft; E.tick(G, 0.5); G.events.length = 0; totalTime += before - G.run.timeLeft;
    }
    G.events.length = 0;
    const o = G.run.over, h = G.run.hero;
    if (G.meta.bossKilled && !bossLoop) bossLoop = loop;
    if (verbose) console.log(`B${String(loop).padStart(2)} ${o.reason.padEnd(6)} lvl${h.lvl} cases:${G.run.completed.size-1} maxNiv:${G.run.maxTile} ⭐${G.meta.renown} 🪙${G.meta.gold} 🪵${G.meta.wood} 🪨${G.meta.ore} upg:${JSON.stringify(G.meta.upgrades)} 🏆${Object.keys(G.meta.trophies).length}`);
    if (bossLoop) break;
    // achats : le moins cher d'abord, en boucle
    let bought = true;
    while (bought){
      bought = false;
      const ks = Object.keys(E.UPGRADES).filter(k => E.upgradeState(G, k).ok).sort((a, b) => E.upgradeState(G, a).cost.gold - E.upgradeState(G, b).cost.gold);
      if (ks.length){ E.buy(G, ks[0]); bought = true; }
    }
    E.newLoop(G);
  }
  return {bossLoop, totalTime: Math.round(totalTime)};
}
runBot(42, 60, true);
const res = [1,2,3,4,5,6,7,8,9,10].map(s => runBot(s * 7919));
console.log('\nBoss vaincu à la boucle :', res.map(r => r.bossLoop).join(' '), '| temps de jeu ×1 (min) :', res.map(r => (r.totalTime/60).toFixed(0)).join(' '));
