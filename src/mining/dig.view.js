import {GRIDS} from '../enemies/grids.generated.js';
import {COMPOSITION} from '../enemies/enemies.data.js';
import {aimAt} from '../combat/combat.engine.js';
import {S} from '../shared/state.js';
import {fxRandom} from '../shared/rng.js';
import {spr} from '../shared/templates.js';

// ---------- combat-minage : monstre dessiné pixel par pixel ----------
const SCALES = [4, 3, 2]; // agrandissements entiers (pixel art), du plus grand au plus petit
const PLATE_H = 76, // plaque d'un monstre (nom, PV, élan) au-dessus de sa grille, marge et ombre comprises
  PLATE_W = 96, // largeur minimale de la plaque
  UNIT_GAP = 16;
const HOLLOW = [249, 230, 207, 80]; // trou creusé : silhouette pâle (f9e6cf de la palette, translucide)
const VEIN_COLOR = {braise: [255, 138, 60], givre: [158, 231, 255], etincelle: [255, 233, 92]};
const sprites = {}; // id -> ImageData du sprite (chargé une fois)

function loadSprite(id) {
  if (sprites[id] !== undefined) return;
  sprites[id] = null;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    sprites[id] = x.getImageData(0, 0, img.width, img.height);
  };
  img.src = `assets/sprites/${id}.png`;
}

// HTML du portrait d'un ennemi : un canvas si le monstre a une grille, sinon le sprite (ou l'emoji)
export function digPortrait(e, i, scale) {
  const g = GRIDS[e.id];
  if (!g || !e.dig) return spr(e.id, e.por);
  loadSprite(e.id);
  return `<canvas class="dig" data-e="${i}" width="${g.w}" height="${g.h}" style="width:${g.w * scale}px;height:${g.h * scale}px;--px:${scale}px" title="Clique pour viser une veine ou le cœur"></canvas>`;
}

// Plus grand agrandissement entier (×4, ×3, sinon ×2) où toute la vague tient dans la zone des monstres
export function digScale(enemies, width, height) {
  const size = e => GRIDS[e.id] || {w: 48, h: 48};
  const fits = s =>
    enemies.reduce((sum, e) => sum + Math.max(PLATE_W, size(e).w * s), UNIT_GAP * (enemies.length - 1)) <= width &&
    Math.max(...enemies.map(e => size(e).h * s)) + PLATE_H <= height;
  return SCALES.find(fits) || SCALES.at(-1);
}

const isExposed = (d, i) => {
  const x = i % d.w,
    y = (i - x) / d.w;
  return [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ].some(([dx, dy]) => {
    const nx = x + dx,
      ny = y + dy;
    return nx < 0 || ny < 0 || nx >= d.w || ny >= d.h || !d.cls[ny * d.w + nx];
  });
};

// Couleur d'un pixel encore en place : veine teintée, cœur qui scintille une fois mis à nu, sinon celle du sprite
function pixelColor(src, d, i, vein, blink) {
  const c = d.cls[i],
    r = src.data[i * 4],
    g = src.data[i * 4 + 1],
    b = src.data[i * 4 + 2];
  if (c === 'veine' && vein) return [(r + vein[0] * 2) / 3, (g + vein[1] * 2) / 3, (b + vein[2] * 2) / 3, 255];
  if (c === 'rare' && isExposed(d, i)) {
    const k = blink ? 255 : 200;
    return [k, k, 160 + blink * 60, 255];
  }
  return [r, g, b, 255];
}

// Redessine un ennemi : pixels creusés en silhouette pâle, veines teintées, cœur qui scintille une fois mis à nu, viseur.
export function drawDig(cv, e, t) {
  const src = sprites[e.id],
    d = e.dig;
  if (!src || !d) return;
  const ctx = cv.getContext('2d'),
    out = ctx.createImageData(d.w, d.h),
    comp = COMPOSITION[e.id];
  const vein = comp.veine && !comp.veine.sprite ? VEIN_COLOR[comp.veine.mat] : null;
  const blink = Math.floor(t * 5) % 2,
    shape = GRIDS[e.id].cells;
  for (let i = 0; i < d.cls.length; i++) {
    if (d.cls[i]) out.data.set(pixelColor(src, d, i, vein, blink), i * 4);
    else if (shape[i] !== '.') out.data.set(HOLLOW, i * 4); // pixel déjà creusé : on voit où il était
  }
  ctx.putImageData(out, 0, 0);
  if (d.target) {
    ctx.strokeStyle = 'rgba(240,192,74,.9)';
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(d.target.x) - 2.5, Math.round(d.target.y) - 2.5, 5, 5);
  }
}

// Clic sur un ennemi : le héros creusera vers ce point
export function onDigClick(ev) {
  const cv = ev.target.closest('canvas.dig'),
    a = S.G.run.action;
  const e = cv && a?.enemies?.[+cv.dataset.e];
  if (!e) return; // entre deux vagues : rien à viser
  const r = cv.getBoundingClientRect(),
    g = GRIDS[e.id];
  aimAt(S.G, +cv.dataset.e, ((ev.clientX - r.left) / r.width) * g.w, ((ev.clientY - r.top) / r.height) * g.h);
}

// Éclats : quelques pixels retirés jaillissent du monstre avec leur couleur ; ceux que le marteau a brisés, en blanc
export function digParticles(unit, id, w, idx, broken = []) {
  const cv = unit?.querySelector('canvas.dig'),
    src = sprites[id];
  if (!cv || !src) return;
  const shattered = new Set(broken),
    scale = cv.offsetWidth / cv.width; // éclats à l'échelle de la grille affichée
  const ox = cv.offsetLeft,
    oy = cv.offsetTop,
    pick = idx.length > 10 ? idx.filter((i, k) => k % Math.ceil(idx.length / 10) === 0 || shattered.has(i)) : idx;
  for (const i of pick) {
    const x = i % w,
      y = (i - x) / w,
      p = document.createElement('i');
    const bg = shattered.has(i) ? '#ffffff' : `rgb(${src.data[i * 4]},${src.data[i * 4 + 1]},${src.data[i * 4 + 2]})`;
    p.className = shattered.has(i) ? 'chip-px broke' : 'chip-px';
    const size = (shattered.has(i) ? 3 : 2) * scale;
    p.style.cssText = `left:${ox + x * scale}px;top:${oy + y * scale}px;width:${size}px;height:${size}px;background:${bg};--dx:${(fxRandom() * 2 - 1) * 15 * scale}px`;
    unit.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}
