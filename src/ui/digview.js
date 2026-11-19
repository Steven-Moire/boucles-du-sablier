import {GRIDS} from '../grids.js';
import {COMPOSITION, MATS} from '../data.js';
import {aimAt} from '../engine.js';
import {S, spr} from './state.js';

// ---------- combat-minage : monstre dessiné pixel par pixel ----------
const SCALE = 2; // agrandissement entier (pixel art)
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
export function digPortrait(e, i) {
  const g = GRIDS[e.id];
  if (!g || !e.dig) return spr(e.id, e.por);
  loadSprite(e.id);
  return `<canvas class="dig" data-e="${i}" width="${g.w}" height="${g.h}" style="width:${g.w * SCALE}px;height:${g.h * SCALE}px" title="Clique pour viser une veine ou le cœur"></canvas>`;
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

// Redessine un ennemi : pixels creusés transparents, veines teintées, cœur qui scintille une fois mis à nu, viseur.
export function drawDig(cv, e, t) {
  const src = sprites[e.id],
    d = e.dig;
  if (!src || !d) return;
  const ctx = cv.getContext('2d'),
    out = ctx.createImageData(d.w, d.h),
    comp = COMPOSITION[e.id];
  const vein = comp.veine && !comp.veine.sprite ? VEIN_COLOR[comp.veine.mat] : null;
  const blink = Math.floor(t * 5) % 2;
  for (let i = 0; i < d.cls.length; i++) {
    const c = d.cls[i];
    if (!c) continue;
    let r = src.data[i * 4],
      g = src.data[i * 4 + 1],
      b = src.data[i * 4 + 2];
    if (c === 'veine' && vein) {
      r = (r + vein[0] * 2) / 3;
      g = (g + vein[1] * 2) / 3;
      b = (b + vein[2] * 2) / 3;
    } else if (c === 'rare' && isExposed(d, i)) {
      const k = blink ? 255 : 200;
      r = k;
      g = k;
      b = 160 + blink * 60;
    }
    out.data[i * 4] = r;
    out.data[i * 4 + 1] = g;
    out.data[i * 4 + 2] = b;
    out.data[i * 4 + 3] = 255;
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
  const e = cv && a && a.enemies && a.enemies[+cv.dataset.e];
  if (!e) return; // entre deux vagues : rien à viser
  const r = cv.getBoundingClientRect(),
    g = GRIDS[e.id];
  aimAt(S.G, +cv.dataset.e, ((ev.clientX - r.left) / r.width) * g.w, ((ev.clientY - r.top) / r.height) * g.h);
}

// Éclats : quelques pixels retirés jaillissent du monstre avec leur couleur ; ceux que le marteau a brisés, en blanc
export function digParticles(unit, id, w, idx, broken = []) {
  const cv = unit && unit.querySelector('canvas.dig'),
    src = sprites[id];
  if (!cv || !src) return;
  const shattered = new Set(broken);
  const ox = cv.offsetLeft,
    oy = cv.offsetTop,
    pick = idx.length > 10 ? idx.filter((i, k) => k % Math.ceil(idx.length / 10) === 0 || shattered.has(i)) : idx;
  for (const i of pick) {
    const x = i % w,
      y = (i - x) / w,
      p = document.createElement('i');
    const bg = shattered.has(i) ? '#ffffff' : `rgb(${src.data[i * 4]},${src.data[i * 4 + 1]},${src.data[i * 4 + 2]})`;
    p.className = shattered.has(i) ? 'chip-px broke' : 'chip-px';
    p.style.cssText = `left:${ox + x * SCALE}px;top:${oy + y * SCALE}px;background:${bg};--dx:${(Math.random() * 2 - 1) * 30}px`;
    unit.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}

// Texte du butin extrait (ex. « +2 🟫 +1 🦴 »)
export const gotText = got =>
  Object.entries(got || {})
    .map(([k, n]) => `+${n} ${MATS[k].icon}`)
    .join(' ');
