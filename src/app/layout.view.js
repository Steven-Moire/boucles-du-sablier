import {RES} from '../world/world.data.js';
import {abandon, startLoop} from '../world/loop.engine.js';
import {explore} from '../world/explore.engine.js';
import {setTool} from '../hero/hero.engine.js';
import {buy} from '../village/village.engine.js';
import {S, anyUpgrade, loopFresh, saveMeta} from '../shared/state.js';
import {$, setHTML} from '../shared/dom.js';
import {fmt} from '../shared/format.js';
import {requestRender} from '../shared/render.js';
import {exploreHTML} from '../world/explore-panel.view.js';
import {villageHTML} from '../village/village.view.js';
import {bestiaryHTML} from '../enemies/bestiary.view.js';
import {openMonster} from '../modals/monster.view.js';

// ---------- haut ----------
export function renderTop() {
  const m = S.G.meta,
    r = S.G.run;
  setHTML(
    $('res'),
    ['renown', 'gold', 'wood', 'ore']
      .map(k => `<div class="chip">${RES[k].icon} ${fmt(m[k])}<span>${RES[k].name}</span></div>`)
      .join(''),
  );
  setHTML(
    $('speed'),
    [1, 2, 5].map(s => `<button data-s="${s}" class="${s === S.gameSpeed ? 'on' : ''}">×${s}</button>`).join(''),
  );
  $('loopLbl').textContent = `⏳ BOUCLE ${m.loop}`;
  $('timeBar').style.width = (r.timeLeft / r.timeMax) * 100 + '%';
  $('timeVal').textContent = `${r.timeLeft.toFixed(1)} s`;
  const fighting = r.action && r.action.phase === 'fight';
  const h = r.hero;
  setHTML(
    $('viewtabs'),
    `<button data-v="map" class="${S.view === 'map' ? 'on' : ''}">🗺️ CARTE</button><button data-v="scene" class="${S.view === 'scene' ? 'on' : ''}">⚔️ COMBAT${fighting && S.view !== 'scene' ? '<span class="live"></span>' : ''}</button>
    <div class="vhp" title="Points de vie du héros : ${fmt(h.hp)} / ${h.maxHp}">🧙 Niv ${h.lvl}<div class="bar hp"><i style="width:${(h.hp / h.maxHp) * 100}%"></i><span>${fmt(h.hp)} / ${h.maxHp} PV</span></div></div>`,
  );
  $('mapView').hidden = S.view !== 'map';
  $('sceneView').hidden = S.view !== 'scene';
}
$('speed').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) {
    S.gameSpeed = +b.dataset.s;
    requestRender();
  }
});
$('viewtabs').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) {
    S.view = b.dataset.v;
    clearTimeout(S.backTimer);
    requestRender();
  }
});

// ---------- panneau de droite ----------
export function renderTabs() {
  const T = [
    ['explore', 'Exploration'],
    ['village', 'Village'],
    ['bestiary', 'Bestiaire'],
  ];
  setHTML(
    $('tabs'),
    T.map(
      ([k, l]) =>
        `<button data-t="${k}" class="${S.tab === k ? 'on' : ''}">${l}${k === 'village' && anyUpgrade() ? '<span class="bg">!</span>' : ''}</button>`,
    ).join(''),
  );
}
$('tabs').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) {
    S.tab = b.dataset.t;
    requestRender();
  }
});

// gabarit de chaque onglet ; tout autre onglet affiche le bestiaire
const PANES = {explore: exploreHTML, village: villageHTML};
export function renderPane() {
  setHTML($('pane'), (PANES[S.tab] || bestiaryHTML)());
}
$('pane').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.act === 'explore') explore(S.G, S.selected);
  else if (b.dataset.act === 'abandon') abandon(S.G);
  else if (b.dataset.tool) {
    setTool(S.G, b.dataset.tool);
    saveMeta();
  } else if (b.dataset.act === 'tab-village') S.tab = 'village';
  else if (b.dataset.buy) {
    if (buy(S.G, b.dataset.buy)) {
      saveMeta();
      if (loopFresh()) startLoop(S.G);
    }
  } else if (b.dataset.mon) openMonster(b.dataset.mon, +b.dataset.lvl || null);
  requestRender();
});
