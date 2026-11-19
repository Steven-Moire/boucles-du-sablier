import {BIOMES, TILES, TILE_MAP, TYPES, tid} from './world.data.js';
import {canExplore, explore, segFill} from './explore.engine.js';
import {S, anyUpgrade} from '../shared/state.js';
import {$, setHTML} from '../shared/dom.js';
import {spr} from '../shared/templates.js';
import {requestRender} from '../shared/render.js';

// ---------- carte ----------
const xs = TILES.map(t => t.x),
  ys = TILES.map(t => t.y);
const minX = Math.min(...xs) - 1,
  maxX = Math.max(...xs) + 1,
  minY = Math.min(...ys) - 1,
  maxY = Math.max(...ys) + 1;
const mapEl = $('map');
mapEl.style.gridTemplateColumns = `repeat(${maxX - minX + 1}, 60px)`;
const tileEls = {};
// icône 32×32 de la case (assets/sprites/tile_<type>.png), repli sur l'emoji ; la case verrouillée du Puits ancien a son propre puits
const tileIcon = t => spr(t.biome === 'puits' ? 'tile_puits' : 'tile_' + t.type, TYPES[t.type].icon);
for (let y = minY; y <= maxY; y++)
  for (let x = minX; x <= maxX; x++) {
    const c = document.createElement('div');
    c.className = 'cell';
    const t = TILE_MAP[tid(x, y)];
    if (t) {
      const d = document.createElement('div');
      d.className = 'tile';
      d.dataset.id = t.id;
      d.style.background = BIOMES[t.biome].color;
      d.innerHTML =
        `<span class="ticon">${tileIcon(t)}</span>` +
        (t.lvl ? `<span class="lv">${t.lvl}</span>` : '') +
        '<span class="ck"></span><span class="herom"></span><div class="tprog" hidden><i></i></div>' +
        (t.type === 'village' ? '<span class="bang" hidden>!</span>' : '');
      d.title = t.name;
      c.appendChild(d);
      tileEls[t.id] = d;
    }
    mapEl.appendChild(c);
  }
mapEl.addEventListener('click', e => {
  const d = e.target.closest('.tile');
  if (!d) return;
  S.selected = d.dataset.id;
  S.tab = TILE_MAP[S.selected].type === 'village' && anyUpgrade() ? 'village' : 'explore';
  requestRender();
});
mapEl.addEventListener('dblclick', e => {
  const d = e.target.closest('.tile');
  if (!d) return;
  S.selected = d.dataset.id;
  if (explore(S.G, S.selected)) S.tab = 'explore';
  requestRender();
});
$('legend').innerHTML =
  ['pres', 'collines', 'puits']
    .map(b => `<span><b style="background:${BIOMES[b].color}"></b>${BIOMES[b].name}</span>`)
    .join('') +
  [
    ['combat', 'combat'],
    ['elite', 'repaire'],
    ['boss', 'boss'],
    ['wood', ''],
    ['ore', 'récolte'],
    ['spring', 'source'],
    ['chest', 'trésor'],
  ]
    .map(([k, lbl]) => `<span class="lg-i">${spr('tile_' + k, TYPES[k].icon)}${lbl}</span>`)
    .join('');

function tileProgress(a) {
  const n = a.segs.length;
  if (a.seg < 0) return 0;
  return (a.seg + segFill(a)) / n;
}
function tileClass(id, t, isShown, can) {
  let c = 'tile';
  if (!isShown) c += ' dim';
  if (can) c += ' can';
  if (id === S.selected) c += ' sel';
  if (t.type === 'locked') c += ' locked';
  return c;
}
function renderTileProgress(d, a, here) {
  const p = d.querySelector('.tprog');
  if (!here) {
    p.hidden = true;
    return;
  }
  p.hidden = false;
  p.firstChild.style.width = tileProgress(a) * 100 + '%';
}
function renderTile(id, r, a, up) {
  const d = tileEls[id],
    t = TILE_MAP[id],
    disc = S.G.meta.discovered[id];
  d.parentNode.style.visibility = disc ? 'visible' : 'hidden';
  const done = r.completed.has(id),
    here = a?.id === id,
    can = canExplore(S.G, id) && !done;
  d.className = tileClass(id, t, done || here || can, can);
  d.querySelector('.ck').textContent = done && t.type !== 'village' ? '✓' : '';
  const heroId = a ? a.id : r.heroAt;
  const isHeroHere = heroId === id && !r.over;
  setHTML(d.querySelector('.herom'), isHeroHere ? spr('heros', '🧙') : '');
  renderTileProgress(d, a, here);
  if (t.type === 'village') d.querySelector('.bang').hidden = !up;
}
export function renderMap() {
  const r = S.G.run,
    a = r.action,
    up = anyUpgrade();
  for (const id in tileEls) renderTile(id, r, a, up);
}
