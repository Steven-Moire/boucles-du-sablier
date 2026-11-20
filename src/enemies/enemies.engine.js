// Moteur pur (aucun DOM) : statistiques d'un monstre selon le niveau de la case, carnet du bestiaire.
import {ADVICE, MONSTERS, RANK} from './enemies.data.js';

// fiche du bestiaire ; byTool : victoires (w) et défaites (l) par outil, pour l'outil conseillé
export const newBestiaryEntry = () => ({seen: false, killed: false, kills: 0, byTool: {}});
export function recordFight(b, toolKey, isWin) {
  const t = b.byTool[toolKey] || (b.byTool[toolKey] = {w: 0, l: 0});
  if (isWin) t.w++;
  else t.l++;
}
// l'outil le plus souvent dans la colonne f (w ou l)
function topTool(byTool, f) {
  const ks = Object.keys(byTool).filter(k => byTool[k][f] > 0);
  return ks.sort((a, b) => byTool[b][f] - byTool[a][f])[0] || null;
}
// ce que dit le carnet : rien avant le premier combat conclu ; « named » quand le monstre a été battu avec
// 2 outils différents (le carnet compare) ou au filet de victoires de son rang ; sinon une note (victoire ou défaite)
export function toolAdvice(id, b) {
  const byTool = b?.byTool || {},
    winTools = Object.keys(byTool).filter(k => byTool[k].w > 0);
  const net = RANK[MONSTERS[id].rank].net,
    kills = b?.kills || 0;
  if (winTools.length >= 2 || kills >= net) return {kind: 'named', ...ADVICE[id], byTool};
  if (winTools.length) return {kind: 'win', tool: topTool(byTool, 'w'), left: net - kills, byTool};
  const lost = topTool(byTool, 'l');
  return lost ? {kind: 'loss', tool: lost, byTool} : null;
}

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
