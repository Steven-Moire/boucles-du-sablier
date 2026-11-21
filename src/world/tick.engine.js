// Moteur pur (aucun DOM) : avance le jeu par pas de 50 ms. Seul module à importer le combat et l'exploration.
import {REST_RATE} from './world.data.js';
import {endLoop} from './loop.engine.js';
import {finishSegment} from './explore.engine.js';
import {fightStep} from '../combat/combat.engine.js';

export function tick(G, dt) {
  while (dt > 1e-9) {
    const s = Math.min(dt, 0.05);
    step(G, s);
    dt -= s;
  }
}
export function step(G, dt) {
  const r = G.run;
  if (!r || r.over || !r.action || r.hold) return; // hold : une scène suspend le jeu (lore/scene.engine.js)
  r.timeLeft -= dt;
  if (r.timeLeft <= 0) {
    r.timeLeft = 0;
    endLoop(G, 'time');
    return;
  }
  const a = r.action;
  if (a.phase === 'fight') {
    fightStep(G, dt);
    return;
  }
  if (a.phase === 'rest') {
    // +10 % PV max / s jusqu'à être plein
    const h = r.hero;
    h.hp = Math.min(h.maxHp, h.hp + REST_RATE * h.maxHp * dt);
    a.t += dt;
    if (h.hp >= h.maxHp && a.t >= 0.5) finishSegment(G);
    return;
  }
  a.t += dt;
  if (a.t >= a.dur) finishSegment(G);
}
