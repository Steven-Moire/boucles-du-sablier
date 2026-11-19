// Moteur pur (aucun DOM) : coups, compétences, morts, butin. rng injectable, émet des G.events.
import {RES} from '../world/world.data.js';
import {SKILLS, xpNeeded} from '../hero/hero.data.js';
import {MONSTERS, RANK} from '../enemies/enemies.data.js';
import {MATS} from '../mining/mining.data.js';
import {actionTool, heroAtLevel, heroEvery, skillUnlocked} from '../hero/hero.engine.js';
import {aimDig, dig, extract} from '../mining/dig.engine.js';
import {addRes, endLoop, log, randInt} from '../world/loop.engine.js';
import {nextSegment} from '../world/explore.engine.js';

export function strike(G, src, att, tgtKey, def, mult, sure) {
  const tool = src === 'hero' ? actionTool(G) : null,
    skill = mult !== 1;
  if (tool) mult *= tool.dmg;
  const hitChance = Math.max(0.1, Math.min(0.98, 0.85 + att.acc - def.dodge));
  if (!sure && G.rng() >= hitChance) {
    G.events.push({type: 'miss', src, tgt: tgtKey});
    return;
  }
  const crit = G.rng() < (tool ? att.crit + tool.crit : att.crit);
  const arm = tool && tool.pierce ? Math.max(0, def.arm - tool.pierce) : def.arm;
  const dmg = Math.max(1, Math.round((att.pow * mult - arm) * (crit ? 1.5 : 1)));
  def.hp -= dmg;
  G.events.push({type: 'hit', src, tgt: tgtKey, dmg, crit, skill});
  if (def.dig) {
    const {idx, broken} = dig(def.dig, dmg, G.mrng);
    if (idx.length) G.events.push({type: 'dig', tgt: tgtKey, idx, broken, id: def.id, w: def.dig.w});
  }
}
// le joueur vise un point (coordonnées dans la grille du sprite) sur l'ennemi i
export function aimAt(G, i, x, y) {
  const a = G.run.action,
    e = a && a.phase === 'fight' && a.enemies && a.enemies[i];
  if (e && e.hp > 0 && e.dig) aimDig(e.dig, {x, y});
}
export const firstAlive = a => a.enemies.findIndex(e => e.hp > 0);
// un pas de combat : attaque de base, compétences automatiques, puis ennemis ; s'arrête dès que le combat finit
export function fightStep(G, dt) {
  if (heroAttacks(G, dt)) return;
  if (autoSkills(G, dt)) return;
  enemiesAttack(G, dt);
}
// attaque de base du héros ; true si la vague est vaincue
function heroAttacks(G, dt) {
  const a = G.run.action,
    h = G.run.hero;
  a.heroT += dt;
  const every = heroEvery(G);
  while (a.heroT >= every) {
    a.heroT -= every;
    const i = firstAlive(a);
    if (i < 0) break;
    strike(G, 'hero', h, 'e' + i, a.enemies[i], 1, false);
    if (resolveDeaths(G)) return true;
  }
  return false;
}
// effet de chaque compétence automatique, une fois son temps de recharge écoulé
const SKILL_EFFECTS = {
  coup(G, h, a) {
    const i = firstAlive(a);
    if (i >= 0) strike(G, 'hero', h, 'e' + i, a.enemies[i], 2.5, true);
  },
  tourbillon(G, h, a) {
    a.enemies.forEach((e, i) => {
      if (e.hp > 0) strike(G, 'hero', h, 'e' + i, e, 1.2, true);
    });
  },
  souffle(G, h) {
    const n = Math.round(h.maxHp * 0.25);
    h.hp = Math.min(h.maxHp, h.hp + n);
    G.events.push({type: 'heal', tgt: 'hero', n});
  },
};
// avance la recharge de la compétence k ; true si elle part maintenant
function skillReady(G, k, dt) {
  const r = G.run,
    h = r.hero;
  if (!skillUnlocked(G.meta, k)) return false;
  r.skillT[k] = Math.min(SKILLS[k].cd, r.skillT[k] + dt);
  if (r.skillT[k] < SKILLS[k].cd) return false;
  return !(k === 'souffle' && h.hp > h.maxHp * 0.5); // souffle attend d'être sous 50 %
}
// compétences automatiques ; true si la vague est vaincue
function autoSkills(G, dt) {
  const r = G.run;
  for (const k in SKILLS) {
    if (!skillReady(G, k, dt)) continue;
    r.skillT[k] = 0;
    G.events.push({type: 'skill', key: k});
    SKILL_EFFECTS[k]?.(G, r.hero, r.action);
    if (resolveDeaths(G)) return true;
  }
  return false;
}
// coups des ennemis encore en vie ; s'arrête à la mort du héros
function enemiesAttack(G, dt) {
  const a = G.run.action;
  for (let i = 0; i < a.enemies.length; i++) {
    if (enemyAttacks(G, a.enemies[i], i, dt)) return;
  }
}
// coups de l'ennemi i pendant dt ; true si le héros meurt (fin de la boucle)
function enemyAttacks(G, e, i, dt) {
  const h = G.run.hero;
  if (e.hp <= 0) return false;
  e.t += dt;
  while (e.t >= e.speed) {
    e.t -= e.speed;
    strike(G, 'e' + i, e, 'hero', h, 1, false);
    if (h.hp <= 0) {
      h.hp = 0;
      endLoop(G, 'death', e.name);
      return true;
    }
  }
  return false;
}
export function resolveDeaths(G) {
  const a = G.run.action;
  a.enemies.forEach((e, i) => {
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      e.hp = 0;
      onKill(G, e, i);
    }
  });
  if (a.enemies.every(e => e.dead)) {
    const h = G.run.hero,
      n = Math.round(h.maxHp * 0.1);
    h.hp = Math.min(h.maxHp, h.hp + n); // souffle entre deux vagues
    a.enemies = null;
    nextSegment(G);
    return true;
  }
  return false;
}
export function onKill(G, e, i) {
  const h = G.run.hero,
    m = MONSTERS[e.id],
    rk = RANK[e.rank];
  G.run.gains.kills++;
  const xp = 4 * e.lvl * rk.xp;
  h.xp += xp;
  let msg = `${e.name} vaincu : +${xp} XP`;
  for (const d of m.drops) {
    if (G.rng() < d.chance) {
      const n = randInt(G, d.min, d.max);
      addRes(G, d.res, n);
      msg += `, +${n} ${RES[d.res].icon}`;
    }
  }
  const got = e.dig ? extract(e.id, e.dig, G.mrng) : {};
  for (const k in got) {
    G.meta.mats[k] = (G.meta.mats[k] || 0) + got[k];
    G.run.gains.mats[k] = (G.run.gains.mats[k] || 0) + got[k];
    msg += `, +${got[k]} ${MATS[k].icon}`;
  }
  log(G, msg, 'g');
  G.events.push({type: 'kill', tgt: 'e' + i, got});
  const b = G.meta.bestiary[e.id];
  b.kills = (b.kills || 0) + 1;
  if (!b.killed) {
    b.killed = true;
    addRes(G, 'renown', rk.renown);
    log(G, `Première victoire contre ${e.name} : +${rk.renown} ⭐`, 'g');
  }
  if (!G.meta.trophies[e.id] && G.rng() < m.trophy.chance) {
    G.meta.trophies[e.id] = true;
    G.run.gains.trophies++;
    log(G, `🏆 Trophée unique : ${m.trophy.name} (${m.trophy.desc}, permanent).`, 'g');
    G.events.push({type: 'trophy', id: e.id});
  }
  while (h.xp >= xpNeeded(h.lvl)) {
    h.xp -= xpNeeded(h.lvl);
    const nh = heroAtLevel(G.run.base, h.lvl + 1),
      gain = nh.maxHp - h.maxHp;
    Object.assign(h, {lvl: nh.lvl, maxHp: nh.maxHp, pow: nh.pow, arm: nh.arm});
    h.hp += gain;
    log(G, `Niveau ${h.lvl} !`, 'p');
    G.events.push({type: 'level', lvl: h.lvl});
  }
  if (e.rank === 'boss' && !G.meta.bossKilled) {
    G.meta.bossKilled = true;
    G.events.push({type: 'boss'});
  }
}
