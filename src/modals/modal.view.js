import {newLoop} from '../world/loop.engine.js';
import {replayScene} from '../lore/scene.engine.js';
import {S, newUiGame, openVillage, saveMeta, startTile} from '../shared/state.js';
import {clearMeta} from '../shared/save.js';
import {$, toast} from '../shared/dom.js';
import {requestRender} from '../shared/render.js';
import {openLoopEnd} from './loop-end.view.js';
import {playIntro} from '../intro/intro.view.js';
import {showMorning} from '../lore/scene.view.js';

// ---------- modales ----------
let resetArm = false;
$('modal').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (e.target.id === 'modal' && S.modalMode !== 'loop') {
    closeModal();
    return;
  }
  if (!b) return;
  if (b.hasAttribute('data-newloop')) {
    newLoop(S.G);
    saveMeta();
    // la boucle s'ouvre au village, chez Jalon (ou sur une amélioration payable si on l'a demandé)
    S.tab = 'place';
    S.zone = 'jalon';
    S.farView = false;
    if (b.dataset.go) openVillage();
    S.selected = startTile();
    S.lastSceneTile = null;
    closeModal();
  } else if (b.hasAttribute('data-replay')) {
    replayScene(S.G.meta); // fiche du Mulot dentu : la scène du premier combat se rejouera au prochain
    saveMeta();
    toast('🗝️ SOUVENIR', 'La scène se rejouera au prochain Mulot dentu.');
    closeModal();
  } else if (b.hasAttribute('data-close')) closeModal();
});
function closeModal() {
  $('modal').hidden = true;
  S.modalMode = null;
  if (S.G.run.over) openLoopEnd();
  requestRender();
}

$('resetBtn').addEventListener('click', () => {
  if (!resetArm) {
    resetArm = true;
    $('resetBtn').textContent = 'Clique encore pour tout effacer';
    setTimeout(() => {
      resetArm = false;
      $('resetBtn').textContent = 'Réinitialiser la sauvegarde';
    }, 3000);
    return;
  }
  clearMeta(); // si l'effacement échoue, la partie repart quand même de zéro à l'écran
  S.G = newUiGame(null);
  resetArm = false;
  $('resetBtn').textContent = 'Réinitialiser la sauvegarde';
  S.selected = startTile();
  S.tab = 'place';
  S.zone = 'jalon';
  S.farView = false;
  S.lastSceneTile = null;
  closeModal();
  playIntro(showMorning); // tout effacé = nouveau départ, l'intro se rejoue (on peut toujours la passer)
});
