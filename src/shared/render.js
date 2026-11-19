// Demande de rendu : une vue appelle requestRender() après une action du joueur ; main.js s'y abonne avec onRender().
// Les vues n'importent jamais main.js (pas de cycle d'imports).
let renderFn = null;

export function onRender(fn) {
  renderFn = fn;
}

export function requestRender() {
  renderFn?.();
}
