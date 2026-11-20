// Tests du moteur de la forge (étape 2b) : node --test
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame, newLoop, startLoop} from '../src/world/loop.engine.js';
import {forgeItem, recipeState, repeatForge} from '../src/village/forge.engine.js';
import {actionTool, heroBase} from '../src/hero/hero.engine.js';
import {lcg} from '../src/shared/rng.js';

// partie avec la forge ouverte, mulot et sanglier vaincus, et assez de cuir pour deux tabliers
function gameWithLeather(cuir = 120) {
  const G = createGame(null, lcg(1), lcg(2));
  Object.assign(G.meta, {renown: 20, mats: {cuir}});
  G.meta.bestiary = {mulot: {seen: true, killed: true}, sanglier: {seen: true, killed: true}};
  return G;
}

test("une recette reste fermée tant que ses monstres n'ont pas été vaincus", () => {
  const G = gameWithLeather();
  assert.equal(recipeState(G, 'manteau', false).unlocked, false);
  assert.equal(forgeItem(G, 'manteau', false), false);
});

test('forger paie les matériaux et réserve l’objet pour la boucle suivante', () => {
  const G = gameWithLeather();
  assert.equal(forgeItem(G, 'tablier', false), true);
  assert.equal(G.meta.mats.cuir, 60);
  assert.deepEqual(G.meta.forge, {armure: 'tablier'});
  assert.deepEqual(G.meta.equip, {});
});

test('un seul objet par emplacement', () => {
  const G = gameWithLeather(200);
  forgeItem(G, 'tablier', false);
  assert.equal(recipeState(G, 'tablier', false).taken, 'tablier');
  assert.equal(forgeItem(G, 'tablier', false), false);
  assert.equal(G.meta.mats.cuir, 140);
});

test('l’objet est porté pendant la boucle suivante, puis perdu', () => {
  const G = gameWithLeather();
  const hpBefore = heroBase(G.meta).hp;
  forgeItem(G, 'tablier', false);
  newLoop(G);
  assert.deepEqual(G.meta.equip, {armure: 'tablier'});
  assert.equal(G.run.base.hp, hpBefore + 15);
  newLoop(G);
  assert.deepEqual(G.meta.equip, {});
  assert.equal(G.run.base.hp, hpBefore);
});

test('héros pas encore parti : l’objet sert tout de suite', () => {
  const G = gameWithLeather();
  forgeItem(G, 'tablier', true);
  startLoop(G);
  assert.deepEqual(G.meta.equip, {armure: 'tablier'});
  assert.deepEqual(G.meta.forge, {});
});

test('refaire la même forge reprend la dernière recette de chaque emplacement, prix plein', () => {
  const G = gameWithLeather();
  forgeItem(G, 'tablier', false);
  newLoop(G);
  assert.equal(repeatForge(G, false), true);
  assert.equal(G.meta.mats.cuir, 0);
  assert.deepEqual(G.meta.forge, {armure: 'tablier'});
  assert.equal(repeatForge(G, false), false);
});

test('le palier II ne joue que quand son outil est en main', () => {
  const G = gameWithLeather();
  G.meta.equip = {pioche: 'pioche2'};
  G.meta.tool = 'pioche';
  assert.equal(actionTool(G).pow, 3);
  assert.equal(actionTool(G).tier, 2);
  G.meta.tool = 'marteau';
  assert.equal(actionTool(G).pow, 0);
  assert.equal(actionTool(G).pierce, 2);
});

test('sauvegarde d’avant la forge ou recette inconnue : valeurs par défaut', () => {
  const G = gameWithLeather();
  const old = {...G.meta, equip: undefined, forge: {armure: 'pioche2', bidule: 'x'}, recent: null};
  const G2 = createGame(old, lcg(1), lcg(2));
  assert.deepEqual(G2.meta.equip, {});
  assert.deepEqual(G2.meta.forge, {});
  assert.deepEqual(G2.meta.recent, {});
});
