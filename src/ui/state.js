import {TILES, UPGRADES} from '../data.js';
import {createGame, upgradeState} from '../engine.js';
import {lcg} from '../rng.js';
import {readMeta, writeMeta} from './save.js';

// ======================= INTERFACE =======================
// renvoie {ok, error} : le jeu continue même si la sauvegarde échoue (voir save.js)
export const saveMeta = () => writeMeta(S.G.meta);

// état de l'interface partagé entre modules (un module ES ne peut pas réaffecter une variable importée)
const savedMeta = readMeta().meta;
export const hadSave = savedMeta !== null; // l'intro ne se joue qu'au tout premier lancement
export const S = {
  G: createGame(savedMeta),
  gameSpeed: 1,
  tab: 'explore',
  view: 'map',
  selected: TILES[2].id,
  modalMode: null,
  backTimer: null,
  lastSceneTile: null,
};
export const $ = id => document.getElementById(id);
export const fmt = n => Math.round(n).toLocaleString('fr-FR');
export const pct = n => Math.round(n * 100) + ' %';
export const setHTML = (el, html) => {
  if (el._h !== html) {
    el.innerHTML = html;
    el._h = html;
  }
};
export const anyUpgrade = () => Object.keys(UPGRADES).some(k => upgradeState(S.G, k).ok);
// sprite pixel art (assets/sprites/<clé>.png) ; si l'image manque, l'emoji (alt) prend sa place
export const spr = (key, emoji) =>
  `<img class="spr" src="assets/sprites/${key}.png" alt="${emoji}" onerror="this.outerHTML=this.alt">`;
export const SCENE_BG = {pres: 'bg_pres', collines: 'bg_collines'};
export const sceneBgOk = {};
for (const b in SCENE_BG) {
  const im = new Image();
  im.onload = () => {
    sceneBgOk[b] = true;
  };
  im.src = `assets/sprites/${SCENE_BG[b]}.png`;
}
// hasard des effets visuels (éclats, nombres flottants) : séparé de G.rng, un effet ne consomme jamais un tirage du jeu
export const fxRandom = lcg(Date.now() % 4294967296);
// relance l'animation portée par la classe cls ; la classe est retirée à la fin pour pouvoir la reposer,
// et si l'animation tourne encore, elle repart du début
export function anim(el, cls) {
  if (!el) return;
  if (el.classList.contains(cls)) {
    for (const a of el.getAnimations()) a.currentTime = 0;
    return;
  }
  el.classList.add(cls);
  const done = e => {
    if (e.target !== el) return; // animationend remonte aussi depuis les enfants (nombres flottants, éclats)
    el.classList.remove(cls);
    el.removeEventListener('animationend', done);
  };
  el.addEventListener('animationend', done);
}
export const loopFresh = () => {
  const r = S.G.run;
  return !r.over && !r.action && r.completed.size === 1 && r.timeLeft === r.timeMax;
};

// ---------- toasts ----------
export function toast(title, text) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.innerHTML = `<b>${title}</b>${text}`;
  $('toasts').appendChild(d);
  setTimeout(() => d.remove(), 4000);
}
