import {MONSTERS, UPGRADES} from '../data.js';
import {tick} from '../engine.js';
import {$, S, saveMeta, toast} from './state.js';
import {renderMap} from './map.js';
import {anim, floatNum, renderScene, unitEl} from './scene.js';
import {renderPane, renderTabs, renderTop} from './panel.js';
import {openBoss, openLoopEnd} from './modals.js';

// ---------- événements & boucle principale ----------
export function consumeEvents(){
  const fx = S.view === 'scene';
  for (const ev of S.G.events){
    if (ev.type === 'hit' && fx){
      floatNum(ev.tgt, '-' + ev.dmg + (ev.crit ? '!' : ''), ev.crit ? 'f-crit' : ev.skill ? 'f-sk' : '');
      anim(unitEl(ev.src), ev.src === 'hero' ? 'atk-u' : 'atk-d'); anim(unitEl(ev.tgt), 'shake');
    }
    else if (ev.type === 'miss' && fx) floatNum(ev.tgt, ev.tgt === 'hero' ? 'esquive' : 'raté', 'f-miss');
    else if (ev.type === 'heal' && fx) floatNum(ev.tgt, '+' + ev.n, 'f-heal');
    else if (ev.type === 'skill' && fx) anim($('sk-' + ev.key), 'fire');
    else if (ev.type === 'explore'){ clearTimeout(S.backTimer); S.lastSceneTile = ev.id; S.view = 'scene'; }
    else if (ev.type === 'tileDone' || ev.type === 'retreat'){ clearTimeout(S.backTimer); S.backTimer = setTimeout(() => { if (!S.G.run.action){ S.view = 'map'; render(); } }, 900); }
    else if (ev.type === 'level' && fx) floatNum('hero', 'NIVEAU ' + ev.lvl, 'f-lv');
    else if (ev.type === 'trophy'){ const tr = MONSTERS[ev.id].trophy; toast('🏆 TROPHÉE UNIQUE', `${tr.icon} ${tr.name} — ${tr.desc} (permanent)`); saveMeta(); }
    else if (ev.type === 'unlock'){ const u = UPGRADES[ev.key]; toast('❗ NOUVEAU BÂTIMENT', `${u.icon} ${u.name} est disponible au village.`); }
    else if (ev.type === 'loopEnd'){ saveMeta(); if (S.modalMode !== 'boss') openLoopEnd(); }
    else if (ev.type === 'boss'){ saveMeta(); openBoss(); }
  }
  S.G.events.length = 0;
}
export function render(){ renderTop(); renderTabs(); renderMap(); if (S.view === 'scene') renderScene(); renderPane(); }
let last = performance.now(), saveT = 0;
setInterval(() => {
  const now = performance.now(), dt = Math.min(1, (now - last) / 1000); last = now;
  if (!S.modalMode) tick(S.G, dt * S.gameSpeed);
  consumeEvents();
  saveT += dt; if (saveT > 5){ saveT = 0; saveMeta(); }
  render();
}, 50);
render();
