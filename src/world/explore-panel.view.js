// Fiche de la case choisie, à côté de la carte : infos de la zone, ennemis ou ressource, bouton d'exploration.
// Une case où le héros ne peut pas aller n'a pas de bouton grisé, seulement la raison.
import {BIOMES, TILE_MAP, TYPES} from './world.data.js';
import {MONSTERS, RANK} from '../enemies/enemies.data.js';
import {isExplorable} from './explore.engine.js';
import {S, anyUpgrade, atVillage} from '../shared/state.js';
import {segBar} from '../shared/templates.js';

const RANK_CLASS = {elite: ' el', boss: ' bo'};
const LOCKED_NOTE_HTML = `<div class="note">Un vieux puits descend dans la roche… Les strates les plus profondes semblent plus anciennes.<br><b>La mine arrive bientôt.</b></div></div>`;
const RESOURCE_NOTES = {
  wood: 'Récolte : 3 × 1–2 🪵 bois (9 s)',
  ore: 'Récolte : 3 × 1–2 🪨 minerai (9 s)',
  spring:
    "Repos : +10 % des PV max par seconde jusqu'à être plein. Tu peux reprendre la route avant. Réutilisable, mais chaque seconde compte.",
};
const note = text => `<div class="note">${text}</div>`;

// en-tête de la case (la section reste ouverte, fermée par la suite du gabarit)
function tileHeadHTML(t) {
  const ty = TYPES[t.type];
  return `<div class="sec"><div class="tname">${ty.icon} ${t.name}</div><div class="tsub">${BIOMES[t.biome].name} · ${ty.label}${t.lvl ? ' · Niveau ' + t.lvl : ''}</div>`;
}
function villageNoteHTML() {
  return `<div class="note">Point de départ de chaque boucle. Le village garde tout ce que tu rapportes.</div><button class="btn small gold" data-act="tab-village">VOIR LE VILLAGE${atVillage() ? '' : ' DE LOIN'}${anyUpgrade() ? ' (!)' : ''}</button></div>`;
}
function tileProgressHTML(t, a, doneNow) {
  return (
    segBar(t, a, doneNow) +
    `<div class="segcap"><span>${t.waves ? t.waves.length + ' VAGUES' : 'EXPLORATION'}</span><span>${doneNow ? 'TERMINÉ' : ''}</span></div>`
  );
}
function enemyButtonHTML(id, t, m, all) {
  const b = m.bestiary[id],
    mm = MONSTERS[id],
    cls = RANK_CLASS[mm.rank] || '';
  const cnt = all.filter(f => f === id).length,
    times = cnt > 1 ? ' ×' + cnt : '',
    tr = m.trophies[id] ? ' 🏆' : '';
  const isSeen = b?.seen;
  const label = isSeen ? `${mm.por} ${mm.name}${times}${tr}` : '???' + times;
  const unk = isSeen ? '' : ' unk';
  return `<button class="enemy${unk}${cls}" data-mon="${id}" data-lvl="${t.lvl}"><b>${label}</b><span>${RANK[mm.rank].label} · Niveau ${t.lvl}</span></button>`;
}
function enemiesHTML(t, m) {
  const all = t.waves.flat(),
    uniq = [...new Set(all)];
  return (
    `<div class="divh"><span>ENNEMIS</span></div><div class="enemies">` +
    uniq.map(id => enemyButtonHTML(id, t, m, all)).join('') +
    `</div>`
  );
}
function resourceNote(t, m) {
  if (t.type === 'chest')
    return m.chests[t.id] ? 'Déjà pillé : il reste 3 🪙' : "Quelque chose brille sur l'autel… (2 s)";
  return RESOURCE_NOTES[t.type];
}
// pourquoi le héros ne peut pas explorer cette case ('' s'il le peut)
function blockReason(t, r, a) {
  if (r.over) return 'La boucle est terminée.';
  if (a) return a.id === t.id ? 'Exploration en cours…' : 'Le héros est occupé ailleurs.';
  if (!isExplorable(S.G, t.id)) return "Pas encore accessible : explore d'abord une case voisine.";
  return '';
}
function againNote(t) {
  if (t.type === 'spring') return 'Échange du temps de boucle contre des PV.';
  if (t.waves)
    return 'Ré-exploration : pas de renommée, mais XP, butins et chance de trophée 🏆. Coûte du temps de boucle.';
  return 'Ré-exploration : récolte à nouveau. Coûte du temps de boucle.';
}
function hintHTML(t, m, reason, again) {
  if (reason) return note(reason);
  if (again) return note(againNote(t));
  if (!m.everCompleted[t.id]) return note(`Première exploration : +${3 * t.lvl} ⭐`);
  return '';
}
function exploreLabel(t, again) {
  if (!again) return 'EXPLORER';
  return t.type === 'spring' ? 'SE REPOSER' : 'RÉ-EXPLORER';
}
function exploreButtonHTML(t, m, again) {
  const reason = blockReason(t, S.G.run, S.G.run.action);
  if (reason) return hintHTML(t, m, reason, again) + '</div>';
  return `<button class="btn gold" data-act="explore">${exploreLabel(t, again)}</button>${hintHTML(t, m, reason, again)}</div>`;
}
// case explorable : progression, ennemis ou ressource, bouton
function tileBodyHTML(t, m) {
  const doneNow = S.G.run.completed.has(t.id);
  let h = tileProgressHTML(t, S.G.run.action, doneNow);
  if (t.waves) h += enemiesHTML(t, m);
  else h += note(resourceNote(t, m));
  return h + exploreButtonHTML(t, m, doneNow);
}
function tileHTML() {
  const t = TILE_MAP[S.selected],
    m = S.G.meta;
  if (!t || !m.discovered[t.id]) return '';
  const head = tileHeadHTML(t);
  if (t.type === 'village') return head + villageNoteHTML();
  if (t.type === 'locked') return head + LOCKED_NOTE_HTML;
  return head + tileBodyHTML(t, m);
}
const EMPTY_HTML = `<div class="sec"><div class="note">Clique une case de la carte pour voir sa fiche.</div></div>`;
export function tileCardHTML() {
  return tileHTML() || EMPTY_HTML;
}
