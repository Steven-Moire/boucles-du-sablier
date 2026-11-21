// Tests de la scène du premier combat (R2) : une seule fois, sauvegardes anciennes, hasard intact — node --test
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame, newMeta} from '../src/world/loop.engine.js';
import {explore} from '../src/world/explore.engine.js';
import {step} from '../src/world/tick.engine.js';
import {replayScene, resumeScene} from '../src/lore/scene.engine.js';
import {lcg} from '../src/shared/rng.js';

const MULOTS = '4,5'; // Lisière de l'Aube : trois vagues de Mulots dentus
const DT = 0.05;

function game(scenes, meta = null) {
  const G = createGame(meta, lcg(7), lcg(11));
  G.scenes = scenes;
  explore(G, MULOTS);
  return G;
}
// joue jusqu'à la fin de la case ; à chaque suspension, l'UI « ferme la bulle » ; renvoie les événements de scène
function playTile(G) {
  const seen = [];
  for (let n = 0; n < 20000 && G.run.action && !G.run.over; n++) {
    step(G, DT);
    seen.push(...G.events.filter(e => e.type === 'scene' || e.type === 'vestige'));
    G.events.length = 0;
    if (G.run.hold) resumeScene(G);
  }
  return seen;
}

test('sans G.scenes (la simu) : aucune scène, aucun vestige', () => {
  const G = game(false);
  assert.deepEqual(playTile(G), []);
  assert.deepEqual(G.meta.vestiges, {});
  assert.equal(G.meta.scenes.premierCombat, undefined);
});

test('premier Mulot : la scène, puis la clé, une seule fois sur la case', () => {
  const G = game(true);
  const seen = playTile(G).map(e => e.type);
  assert.deepEqual(seen, ['scene', 'vestige']);
  assert.equal(G.meta.vestiges.cle, 1);
  assert.equal(G.meta.scenes.premierCombat, true);
});

test('pendant une bulle, le jeu est suspendu : ni coup ni sablier', () => {
  const G = game(true);
  while (!G.run.hold) step(G, DT);
  const t = G.run.timeLeft,
    hp = G.run.action.enemies[0].hp;
  for (let n = 0; n < 100; n++) step(G, DT);
  assert.equal(G.run.timeLeft, t);
  assert.equal(G.run.action.enemies[0].hp, hp);
});

test('hasard intact : avec ou sans scène, la même partie', () => {
  const A = game(false),
    B = game(true);
  playTile(A);
  playTile(B);
  assert.equal(A.run.timeLeft, B.run.timeLeft);
  assert.equal(A.run.hero.hp, B.run.hero.hp);
  assert.equal(A.rng(), B.rng());
  assert.equal(A.mrng(), B.mrng());
});

test('ancienne sauvegarde sans les champs : la scène se joue une fois', () => {
  const old = newMeta();
  delete old.scenes;
  delete old.vestiges;
  const G = game(true, old);
  assert.deepEqual(G.meta.scenes, {});
  assert.deepEqual(G.meta.vestiges, {});
  assert.deepEqual(
    playTile(G).map(e => e.type),
    ['scene', 'vestige'],
  );
});

test('rejouée depuis le bestiaire : la scène revient, la clé garde sa boucle', () => {
  const meta = newMeta();
  meta.scenes.premierCombat = true;
  meta.vestiges.cle = 1;
  meta.loop = 4;
  replayScene(meta);
  const G = game(true, meta);
  assert.deepEqual(
    playTile(G).map(e => e.type),
    ['scene', 'vestige'],
  );
  assert.equal(G.meta.vestiges.cle, 1);
});
