// Moteur pur : aucun accès au DOM. rng injectable, émet des G.events que l'UI consomme.
import {BASE_LOOP_TIME, HERO_BASE, HERO_PER_LVL, MONSTERS, RANK, RES, REST_RATE, SKILLS, TILE_MAP, UPGRADES, VILLAGE, neighbors, xpNeeded} from './data.js';

export function monsterStats(id, L){
  const m = MONSTERS[id];
  return {id, name:m.name, por:m.por, rank:m.rank, lvl:L,
    maxHp:Math.round((12 + 8*(L-1)) * m.hp), pow:(3 + 1.6*(L-1)) * m.pow,
    arm:Math.floor((L-1)/2) + m.arm, dodge:.02 + .01*L + m.dodge,
    crit:m.rank === 'boss' ? .1 : .05, acc:0, speed:m.speed};
}

// ======================= MOTEUR =======================
export function newMeta(){
  const m = {v:1, loop:1, renown:0, gold:0, wood:0, ore:0, upgrades:{}, discovered:{}, everCompleted:{}, bestiary:{}, chests:{}, trophies:{}, bossKilled:false};
  m.discovered[VILLAGE] = true; neighbors(VILLAGE).forEach(n => m.discovered[n] = true);
  return m;
}
export function heroBase(meta){
  const s = {...HERO_BASE, loopTime:BASE_LOOP_TIME};
  for (const k in UPGRADES){ const n = meta.upgrades[k] || 0; if (n) UPGRADES[k].apply(s, n); }
  for (const id in meta.trophies) MONSTERS[id].trophy.apply(s);
  return s;
}
export function heroAtLevel(base, lvl){
  return {...base, lvl, maxHp:Math.round(base.hp + HERO_PER_LVL.hp*(lvl-1)),
    pow:base.pow + HERO_PER_LVL.pow*(lvl-1), arm:base.arm + HERO_PER_LVL.arm*(lvl-1)};
}
export function skillUnlocked(meta, k){ const u = SKILLS[k].unlock; return !u || (meta.upgrades[u.upg] || 0) >= u.lvl; }
export function createGame(meta, rng){
  meta = meta || newMeta(); meta.trophies = meta.trophies || {};
  const G = {meta, rng: rng || Math.random, run:null, events:[]};
  startLoop(G);
  return G;
}
export function startLoop(G){
  const base = heroBase(G.meta);
  const hero = heroAtLevel(base, 1); hero.hp = hero.maxHp; hero.xp = 0;
  const skillT = {}; for (const k in SKILLS) skillT[k] = 0;
  G.run = {hero, base, skillT, timeMax:base.loopTime, timeLeft:base.loopTime, completed:new Set([VILLAGE]), heroAt:VILLAGE,
    action:null, over:null, log:[], gains:{renown:0, gold:0, wood:0, ore:0, tiles:0, monsters:0, kills:0, trophies:0}, maxTile:0};
  log(G, `Boucle ${G.meta.loop} : le héros se réveille au village.`, 'b');
}
export function log(G, text, cls){ G.run.log.unshift({text, cls}); if (G.run.log.length > 50) G.run.log.pop(); }
export function addRes(G, res, n){
  if (!n) return;
  const before = G.meta[res];
  G.meta[res] += n; G.run.gains[res] += n;
  if (res === 'renown') for (const k in UPGRADES){ const q = UPGRADES[k].req; if (before < q && G.meta.renown >= q) G.events.push({type:'unlock', key:k}); }
}
export const randInt = (G, a, b) => a + Math.floor(G.rng() * (b - a + 1));

export function isExplorable(G, id){
  const t = TILE_MAP[id], r = G.run;
  if (!t || t.type === 'village' || t.type === 'locked' || !G.meta.discovered[id]) return false;
  if (r.completed.has(id)) return true;                          // ré-exploration (farm, ou repos à la source)
  return neighbors(id).some(n => r.completed.has(n));
}
export function canExplore(G, id){ return !G.run.over && !G.run.action && isExplorable(G, id); }

