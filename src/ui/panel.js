import {BIOMES, MONSTERS, RANK, RES, TILES, TILE_MAP, TYPES, UPGRADES, xpNeeded} from '../data.js';
import {abandon, buy, canExplore, explore, heroAtLevel, heroBase, isExplorable, startLoop, upgradeState} from '../engine.js';
import {$, S, anyUpgrade, fmt, loopFresh, pct, saveMeta, setHTML} from './state.js';
import {segBar} from './scene.js';
import {openMonster} from './modals.js';
import {consumeEvents, render} from './main.js';

// ---------- haut ----------
export function renderTop(){
  const m = S.G.meta, r = S.G.run;
  setHTML($('res'), ['renown','gold','wood','ore'].map(k => `<div class="chip">${RES[k].icon} ${fmt(m[k])}<span>${RES[k].name}</span></div>`).join(''));
  setHTML($('speed'), [1,2,5].map(s => `<button data-s="${s}" class="${s === S.gameSpeed ? 'on' : ''}">×${s}</button>`).join(''));
  $('loopLbl').textContent = `⏳ BOUCLE ${m.loop}`;
  $('timeBar').style.width = (r.timeLeft / r.timeMax * 100) + '%';
  $('timeVal').textContent = `${r.timeLeft.toFixed(1)} s`;
  const fighting = r.action && r.action.phase === 'fight';
  const h = r.hero;
  setHTML($('viewtabs'), `<button data-v="map" class="${S.view === 'map' ? 'on' : ''}">🗺️ CARTE</button><button data-v="scene" class="${S.view === 'scene' ? 'on' : ''}">⚔️ COMBAT${fighting && S.view !== 'scene' ? '<span class="live"></span>' : ''}</button>
    <div class="vhp" title="Points de vie du héros : ${fmt(h.hp)} / ${h.maxHp}">🧙 Niv ${h.lvl}<div class="bar hp"><i style="width:${h.hp / h.maxHp * 100}%"></i><span>${fmt(h.hp)} / ${h.maxHp} PV</span></div></div>`);
  $('mapView').hidden = S.view !== 'map'; $('sceneView').hidden = S.view !== 'scene';
}
$('speed').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ S.gameSpeed = +b.dataset.s; render(); } });
$('viewtabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ S.view = b.dataset.v; clearTimeout(S.backTimer); render(); } });

// ---------- panneau de droite ----------
export function renderTabs(){
  const T = [['explore','Exploration'],['village','Village'],['bestiary','Bestiaire']];
  setHTML($('tabs'), T.map(([k,l]) => `<button data-t="${k}" class="${S.tab === k ? 'on' : ''}">${l}${k === 'village' && anyUpgrade() ? '<span class="bg">!</span>' : ''}</button>`).join(''));
}
$('tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b){ S.tab = b.dataset.t; render(); } });

function heroHTML(){
  const h = S.G.run.hero;
  return `<div class="sec"><h3>HÉROS <span>Niv ${h.lvl}</span></h3>
    <div class="barline" title="PV : ${fmt(h.hp)} / ${h.maxHp}"><span style="width:22px">❤️</span><div class="bar hp"><i style="width:${h.hp / h.maxHp * 100}%"></i></div><span class="n">${fmt(h.hp)} / ${h.maxHp}</span></div>
    <div class="barline" title="XP : ${fmt(h.xp)} / ${xpNeeded(h.lvl)}"><span style="width:22px">✨</span><div class="bar xp thin"><i style="width:${h.xp / xpNeeded(h.lvl) * 100}%"></i></div><span class="n">${fmt(h.xp)} / ${xpNeeded(h.lvl)} XP</span></div>
    <div class="stats"><div>Puissance <b>${h.pow.toFixed(1)}</b></div><div>Armure <b>${h.arm.toFixed(1)}</b></div><div>Esquive <b>${pct(h.dodge)}</b></div><div>Critique <b>${pct(h.crit)}</b></div></div></div>`;
}
function tileHTML(){
  const t = TILE_MAP[S.selected], m = S.G.meta, r = S.G.run;
  if (!t || !m.discovered[t.id]) return '';
  const ty = TYPES[t.type], doneNow = r.completed.has(t.id), a = r.action;
  let h = `<div class="sec"><div class="tname">${ty.icon} ${t.name}</div><div class="tsub">${BIOMES[t.biome].name} · ${ty.label}${t.lvl ? ' · Niveau ' + t.lvl : ''}</div>`;
  if (t.type === 'village') return h + `<div class="note">Point de départ de chaque boucle. Le village garde tout ce que tu rapportes.</div><button class="btn small gold" data-act="tab-village">VOIR LE VILLAGE${anyUpgrade() ? ' (!)' : ''}</button></div>`;
  if (t.type === 'locked') return h + `<div class="note">Un vieux puits descend dans la roche… Les strates les plus profondes semblent plus anciennes.<br><b>La mine arrive bientôt.</b></div></div>`;
  h += segBar(t, a, doneNow) + `<div class="segcap"><span>${t.waves ? t.waves.length + ' VAGUES' : 'EXPLORATION'}</span><span>${doneNow ? 'TERMINÉ' : ''}</span></div>`;
  if (t.waves){
    const all = t.waves.flat(), uniq = [...new Set(all)];
    h += `<div class="divh"><span>ENNEMIS</span></div><div class="enemies">` + uniq.map(id => {
      const b = m.bestiary[id], mm = MONSTERS[id], cls = mm.rank === 'elite' ? ' el' : mm.rank === 'boss' ? ' bo' : '';
      const cnt = all.filter(f => f === id).length, tr = m.trophies[id] ? ' 🏆' : '';
      return b && b.seen ? `<button class="enemy${cls}" data-mon="${id}" data-lvl="${t.lvl}"><b>${mm.por} ${mm.name}${cnt > 1 ? ' ×' + cnt : ''}${tr}</b><span>${RANK[mm.rank].label} · Niveau ${t.lvl}</span></button>`
        : `<button class="enemy unk${cls}" data-mon="${id}" data-lvl="${t.lvl}"><b>???${cnt > 1 ? ' ×' + cnt : ''}</b><span>${RANK[mm.rank].label} · Niveau ${t.lvl}</span></button>`;
    }).join('') + `</div>`;
  } else {
    const info = {wood:'Récolte : 3 × 1–2 🪵 bois (9 s)', ore:'Récolte : 3 × 1–2 🪨 minerai (9 s)', spring:'Repos : +10 % des PV max par seconde jusqu\'à être plein. Tu peux reprendre la route avant. Réutilisable, mais chaque seconde compte.',
      chest: m.chests[t.id] ? 'Déjà pillé : il reste 3 🪙' : 'Quelque chose brille sur l\'autel… (2 s)'}[t.type];
    h += `<div class="note">${info}</div>`;
  }
  let reason = '';
  if (r.over) reason = 'La boucle est terminée.';
  else if (a) reason = a.id === t.id ? 'Exploration en cours…' : 'Le héros est occupé ailleurs.';
  else if (!isExplorable(S.G, t.id)) reason = 'Pas encore accessible : explore d\'abord une case voisine.';
  const again = doneNow;
  const hint = !reason ? (again ? `<div class="note">${t.type === 'spring' ? 'Échange du temps de boucle contre des PV.' : t.waves ? 'Ré-exploration : pas de renommée, mais XP, butins et chance de trophée 🏆. Coûte du temps de boucle.' : 'Ré-exploration : récolte à nouveau. Coûte du temps de boucle.'}</div>`
    : !m.everCompleted[t.id] ? `<div class="note">Première exploration : +${3*t.lvl} ⭐</div>` : '') : `<div class="note">${reason}</div>`;
  h += `<button class="btn gold" data-act="explore" ${canExplore(S.G, t.id) ? '' : 'disabled'}>${again ? (t.type === 'spring' ? 'SE REPOSER' : 'RÉ-EXPLORER') : 'EXPLORER'}</button>${hint}</div>`;
  return h;
}
function logHTML(){ return `<div class="sec"><h3>JOURNAL</h3><div class="log">${S.G.run.log.map(l => `<div class="${l.cls || ''}">${l.text}</div>`).join('')}</div></div>`; }
function exploreHTML(){
  return heroHTML() + tileHTML() + logHTML()
    + `<button class="btn small" data-act="abandon" ${S.G.run.over ? 'disabled' : ''}>RENTRER AU VILLAGE (FIN DE BOUCLE)</button>`;
}
function costHTML(cost){ return Object.entries(cost).map(([k,v]) => `<span class="${S.G.meta[k] >= v ? '' : 'no'}">${RES[k].icon} ${fmt(v)}</span>`).join(' &nbsp; '); }
function villageHTML(){
  const m = S.G.meta, nb = heroBase(m), h1 = heroAtLevel(nb, 1);
  const nextReq = Object.values(UPGRADES).map(u => u.req).filter(q => q > m.renown).sort((a,b) => a-b)[0];
  let h = `<div class="sec"><h3>RENOMMÉE <span>⭐ ${fmt(m.renown)}</span></h3><div class="note" style="text-align:left;margin:0">Le village se souvient de toi : la renommée débloque les bâtiments, l'or et les matériaux servent à les améliorer.${nextReq ? `<br>Prochain déblocage à <b>${nextReq} ⭐</b>.` : ''}</div></div>`;
  for (const k in UPGRADES){
    const s = upgradeState(S.G, k), u = s.u;
    h += `<div class="sec bld ${s.unlocked ? '' : 'lock'}"><div class="ic">${u.icon}</div><div>
      <div><span class="nm">${u.name}</span>${s.unlocked ? `<span class="lvl">NIV ${s.n}/${u.max}</span>` : ''}</div>
      <div class="ds">${s.unlocked ? u.desc : `Débloqué à ${u.req} ⭐ de renommée`}</div>
      ${s.unlocked && !s.maxed ? `<div class="cost">${costHTML(s.cost)}</div><button class="btn small gold" data-buy="${k}" ${s.ok ? '' : 'disabled'}>AMÉLIORER</button>` : s.maxed ? '<div class="cost">Niveau maximum</div>' : ''}
    </div></div>`;
  }
  h += `<div class="sec bld lock"><div class="ic">🗺️</div><div><span class="nm">Cartographe</span><div class="ds">Bientôt : programmer sa route à l'avance sur les cases connues (mode idle).</div></div></div>`;
  h += `<div class="sec"><h3>HÉROS DE LA PROCHAINE BOUCLE</h3><div class="stats" style="margin:0">
    <div>PV <b>${h1.maxHp}</b></div><div>Puissance <b>${h1.pow.toFixed(1)}</b></div><div>Armure <b>${h1.arm.toFixed(1)}</b></div>
    <div>Esquive <b>${pct(h1.dodge)}</b></div><div>Critique <b>${pct(h1.crit)}</b></div><div>Temps <b>${nb.loopTime} s</b></div></div>
    <div class="note">${loopFresh() ? 'Le héros n\'est pas encore parti : les améliorations s\'appliquent tout de suite.' : 'Les améliorations prennent effet au début de la boucle suivante.'}</div></div>`;
  return h;
}
function bestiaryHTML(){
  const m = S.G.meta, total = TILES.filter(t => t.type !== 'village').length, disc = Object.keys(m.discovered).length - 1;
  let h = `<div class="sec"><h3>MÉMOIRE DES BOUCLES</h3>
    <div class="row"><span class="k">Boucles vécues</span><b>${m.loop}</b></div>
    <div class="row"><span class="k">Cases découvertes</span><b>${disc} / ${total}</b></div>
    <div class="row"><span class="k">Cases explorées au moins une fois</span><b>${Object.keys(m.everCompleted).length}</b></div></div><div class="sec"><h3>BESTIAIRE</h3>`;
  for (const id in MONSTERS){
    const b = m.bestiary[id], mm = MONSTERS[id];
    h += b && b.seen ? `<button class="mon" data-mon="${id}"><span>${mm.por} <b>${mm.name}</b> <span class="tag">${RANK[mm.rank].label}</span></span><span>${m.trophies[id] ? '<span class="tag t">🏆</span> ' : ''}<span class="tag ${b.killed ? 'k' : ''}">${b.killed ? 'VAINCU' : 'RENCONTRÉ'}</span></span></button>`
      : `<div class="mon unk"><span>???</span><span class="tag">${RANK[mm.rank].label}</span></div>`;
  }
  h += `<div class="note">Une fiche se révèle à la première rencontre, les butins à la première victoire.</div></div>`;
  const nT = Object.keys(m.trophies).length, all = Object.keys(MONSTERS).length;
  h += `<div class="sec"><h3>TROPHÉES <span>${nT} / ${all}</span></h3><div class="trophies">` + Object.entries(MONSTERS).map(([id, mm]) => {
    const own = m.trophies[id], b = m.bestiary[id], tr = mm.trophy;
    return own ? `<div class="troph own"><b>${tr.icon} ${tr.name}</b><span>${tr.desc}</span></div>`
      : `<div class="troph"><b>🔒 ???</b><span>${b && b.killed ? `Sur ${mm.name} · ${Math.round(tr.chance*100)} %` : 'Source inconnue'}</span></div>`;
  }).join('') + `</div><div class="note">Butins uniques : un seul exemplaire par monstre, bonus permanent sur tous les héros futurs.</div></div>`;
  return h;
}
export function renderPane(){ setHTML($('pane'), S.tab === 'explore' ? exploreHTML() : S.tab === 'village' ? villageHTML() : bestiaryHTML()); }
$('pane').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.act === 'explore') explore(S.G, S.selected);
  else if (b.dataset.act === 'abandon') abandon(S.G);
  else if (b.dataset.act === 'tab-village') S.tab = 'village';
  else if (b.dataset.buy){ if (buy(S.G, b.dataset.buy)){ saveMeta(); if (loopFresh()) startLoop(S.G); } }
  else if (b.dataset.mon) openMonster(b.dataset.mon, +b.dataset.lvl || null);
  consumeEvents(); render();
});

