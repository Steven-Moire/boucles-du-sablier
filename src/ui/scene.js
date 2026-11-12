import {BIOMES, SKILLS, TILE_MAP} from '../data.js';
import {buildSegments, retreat, skillUnlocked} from '../engine.js';
import {$, S, SCENE_BG, fmt, sceneBgOk, setHTML, spr} from './state.js';
import {segFill} from './map.js';
import {consumeEvents, render} from './main.js';

// ---------- scène de combat ----------
let sceneKey = '';
export function segBar(t, a, done){
  const n = buildSegments(t).length; let cells = '';
  for (let i = 0; i < n; i++){
    if (done) cells += '<i class="f"></i>';
    else if (a && a.id === t.id){
      if (i < a.seg) cells += '<i class="f"></i>';
      else if (i === a.seg) cells += `<i class="cur" style="--p:${Math.round(segFill(a) * 100)}%"></i>`;
      else cells += '<i></i>';
    } else cells += '<i></i>';
  }
  return `<div class="segs">${cells}</div>`;
}
export function renderScene(){
  const r = S.G.run, a = r.action, h = r.hero;
  const tId = a ? a.id : S.lastSceneTile, t = tId && TILE_MAP[tId];
  const grad = t && BIOMES[t.biome].scene ? BIOMES[t.biome].scene : 'linear-gradient(180deg,#2a2e39,#1a1c22)';
  const bgImg = t && sceneBgOk[t.biome];
  $('sceneView').style.background = bgImg ? `url(assets/sprites/${SCENE_BG[t.biome]}.png) center bottom / cover no-repeat, ${grad}` : grad;
  $('sceneView').classList.toggle('has-bg', !!bgImg);
  const done = t && r.completed.has(t.id) && !a;
  setHTML($('scTitle'), t ? `<b>${t.name}</b> <span>· Niveau ${t.lvl}</span>${segBar(t, a, done)}<div class="segcap"><span>${a && a.phase === 'fight' ? 'VAGUE ' + (a.seg + 1) + '/' + a.segs.length : 'EXPLORATION'}</span><span>${done ? 'EXPLORÉ' : ''}</span></div>`
    : `<b>Aucune exploration</b> <span>· choisis une case sur la carte</span>`);
  // ennemis / message
  const key = a ? `${a.id}|${a.seg}|${a.phase}` : 'idle|' + (r.over ? 'over' : done ? 'done' : 'wait');
  const box = $('scEnemies');
  if (key !== sceneKey){
    sceneKey = key;
    if (a && a.phase === 'fight' && a.enemies){
      box.innerHTML = a.enemies.map((e, i) => `<div class="unit ${e.rank}" id="u-e${i}"><div class="por">${spr(e.id, e.por)}</div><div class="nm"><b>${e.lvl}</b>${e.name}</div><div class="bar hp enemy"><i></i><span></span></div><div class="swing"><i></i></div></div>`).join('');
    } else {
      let big = '⏳', txt = 'Le héros attend tes ordres.', bar = false;
      if (a){
        big = {walk:'🚶', harvest:a.segs[a.seg] && a.segs[a.seg].res === 'ore' ? '⛏️' : '🪓', rest:'💧', chest:'🎁'}[a.phase] || '…';
        txt = {walk:'En route…', harvest:'Récolte en cours', rest:'Repos à la source : +10 % PV / s', chest:'Fouille de l\'autel'}[a.phase] || '';
        bar = a.phase !== 'walk';
      } else if (r.over) { big = '⌛'; txt = 'La boucle se referme…'; }
      else if (done) { big = '✅'; txt = 'Zone explorée. Choisis la suite sur la carte.'; }
      box.innerHTML = `<div class="sc-msg"><div class="big">${big}</div><div>${txt}</div>${bar ? '<div class="bar thin"><i id="phaseBar" style="background:var(--gold)"></i></div>' : ''}${!a ? '<button class="btn small" data-view="map" style="margin-top:12px">VOIR LA CARTE</button>' : ''}</div>`;
    }
  }
  if (a && a.phase === 'fight' && a.enemies){
    a.enemies.forEach((e, i) => {
      const u = $('u-e' + i); if (!u) return;
      u.querySelector('.bar i').style.width = (Math.max(0, e.hp) / e.maxHp * 100) + '%';
      u.querySelector('.bar span').textContent = Math.max(0, Math.ceil(e.hp));
      u.querySelector('.swing i').style.width = (Math.max(0, e.t) / e.speed * 100) + '%';
      u.classList.toggle('dead', e.hp <= 0);
    });
  } else if (a && $('phaseBar')) $('phaseBar').style.width = ((a.phase === 'rest' ? h.hp / h.maxHp : Math.min(1, a.t / a.dur)) * 100) + '%';
  // héros
  $('heroLv').textContent = h.lvl;
  $('heroHpBar').style.width = (h.hp / h.maxHp * 100) + '%';
  $('heroHpTxt').textContent = `${fmt(h.hp)} / ${h.maxHp}`;
  $('heroSwing').style.width = (a && a.phase === 'fight' ? Math.min(1, a.heroT / h.speed) * 100 : 0) + '%';
  // compétences
  const sk = [`<div class="skill" title="Attaque — toutes les ${h.speed} s"><span>⚔️</span><div class="cd" style="--p:${a && a.phase === 'fight' ? 1 - Math.min(1, a.heroT / h.speed) : 0}"></div></div>`];
  for (const k in SKILLS){
    const s = SKILLS[k];
    if (!skillUnlocked(S.G.meta, k)){ sk.push(`<div class="skill lock" title="${s.name} — débloqué par : ${s.unlock.txt}">🔒</div>`); continue; }
    const p = 1 - r.skillT[k] / s.cd, ready = p <= 0;
    sk.push(`<div class="skill ${ready ? 'ready' : ''}" id="sk-${k}" title="${s.name} — ${s.desc} (recharge ${s.cd} s)"><span>${s.icon}</span><div class="cd" style="--p:${p.toFixed(3)}"></div>${ready ? '' : `<small>${Math.ceil(p * s.cd)}</small>`}</div>`);
  }
  const skBox = $('scSkills'), skKey = Object.keys(SKILLS).map(k => skillUnlocked(S.G.meta, k) ? 1 : 0).join('');
  if (skBox._k !== skKey){ skBox._k = skKey; skBox.innerHTML = sk.join(''); }
  else Array.from(skBox.children).forEach((c, i) => { const tmp = document.createElement('div'); tmp.innerHTML = sk[i]; const n = tmp.firstChild; c.className = n.className; c.innerHTML = n.innerHTML; });
  $('retreatBtn').disabled = !a || !!r.over;
  $('retreatBtn').textContent = a && a.phase === 'rest' ? 'REPRENDRE LA ROUTE' : 'BATTRE EN RETRAITE';
}
$('retreatBtn').addEventListener('click', () => { retreat(S.G); consumeEvents(); render(); });
$('sceneView').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b){ S.view = b.dataset.view; render(); } });

export function unitEl(key){ return key === 'hero' ? $('u-hero') : $('u-' + key); }
export function anim(el, cls){ if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
export function floatNum(key, text, cls){
  const el = unitEl(key); if (!el) return;
  const f = document.createElement('div'); f.className = 'float ' + (cls || ''); f.textContent = text;
  f.style.marginLeft = (Math.random() * 40 - 20) + 'px';
  el.appendChild(f); setTimeout(() => f.remove(), 1000);
}