export function buildSegments(t){
  if (t.waves) return t.waves.map(w => ({kind:'fight', mons:w}));
  switch (t.type){
    case 'wood': case 'ore': return [0,1,2].map(() => ({kind:'harvest', res:t.type, dur:3}));
    case 'spring': return [{kind:'rest', dur:1}];
    case 'chest': return [{kind:'chest', dur:2}];
  }
  return [];
}
export function explore(G, id){
  if (!canExplore(G, id)) return false;
  const t = TILE_MAP[id], again = G.run.completed.has(id);
  G.run.action = {id, again, segs:buildSegments(t), seg:-1, phase:'walk', t:0, dur:.5, enemies:null, prevAt:G.run.heroAt};
  G.run.heroAt = id;
  log(G, again ? `Retour à ${t.name} (farm).` : `En route vers ${t.name}.`);
  G.events.push({type:'explore', id});
  return true;
}
export function retreat(G){
  const a = G.run.action; if (!a || G.run.over) return;
  if (a.phase === 'rest'){ finishSegment(G); return; }           // « reprendre la route » : la source compte comme faite
  log(G, `Retraite depuis ${TILE_MAP[a.id].name}.`, 'r');
  G.run.heroAt = G.run.completed.has(a.id) ? a.id : a.prevAt;
  G.run.action = null; G.events.push({type:'retreat'});
}
export function tick(G, dt){ while (dt > 1e-9){ const s = Math.min(dt, .05); step(G, s); dt -= s; } }
export function step(G, dt){
  const r = G.run; if (!r || r.over || !r.action) return;
  r.timeLeft -= dt;
  if (r.timeLeft <= 0){ r.timeLeft = 0; endLoop(G, 'time'); return; }
  const a = r.action;
  if (a.phase === 'fight'){ fightStep(G, dt); return; }
  if (a.phase === 'rest'){                                       // +10 % PV max / s jusqu'à être plein
    const h = r.hero; h.hp = Math.min(h.maxHp, h.hp + REST_RATE * h.maxHp * dt); a.t += dt;
    if (h.hp >= h.maxHp && a.t >= .5) finishSegment(G);
    return;
  }
  a.t += dt;
  if (a.t >= a.dur) finishSegment(G);
}
export function finishSegment(G){
  const a = G.run.action, h = G.run.hero;
  if (a.phase === 'harvest'){
    const res = a.segs[a.seg].res, n = randInt(G, 1, 2); addRes(G, res, n);
    log(G, `+${n} ${RES[res].icon} ${RES[res].name.toLowerCase()}`, 'g');
  } else if (a.phase === 'rest'){
    log(G, `Le héros a récupéré : ${Math.round(h.hp)} / ${h.maxHp} PV.`, 'v');
  } else if (a.phase === 'chest'){
    if (!G.meta.chests[a.id]){
      G.meta.chests[a.id] = true; addRes(G, 'gold', 30); addRes(G, 'renown', 5);
      log(G, `Trésor ! +30 🪙 et +5 ⭐ (ne se trouve qu'une fois).`, 'g');
    } else { addRes(G, 'gold', 3); log(G, `L'autel est vide… +3 🪙`, 'g'); }
  }
  nextSegment(G);
}
export function nextSegment(G){
  const a = G.run.action, t = TILE_MAP[a.id];
  a.seg++;
  if (a.seg >= a.segs.length){ completeTile(G); return; }
  const s = a.segs[a.seg];
  if (s.kind === 'fight'){
    a.enemies = s.mons.map(id => { const e = monsterStats(id, t.lvl); e.hp = e.maxHp; e.t = -G.rng() * .4; return e; });
    a.heroT = 0; a.phase = 'fight';
    for (const e of a.enemies){
      const b = G.meta.bestiary[e.id] || (G.meta.bestiary[e.id] = {seen:false, killed:false});
      if (!b.seen){ b.seen = true; G.run.gains.monsters++; log(G, `Nouvelle fiche au bestiaire : ${e.name}.`, 'p'); }
    }
    log(G, `Vague ${a.seg + 1} : ${a.enemies.map(e => e.name).join(', ')}.`, 'r');
  } else {
    a.phase = s.kind; a.t = 0; a.dur = s.dur; a.enemies = null;
    if (s.kind === 'rest') log(G, 'Le héros se repose à la source…', 'v');
  }
}
export function strike(G, src, att, tgtKey, def, mult, sure){
  const hitChance = Math.max(.1, Math.min(.98, .85 + att.acc - def.dodge));
  if (!sure && G.rng() >= hitChance){ G.events.push({type:'miss', src, tgt:tgtKey}); return; }
  const crit = G.rng() < att.crit;
  const dmg = Math.max(1, Math.round((att.pow * mult - def.arm) * (crit ? 1.5 : 1)));
  def.hp -= dmg; G.events.push({type:'hit', src, tgt:tgtKey, dmg, crit, skill:mult !== 1});
}
export const firstAlive = a => a.enemies.findIndex(e => e.hp > 0);
export function fightStep(G, dt){
  const r = G.run, a = r.action, h = r.hero;
  // attaque de base
  a.heroT += dt;
  while (a.heroT >= h.speed){
    a.heroT -= h.speed; const i = firstAlive(a); if (i < 0) break;
    strike(G, 'hero', h, 'e' + i, a.enemies[i], 1, false);
    if (resolveDeaths(G)) return;
  }
  // compétences automatiques
  for (const k in SKILLS){
    if (!skillUnlocked(G.meta, k)) continue;
    r.skillT[k] = Math.min(SKILLS[k].cd, r.skillT[k] + dt);
    if (r.skillT[k] < SKILLS[k].cd) continue;
    if (k === 'souffle' && h.hp > h.maxHp * .5) continue;     // attend d'être sous 50 %
    r.skillT[k] = 0; G.events.push({type:'skill', key:k});
    if (k === 'coup'){ const i = firstAlive(a); if (i >= 0) strike(G, 'hero', h, 'e' + i, a.enemies[i], 2.5, true); }
    else if (k === 'tourbillon') a.enemies.forEach((e, i) => { if (e.hp > 0) strike(G, 'hero', h, 'e' + i, e, 1.2, true); });
    else if (k === 'souffle'){ const n = Math.round(h.maxHp * .25); h.hp = Math.min(h.maxHp, h.hp + n); G.events.push({type:'heal', tgt:'hero', n}); }
    if (resolveDeaths(G)) return;
  }
  // ennemis
  for (let i = 0; i < a.enemies.length; i++){
    const e = a.enemies[i]; if (e.hp <= 0) continue;
    e.t += dt;
    while (e.t >= e.speed){
      e.t -= e.speed; strike(G, 'e' + i, e, 'hero', h, 1, false);
      if (h.hp <= 0){ h.hp = 0; endLoop(G, 'death', e.name); return; }
    }
  }
}
export function resolveDeaths(G){
  const a = G.run.action;
  a.enemies.forEach((e, i) => { if (e.hp <= 0 && !e.dead){ e.dead = true; e.hp = 0; onKill(G, e, i); } });
  if (a.enemies.every(e => e.dead)){
    const h = G.run.hero, n = Math.round(h.maxHp * .1);
    h.hp = Math.min(h.maxHp, h.hp + n);                       // souffle entre deux vagues
    a.enemies = null; nextSegment(G); return true;
  }
  return false;
}
export function onKill(G, e, i){
  const h = G.run.hero, m = MONSTERS[e.id], rk = RANK[e.rank];
  G.run.gains.kills++;
  const xp = 4 * e.lvl * rk.xp; h.xp += xp;
  let msg = `${e.name} vaincu : +${xp} XP`;
  for (const d of m.drops){ if (G.rng() < d.chance){ const n = randInt(G, d.min, d.max); addRes(G, d.res, n); msg += `, +${n} ${RES[d.res].icon}`; } }
  log(G, msg, 'g');
  G.events.push({type:'kill', tgt:'e' + i});
  const b = G.meta.bestiary[e.id];
  if (!b.killed){ b.killed = true; addRes(G, 'renown', rk.renown); log(G, `Première victoire contre ${e.name} : +${rk.renown} ⭐`, 'g'); }
  if (!G.meta.trophies[e.id] && G.rng() < m.trophy.chance){
    G.meta.trophies[e.id] = true; G.run.gains.trophies++;
    log(G, `🏆 Trophée unique : ${m.trophy.name} (${m.trophy.desc}, permanent).`, 'g');
    G.events.push({type:'trophy', id:e.id});
  }
  while (h.xp >= xpNeeded(h.lvl)){
    h.xp -= xpNeeded(h.lvl);
    const nh = heroAtLevel(G.run.base, h.lvl + 1), gain = nh.maxHp - h.maxHp;
    Object.assign(h, {lvl:nh.lvl, maxHp:nh.maxHp, pow:nh.pow, arm:nh.arm}); h.hp += gain;
    log(G, `Niveau ${h.lvl} !`, 'p'); G.events.push({type:'level', lvl:h.lvl});
  }
  if (e.rank === 'boss' && !G.meta.bossKilled){ G.meta.bossKilled = true; G.events.push({type:'boss'}); }
}
export function completeTile(G){
  const a = G.run.action, id = a.id, t = TILE_MAP[id];
  G.run.completed.add(id); G.run.action = null; G.run.maxTile = Math.max(G.run.maxTile, t.lvl);
  if (!G.meta.everCompleted[id]){
    G.meta.everCompleted[id] = true; addRes(G, 'renown', 3 * t.lvl);
    log(G, `${t.name} explorée pour la première fois : +${3*t.lvl} ⭐`, 'g');
  } else log(G, `${t.name} explorée.`, 'v');
  neighbors(id).forEach(n => { if (!G.meta.discovered[n]){ G.meta.discovered[n] = true; G.run.gains.tiles++; } });
  G.events.push({type:'tileDone', id});
}
export function endLoop(G, reason, enemyName){
  const r = G.run; if (r.over) return;
  r.over = {reason, enemyName, loop:G.meta.loop, lvl:r.hero.lvl, gains:{...r.gains}, tilesDone:r.completed.size - 1};
  r.action = null;
  G.events.push({type:'loopEnd'});
}
export function newLoop(G){ G.meta.loop++; startLoop(G); }
export function abandon(G){ if (!G.run.over) endLoop(G, 'return'); }
export function canAfford(meta, cost){ return Object.keys(cost).every(k => meta[k] >= cost[k]); }
export function upgradeState(G, key){
  const u = UPGRADES[key], n = G.meta.upgrades[key] || 0, cost = u.cost(n);
  return {u, n, cost, unlocked:G.meta.renown >= u.req, maxed:n >= u.max,
    ok:G.meta.renown >= u.req && n < u.max && canAfford(G.meta, cost)};
}
export function buy(G, key){
  const s = upgradeState(G, key); if (!s.ok) return false;
  for (const k in s.cost) G.meta[k] -= s.cost[k];
  G.meta.upgrades[key] = s.n + 1;
  return true;
}
