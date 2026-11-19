// Onglet Exploration du panneau de droite : héros, case choisie, outil, journal.
import {BIOMES, TILE_MAP, TYPES} from './world.data.js';
import {TOOLS, xpNeeded} from '../hero/hero.data.js';
import {MONSTERS, RANK} from '../enemies/enemies.data.js';
import {canExplore, isExplorable} from './explore.engine.js';
import {S, anyUpgrade} from '../shared/state.js';
import {fmt, pct} from '../shared/format.js';
import {segBar} from '../shared/templates.js';

function heroHTML() {
  const h = S.G.run.hero;
  return `<div class="sec"><h3>HÉROS <span>Niv ${h.lvl}</span></h3>
    <div class="barline" title="PV : ${fmt(h.hp)} / ${h.maxHp}"><span style="width:22px">❤️</span><div class="bar hp"><i style="width:${(h.hp / h.maxHp) * 100}%"></i></div><span class="n">${fmt(h.hp)} / ${h.maxHp}</span></div>
    <div class="barline" title="XP : ${fmt(h.xp)} / ${xpNeeded(h.lvl)}"><span style="width:22px">✨</span><div class="bar xp thin"><i style="width:${(h.xp / xpNeeded(h.lvl)) * 100}%"></i></div><span class="n">${fmt(h.xp)} / ${xpNeeded(h.lvl)} XP</span></div>
    <div class="stats"><div>Puissance <b>${h.pow.toFixed(1)}</b></div><div>Armure <b>${h.arm.toFixed(1)}</b></div><div>Esquive <b>${pct(h.dodge)}</b></div><div>Critique <b>${pct(h.crit)}</b></div></div></div>`;
}
function tileHTML() {
  const t = TILE_MAP[S.selected],
    m = S.G.meta,
    r = S.G.run;
  if (!t || !m.discovered[t.id]) return '';
  const ty = TYPES[t.type],
    doneNow = r.completed.has(t.id),
    a = r.action;
  let h = `<div class="sec"><div class="tname">${ty.icon} ${t.name}</div><div class="tsub">${BIOMES[t.biome].name} · ${ty.label}${t.lvl ? ' · Niveau ' + t.lvl : ''}</div>`;
  if (t.type === 'village')
    return (
      h +
      `<div class="note">Point de départ de chaque boucle. Le village garde tout ce que tu rapportes.</div><button class="btn small gold" data-act="tab-village">VOIR LE VILLAGE${anyUpgrade() ? ' (!)' : ''}</button></div>`
    );
  if (t.type === 'locked')
    return (
      h +
      `<div class="note">Un vieux puits descend dans la roche… Les strates les plus profondes semblent plus anciennes.<br><b>La mine arrive bientôt.</b></div></div>`
    );
  h +=
    segBar(t, a, doneNow) +
    `<div class="segcap"><span>${t.waves ? t.waves.length + ' VAGUES' : 'EXPLORATION'}</span><span>${doneNow ? 'TERMINÉ' : ''}</span></div>`;
  if (t.waves) {
    const all = t.waves.flat(),
      uniq = [...new Set(all)];
    h +=
      `<div class="divh"><span>ENNEMIS</span></div><div class="enemies">` +
      uniq
        .map(id => {
          const b = m.bestiary[id],
            mm = MONSTERS[id],
            cls = mm.rank === 'elite' ? ' el' : mm.rank === 'boss' ? ' bo' : '';
          const cnt = all.filter(f => f === id).length,
            tr = m.trophies[id] ? ' 🏆' : '';
          return b && b.seen
            ? `<button class="enemy${cls}" data-mon="${id}" data-lvl="${t.lvl}"><b>${mm.por} ${mm.name}${cnt > 1 ? ' ×' + cnt : ''}${tr}</b><span>${RANK[mm.rank].label} · Niveau ${t.lvl}</span></button>`
            : `<button class="enemy unk${cls}" data-mon="${id}" data-lvl="${t.lvl}"><b>???${cnt > 1 ? ' ×' + cnt : ''}</b><span>${RANK[mm.rank].label} · Niveau ${t.lvl}</span></button>`;
        })
        .join('') +
      `</div>`;
  } else {
    const info = {
      wood: 'Récolte : 3 × 1–2 🪵 bois (9 s)',
      ore: 'Récolte : 3 × 1–2 🪨 minerai (9 s)',
      spring:
        "Repos : +10 % des PV max par seconde jusqu'à être plein. Tu peux reprendre la route avant. Réutilisable, mais chaque seconde compte.",
      chest: m.chests[t.id] ? 'Déjà pillé : il reste 3 🪙' : "Quelque chose brille sur l'autel… (2 s)",
    }[t.type];
    h += `<div class="note">${info}</div>`;
  }
  let reason = '';
  if (r.over) reason = 'La boucle est terminée.';
  else if (a) reason = a.id === t.id ? 'Exploration en cours…' : 'Le héros est occupé ailleurs.';
  else if (!isExplorable(S.G, t.id)) reason = "Pas encore accessible : explore d'abord une case voisine.";
  const again = doneNow;
  const hint = !reason
    ? again
      ? `<div class="note">${t.type === 'spring' ? 'Échange du temps de boucle contre des PV.' : t.waves ? 'Ré-exploration : pas de renommée, mais XP, butins et chance de trophée 🏆. Coûte du temps de boucle.' : 'Ré-exploration : récolte à nouveau. Coûte du temps de boucle.'}</div>`
      : !m.everCompleted[t.id]
        ? `<div class="note">Première exploration : +${3 * t.lvl} ⭐</div>`
        : ''
    : `<div class="note">${reason}</div>`;
  if (t.waves) h += toolsHTML();
  h += `<button class="btn gold" data-act="explore" ${canExplore(S.G, t.id) ? '' : 'disabled'}>${again ? (t.type === 'spring' ? 'SE REPOSER' : 'RÉ-EXPLORER') : 'EXPLORER'}</button>${hint}</div>`;
  return h;
}
// choix de l'outil avant d'entrer sur une case de combat (l'action en cours garde le sien)
function toolsHTML() {
  const cur = S.G.meta.tool,
    a = S.G.run.action;
  const busy =
    a && a.tool !== cur
      ? `<br>Le combat en cours garde ${TOOLS[a.tool].icon} ${TOOLS[a.tool].name.toLowerCase()} : le nouvel outil servira à la case suivante.`
      : '';
  return `<div class="divh"><span>OUTIL</span></div><div class="tools">${Object.entries(TOOLS)
    .map(
      ([k, o]) =>
        `<button data-tool="${k}" class="${k === cur ? 'on' : ''}" title="${o.desc}">${o.icon} ${o.name}</button>`,
    )
    .join('')}</div>
    <div class="note">${TOOLS[cur].desc}${busy}</div>`;
}
function logHTML() {
  return `<div class="sec"><h3>JOURNAL</h3><div class="log">${S.G.run.log.map(l => `<div class="${l.cls || ''}">${l.text}</div>`).join('')}</div></div>`;
}
export function exploreHTML() {
  return (
    heroHTML() +
    tileHTML() +
    logHTML() +
    `<button class="btn small" data-act="abandon" ${S.G.run.over ? 'disabled' : ''}>RENTRER AU VILLAGE (FIN DE BOUCLE)</button>`
  );
}
