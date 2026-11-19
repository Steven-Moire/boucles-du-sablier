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
function hitClass(ev) {
  if (ev.crit) return 'f-crit';
  return ev.skill ? 'f-sk' : '';
}
// retour à la carte peu après la fin d'une case, si le héros n'est pas reparti
function backToMapSoon() {
  clearTimeout(S.backTimer);
  S.backTimer = setTimeout(() => {
    if (!S.G.run.action) {
      S.view = 'map';
      requestRender();
    }
  }, 900);
}
// effets visuels : seulement quand la scène de combat est affichée
const FX_HANDLERS = {
  hit: ev => {
    floatNum(ev.tgt, '-' + ev.dmg + (ev.crit ? '!' : ''), hitClass(ev));
    anim(unitEl(ev.src), ev.src === 'hero' ? 'atk-u' : 'atk-d');
    anim(unitEl(ev.tgt), 'shake');
  },
  miss: ev => floatNum(ev.tgt, ev.tgt === 'hero' ? 'esquive' : 'raté', 'f-miss'),
  heal: ev => floatNum(ev.tgt, '+' + ev.n, 'f-heal'),
  skill: ev => anim($('sk-' + ev.key), 'fire'),
  level: ev => floatNum('hero', 'NIVEAU ' + ev.lvl, 'f-lv'),
  dig: ev => digParticles(unitEl(ev.tgt), ev.id, ev.w, ev.idx, ev.broken),
  kill: ev => {
    if (gotText(ev.got)) floatNum(ev.tgt, gotText(ev.got), 'f-loot');
  },
};
// navigation, annonces et sauvegarde : quelle que soit la vue
const HANDLERS = {
  explore: ev => {
    clearTimeout(S.backTimer);
    S.lastSceneTile = ev.id;
    S.view = 'scene';
  },
  tileDone: backToMapSoon,
  retreat: backToMapSoon,
  trophy: ev => {
    const tr = MONSTERS[ev.id].trophy;
    toast('🏆 TROPHÉE UNIQUE', `${tr.icon} ${tr.name} — ${tr.desc} (permanent)`);
    saveMeta();
  },
  unlock: ev => {
    const u = UPGRADES[ev.key];
    toast('❗ NOUVEAU BÂTIMENT', `${u.icon} ${u.name} est disponible au village.`);
  },
  loopEnd: () => {
    saveMeta();
    if (S.modalMode !== 'boss') openLoopEnd();
  },
  boss: () => {
    saveMeta();
    openBoss();
  },
};
export function consumeEvents() {
  const fx = S.view === 'scene';
  for (const ev of S.G.events) {
    const handler = (fx && FX_HANDLERS[ev.type]) || HANDLERS[ev.type];
    if (handler) handler(ev);
  }
  S.G.events.length = 0;
}
