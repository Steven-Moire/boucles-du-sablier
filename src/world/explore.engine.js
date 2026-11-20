// Moteur pur (aucun DOM) : explorer une case, segment par segment (marche, vagues, récolte, repos, trésor).
import {RES, TILE_MAP, neighbors} from './world.data.js';
import {addRes, log, randInt} from './loop.engine.js';
import {monsterStats, newBestiaryEntry} from '../enemies/enemies.engine.js';
import {makeDig} from '../mining/dig.engine.js';

export function isExplorable(G, id) {
  const t = TILE_MAP[id],
    r = G.run;
  if (!t || t.type === 'village' || t.type === 'locked' || !G.meta.discovered[id]) return false;
  if (r.completed.has(id)) return true; // ré-exploration (farm, ou repos à la source)
  return neighbors(id).some(n => r.completed.has(n));
}
export function canExplore(G, id) {
  return !G.run.over && !G.run.action && isExplorable(G, id);
}

export function buildSegments(t) {
  if (t.waves) return t.waves.map(w => ({kind: 'fight', mons: w}));
  switch (t.type) {
    case 'wood':
    case 'ore':
      return [0, 1, 2].map(() => ({kind: 'harvest', res: t.type, dur: 3}));
    case 'spring':
      return [{kind: 'rest', dur: 1}];
    case 'chest':
      return [{kind: 'chest', dur: 2}];
  }
  return [];
}
export function explore(G, id) {
  if (!canExplore(G, id)) return false;
  const t = TILE_MAP[id],
    again = G.run.completed.has(id);
  G.run.action = {
    id,
    again,
    segs: buildSegments(t),
    seg: -1,
    phase: 'walk',
    t: 0,
    dur: 0.5,
    enemies: null,
    prevAt: G.run.heroAt,
    tool: G.meta.tool,
  };
  G.run.heroAt = id;
  log(G, again ? `Retour à ${t.name} (farm).` : `En route vers ${t.name}.`);
  G.events.push({type: 'explore', id});
  return true;
}
export function retreat(G) {
  const a = G.run.action;
  if (!a || G.run.over) return;
  if (a.phase === 'rest') {
    finishSegment(G);
    return;
  } // « reprendre la route » : la source compte comme faite
  log(G, `Retraite depuis ${TILE_MAP[a.id].name}.`, 'r');
  G.run.heroAt = G.run.completed.has(a.id) ? a.id : a.prevAt;
  G.run.action = null;
  G.events.push({type: 'retreat'});
}
export function finishSegment(G) {
  const a = G.run.action,
    h = G.run.hero;
  if (a.phase === 'harvest') {
    const res = a.segs[a.seg].res,
      n = randInt(G, 1, 2);
    addRes(G, res, n);
    log(G, `+${n} ${RES[res].icon} ${RES[res].name.toLowerCase()}`, 'g');
  } else if (a.phase === 'rest') {
    log(G, `Le héros a récupéré : ${Math.round(h.hp)} / ${h.maxHp} PV.`, 'v');
  } else if (a.phase === 'chest') {
    if (!G.meta.chests[a.id]) {
      G.meta.chests[a.id] = true;
      addRes(G, 'gold', 30);
      addRes(G, 'renown', 5);
      log(G, `Trésor ! +30 🪙 et +5 ⭐ (ne se trouve qu'une fois).`, 'g');
    } else {
      addRes(G, 'gold', 3);
      log(G, `L'autel est vide… +3 🪙`, 'g');
    }
  }
  nextSegment(G);
}
export function nextSegment(G) {
  const a = G.run.action,
    t = TILE_MAP[a.id];
  a.seg++;
  if (a.seg >= a.segs.length) {
    completeTile(G);
    return;
  }
  const s = a.segs[a.seg];
  if (s.kind === 'fight') {
    a.enemies = s.mons.map(id => {
      const e = monsterStats(id, t.lvl);
      e.hp = e.maxHp;
      e.t = -G.rng() * 0.4;
      e.dig = makeDig(e, G.mrng, a.tool);
      return e;
    });
    a.heroT = 0;
    a.phase = 'fight';
    for (const e of a.enemies) {
      const b = G.meta.bestiary[e.id] || (G.meta.bestiary[e.id] = newBestiaryEntry());
      if (!b.seen) {
        b.seen = true;
        G.run.gains.monsters++;
        log(G, `Nouvelle fiche au bestiaire : ${e.name}.`, 'p');
      }
    }
    log(G, `Vague ${a.seg + 1} : ${a.enemies.map(e => e.name).join(', ')}.`, 'r');
  } else {
    a.phase = s.kind;
    a.t = 0;
    a.dur = s.dur;
    a.enemies = null;
    if (s.kind === 'rest') log(G, 'Le héros se repose à la source…', 'v');
  }
}
export function completeTile(G) {
  const a = G.run.action,
    id = a.id,
    t = TILE_MAP[id];
  G.run.completed.add(id);
  G.run.action = null;
  G.run.maxTile = Math.max(G.run.maxTile, t.lvl);
  if (!G.meta.everCompleted[id]) {
    G.meta.everCompleted[id] = true;
    addRes(G, 'renown', 3 * t.lvl);
    log(G, `${t.name} explorée pour la première fois : +${3 * t.lvl} ⭐`, 'g');
  } else log(G, `${t.name} explorée.`, 'v');
  neighbors(id).forEach(n => {
    if (!G.meta.discovered[n]) {
      G.meta.discovered[n] = true;
      G.run.gains.tiles++;
    }
  });
  G.events.push({type: 'tileDone', id});
}
// avancement du segment en cours (0 à 1) : PV ôtés aux ennemis, ou temps écoulé
export function segFill(a) {
  if (a.phase === 'fight' && a.enemies) {
    const tot = a.enemies.reduce((s, e) => s + e.maxHp, 0),
      left = a.enemies.reduce((s, e) => s + Math.max(0, e.hp), 0);
    return 1 - left / tot;
  }
  return a.dur ? Math.min(1, a.t / a.dur) : 0;
}
