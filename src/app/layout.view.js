// Disposition : barre du haut (ressources, vitesse, sablier), onglets Combat / Carte / Bestiaire / Village et leur contenu.
import {RES} from '../world/world.data.js';
import {startLoop} from '../world/loop.engine.js';
import {explore} from '../world/explore.engine.js';
import {buy} from '../village/village.engine.js';
import {forgeItem, repeatForge} from '../village/forge.engine.js';
import {S, anyUpgrade, loopFresh, saveMeta} from '../shared/state.js';
import {$, setHTML} from '../shared/dom.js';
import {fmt} from '../shared/format.js';
import {requestRender} from '../shared/render.js';
import {tileCardHTML} from '../world/explore-panel.view.js';
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
}
$('speed').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) {
    S.gameSpeed = +b.dataset.s;
    requestRender();
  }
});

// ---------- onglets (à droite du héros) et leur contenu ----------
const TABS = [
  ['combat', '⚔️', 'COMBAT'],
  ['map', '🗺️', 'CARTE'],
  ['bestiary', '📖', 'BESTIAIRE'],
  ['village', '🏠', 'VILLAGE'],
];
const LIVE_HTML = '<span class="live"></span>';
const BADGE_HTML = '<span class="bg">!</span>';
// pastille d'un onglet : combat en cours ailleurs, ou amélioration possible au village
function tabMark(k) {
  if (k === 'combat' && S.G.run.action?.phase === 'fight' && S.tab !== 'combat') return LIVE_HTML;
  if (k === 'village' && anyUpgrade()) return BADGE_HTML;
  return '';
}
export function renderTabs() {
  setHTML(
    $('tabs'),
    TABS.map(
      ([k, ic, l]) =>
        `<button data-t="${k}" class="${S.tab === k ? 'on' : ''}">${ic}<span class="tl"> ${l}</span>${tabMark(k)}</button>`,
    ).join(''),
  );
  $('sceneView').hidden = S.tab !== 'combat';
  $('mapView').hidden = S.tab !== 'map';
  $('pane').hidden = S.tab !== 'bestiary' && S.tab !== 'village';
}
$('tabs').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) {
    S.tab = b.dataset.t;
    clearTimeout(S.backTimer);
    requestRender();
  }
});

// fiche de la case à côté de la carte ; bestiaire ou village dans le panneau
export function renderPane() {
  if (S.tab === 'map') setHTML($('tileCard'), tileCardHTML());
  else if (S.tab === 'village') setHTML($('pane'), villageHTML());
  else if (S.tab === 'bestiary') setHTML($('pane'), bestiaryHTML());
}
// achat d'un bâtiment ou forge : sauvegarde, et si le héros n'est pas parti, il repart avec (stats recalculées)
function afterVillageChange(isDone) {
  if (!isDone) return;
  saveMeta();
  if (loopFresh()) startLoop(S.G);
}
function onPaneClick(e) {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.act === 'explore') explore(S.G, S.selected);
  else if (b.dataset.act === 'tab-village') S.tab = 'village';
  else if (b.dataset.buy) afterVillageChange(buy(S.G, b.dataset.buy));
  else if (b.dataset.forge) afterVillageChange(forgeItem(S.G, b.dataset.forge, loopFresh()));
  else if (b.dataset.reforge !== undefined) afterVillageChange(repeatForge(S.G, loopFresh()));
  else if (b.dataset.mon) openMonster(b.dataset.mon, +b.dataset.lvl || null);
  requestRender();
}
$('pane').addEventListener('click', onPaneClick);
$('tileCard').addEventListener('click', onPaneClick);
