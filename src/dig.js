// Combat-minage (moteur pur, sans DOM) : chaque monstre est sa grille de pixels, les dégâts la creusent.
// Les hasards du minage passent par un générateur à part (G.mrng) : les combats restent identiques à la v0.3.
import {COMPOSITION, DIG, MONSTERS, STRATA} from './data.js';
import {GRIDS} from './grids.js';

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BASE = {};   // strates de base par monstre (calculées une fois)

// Strates d'un monstre : croûte (contour), veine brillante du sprite, puis par profondeur :
// les plus profonds = cœur (rare), les 30 % suivants = profondeur (peu commun), le reste = surface (commun).
export function baseStrata(id){
  if (BASE[id] !== undefined) return BASE[id];
  const g = GRIDS[id];
  if (!g){ BASE[id] = null; return null; }
  const comp = COMPOSITION[id], n = g.w * g.h, cls = new Array(n).fill(null), deep = [];
  let sx = 0, sy = 0, count = 0;
  for (let i = 0; i < n; i++){
    const ch = g.cells[i];
    if (ch === '.') continue;
    const x = i % g.w, y = (i - x) / g.w;
    sx += x; sy += y; count++;
    if (ch === 'c') cls[i] = 'croute';
    else if (ch === 'v') cls[i] = comp.veine && comp.veine.sprite ? 'veine' : 'peu';
    else deep.push({i, d:ch.charCodeAt(0) - 48, x, y});
  }
  const cx = sx / count, cy = sy / count;
  // tri : le plus profond d'abord, à profondeur égale le plus proche du centre
  deep.sort((a, b) => b.d - a.d || Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
  const nRare = Math.round(count * DIG.core[MONSTERS[id].rank]), nPeu = Math.round(count * DIG.peu);
  deep.forEach((p, k) => { cls[p.i] = k < nRare ? 'rare' : k < nRare + nPeu ? 'peu' : 'commun'; });
  BASE[id] = {w:g.w, h:g.h, cls, count, cx, cy};
  return BASE[id];
}

const rand = (r, n) => Math.floor(r() * n);
const solidOf = d => d.cls.reduce((a, c, i) => { if (c) a.push(i); return a; }, []);

// Veine élémentaire tracée au hasard (marche aléatoire, 2 à 3 branches), dans la chair : ni croûte ni cœur.
function carveVein(d, len, r){
  const ok = i => d.cls[i] === 'commun' || d.cls[i] === 'peu';
  const pool = solidOf(d).filter(ok);
  let done = 0, cur = -1, branch = 0;
  for (let guard = 0; done < len && guard < len * 20 && pool.length; guard++){
    if (cur < 0 || branch > len / 2.5){ cur = pool[rand(r, pool.length)]; branch = 0; }
    if (ok(cur)){ d.cls[cur] = 'veine'; done++; branch++; }
    const x = cur % d.w, y = (cur - x) / d.w, [dx, dy] = N4[rand(r, 4)], nx = x + dx, ny = y + dy;
    const j = ny * d.w + nx;
    cur = nx >= 0 && ny >= 0 && nx < d.w && ny < d.h && (ok(j) || d.cls[j] === 'veine') ? j : -1;
  }
}

// Point visé sans clic du joueur : cœur (45 %), veine (35 %) ou n'importe où (20 %).
function pickTarget(d, r){
  const solid = solidOf(d), roll = r();
  const of = c => solid.filter(i => d.cls[i] === c);
  let pool = roll < .45 ? of('rare') : roll < .8 ? of('veine') : solid;
  if (!pool.length) pool = solid;
  const i = pool[rand(r, pool.length)];
  return {x:i % d.w, y:Math.floor(i / d.w)};
}

const exposed = (d, i) => {
  const x = i % d.w, y = (i - x) / d.w;
  return N4.some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx >= d.w || ny >= d.h || !d.cls[ny * d.w + nx]; });
};

