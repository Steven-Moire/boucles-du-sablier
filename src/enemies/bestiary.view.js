// Onglet Bestiaire du panneau de droite : mémoire des boucles, fiches des monstres, trophées.
import {TILES} from '../world/world.data.js';
import {MONSTERS, RANK} from './enemies.data.js';
import {S} from '../shared/state.js';

const trophyTag = hasTrophy => (hasTrophy ? '<span class="tag t">🏆</span> ' : '');
const killTag = killed => (killed ? '<span class="tag k">VAINCU</span>' : '<span class="tag ">RENCONTRÉ</span>');
// ligne d'un monstre déjà rencontré (ouvre sa fiche)
const seenMonHTML = (id, mm, killed, hasTrophy) =>
  `<button class="mon" data-mon="${id}"><span>${mm.por} <b>${mm.name}</b> <span class="tag">${RANK[mm.rank].label}</span></span><span>${trophyTag(hasTrophy)}${killTag(killed)}</span></button>`;
const unknownMonHTML = mm =>
  `<div class="mon unk"><span>???</span><span class="tag">${RANK[mm.rank].label}</span></div>`;
// où trouver un trophée pas encore obtenu : révélé à la première victoire sur son monstre
function trophySource(mm, b) {
  if (b?.killed) return `Sur ${mm.name} · ${Math.round(mm.trophy.chance * 100)} %`;
  return 'Source inconnue';
}

export function bestiaryHTML() {
  const m = S.G.meta,
    total = TILES.filter(t => t.type !== 'village').length,
    disc = Object.keys(m.discovered).length - 1;
  let h = `<div class="sec"><h3>MÉMOIRE DES BOUCLES</h3>
    <div class="row"><span class="k">Boucles vécues</span><b>${m.loop}</b></div>
    <div class="row"><span class="k">Cases découvertes</span><b>${disc} / ${total}</b></div>
    <div class="row"><span class="k">Cases explorées au moins une fois</span><b>${Object.keys(m.everCompleted).length}</b></div></div><div class="sec"><h3>BESTIAIRE</h3>`;
  for (const id in MONSTERS) {
    const b = m.bestiary[id],
      mm = MONSTERS[id];
    h += b?.seen ? seenMonHTML(id, mm, b.killed, m.trophies[id]) : unknownMonHTML(mm);
  }
  h += `<div class="note">Une fiche se révèle à la première rencontre, les butins à la première victoire.</div></div>`;
  const nT = Object.keys(m.trophies).length,
    all = Object.keys(MONSTERS).length;
  h +=
    `<div class="sec"><h3>TROPHÉES <span>${nT} / ${all}</span></h3><div class="trophies">` +
    Object.entries(MONSTERS)
      .map(([id, mm]) => {
        const own = m.trophies[id],
          b = m.bestiary[id],
          tr = mm.trophy;
        return own
          ? `<div class="troph own"><b>${tr.icon} ${tr.name}</b><span>${tr.desc}</span></div>`
          : `<div class="troph"><b>🔒 ???</b><span>${trophySource(mm, b)}</span></div>`;
      })
      .join('') +
    `</div><div class="note">Butins uniques : un seul exemplaire par monstre, bonus permanent sur tous les héros futurs.</div></div>`;
  return h;
}
