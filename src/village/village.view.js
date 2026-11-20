// Onglet Village du panneau de droite : renommée, bâtiments, matériaux, héros de la prochaine boucle.
import {RES} from '../world/world.data.js';
import {MATS} from '../mining/mining.data.js';
import {UPGRADES} from './village.data.js';
import {RECIPES, SLOTS} from './forge.data.js';
import {MONSTERS} from '../enemies/enemies.data.js';
import {heroAtLevel, heroBase} from '../hero/hero.engine.js';
import {upgradeState} from './village.engine.js';
import {forgeOpen, recipeState, repeatPlan} from './forge.engine.js';
import {S, loopFresh} from '../shared/state.js';
import {fmt, pct} from '../shared/format.js';

function costHTML(cost) {
  return Object.entries(cost)
    .map(([k, v]) => `<span class="${S.G.meta[k] >= v ? '' : 'no'}">${RES[k].icon} ${fmt(v)}</span>`)
    .join(' &nbsp; ');
}
const CARTOGRAPHER_HTML = `<div class="sec bld lock"><div class="ic">🗺️</div><div><span class="nm">Cartographe</span><div class="ds">Bientôt : programmer sa route à l'avance sur les cases connues (mode idle).</div></div></div>`;
const NO_MATS_HTML =
  '<div class="note" style="margin:0;text-align:left">Creuse les monstres : ce que tu extrais, le village le garde. La forge s\'en sert.</div>';

