// Colonne du héros, toujours affichée à gauche : portrait, PV, XP, stats, outil (haut) ; équipement, journal (bas).
// La fin de boucle est à l'horloge du village (« Laisser filer le sablier », village/village.view.js).
// Sur écran étroit, le haut devient une bande au-dessus des onglets et le bas passe sous leur contenu (CSS).
import {TOOLS, xpNeeded} from './hero.data.js';
import {setTool} from './hero.engine.js';
import {RECIPES, SLOTS} from '../village/forge.data.js';
import {S, saveMeta} from '../shared/state.js';
import {$, setHTML} from '../shared/dom.js';
import {fmt, pct} from '../shared/format.js';
import {spr} from '../shared/templates.js';
import {requestRender} from '../shared/render.js';

function identityHTML(h) {
  return `<div class="hp-id"><div class="hp-por">${spr('heros', '🧙')}</div><div class="hp-bars">
    <div class="hp-nm">HÉROS <b>Niv ${h.lvl}</b></div>
    <div class="barline" title="PV : ${fmt(h.hp)} / ${h.maxHp}"><span>❤️</span><div class="bar hp"><i style="width:${(h.hp / h.maxHp) * 100}%"></i></div><span class="n">${fmt(h.hp)} / ${h.maxHp}</span></div>
    <div class="barline" title="XP : ${fmt(h.xp)} / ${xpNeeded(h.lvl)}"><span>✨</span><div class="bar xp thin"><i style="width:${(h.xp / xpNeeded(h.lvl)) * 100}%"></i></div><span class="n">${fmt(h.xp)} / ${xpNeeded(h.lvl)} XP</span></div>
  </div></div>`;
}
function statsHTML(h) {
  return `<div class="stats"><div>Puissance <b>${h.pow.toFixed(1)}</b></div><div>Armure <b>${h.arm.toFixed(1)}</b></div><div>Esquive <b>${pct(h.dodge)}</b></div><div>Critique <b>${pct(h.crit)}</b></div></div>`;
}
// palier forgé de l'outil choisi (porté pendant cette boucle)
function forgedToolText(key) {
  const r = RECIPES[S.G.meta.equip[key]];
  return r ? `<br>Forgé : <b>${r.name}</b>. ${r.desc}` : '';
}
// choix de l'outil avant d'entrer sur une case de combat (l'action en cours garde le sien)
function toolsHTML() {
  const cur = S.G.meta.tool,
    a = S.G.run.action;
  const busy =
    a && a.tool !== cur
      ? `<br>Le combat en cours garde ${TOOLS[a.tool].icon} ${TOOLS[a.tool].name.toLowerCase()} : le nouvel outil servira à la case suivante.`
      : '';
  return `<div class="divh"><span>OUTIL</span></div><div class="tools">${Object.entries(TOOLS)
    .map(
      ([k, o]) =>
        `<button data-tool="${k}" class="${k === cur ? 'on' : ''}" title="${o.desc}">${o.icon} ${o.name}</button>`,
    )
    .join('')}</div>
    <div class="note">${TOOLS[cur].desc}${forgedToolText(cur)}${busy}</div>`;
}
// équipement porté pendant la boucle : un emplacement par ligne, « — » s'il est vide
function equipHTML() {
  const e = S.G.meta.equip;
  const line = ([k, s]) => {
    const r = RECIPES[e[k]];
    return `<div class="row"><span class="k">${s.icon} ${s.name}</span><span class="${r ? '' : 'k'}">${r ? r.name : '—'}</span></div>`;
  };
  return `<div class="sec"><h3>ÉQUIPEMENT</h3>${Object.entries(SLOTS).map(line).join('')}</div>`;
}
const logLine = l => `<div class="${l.cls || ''}">${l.text}</div>`;
function logHTML() {
  return `<div class="sec"><h3>JOURNAL</h3><div class="log">${S.G.run.log.map(logLine).join('')}</div></div>`;
}

export function renderHeroPanel() {
  const h = S.G.run.hero;
  setHTML($('heroTop'), identityHTML(h) + statsHTML(h) + toolsHTML());
  setHTML($('heroMore'), equipHTML() + logHTML());
}
function onHeroClick(e) {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (!b.dataset.tool) return;
  setTool(S.G, b.dataset.tool);
  saveMeta();
  requestRender();
}
$('heroTop').addEventListener('click', onHeroClick);
$('heroMore').addEventListener('click', onHeroClick);
