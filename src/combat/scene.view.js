import {BIOMES, TILE_MAP} from '../world/world.data.js';
import {SKILLS} from '../hero/hero.data.js';
import {actionTool, heroEvery, skillUnlocked} from '../hero/hero.engine.js';
import {retreat} from '../world/explore.engine.js';
import {S} from '../shared/state.js';
import {$, setHTML} from '../shared/dom.js';
import {fmt} from '../shared/format.js';
import {fxRandom} from '../shared/rng.js';
import {segBar} from '../shared/templates.js';
import {requestRender} from '../shared/render.js';
import {digPortrait, drawDig, onDigClick} from '../mining/dig.view.js';

// ---------- scène de combat ----------
let sceneKey = '';
// fonds de scène : préchargés, affichés seulement une fois chargés
export const SCENE_BG = {pres: 'bg_pres', collines: 'bg_collines'};
export const sceneBgOk = {};
for (const b in SCENE_BG) {
  const im = new Image();
  im.onload = () => {
    sceneBgOk[b] = true;
  };
  im.src = `assets/sprites/${SCENE_BG[b]}.png`;
}
const DEFAULT_SCENE_BG = 'linear-gradient(180deg,#2a2e39,#1a1c22)';
const PHASE_ICON = {walk: '🚶', rest: '💧', chest: '🎁'};
const PHASE_TEXT = {
  walk: 'En route…',
  harvest: 'Récolte en cours',
  rest: 'Repos à la source : +10 % PV / s',
  chest: "Fouille de l'autel",
};
const PHASE_BAR_HTML = '<div class="bar thin"><i id="phaseBar" style="background:var(--gold)"></i></div>';
const MAP_BUTTON_HTML = '<button class="btn small" data-tab="map" style="margin-top:12px">VOIR LA CARTE</button>';
const isFight = a => a?.phase === 'fight';
const hasEnemies = a => isFight(a) && !!a.enemies;

