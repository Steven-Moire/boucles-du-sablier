// Moteur pur (aucun DOM) : statistiques d'un monstre selon le niveau de la case.
import {MONSTERS} from './enemies.data.js';

export function monsterStats(id, L) {
  const m = MONSTERS[id];
  return {
    id,
    name: m.name,
    por: m.por,
    rank: m.rank,
    lvl: L,
    maxHp: Math.round((12 + 8 * (L - 1)) * m.hp),
    pow: (3 + 1.6 * (L - 1)) * m.pow,
    arm: Math.floor((L - 1) / 2) + m.arm,
    dodge: 0.02 + 0.01 * L + m.dodge,
    crit: m.rank === 'boss' ? 0.1 : 0.05,
    acc: 0,
    speed: m.speed,
  };
}
