import {TILES, UPGRADES} from '../data.js';
import {createGame, upgradeState} from '../engine.js';

// ======================= INTERFACE =======================
export const SAVE_KEY = 'boucles-sablier-v01';
function loadMeta(){ try { const s = localStorage.getItem(SAVE_KEY); if (s){ const m = JSON.parse(s); if (m && m.v === 1) return m; } } catch(e){} return null; }
export function saveMeta(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(S.G.meta)); } catch(e){} }

// état de l'interface partagé entre modules (un module ES ne peut pas réaffecter une variable importée)
export const S = {G:createGame(loadMeta()), gameSpeed:1, tab:'explore', view:'map', selected:TILES[2].id, modalMode:null, backTimer:null, lastSceneTile:null};
export const $ = id => document.getElementById(id);
export const fmt = n => Math.round(n).toLocaleString('fr-FR');
export const pct = n => Math.round(n * 100) + ' %';
export const setHTML = (el, html) => { if (el._h !== html){ el.innerHTML = html; el._h = html; } };
export const anyUpgrade = () => Object.keys(UPGRADES).some(k => upgradeState(S.G, k).ok);
// sprite pixel art (assets/sprites/<clé>.png) ; si l'image manque, l'emoji (alt) prend sa place
export const spr = (key, emoji) => `<img class="spr" src="assets/sprites/${key}.png" alt="${emoji}" onerror="this.outerHTML=this.alt">`;
export const SCENE_BG = {pres:'bg_pres', collines:'bg_collines'};
export const sceneBgOk = {};
for (const b in SCENE_BG){ const im = new Image(); im.onload = () => { sceneBgOk[b] = true; }; im.src = `assets/sprites/${SCENE_BG[b]}.png`; }
export const loopFresh = () => { const r = S.G.run; return !r.over && !r.action && r.completed.size === 1 && r.timeLeft === r.timeMax; };

// ---------- toasts ----------
export function toast(title, text){
  const d = document.createElement('div'); d.className = 'toast';
  d.innerHTML = `<b>${title}</b>${text}`;
  $('toasts').appendChild(d); setTimeout(() => d.remove(), 4000);
}
