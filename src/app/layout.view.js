// Disposition : barre du haut (ressources, vitesse, sablier), onglets lieu (village ou combat) / Carte / Bestiaire et leur contenu.
import {RES} from '../world/world.data.js';
import {abandon, startLoop} from '../world/loop.engine.js';
import {explore} from '../world/explore.engine.js';
import {buy} from '../village/village.engine.js';
import {forgeItem, repeatForge} from '../village/forge.engine.js';
import {
  S,
  anyUpgrade,
  atVillage,
  combatShown,
  loopFresh,
  openVillage,
  saveMeta,
  villageShown,
} from '../shared/state.js';
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
// l'onglet du lieu suit le héros : 🏠 VILLAGE quand il y est (ou qu'on le regarde de loin), ⚔️ COMBAT en route
function placeTab() {
  if (!villageShown()) return ['place', '⚔️', 'COMBAT'];
  return ['place', '🏠', atVillage() ? 'VILLAGE' : 'VILLAGE (DE LOIN)'];
}
const OTHER_TABS = [
  ['map', '🗺️', 'CARTE'],
  ['bestiary', '📖', 'BESTIAIRE'],
];
const LIVE_HTML = '<span class="live"></span>';
const BADGE_HTML = '<span class="bg">!</span>';
// pastille de l'onglet du lieu : combat en cours qu'on ne regarde pas, ou amélioration possible au village
function tabMark(k) {
  if (k !== 'place') return '';
  if (S.G.run.action?.phase === 'fight' && !combatShown()) return LIVE_HTML;
  if (atVillage() && anyUpgrade()) return BADGE_HTML;
  return '';
}
export function renderTabs() {
  setHTML(
    $('tabs'),
    [placeTab(), ...OTHER_TABS]
      .map(
        ([k, ic, l]) =>
          `<button data-t="${k}" class="${S.tab === k ? 'on' : ''}">${ic}<span class="tl"> ${l}</span>${tabMark(k)}</button>`,
      )
      .join(''),
  );
  $('sceneView').hidden = !combatShown();
  $('villageView').hidden = S.tab !== 'place' || !villageShown();
  $('mapView').hidden = S.tab !== 'map';
  $('pane').hidden = S.tab !== 'bestiary';
}
$('tabs').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) {
    S.tab = b.dataset.t;
    if (S.tab !== 'place') S.farView = false; // quitter l'onglet du lieu met fin au regard de loin
    clearTimeout(S.backTimer);
    requestRender();
  }
});

// fiche de la case à côté de la carte ; village dans l'onglet du lieu ; bestiaire dans le panneau
export function renderPane() {
  if (S.tab === 'map') setHTML($('tileCard'), tileCardHTML());
  else if (S.tab === 'place' && villageShown()) setHTML($('villageView'), villageHTML());
  else if (S.tab === 'bestiary') setHTML($('pane'), bestiaryHTML());
}
// achat d'un bâtiment ou forge : sauvegarde, et si le héros n'est pas parti, il repart avec (stats recalculées)
function afterVillageChange(isDone) {
  if (!isDone) return;
  saveMeta();
  if (loopFresh()) startLoop(S.G);
}
// boutons d'action des fiches (case de la carte, zones du village)
const ACTS = {
  explore: () => explore(S.G, S.selected),
  'tab-village': openVillage,
  go: () => {
    S.tab = 'map'; // « Partir » : Jalon ouvre la carte
    S.farView = false;
  },
  letgo: () => abandon(S.G), // « Laisser filer le sablier » : fin de boucle tout de suite
  back: () => {
    S.farView = false;
  },
};
function onPaneClick(e) {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (ACTS[b.dataset.act]) ACTS[b.dataset.act]();
  else if (b.dataset.zone) S.zone = b.dataset.zone;
  else if (b.dataset.buy) afterVillageChange(buy(S.G, b.dataset.buy));
  else if (b.dataset.forge) afterVillageChange(forgeItem(S.G, b.dataset.forge, loopFresh()));
  else if (b.dataset.reforge !== undefined) afterVillageChange(repeatForge(S.G, loopFresh()));
  else if (b.dataset.mon) openMonster(b.dataset.mon, +b.dataset.lvl || null);
  requestRender();
}
$('pane').addEventListener('click', onPaneClick);
$('villageView').addEventListener('click', onPaneClick);
$('tileCard').addEventListener('click', onPaneClick);
