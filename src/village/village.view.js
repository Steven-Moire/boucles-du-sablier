// Le village, lieu de l'onglet du lieu (R3a) : scène à cinq zones (sur téléphone, liste de boutons-vignettes),
// la fiche de la zone cliquée dessous. Aucune règle propre : bâtiments, forge et fin de boucle d'avant, rangés par zone.
import {RES} from '../world/world.data.js';
import {MATS} from '../mining/mining.data.js';
import {UPGRADES} from './village.data.js';
import {RECIPES, SLOTS} from './forge.data.js';
import {MONSTERS} from '../enemies/enemies.data.js';
import {heroAtLevel, heroBase} from '../hero/hero.engine.js';
import {upgradeState} from './village.engine.js';
import {forgeOpen, recipeState, repeatPlan} from './forge.engine.js';
import {S, UPGRADE_ZONE, atVillage, loopFresh} from '../shared/state.js';
import {fmt, pct} from '../shared/format.js';

// zones de la scène, dans l'ordre de la liste sur téléphone ; x, y : position sur la scène (en %)
const ZONES = [
  {id: 'jalon', icon: '🧭', name: 'Hyacinthe Jalon', role: 'Cartographe', x: 14, y: 70},
  {id: 'mailloche', icon: '⚒️', name: 'Honorine Mailloche', role: 'Forgeronne · le coffre', x: 47, y: 64},
  {id: 'basane', icon: '🧵', name: 'Philémon Basane', role: 'Tanneur', x: 82, y: 72},
  {id: 'entrainement', icon: '🥋', name: "Salle d'entraînement", role: 'Entraîneur', x: 70, y: 26},
  {id: 'horloge', icon: '🕰️', name: "L'horloge", role: 'Clocher · le sablier', x: 24, y: 22},
];
const ZONE_UPGRADE = Object.fromEntries(Object.entries(UPGRADE_ZONE).map(([k, z]) => [z, k]));
const zoneBadge = id => ZONE_UPGRADE[id] && upgradeState(S.G, ZONE_UPGRADE[id]).ok;
const tale = text => `<div class="note vil-tale">${text}</div>`;

function costHTML(cost) {
  return Object.entries(cost)
    .map(([k, v]) => `<span class="${S.G.meta[k] >= v ? '' : 'no'}">${RES[k].icon} ${fmt(v)}</span>`)
    .join(' &nbsp; ');
}
function nextReqHTML(m) {
  const nextReq = Object.values(UPGRADES)
    .map(u => u.req)
    .filter(q => q > m.renown)
    .sort((a, b) => a - b)[0];
  return nextReq ? ` · prochain déblocage à <b>${nextReq} ⭐</b>` : '';
}
function renownHTML(m) {
  return `<div class="sec vil-renown"><b>⭐ ${fmt(m.renown)}</b> de renommée${nextReqHTML(m)}<div class="note">Le village se souvient de toi : la renommée débloque les bâtiments, l'or et les matériaux servent à les améliorer.</div></div>`;
}
const FAR_HTML = `<div class="sec vil-far"><div>Le héros est en route : tu regardes le village de loin. Ce que tu achètes ou forges sert à la boucle suivante.</div><button class="btn small" data-act="back">⚔️ RETOUR AU COMBAT</button></div>`;

