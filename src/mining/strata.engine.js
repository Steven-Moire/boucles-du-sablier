// Moteur pur (aucun DOM) : strates de chaque monstre, calculées une fois depuis sa grille de pixels.
import {COMPOSITION, MONSTERS} from '../enemies/enemies.data.js';
import {GRIDS} from '../enemies/grids.generated.js';
import {DIG} from './mining.data.js';

const BASE = {}; // strates de base par monstre (calculées une fois)

// classe du k-ième pixel trié par profondeur : cœur, puis profondeur, puis surface
function layerOf(k, nRare, nPeu) {
  if (k < nRare) return 'rare';
  if (k < nRare + nPeu) return 'peu';
  return 'commun';
}

// Strates d'un monstre : croûte (contour), veine brillante du sprite, puis par profondeur :
// les plus profonds = cœur (rare), les 30 % suivants = profondeur (peu commun), le reste = surface (commun).
export function baseStrata(id) {
  if (BASE[id] !== undefined) return BASE[id];
  const g = GRIDS[id];
  if (!g) {
    BASE[id] = null;
    return null;
  }
  const comp = COMPOSITION[id],
    n = g.w * g.h,
    cls = new Array(n).fill(null),
    deep = [];
  let sx = 0,
    sy = 0,
    count = 0;
  for (let i = 0; i < n; i++) {
    const ch = g.cells[i];
    if (ch === '.') continue;
    const x = i % g.w,
      y = (i - x) / g.w;
    sx += x;
    sy += y;
    count++;
    if (ch === 'c') cls[i] = 'croute';
    else if (ch === 'v') cls[i] = comp.veine && comp.veine.sprite ? 'veine' : 'peu';
    else deep.push({i, d: ch.charCodeAt(0) - 48, x, y});
  }
  const cx = sx / count,
    cy = sy / count;
  // tri : le plus profond d'abord, à profondeur égale le plus proche du centre
  deep.sort((a, b) => b.d - a.d || Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
  const nRare = Math.round(count * DIG.core[MONSTERS[id].rank]),
    nPeu = Math.round(count * DIG.peu);
  deep.forEach((p, k) => {
    cls[p.i] = layerOf(k, nRare, nPeu);
  });
  BASE[id] = {w: g.w, h: g.h, cls, count, cx, cy};
  return BASE[id];
}

// Composition d'un monstre (pour le bestiaire) : part des pixels par strate, hors veine tirée au hasard.
export function composition(id) {
  const b = baseStrata(id);
  if (!b) return null;
  const c = {};
  b.cls.forEach(s => {
    if (s) c[s] = (c[s] || 0) + 1;
  });
  const comp = COMPOSITION[id];
  if (comp.veine && !comp.veine.sprite) {
    const v = Math.round(comp.veine.frac * b.count);
    c.veine = v;
    c.commun = Math.max(0, (c.commun || 0) - v);
  }
  return {count: b.count, parts: c};
}