function sceneTile(a) {
  const tId = a ? a.id : S.lastSceneTile;
  return tId && TILE_MAP[tId];
}
function renderSceneBg(t) {
  const grad = t && BIOMES[t.biome].scene ? BIOMES[t.biome].scene : DEFAULT_SCENE_BG;
  const hasBg = !!t && !!sceneBgOk[t.biome];
  const view = $('sceneView');
  view.style.background = hasBg
    ? `url(assets/sprites/${SCENE_BG[t.biome]}.png) center bottom / cover no-repeat, ${grad}`
    : grad;
  view.classList.toggle('has-bg', hasBg);
}
function waveCaption(a) {
  return isFight(a) ? 'VAGUE ' + (a.seg + 1) + '/' + a.segs.length : 'EXPLORATION';
}
function sceneTitleHTML(t, a, done) {
  if (!t) return `<b>Aucune exploration</b> <span>· choisis une case sur la carte</span>`;
  return `<b>${t.name}</b> <span>· Niveau ${t.lvl}</span>${segBar(t, a, done)}<div class="segcap"><span>${waveCaption(a)}</span><span>${done ? 'EXPLORÉ' : ''}</span></div>`;
}
function idleState(r, done) {
  if (r.over) return 'over';
  return done ? 'done' : 'wait';
}
function sceneKeyOf(r, a, done) {
  return a ? `${a.id}|${a.seg}|${a.phase}` : 'idle|' + idleState(r, done);
}
function enemyUnitHTML(e, i) {
  return `<div class="unit ${e.rank}" id="u-e${i}"><div class="por">${digPortrait(e, i)}</div><div class="nm"><b>${e.lvl}</b>${e.name}</div><div class="bar hp enemy"><i></i><span></span></div><div class="swing"><i></i></div></div>`;
}
function phaseIcon(a) {
  if (a.phase === 'harvest') return a.segs[a.seg]?.res === 'ore' ? '⛏️' : '🪓';
  return PHASE_ICON[a.phase] || '…';
}
// message affiché quand il n'y a pas d'ennemis : {big, txt, bar}
function sceneMessage(r, a, done) {
  if (a) return {big: phaseIcon(a), txt: PHASE_TEXT[a.phase] || '', bar: a.phase !== 'walk'};
  if (r.over) return {big: '⌛', txt: 'La boucle se referme…', bar: false};
  if (done) return {big: '✅', txt: 'Zone explorée. Choisis la suite sur la carte.', bar: false};
  return {big: '⏳', txt: 'Le héros attend tes ordres.', bar: false};
}
function messageHTML(r, a, done) {
  const {big, txt, bar} = sceneMessage(r, a, done);
  return `<div class="sc-msg"><div class="big">${big}</div><div>${txt}</div>${bar ? PHASE_BAR_HTML : ''}${a ? '' : MAP_BUTTON_HTML}</div>`;
}
// ennemis / message : reconstruits seulement quand la vague ou la phase change
function renderSceneBody(r, a, done) {
  const key = sceneKeyOf(r, a, done);
  if (key === sceneKey) return;
  sceneKey = key;
  $('scEnemies').innerHTML = hasEnemies(a) ? a.enemies.map(enemyUnitHTML).join('') : messageHTML(r, a, done);
}
function updateEnemyUnit(e, i) {
  const u = $('u-e' + i);
  if (!u) return;
  u.querySelector('.bar i').style.width = (Math.max(0, e.hp) / e.maxHp) * 100 + '%';
  u.querySelector('.bar span').textContent = Math.max(0, Math.ceil(e.hp));
  u.querySelector('.swing i').style.width = (Math.max(0, e.t) / e.speed) * 100 + '%';
  u.classList.toggle('dead', e.hp <= 0);
  const cv = u.querySelector('canvas.dig');
  if (cv) drawDig(cv, e, performance.now() / 1000);
}
function renderLiveBars(a, h) {
  if (hasEnemies(a)) {
    a.enemies.forEach(updateEnemyUnit);
    return;
  }
  if (!a) return;
  const bar = $('phaseBar');
  if (bar) bar.style.width = (a.phase === 'rest' ? h.hp / h.maxHp : Math.min(1, a.t / a.dur)) * 100 + '%';
}
function renderHero(h, a, every) {
  $('heroLv').textContent = h.lvl;
  $('heroHpBar').style.width = (h.hp / h.maxHp) * 100 + '%';
  $('heroHpTxt').textContent = `${fmt(h.hp)} / ${h.maxHp}`;
  $('heroSwing').style.width = (isFight(a) ? Math.min(1, a.heroT / every) * 100 : 0) + '%';
}
// compétences : l'outil de la case en cours, puis les compétences (verrouillées ou en recharge)
function toolSkillHTML(tool, every, a) {
  const p = isFight(a) ? 1 - Math.min(1, a.heroT / every) : 0;
  return `<div class="skill" title="${tool.name} — frappe toutes les ${every.toFixed(2)} s"><span>${tool.icon}</span><div class="cd" style="--p:${p}"></div></div>`;
}
function skillHTML(k, r) {
  const s = SKILLS[k];
  if (!skillUnlocked(S.G.meta, k))
    return `<div class="skill lock" title="${s.name} — débloqué par : ${s.unlock.txt}">🔒</div>`;
  const p = 1 - r.skillT[k] / s.cd,
    ready = p <= 0;
  const left = ready ? '' : `<small>${Math.ceil(p * s.cd)}</small>`;
  return `<div class="skill ${ready ? 'ready' : ''}" id="sk-${k}" title="${s.name} — ${s.desc} (recharge ${s.cd} s)"><span>${s.icon}</span><div class="cd" style="--p:${p.toFixed(3)}"></div>${left}</div>`;
}
function patchSkill(c, html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const n = tmp.firstChild;
  c.className = n.className;
  c.innerHTML = n.innerHTML;
}
function renderSkills(r, a, tool, every) {
  const sk = [toolSkillHTML(tool, every, a), ...Object.keys(SKILLS).map(k => skillHTML(k, r))];
  const skBox = $('scSkills'),
    skKey = Object.keys(SKILLS)
      .map(k => (skillUnlocked(S.G.meta, k) ? 1 : 0))
      .join('');
  if (skBox._k !== skKey) {
    skBox._k = skKey;
    skBox.innerHTML = sk.join('');
    return;
  }
  Array.from(skBox.children).forEach((c, i) => patchSkill(c, sk[i]));
}
function renderRetreat(r, a) {
  const btn = $('retreatBtn');
  btn.disabled = !a || !!r.over;
  btn.textContent = a?.phase === 'rest' ? 'REPRENDRE LA ROUTE' : 'BATTRE EN RETRAITE';
}
export function renderScene() {
  const r = S.G.run,
    a = r.action,
    h = r.hero;
  const t = sceneTile(a);
  renderSceneBg(t);
  const done = !!t && r.completed.has(t.id) && !a;
  setHTML($('scTitle'), sceneTitleHTML(t, a, done));
  renderSceneBody(r, a, done);
  renderLiveBars(a, h);
  const every = heroEvery(S.G),
    tool = actionTool(S.G); // cadence de l'outil de la case en cours
  renderHero(h, a, every);
  renderSkills(r, a, tool, every);
  renderRetreat(r, a);
}
$('retreatBtn').addEventListener('click', () => {
  retreat(S.G);
  requestRender();
});
$('sceneView').addEventListener('click', e => {
  const b = e.target.closest('[data-tab]');
  if (b) {
    S.tab = b.dataset.tab;
    requestRender();
  }
});
$('scEnemies').addEventListener('click', onDigClick);

export function unitEl(key) {
  return key === 'hero' ? $('u-hero') : $('u-' + key);
}
export function floatNum(key, text, cls) {
  const el = unitEl(key);
  if (!el) return;
  const f = document.createElement('div');
  f.className = 'float ' + (cls || '');
  f.textContent = text;
  f.style.marginLeft = fxRandom() * 40 - 20 + 'px';
  el.appendChild(f);
  setTimeout(() => f.remove(), 1000);
}
