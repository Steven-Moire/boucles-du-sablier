// Onglet Village du panneau de droite : renommée, bâtiments, matériaux, héros de la prochaine boucle.
import {RES} from '../world/world.data.js';
import {MATS} from '../mining/mining.data.js';
import {UPGRADES} from './village.data.js';
import {heroAtLevel, heroBase} from '../hero/hero.engine.js';
import {upgradeState} from './village.engine.js';
import {S, loopFresh} from '../shared/state.js';
import {fmt, pct} from '../shared/format.js';

function costHTML(cost) {
  return Object.entries(cost)
    .map(([k, v]) => `<span class="${S.G.meta[k] >= v ? '' : 'no'}">${RES[k].icon} ${fmt(v)}</span>`)
    .join(' &nbsp; ');
}
export function villageHTML() {
  const m = S.G.meta,
    nb = heroBase(m),
    h1 = heroAtLevel(nb, 1);
  const nextReq = Object.values(UPGRADES)
    .map(u => u.req)
    .filter(q => q > m.renown)
    .sort((a, b) => a - b)[0];
  let h = `<div class="sec"><h3>RENOMMÉE <span>⭐ ${fmt(m.renown)}</span></h3><div class="note" style="text-align:left;margin:0">Le village se souvient de toi : la renommée débloque les bâtiments, l'or et les matériaux servent à les améliorer.${nextReq ? `<br>Prochain déblocage à <b>${nextReq} ⭐</b>.` : ''}</div></div>`;
  for (const k in UPGRADES) {
    const s = upgradeState(S.G, k),
      u = s.u;
    h += `<div class="sec bld ${s.unlocked ? '' : 'lock'}"><div class="ic">${u.icon}</div><div>
      <div><span class="nm">${u.name}</span>${s.unlocked ? `<span class="lvl">NIV ${s.n}/${u.max}</span>` : ''}</div>
      <div class="ds">${s.unlocked ? u.desc : `Débloqué à ${u.req} ⭐ de renommée`}</div>
      ${s.unlocked && !s.maxed ? `<div class="cost">${costHTML(s.cost)}</div><button class="btn small gold" data-buy="${k}" ${s.ok ? '' : 'disabled'}>AMÉLIORER</button>` : s.maxed ? '<div class="cost">Niveau maximum</div>' : ''}
    </div></div>`;
  }
  const mats = Object.keys(MATS).filter(k => m.mats[k]);
  h += `<div class="sec"><h3>MATÉRIAUX EXTRAITS</h3>${
    mats.length
      ? `<div class="mats">${mats.map(k => `<span title="${MATS[k].name}">${MATS[k].icon} <b>${fmt(m.mats[k])}</b> ${MATS[k].name}</span>`).join('')}</div>`
      : '<div class="note" style="margin:0;text-align:left">Creuse les monstres : ce que tu extrais, le village le garde. La forge s\'en servira bientôt.</div>'
  }</div>`;
  h += `<div class="sec bld lock"><div class="ic">🗺️</div><div><span class="nm">Cartographe</span><div class="ds">Bientôt : programmer sa route à l'avance sur les cases connues (mode idle).</div></div></div>`;
  h += `<div class="sec"><h3>HÉROS DE LA PROCHAINE BOUCLE</h3><div class="stats" style="margin:0">
    <div>PV <b>${h1.maxHp}</b></div><div>Puissance <b>${h1.pow.toFixed(1)}</b></div><div>Armure <b>${h1.arm.toFixed(1)}</b></div>
    <div>Esquive <b>${pct(h1.dodge)}</b></div><div>Critique <b>${pct(h1.crit)}</b></div><div>Temps <b>${nb.loopTime} s</b></div></div>
    <div class="note">${loopFresh() ? "Le héros n'est pas encore parti : les améliorations s'appliquent tout de suite." : 'Les améliorations prennent effet au début de la boucle suivante.'}</div></div>`;
  return h;
}
