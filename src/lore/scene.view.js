// Scène jouée du premier combat (R2) et bulle du premier matin (texte : docs/lore.md, données : lore.data.js).
// Le moteur suspend le jeu (G.run.hold) à chaque geste et émet scene / vestige ; ici, une bulle par geste.
// Passable d'un clic, pas d'un bloc (clic ignoré pendant MIN_SHOW), 20 s au plus : 6 s + 8 s + 6 s.
import {FIRST_FIGHT, FIRST_MORNING, VESTIGES} from './lore.data.js';
import {resumeScene} from './scene.engine.js';
import {aimAt} from '../combat/combat.engine.js';
import {GRIDS} from '../enemies/grids.generated.js';
import {S, saveMeta} from '../shared/state.js';
import {$} from '../shared/dom.js';
import {fxRandom} from '../shared/rng.js';
import {requestRender} from '../shared/render.js';

const MIN_SHOW = 800, // ms : un clic plus rapide ne passe pas la bulle (pas d'un bloc)
  AUTO_CLOSE = 6000, // ms : une bulle se ferme seule
  HEART_WAIT = 8000, // ms : sans clic sur le cœur, le héros le vise lui-même
  HEART_LINE = 3000, // ms : la deuxième réplique reste affichée pendant que le jeu reprend
  HEART_NEAR = 3, // pixels de grille : un clic aussi près du cœur compte
  FLY_MAX = 10; // pixels qui partent vers le héros au premier coup
let say = null; // bulle affichée : {el, at, timer, next}

// une bulle de la scène est à l'écran ou attendue (pas pendant que le héros descend vers le cœur)
export const sceneActive = () => !!S.scene && S.scene.step !== 'heartLine';

// ---------- bulle ----------
function closeBubble() {
  if (!say) return;
  clearTimeout(say.timer);
  say.el.remove();
  say = null;
}
// haut de la bulle : au-dessus de l'ancre, ou dessous (say-below : en haut de l'écran, elle sortirait)
function bubbleTop(r, below) {
  if (!r) return 80;
  return below ? r.bottom : Math.max(16, r.top);
}
// bulle au-dessus de anchor ; next() est appelé au clic n'importe où (après MIN_SHOW) ou au bout de ms ;
// sans next, la bulle ne retient aucun clic et se ferme d'un clic sur elle-même
function bubble(anchor, html, {next = null, ms = AUTO_CLOSE, cls = ''} = {}) {
  closeBubble();
  const el = document.createElement('div');
  el.className = `say ${cls}`;
  el.innerHTML = html + (next ? '<small class="say-hint">clic pour continuer</small>' : '');
  if (!next) el.addEventListener('click', closeBubble);
  document.body.appendChild(el);
  const r = anchor?.getBoundingClientRect(),
    half = Math.min(150, window.innerWidth / 2 - 16);
  const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
  el.style.left = Math.max(16 + half, Math.min(window.innerWidth - 16 - half, x)) + 'px';
  el.style.top = bubbleTop(r, cls.includes('say-below')) + 'px';
  const done = () => {
    closeBubble();
    next?.();
  };
  say = {el, at: performance.now(), next: next && done, timer: setTimeout(done, ms)};
}
// un clic n'importe où passe la bulle en cours ; il ne va pas plus loin (ni visée, ni bouton)
document.addEventListener(
  'click',
  e => {
    if (!say?.next) return;
    e.stopPropagation();
    e.preventDefault();
    if (performance.now() - say.at >= MIN_SHOW) say.next();
  },
  true,
);

// ---------- premier matin ----------
export function showMorning() {
  bubble($('heroTop'), `<b>Le Radoteur</b>« ${FIRST_MORNING} »`, {cls: 'say-below'});
}

// ---------- premier combat ----------
const heroEl = () => $('u-hero');
const lineHTML = text => `<b>Le Radoteur</b>« ${text} »`;
const canvasOf = tgt => $('u-' + tgt)?.querySelector('canvas.dig');

// quelques pixels creusés partent du monstre vers le héros (vers son sac), avec leur couleur
function flyToHero(tgt, idx, w) {
  const cv = canvasOf(tgt),
    to = heroEl()?.getBoundingClientRect();
  if (!cv || !to) return;
  const ctx = cv.getContext('2d'),
    r = cv.getBoundingClientRect(),
    k = r.width / cv.width;
  const pick = idx.filter((_, n) => n % Math.ceil(idx.length / FLY_MAX) === 0);
  for (const i of pick) {
    const x = i % w,
      y = (i - x) / w,
      [cr, cg, cb] = ctx.getImageData(x, y, 1, 1).data;
    const p = document.createElement('i'),
      sx = r.left + x * k,
      sy = r.top + y * k;
    p.className = 'say-px';
    p.style.cssText = `left:${sx}px;top:${sy}px;width:${2 * k}px;height:${2 * k}px;background:rgb(${cr},${cg},${cb})`;
    document.body.appendChild(p);
    const dx = to.left + to.width / 2 - sx + (fxRandom() - 0.5) * 30,
      dy = to.top + to.height / 2 - sy;
    const a = p.animate([{transform: 'none'}, {transform: `translate(${dx}px,${dy}px) scale(.5)`, opacity: 0.2}], {
      duration: 900 + fxRandom() * 300,
      easing: 'ease-in',
    });
    a.onfinish = () => p.remove();
  }
}

