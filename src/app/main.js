// Point d'entrée : boucle principale (50 ms), rendu de toutes les zones, intro au premier lancement.
import {tick} from '../world/tick.engine.js';
import {S, hadSave, saveMeta} from '../shared/state.js';
import {onRender} from '../shared/render.js';
import {watchSprites} from '../shared/dom.js';
import {playIntro} from '../intro/intro.view.js';
import {renderScene} from '../combat/scene.view.js';
import {renderMap} from '../world/map.view.js';
import {renderPane, renderTabs, renderTop} from './layout.view.js';
import {consumeEvents} from './events.view.js';
import '../modals/modal.view.js'; // écouteurs de la fenêtre modale et du bouton de réinitialisation

watchSprites(); // avant le premier rendu : les sprites manquants deviennent leur emoji
function render() {
  renderTop();
  renderTabs();
  renderMap();
  if (S.view === 'scene') renderScene();
  renderPane();
}
onRender(() => {
  consumeEvents();
  render();
});
let last = performance.now(),
  saveT = 0;
setInterval(() => {
  const now = performance.now(),
    dt = Math.min(1, (now - last) / 1000);
  last = now;
  if (!S.modalMode) tick(S.G, dt * S.gameSpeed);
  consumeEvents();
  saveT += dt;
  if (saveT > 5) {
    saveT = 0;
    saveMeta();
  }
  render();
}, 50);
render();
if (!hadSave) playIntro();