// ---------- bâtiments ----------
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
// ---------- le coffre de Mailloche : bois, minerai et matériaux extraits gardés d'une boucle à l'autre ----------
function chestLine(icon, n, name) {
  return `<span title="${name}">${icon} <b>${fmt(n)}</b> ${name}</span>`;
}
function chestHTML(m) {
  const lines = [chestLine(RES.wood.icon, m.wood, RES.wood.name), chestLine(RES.ore.icon, m.ore, RES.ore.name)];
  for (const k of Object.keys(MATS)) if (m.mats[k]) lines.push(chestLine(MATS[k].icon, m.mats[k], MATS[k].name));
  return `<div class="sec"><h3>LE COFFRE</h3><div class="mats">${lines.join('')}</div><div class="note" style="text-align:left">Ce que tu récoltes et ce que tu extrais des monstres, le village le garde. La forge s'en sert.</div></div>`;
}
function nextHeroHTML(m) {
  const nb = heroBase(m, loopFresh() ? m.equip : m.forge),
    h1 = heroAtLevel(nb, 1);
  return `<div class="sec"><h3>HÉROS DE LA PROCHAINE BOUCLE</h3><div class="stats" style="margin:0">
    <div>PV <b>${h1.maxHp}</b></div><div>Puissance <b>${h1.pow.toFixed(1)}</b></div><div>Armure <b>${h1.arm.toFixed(1)}</b></div>
    <div>Esquive <b>${pct(h1.dodge)}</b></div><div>Critique <b>${pct(h1.crit)}</b></div><div>Temps <b>${nb.loopTime} s</b></div></div>
    <div class="note">${loopFresh() ? "Le héros n'est pas encore parti : les améliorations s'appliquent tout de suite." : 'Les améliorations prennent effet au début de la boucle suivante.'}</div></div>`;
}

// ---------- fiches des cinq zones ----------
const CARTOGRAPHER_NOTE = "Bientôt : programmer sa route à l'avance sur les cases connues (mode idle).";
function jalonHTML() {
  const go = atVillage()
    ? '<button class="btn gold" data-act="go">PARTIR</button>'
    : '<div class="note">Le héros est déjà en route.</div><button class="btn small" data-act="go">VOIR LA CARTE</button>';
  return `<div class="sec"><h3>HYACINTHE JALON · CARTOGRAPHE</h3>${tale("Jalon déroule la carte des environs sur une borne et pose le doigt dessus : c'est par là que la route commence.")}${go}<div class="note">${CARTOGRAPHER_NOTE}</div></div>`;
}
function maillocheHTML(m) {
  return `<div class="sec"><h3>HONORINE MAILLOCHE · FORGERONNE</h3>${tale('Honorine Mailloche tape sur une lame qui refroidit. Derrière elle, le coffre du village, la seule chose qui traverse les boucles.')}</div>${buildingHTML('forge')}${forgeHTML(m)}${chestHTML(m)}`;
}
const BASANE_HTML = `<div class="sec"><h3>PHILÉMON BASANE · TANNEUR</h3>${tale("Philémon Basane tend une peau devant son atelier. Il te salue d'un signe de tête et retourne à son ouvrage.")}<div class="note">Rien à faire chez lui pour l'instant.</div></div>`;
function hourglassHTML() {
  return `<div class="sec"><h3>LE SABLIER</h3>${tale("Sous l'horloge, le sable file. Le laisser filer, c'est finir la boucle tout de suite : le village garde ce que tu as gagné.")}<button class="btn small" data-act="letgo" ${S.G.run.over ? 'disabled' : ''}>LAISSER FILER LE SABLIER</button></div>`;
}
const ZONE_HTML = {
  jalon: jalonHTML,
  mailloche: maillocheHTML,
  basane: () => BASANE_HTML,
  entrainement: m => buildingHTML('entraineur') + nextHeroHTML(m),
  horloge: () => buildingHTML('horloge') + hourglassHTML(),
};

// ---------- la scène ----------
function zoneHTML(z) {
  return `<button class="vz ${S.zone === z.id ? 'on' : ''}" data-zone="${z.id}" style="--x:${z.x}%;--y:${z.y}%">
    <span class="vz-ic">${z.icon}</span><span class="vz-tx"><b>${z.name}</b><small>${z.role}</small></span>${zoneBadge(z.id) ? '<span class="vz-bang">!</span>' : ''}<span class="vz-go">›</span></button>`;
}
function sceneHTML() {
  return `<div class="vil-scene"><div class="vil-name">LES HEURELLES</div><div class="vil-houses"></div>${ZONES.map(zoneHTML).join('')}</div>`;
}
export function villageHTML() {
  const m = S.G.meta;
  return (
    (atVillage() ? '' : FAR_HTML) + renownHTML(m) + sceneHTML() + `<div class="vil-card">${ZONE_HTML[S.zone](m)}</div>`
  );
}
