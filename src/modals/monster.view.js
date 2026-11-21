import {RES, TILES} from '../world/world.data.js';
import {COMPOSITION, MONSTERS, RANK} from '../enemies/enemies.data.js';
import {MATS, STRATA} from '../mining/mining.data.js';
import {TOOLS} from '../hero/hero.data.js';
import {monsterStats, toolAdvice} from '../enemies/enemies.engine.js';
import {composition} from '../mining/strata.engine.js';
import {S} from '../shared/state.js';
import {$} from '../shared/dom.js';
import {pct} from '../shared/format.js';
import {spr} from '../shared/templates.js';
import {VESTIGES} from '../lore/lore.data.js';

// ---------- fiche d'un monstre ----------
const dropQty = d => (d.min === d.max ? d.min : d.min + '~' + d.max);
const dropHTML = d =>
  `<div class="drop">${RES[d.res].icon}<em>${dropQty(d)}</em><small>${Math.round(d.chance * 100)}%</small></div>`;
// butins révélés (après une victoire) : butins communs puis le trophée unique
function dropsHTML(mm, own) {
  const tr = mm.trophy;
  return `<div class="drops">${mm.drops.map(dropHTML).join('')}
      <div class="drop uniq ${own ? 'got' : ''}" title="${tr.name} — ${tr.desc}">${tr.icon}<em>${own ? '✓' : '🏆'}</em><small>${Math.round(tr.chance * 100)}%</small></div></div>
      <div class="note">🏆 ${tr.name} : ${tr.desc} — unique, permanent${own ? ' (obtenu)' : ''}.</div>`;
}
export function openMonster(id, lvl) {
  const mm = MONSTERS[id],
    b = S.G.meta.bestiary[id] || {},
    L = lvl || TILES.find(t => (t.waves || []).flat().includes(id)).lvl;
  const s = monsterStats(id, L),
    seen = b.seen,
    q = v => (seen ? v : '???'),
    own = S.G.meta.trophies[id];
  const rows = [
    ['Santé', q(s.maxHp)],
    ['Puissance', q(s.pow.toFixed(1))],
    ['Armure', q(s.arm)],
    ['Esquive', q(pct(s.dodge))],
    ['Critique', q(pct(s.crit))],
    ['Attaque toutes les', q(s.speed + ' s')],
  ];
  const drops = b.killed ? dropsHTML(mm, own) : `<div class="note">Bats-le une fois pour révéler ses butins.</div>`;
  $('mbox').innerHTML =
    `<button class="x" data-close>×</button><div style="text-align:center;font-size:48px">${seen ? spr(id, mm.por) : '❔'}</div><h2>${seen ? mm.name : '???'}</h2><div class="sub">${RANK[mm.rank].label} · Niveau ${L}</div>
    <div class="divh"><span>STATS</span></div>${rows.map(([k, v]) => `<div class="row"><span class="k">${k}</span><b>${v}</b></div>`).join('')}
    ${seen ? '' : '<div class="note">Rencontre-le une fois pour révéler sa fiche.</div>'}
    ${seen ? compositionHTML(id, b.killed) + carnetHTML(id, b) + vestigeHTML(id) : ''}
    <div class="divh"><span>BUTINS</span></div>${drops}`;
  S.modalMode = 'monster';
  $('modal').hidden = false;
}
// Vestige trouvé dans ce monstre (texte simple en attendant le carnet des vestiges) ; rejouer la scène du premier combat
const replayHTML = pending =>
  pending
    ? '<div class="note">La scène se rejouera au prochain Mulot dentu.</div>'
    : '<button class="btn small" data-replay>Revoir au prochain Mulot</button>';
function vestigeHTML(id) {
  const m = S.G.meta,
    k = Object.keys(VESTIGES).find(v => VESTIGES[v].monster === id && m.vestiges[v]);
  if (!k) return '';
  const v = VESTIGES[k];
  return `<div class="divh"><span>VESTIGE</span></div>
    <div class="row"><span class="k">${v.icon} ${v.name}</span><span>boucle ${m.vestiges[k]}</span></div>
    <div class="note">« ${v.text} »</div>${replayHTML(!m.scenes.premierCombat)}`;
}
// Carnet : outil conseillé (étape 2b) — note après la 1re victoire ou défaite, outil nommé après comparaison ou au filet
const tally = (byTool, f) =>
  Object.keys(byTool)
    .filter(k => byTool[k][f] > 0)
    .map(k => `${TOOLS[k].icon} ${byTool[k][f]}`)
    .join(' · ') || '—';
const CARNET_NOTE = {
  named: a =>
    `<div class="row"><span class="k">Outil conseillé</span><b>${TOOLS[a.tool].icon} ${TOOLS[a.tool].name}</b></div><div class="note">« ${a.why} »</div>`,
  win: a =>
    `<div class="note">« Tombé sous ${TOOLS[a.tool].the}. » Le carnet attend un autre outil pour comparer (ou encore ${a.left} victoire${a.left > 1 ? 's' : ''}).</div>`,
  loss: a => `<div class="note">« Pas ${TOOLS[a.tool].the}, en tout cas. »</div>`,
};
function carnetHTML(id, b) {
  const a = toolAdvice(id, b);
  if (!a) return '';
  return `<div class="divh"><span>CARNET</span></div>
    <div class="row"><span class="k">Victoires par outil</span><span>${tally(a.byTool, 'w')}</span></div>
    <div class="row"><span class="k">Défaites par outil</span><span>${tally(a.byTool, 'l')}</span></div>
    ${CARNET_NOTE[a.kind](a)}`;
}
// Composition d'un monstre : part de chaque strate et matériau extrait (révélé à la première victoire)
function compositionHTML(id, killed) {
  const c = composition(id);
  if (!c) return '';
  const comp = COMPOSITION[id],
    order = ['croute', 'commun', 'peu', 'rare', 'veine'];
  const mat = s => {
    if (s === 'croute') return '—';
    if (!killed) return '???';
    const k = s === 'veine' ? comp.veine.mat : comp[s];
    return `${MATS[k].icon} ${MATS[k].name}`;
  };
  const rows = order
    .filter(s => c.parts[s])
    .map(
      s =>
        `<div class="row"><span class="k">${STRATA[s].label}${s === 'veine' && !comp.veine.sprite ? ' (tracée au hasard)' : ''}</span><span>${Math.max(1, Math.round((c.parts[s] / c.count) * 100))} % · <b>${mat(s)}</b></span></div>`,
    )
    .join('');
  return `<div class="divh"><span>COMPOSITION</span></div>${rows}<div class="note">${c.count} pixels. Le monstre s'effondre quand ~30 % est creusé : vise le cœur ou les veines (clic) pour en tirer le meilleur.</div>`;
}