// Ordre de creusage pour la pioche : tunnel de ~2 px depuis la surface la plus proche jusqu'à la cible,
// puis cratère qui s'élargit autour de la cible.
export function aimDig(d, target){
  const solid = solidOf(d);
  if (!solid.length) return;
  const pos = i => ({x:i % d.w, y:Math.floor(i / d.w)});
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const entry = pos(solid.filter(i => exposed(d, i)).reduce((b, i) => dist(pos(i), target) < dist(pos(b), target) ? i : b));
  const vx = target.x - entry.x, vy = target.y - entry.y, L2 = vx * vx + vy * vy || 1;
  const tunnel = [], rest = [];
  for (const i of solid){
    const p = pos(i), t = Math.max(0, Math.min(1, ((p.x - entry.x) * vx + (p.y - entry.y) * vy) / L2));
    const off = Math.hypot(p.x - entry.x - t * vx, p.y - entry.y - t * vy);
    if (off <= 1.05) tunnel.push({i, k:t}); else rest.push({i, k:dist(p, target)});
  }
  tunnel.sort((a, b) => a.k - b.k); rest.sort((a, b) => a.k - b.k);
  d.order = tunnel.concat(rest).map(o => o.i);
  d.pos = 0;
  d.target = target;
}

// Grille d'un monstre qui apparaît : strates de base + veine au hasard + cible au hasard.
export function makeDig(e, r){
  const b = baseStrata(e.id);
  if (!b) return null;
  const comp = COMPOSITION[e.id];
  const d = {w:b.w, h:b.h, cls:b.cls.slice(), hp:null, px:{}, budget:0, k:0, order:[], pos:0, target:null};
  if (comp.veine && !comp.veine.sprite) carveVein(d, Math.round(comp.veine.frac * b.count), r);
  d.hp = d.cls.map(c => c ? STRATA[c].hp : 0);
  const total = d.hp.reduce((s, h) => s + h, 0);
  d.k = DIG.collapse * total / e.maxHp;      // vie de pixels creusée par point de dégât
  aimDig(d, pickTarget(d, r));
  return d;
}

// Creuse avec les dégâts d'un coup ; renvoie les index des pixels retirés (pour l'UI).
export function dig(d, dmg){
  const out = [];
  d.budget += dmg * d.k;
  while (d.budget > 1e-9 && d.pos < d.order.length){
    const i = d.order[d.pos], c = d.cls[i];
    if (!c){ d.pos++; continue; }
    const use = Math.min(d.budget, d.hp[i]);
    d.hp[i] -= use; d.budget -= use;
    if (d.hp[i] > 1e-9) break;
    d.cls[i] = null; d.pos++;
    if (c !== 'croute') d.px[c] = (d.px[c] || 0) + 1;
    out.push(i);
  }
  return out;
}

// Matériaux extraits à la mort : pixels / rendement, la fraction restante devient une chance.
export function extract(id, d, r){
  const comp = COMPOSITION[id], got = {};
  for (const c in d.px){
    const mat = c === 'veine' ? comp.veine.mat : comp[c];
    const units = d.px[c] / STRATA[c].yield, n = Math.floor(units) + (r() < units % 1 ? 1 : 0);
    if (n) got[mat] = (got[mat] || 0) + n;
  }
  return got;
}

// Composition d'un monstre (pour le bestiaire) : part des pixels par strate, hors veine tirée au hasard.
export function composition(id){
  const b = baseStrata(id);
  if (!b) return null;
  const c = {};
  b.cls.forEach(s => { if (s) c[s] = (c[s] || 0) + 1; });
  const comp = COMPOSITION[id];
  if (comp.veine && !comp.veine.sprite){
    const v = Math.round(comp.veine.frac * b.count);
    c.veine = v; c.commun = Math.max(0, (c.commun || 0) - v);
  }
  return {count:b.count, parts:c};
}
