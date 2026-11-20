// Moteur pur (aucun DOM) : statistiques du héros, compétences débloquées, outil.
import {BASE_LOOP_TIME} from '../world/world.data.js';
import {DEFAULT_TOOL, HERO_BASE, HERO_PER_LVL, SKILLS, TOOLS} from './hero.data.js';
import {MONSTERS} from '../enemies/enemies.data.js';
import {UPGRADES} from '../village/village.data.js';
import {equipBonus, toolBonus} from '../village/forge.engine.js';

// equip : armure et accessoire portés (ceux de la boucle en cours par défaut ; le village montre ceux de la suivante)
export function heroBase(meta, equip = meta.equip) {
  const s = {...HERO_BASE, loopTime: BASE_LOOP_TIME};
  for (const k in UPGRADES) {
    const n = meta.upgrades[k] || 0;
    if (n) UPGRADES[k].apply(s, n);
  }
  for (const id in meta.trophies) MONSTERS[id].trophy.apply(s);
  const eq = equipBonus(equip || {});
  for (const k in eq) s[k] += eq[k];
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
// avec le bonus de son palier forgé (pow ajouté à la puissance, crit et pierce ajoutés à ceux de l'outil)
function toolKey(G) {
  const k = G.run.action?.tool || G.meta.tool;
  return TOOLS[k] ? k : DEFAULT_TOOL;
}
export function actionTool(G) {
  const key = toolKey(G),
    t = TOOLS[key],
    b = toolBonus(G.meta.equip, key);
  return {...t, key, tier: b.tier, pow: b.pow, crit: t.crit + b.crit, pierce: t.pierce + b.pierce};
}
// temps entre deux attaques de base du héros avec son outil
export const heroEvery = G => G.run.hero.speed * actionTool(G).every;
// choix de l'outil pour les prochaines cases (l'action en cours garde le sien)
export function setTool(G, key) {
  if (TOOLS[key]) G.meta.tool = key;
}
