// Tests du carnet du bestiaire : outil conseillé (étape 2b) — node --test
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newBestiaryEntry, recordFight, toolAdvice} from '../src/enemies/enemies.engine.js';
import {ADVICE} from '../src/enemies/enemies.data.js';
import {createGame} from '../src/world/loop.engine.js';
import {lcg} from '../src/shared/rng.js';

// fiche après des victoires (wins) et défaites (losses) : listes d'outils, une entrée par combat
function entry(wins = [], losses = []) {
  const b = newBestiaryEntry();
  for (const k of wins) {
    recordFight(b, k, true);
    b.kills++;
  }
  for (const k of losses) recordFight(b, k, false);
  return b;
}

test('rien dans le carnet avant le premier combat conclu', () => {
  assert.equal(toolAdvice('golem', entry()), null);
});

test('défaite seule : note en négatif sur l’outil', () => {
  const a = toolAdvice('golem', entry([], ['pioche']));
  assert.equal(a.kind, 'loss');
  assert.equal(a.tool, 'pioche');
});

test('victoire avec un seul outil : note, pas encore d’outil nommé', () => {
  const a = toolAdvice('golem', entry(['pioche', 'pioche']));
  assert.equal(a.kind, 'win');
  assert.equal(a.tool, 'pioche');
  assert.equal(a.left, 8);
});

test('battu avec deux outils différents : le carnet nomme l’outil conseillé', () => {
  const a = toolAdvice('golem', entry(['pioche', 'coutelas']));
  assert.equal(a.kind, 'named');
  assert.equal(a.tool, ADVICE.golem.tool);
});

test('filet par rang : 10 victoires (normal), 2 (élite), 1 (boss)', () => {
  assert.equal(toolAdvice('mulot', entry(Array(9).fill('pioche'))).kind, 'win');
  assert.equal(toolAdvice('mulot', entry(Array(10).fill('pioche'))).kind, 'named');
  assert.equal(toolAdvice('ours', entry(['pioche'])).kind, 'win');
  assert.equal(toolAdvice('ours', entry(['pioche', 'pioche'])).kind, 'named');
  assert.equal(toolAdvice('gardien', entry(['marteau'])).kind, 'named');
});

test('chaque monstre a un outil conseillé connu', () => {
  for (const id in ADVICE) assert.ok(['pioche', 'marteau', 'coutelas'].includes(ADVICE[id].tool), id);
});

test('sauvegarde d’avant le carnet : byTool vaut {} au chargement', () => {
  const meta = createGame(null, lcg(1), lcg(2)).meta;
  meta.bestiary = {mulot: {seen: true, killed: true, kills: 4}};
  const G = createGame(meta, lcg(1), lcg(2));
  assert.deepEqual(G.meta.bestiary.mulot.byTool, {});
});
