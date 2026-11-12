import {BIOMES, TILES, TILE_MAP, TYPES, tid} from '../data.js';
import {canExplore, explore} from '../engine.js';
import {$, S, anyUpgrade, setHTML, spr} from './state.js';
import {consumeEvents, render} from './main.js';

// ---------- carte ----------
const xs = TILES.map(t => t.x), ys = TILES.map(t => t.y);
const minX = Math.min(...xs) - 1, maxX = Math.max(...xs) + 1, minY = Math.min(...ys) - 1, maxY = Math.max(...ys) + 1;
const mapEl = $('map');
mapEl.style.gridTemplateColumns = `repeat(${maxX - minX + 1}, 60px)`;
const tileEls = {};
for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++){
  const c = document.createElement('div'); c.className = 'cell';
  const t = TILE_MAP[tid(x,y)];
  if (t){
    const d = document.createElement('div'); d.className = 'tile'; d.dataset.id = t.id;
    d.style.background = BIOMES[t.biome].color;
    d.innerHTML = `<span>${TYPES[t.type].icon}</span>` + (t.lvl ? `<span class="lv">${t.lvl}</span>` : '')
      + '<span class="ck"></span><span class="herom"></span><div class="tprog" hidden><i></i></div>'
      + (t.type === 'village' ? '<span class="bang" hidden>!</span>' : '');
    d.title = t.name;
    c.appendChild(d); tileEls[t.id] = d;
  }
  mapEl.appendChild(c);
}
mapEl.addEventListener('click', e => { const d = e.target.closest('.tile'); if (!d) return; S.selected = d.dataset.id; S.tab = TILE_MAP[S.selected].type === 'village' && anyUpgrade() ? 'village' : 'explore'; render(); });
mapEl.addEventListener('dblclick', e => { const d = e.target.closest('.tile'); if (!d) return; S.selected = d.dataset.id; if (explore(S.G, S.selected)) S.tab = 'explore'; consumeEvents(); render(); });
$('legend').innerHTML = ['pres','collines','puits'].map(b => `<span><b style="background:${BIOMES[b].color}"></b>${BIOMES[b].name}</span>`).join('')
  + `<span>⚔️ combat · 💀 repaire · 👑 boss · 🌳⛏️ récolte · 💧 source · 🎁 trésor</span>`;

function tileProgress(a){
  const n = a.segs.length; if (a.seg < 0) return 0;
  return (a.seg + segFill(a)) / n;
}
export function segFill(a){
  if (a.phase === 'fight' && a.enemies){ const tot = a.enemies.reduce((s, e) => s + e.maxHp, 0), left = a.enemies.reduce((s, e) => s + Math.max(0, e.hp), 0); return 1 - left / tot; }
  return a.dur ? Math.min(1, a.t / a.dur) : 0;
}
export function renderMap(){
  const r = S.G.run, a = r.action, up = anyUpgrade();
  for (const id in tileEls){
    const d = tileEls[id], t = TILE_MAP[id], disc = S.G.meta.discovered[id];
    d.parentNode.style.visibility = disc ? 'visible' : 'hidden';
    const done = r.completed.has(id), here = a && a.id === id, can = canExplore(S.G, id) && !done;
    d.className = 'tile' + (done || here || can ? '' : ' dim') + (can ? ' can' : '') + (id === S.selected ? ' sel' : '') + (t.type === 'locked' ? ' locked' : '');
    d.querySelector('.ck').textContent = done && t.type !== 'village' ? '✓' : '';
    setHTML(d.querySelector('.herom'), (a ? a.id : r.heroAt) === id && !r.over ? spr('heros', '🧙') : '');
    const p = d.querySelector('.tprog');
    if (here){ p.hidden = false; p.firstChild.style.width = (tileProgress(a) * 100) + '%'; } else p.hidden = true;
    if (t.type === 'village') d.querySelector('.bang').hidden = !up;
  }
}

