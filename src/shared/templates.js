// Gabarits HTML partagés par plusieurs zones (sans effet de bord).
import {buildSegments, segFill} from '../world/explore.engine.js';

// sprite pixel art (assets/sprites/<clé>.png) ; si l'image manque, l'emoji (alt) prend sa place
// (écouteur délégué watchSprites() de shared/dom.js)
export const spr = (key, emoji) => `<img class="spr" src="assets/sprites/${key}.png" alt="${emoji}">`;
// barre des segments d'une case (scène de combat et panneau de droite)
export function segBar(t, a, done) {
  const n = buildSegments(t).length;
  let cells = '';
  for (let i = 0; i < n; i++) {
    if (done) cells += '<i class="f"></i>';
    else if (a && a.id === t.id) {
      if (i < a.seg) cells += '<i class="f"></i>';
      else if (i === a.seg) cells += `<i class="cur" style="--p:${Math.round(segFill(a) * 100)}%"></i>`;
      else cells += '<i></i>';
    } else cells += '<i></i>';
  }
  return `<div class="segs">${cells}</div>`;
}
