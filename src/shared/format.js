// Mise en forme des nombres et des butins.
import {MATS} from '../mining/mining.data.js';

export const fmt = n => Math.round(n).toLocaleString('fr-FR');
export const pct = n => Math.round(n * 100) + ' %';

// Texte du butin extrait (ex. « +2 🟫 +1 🦴 »)
export const gotText = got =>
  Object.entries(got || {})
    .map(([k, n]) => `+${n} ${MATS[k].icon}`)
    .join(' ');