function nextReqHTML(m) {
  const nextReq = Object.values(UPGRADES)
    .map(u => u.req)
    .filter(q => q > m.renown)
    .sort((a, b) => a - b)[0];
  return nextReq ? `<br>Prochain déblocage à <b>${nextReq} ⭐</b>.` : '';
}
function renownHTML(m) {
  return `<div class="sec"><h3>RENOMMÉE <span>⭐ ${fmt(m.renown)}</span></h3><div class="note" style="text-align:left;margin:0">Le village se souvient de toi : la renommée débloque les bâtiments, l'or et les matériaux servent à les améliorer.${nextReqHTML(m)}</div></div>`;
}
function levelHTML(s) {
  return s.unlocked ? `<span class="lvl">NIV ${s.n}/${s.u.max}</span>` : '';
}
function descText(s) {
  return s.unlocked ? s.u.desc : `Débloqué à ${s.u.req} ⭐ de renommée`;
}
function buildingActionHTML(k, s) {
  if (s.maxed) return '<div class="cost">Niveau maximum</div>';
  if (!s.unlocked) return '';
  return `<div class="cost">${costHTML(s.cost)}</div><button class="btn small gold" data-buy="${k}" ${s.ok ? '' : 'disabled'}>AMÉLIORER</button>`;
}
function buildingHTML(k) {
  const s = upgradeState(S.G, k),
    u = s.u;
  return `<div class="sec bld ${s.unlocked ? '' : 'lock'}"><div class="ic">${u.icon}</div><div>
      <div><span class="nm">${u.name}</span>${levelHTML(s)}</div>
      <div class="ds">${descText(s)}</div>
      ${buildingActionHTML(k, s)}
    </div></div>`;
}
// ---------- forge (2b) : un objet par emplacement, perdu à la fin de la boucle où il sert ----------
function matCostHTML(cost) {
  return Object.entries(cost)
    .map(([k, v]) => `<span class="${(S.G.meta.mats[k] || 0) >= v ? '' : 'no'}">${MATS[k].icon} ${fmt(v)}</span>`)
    .join(' &nbsp; ');
}
// monstres à vaincre pour découvrir une recette (nom caché tant qu'il n'a pas été rencontré)
function unlockText(r) {
  const b = S.G.meta.bestiary;
  return r.unlock
    .filter(id => !b[id]?.killed)
    .map(id => (b[id]?.seen ? MONSTERS[id].name : '???'))
    .join(', ');
}
function recipeActionHTML(id, s) {
  if (s.taken === id) return '<div class="cost">✓ Forgé</div>';
  if (s.taken) return `<div class="cost">Emplacement pris : ${RECIPES[s.taken].name}</div>`;
  return `<div class="cost">${matCostHTML(s.r.cost)}</div><button class="btn small gold" data-forge="${id}" ${s.ok ? '' : 'disabled'}>FORGER</button>`;
}
const slotLabel = r => (r.tier > 1 ? 'PALIER II' : SLOTS[r.slot].name.toUpperCase());
function recipeHTML(id, fresh) {
  const s = recipeState(S.G, id, fresh),
    r = s.r;
  if (!s.unlocked)
    return `<div class="sec bld lock"><div class="ic">❔</div><div><span class="nm">Recette inconnue</span><div class="ds">${SLOTS[r.slot].icon} ${SLOTS[r.slot].name} · bats ${unlockText(r)} pour la découvrir.</div></div></div>`;
  return `<div class="sec bld"><div class="ic">${r.icon}</div><div>
      <div><span class="nm">${r.name}</span><span class="lvl">${SLOTS[r.slot].icon} ${slotLabel(r)}</span></div>
      <div class="ds">${r.desc}</div>${recipeActionHTML(id, s)}</div></div>`;
}
const itemsText = ids => ids.map(id => `${RECIPES[id].icon} ${RECIPES[id].name}`).join(', ') || 'rien';
function repeatHTML(fresh) {
  const p = repeatPlan(S.G, fresh);
  if (!p.ids.length) return '';
  return `<div class="cost" style="margin-top:6px">Refaire : ${itemsText(p.ids)} · ${matCostHTML(p.cost)}</div>
    <button class="btn small" data-reforge ${p.ok ? '' : 'disabled'}>REFAIRE LA MÊME FORGE</button>`;
}
const FORGE_LOCKED_HTML = `<div class="sec bld lock"><div class="ic">🔥</div><div><span class="nm">Forge à recettes</span><div class="ds">Ouvre avec la Forge (${UPGRADES.forge.req} ⭐ de renommée) : forger des paliers d'outils, des armures et des accessoires avec les matériaux extraits.</div></div></div>`;
function forgeNoteHTML(m, fresh) {
  const when = fresh ? "cette boucle (le héros n'est pas encore parti)" : 'la prochaine boucle';
  const worn = fresh ? '' : `<br>Porté pendant cette boucle : ${itemsText(Object.values(m.equip))}.`;
  const next = itemsText(Object.values(fresh ? m.equip : m.forge));
  return `<div class="note" style="text-align:left;margin:0">Ce que tu forges sert pendant <b>${when}</b>, puis s'use : le village ne sait pas encore s'en souvenir. Un objet par emplacement.${worn}<br>Forgé pour ${fresh ? 'elle' : 'la suivante'} : ${next}.</div>`;
}
function forgeHTML(m) {
  if (!forgeOpen(m)) return FORGE_LOCKED_HTML;
  const fresh = loopFresh();
  const recipes = Object.keys(RECIPES)
    .map(id => recipeHTML(id, fresh))
    .join('');
  return `<div class="sec"><h3>FORGE À RECETTES</h3>${forgeNoteHTML(m, fresh)}${repeatHTML(fresh)}</div>${recipes}`;
}
function matHTML(m, k) {
  return `<span title="${MATS[k].name}">${MATS[k].icon} <b>${fmt(m.mats[k])}</b> ${MATS[k].name}</span>`;
}
function matsHTML(m) {
  const mats = Object.keys(MATS).filter(k => m.mats[k]);
  const body = mats.length ? `<div class="mats">${mats.map(k => matHTML(m, k)).join('')}</div>` : NO_MATS_HTML;
  return `<div class="sec"><h3>MATÉRIAUX EXTRAITS</h3>${body}</div>`;
}
function nextHeroHTML(m) {
  const nb = heroBase(m, loopFresh() ? m.equip : m.forge),
    h1 = heroAtLevel(nb, 1);
  return `<div class="sec"><h3>HÉROS DE LA PROCHAINE BOUCLE</h3><div class="stats" style="margin:0">
    <div>PV <b>${h1.maxHp}</b></div><div>Puissance <b>${h1.pow.toFixed(1)}</b></div><div>Armure <b>${h1.arm.toFixed(1)}</b></div>
    <div>Esquive <b>${pct(h1.dodge)}</b></div><div>Critique <b>${pct(h1.crit)}</b></div><div>Temps <b>${nb.loopTime} s</b></div></div>
    <div class="note">${loopFresh() ? "Le héros n'est pas encore parti : les améliorations s'appliquent tout de suite." : 'Les améliorations prennent effet au début de la boucle suivante.'}</div></div>`;
}
export function villageHTML() {
  const m = S.G.meta;
  return (
    renownHTML(m) +
    Object.keys(UPGRADES).map(buildingHTML).join('') +
    forgeHTML(m) +
    matsHTML(m) +
    CARTOGRAPHER_HTML +
    nextHeroHTML(m)
  );
}
