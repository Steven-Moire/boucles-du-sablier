// Moteur pur (aucun DOM) : statistiques du héros, compétences débloquées, outil.
import {BASE_LOOP_TIME} from '../world/world.data.js';
import {DEFAULT_TOOL, HERO_BASE, HERO_PER_LVL, SKILLS, TOOLS} from './hero.data.js';
import {MONSTERS} from '../enemies/enemies.data.js';
import {UPGRADES} from '../village/village.data.js';

export function heroBase(meta) {
  const s = {...HERO_BASE, loopTime: BASE_LOOP_TIME};
  for (const k in UPGRADES) {
    const n = meta.upgrades[k] || 0;
    if (n) UPGRADES[k].apply(s, n);
  }
  for (const id in meta.trophies) MONSTERS[id].trophy.apply(s);
  return s;
}
export function heroAtLevel(base, lvl) {
  return {
    ...base,
    lvl,
    maxHp: Math.round(base.hp + HERO_PER_LVL.hp * (lvl - 1)),
    pow: base.pow + HERO_PER_LVL.pow * (lvl - 1),
    arm: base.arm + HERO_PER_LVL.arm * (lvl - 1),
  };
}
export function skillUnlocked(meta, k) {
  const u = SKILLS[k].unlock;
  return !u || (meta.upgrades[u.upg] || 0) >= u.lvl;
}
// outil du héros pendant l'action en cours (pioche par défaut, ×1 partout : combats identiques à la v0.3)
// hors action : l'outil choisi pour la prochaine case (affichage)
export const actionTool = G => TOOLS[(G.run.action && G.run.action.tool) || G.meta.tool] || TOOLS[DEFAULT_TOOL];
// temps entre deux attaques de base du héros avec son outil
export const heroEvery = G => G.run.hero.speed * actionTool(G).every;
// choix de l'outil pour les prochaines cases (l'action en cours garde le sien)
export function setTool(G, key) {
  if (TOOLS[key]) G.meta.tool = key;
}