function resume() {
  resumeScene(S.G);
  requestRender();
}
function endScene() {
  S.scene = null;
  S.heartHint = null;
  resume();
}
// la clé : dernière bulle, puis le jeu reprend et la scène est finie
function showKey() {
  const v = VESTIGES[FIRST_FIGHT.vestige];
  S.scene.step = 'key';
  S.heartHint = null;
  bubble(
    heroEl(),
    `<b>${v.icon} ${v.name}</b><span class="say-note">${v.text}</span><span class="say-stow">${FIRST_FIGHT.stow}</span>`,
    {next: endScene, cls: 'say-vestige'},
  );
}
// pixels du cœur encore en place
function heartCells(e) {
  const d = e.dig;
  return d ? d.cls.map((c, i) => (c === 'rare' ? i : -1)).filter(i => i >= 0) : [];
}
function aimHeart(i, x, y) {
  aimAt(S.G, i, x, y);
  S.heartHint = null;
  S.scene.step = 'heartLine';
  bubble(heroEl(), lineHTML(FIRST_FIGHT.heart), {ms: HEART_LINE});
  resume();
}
// deuxième geste : le joueur clique lui-même sur le cœur (qui clignote à travers la chair)
function askHeart() {
  const sc = S.scene;
  if (sc.killed) {
    showKey();
    return;
  }
  sc.step = 'heart';
  S.heartHint = sc.e;
  bubble(canvasOf(sc.tgt) || heroEl(), FIRST_FIGHT.heartHint, {ms: HEART_WAIT + 1000, cls: 'say-hint-only'});
  sc.timer = setTimeout(() => {
    const cells = heartCells(sc.e),
      w = sc.e.dig.w;
    if (sc.step !== 'heart') return;
    const n = cells.length || 1,
      cx = cells.reduce((s, i) => s + (i % w), 0) / n,
      cy = cells.reduce((s, i) => s + Math.floor(i / w), 0) / n;
    aimHeart(+sc.tgt.slice(1), cx, cy);
  }, HEART_WAIT);
}
// clic sur un monstre pendant que le cœur est attendu : près du cœur, il compte ; ailleurs, il ne fait rien
$('scEnemies').addEventListener(
  'click',
  ev => {
    const sc = S.scene;
    if (sc?.step !== 'heart') return;
    const cv = ev.target.closest('canvas.dig'),
      i = cv ? +cv.dataset.e : -1;
    const e = S.G.run.action?.enemies?.[i];
    ev.stopPropagation();
    if (e !== sc.e) return;
    const r = cv.getBoundingClientRect(),
      g = GRIDS[e.id],
      x = ((ev.clientX - r.left) / r.width) * g.w,
      y = ((ev.clientY - r.top) / r.height) * g.h;
    const cells = heartCells(e),
      near = !cells.length || cells.some(c => Math.hypot((c % g.w) - x, Math.floor(c / g.w) - y) <= HEART_NEAR);
    if (!near) return;
    clearTimeout(sc.timer);
    aimHeart(i, x, y);
  },
  true,
);

// événement scene (premier coup) : le jeu est suspendu par le moteur
export function onSceneEvent(ev) {
  const a = S.G.run.action;
  S.scene = {step: 'coup', tgt: ev.tgt, e: a?.enemies?.[+ev.tgt.slice(1)], killed: false, timer: null};
  S.tab = 'combat';
  flyToHero(ev.tgt, ev.idx, ev.w);
  bubble(heroEl(), lineHTML(FIRST_FIGHT.coup), {next: askHeart});
}
// événement vestige (mort du Mulot) : la clé, tout de suite ou après la bulle en cours
export function onVestigeEvent() {
  saveMeta();
  const sc = S.scene;
  if (!sc) {
    resume(); // scène sans UI (rechargement) : rien à montrer, le jeu repart
    return;
  }
  sc.killed = true;
  if (sc.step === 'coup') return; // tué au premier coup : la clé vient après la première bulle
  clearTimeout(sc.timer);
  showKey();
}
