import {MONSTERS, RANK, RES, TILES} from '../data.js';
import {createGame, monsterStats, newLoop} from '../engine.js';
import {$, S, SAVE_KEY, anyUpgrade, pct, saveMeta, spr} from './state.js';
import {render} from './main.js';

// ---------- modales ----------
let resetArm = false;
export function openMonster(id, lvl){
  const mm = MONSTERS[id], b = S.G.meta.bestiary[id] || {}, L = lvl || TILES.find(t => (t.waves || []).flat().includes(id)).lvl;
  const s = monsterStats(id, L), seen = b.seen, q = v => seen ? v : '???', tr = mm.trophy, own = S.G.meta.trophies[id];
  const rows = [['Santé', q(s.maxHp)], ['Puissance', q(s.pow.toFixed(1))], ['Armure', q(s.arm)], ['Esquive', q(pct(s.dodge))], ['Critique', q(pct(s.crit))], ['Attaque toutes les', q(s.speed + ' s')]];
  const drops = b.killed ? `<div class="drops">${mm.drops.map(d => `<div class="drop">${RES[d.res].icon}<em>${d.min === d.max ? d.min : d.min + '~' + d.max}</em><small>${Math.round(d.chance*100)}%</small></div>`).join('')}
      <div class="drop uniq ${own ? 'got' : ''}" title="${tr.name} — ${tr.desc}">${tr.icon}<em>${own ? '✓' : '🏆'}</em><small>${Math.round(tr.chance*100)}%</small></div></div>
      <div class="note">🏆 ${tr.name} : ${tr.desc} — unique, permanent${own ? ' (obtenu)' : ''}.</div>`
    : `<div class="note">Bats-le une fois pour révéler ses butins.</div>`;
  $('mbox').innerHTML = `<button class="x" data-close>×</button><div style="text-align:center;font-size:48px">${seen ? spr(id, mm.por) : '❔'}</div><h2>${seen ? mm.name : '???'}</h2><div class="sub">${RANK[mm.rank].label} · Niveau ${L}</div>
    <div class="divh"><span>STATS</span></div>${rows.map(([k,v]) => `<div class="row"><span class="k">${k}</span><b>${v}</b></div>`).join('')}
    ${seen ? '' : '<div class="note">Rencontre-le une fois pour révéler sa fiche.</div>'}
    <div class="divh"><span>BUTINS</span></div>${drops}`;
  S.modalMode = 'monster'; $('modal').hidden = false;
}
export function openLoopEnd(){
  const o = S.G.run.over, g = o.gains;
  const why = {death:`Le héros est tombé face à <b>${o.enemyName}</b>.`, time:'Le sablier s\'est vidé.', return:'Le héros est rentré au village.'}[o.reason];
  $('mbox').innerHTML = `<h2>⏳ La boucle se referme</h2><div class="sub">Boucle ${o.loop} · ${why}</div>
    <div class="divh"><span>CE QUE TU AS FAIT</span></div>
    <div class="row"><span class="k">Niveau atteint</span><b>${o.lvl}</b></div>
    <div class="row"><span class="k">Cases explorées</span><b>${o.tilesDone}</b></div>
    <div class="row"><span class="k">Monstres vaincus</span><b>${g.kills}</b></div>
    <div class="divh"><span>CE QUE LE VILLAGE RETIENT</span></div>
    <div class="gains">
      <div>⭐ +${g.renown}<span>Renommée</span></div><div>🪙 +${g.gold}<span>Or</span></div>
      <div>🪵 +${g.wood} · 🪨 +${g.ore}<span>Matériaux</span></div><div>🗺️ +${g.tiles} · 📖 +${g.monsters} · 🏆 +${g.trophies}<span>Cases · fiches · trophées</span></div>
    </div>
    <div class="note">Le héros oublie son niveau. Toi, tu gardes la carte, le bestiaire, les trophées et le village.</div>
    ${anyUpgrade() ? '<button class="btn" data-newloop data-go="village">❗ AMÉLIORER LE VILLAGE D\'ABORD</button><button class="btn small" data-newloop>NOUVELLE BOUCLE ⟳</button>'
      : '<button class="btn" data-newloop>NOUVELLE BOUCLE ⟳</button>'}`;
  S.modalMode = 'loop'; $('modal').hidden = false;
}
export function openBoss(){
  $('mbox').innerHTML = `<div style="text-align:center;font-size:52px">🗽</div><h2>Le Gardien du Sablier est tombé</h2><div class="sub">Fin du contenu du prototype</div>
    <div class="note" style="margin:14px 0">Le sablier se fissure… La suite (la mine, la forge à recettes, les autres époques) arrivera dans les prochaines versions. Tu peux continuer à boucler pour compléter tes trophées.</div>
    <button class="btn" data-close>CONTINUER</button>`;
  S.modalMode = 'boss'; $('modal').hidden = false;
}
$('modal').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (e.target.id === 'modal' && S.modalMode !== 'loop'){ closeModal(); return; }
  if (!b) return;
  if (b.hasAttribute('data-newloop')){ newLoop(S.G); saveMeta(); S.tab = b.dataset.go ? 'village' : 'explore'; S.view = 'map'; S.lastSceneTile = null; closeModal(); }
  else if (b.hasAttribute('data-close')) closeModal();
});
function closeModal(){ $('modal').hidden = true; S.modalMode = null; if (S.G.run.over) openLoopEnd(); render(); }

$('resetBtn').addEventListener('click', () => {
  if (!resetArm){ resetArm = true; $('resetBtn').textContent = 'Clique encore pour tout effacer'; setTimeout(() => { resetArm = false; $('resetBtn').textContent = 'Réinitialiser la sauvegarde'; }, 3000); return; }
  try { localStorage.removeItem(SAVE_KEY); } catch(e){}
  S.G = createGame(null); resetArm = false; $('resetBtn').textContent = 'Réinitialiser la sauvegarde'; S.selected = TILES[2].id; S.view = 'map'; S.lastSceneTile = null; closeModal();
});

