import {MONSTERS} from '../enemies/enemies.data.js';
import {UPGRADES} from '../village/village.data.js';
import {S, saveMeta} from '../shared/state.js';
import {$, anim, toast} from '../shared/dom.js';
import {gotText} from '../shared/format.js';
import {requestRender} from '../shared/render.js';
import {floatNum, unitEl} from '../combat/scene.view.js';
import {digParticles} from '../mining/dig.view.js';
import {openBoss, openLoopEnd} from '../modals/loop-end.view.js';

// ---------- événements & boucle principale ----------
export function consumeEvents() {
  const fx = S.view === 'scene';
  for (const ev of S.G.events) {
    if (ev.type === 'hit' && fx) {
      floatNum(ev.tgt, '-' + ev.dmg + (ev.crit ? '!' : ''), ev.crit ? 'f-crit' : ev.skill ? 'f-sk' : '');
      anim(unitEl(ev.src), ev.src === 'hero' ? 'atk-u' : 'atk-d');
      anim(unitEl(ev.tgt), 'shake');
    } else if (ev.type === 'miss' && fx) floatNum(ev.tgt, ev.tgt === 'hero' ? 'esquive' : 'raté', 'f-miss');
    else if (ev.type === 'heal' && fx) floatNum(ev.tgt, '+' + ev.n, 'f-heal');
    else if (ev.type === 'skill' && fx) anim($('sk-' + ev.key), 'fire');
    else if (ev.type === 'explore') {
      clearTimeout(S.backTimer);
      S.lastSceneTile = ev.id;
      S.view = 'scene';
    } else if (ev.type === 'tileDone' || ev.type === 'retreat') {
      clearTimeout(S.backTimer);
      S.backTimer = setTimeout(() => {
        if (!S.G.run.action) {
          S.view = 'map';
          requestRender();
        }
      }, 900);
    } else if (ev.type === 'level' && fx) floatNum('hero', 'NIVEAU ' + ev.lvl, 'f-lv');
    else if (ev.type === 'dig' && fx) digParticles(unitEl(ev.tgt), ev.id, ev.w, ev.idx, ev.broken);
    else if (ev.type === 'kill' && fx && gotText(ev.got)) floatNum(ev.tgt, gotText(ev.got), 'f-loot');
    else if (ev.type === 'trophy') {
      const tr = MONSTERS[ev.id].trophy;
      toast('🏆 TROPHÉE UNIQUE', `${tr.icon} ${tr.name} — ${tr.desc} (permanent)`);
      saveMeta();
    } else if (ev.type === 'unlock') {
      const u = UPGRADES[ev.key];
      toast('❗ NOUVEAU BÂTIMENT', `${u.icon} ${u.name} est disponible au village.`);
    } else if (ev.type === 'loopEnd') {
      saveMeta();
      if (S.modalMode !== 'boss') openLoopEnd();
    } else if (ev.type === 'boss') {
      saveMeta();
      openBoss();
    }
  }
  S.G.events.length = 0;
}
