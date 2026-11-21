import {S, anyUpgrade} from '../shared/state.js';
import {$} from '../shared/dom.js';
import {gotText} from '../shared/format.js';
import {RECIPES} from '../village/forge.data.js';

// équipement forgé porté pendant la boucle : il s'use avec elle (non permanent en 2b)
function wornOutHTML(equip) {
  const ids = Object.values(equip);
  if (!ids.length) return '';
  const names = ids.map(id => `${RECIPES[id].icon} ${RECIPES[id].name}`).join(', ');
  return `<div class="note">Ton équipement s'use avec la boucle : ${names}. Reforge-le à la forge du village.</div>`;
}

// ---------- fin de boucle, boss vaincu ----------
export function openLoopEnd() {
  const o = S.G.run.over,
    g = o.gains;
  const why = {
    death: `Le héros est tombé face à <b>${o.enemyName}</b>.`,
    time: "Le sablier s'est vidé.",
    return: 'Le héros a laissé filer le sablier.',
  }[o.reason];
  $('mbox').innerHTML = `<h2>⏳ La boucle se referme</h2><div class="sub">Boucle ${o.loop} · ${why}</div>
    <div class="divh"><span>CE QUE TU AS FAIT</span></div>
    <div class="row"><span class="k">Niveau atteint</span><b>${o.lvl}</b></div>
    <div class="row"><span class="k">Cases explorées</span><b>${o.tilesDone}</b></div>
    <div class="row"><span class="k">Monstres vaincus</span><b>${g.kills}</b></div>
    <div class="divh"><span>CE QUE LE VILLAGE RETIENT</span></div>
    <div class="gains">
      <div>⭐ +${g.renown}<span>Renommée</span></div><div>🪙 +${g.gold}<span>Or</span></div>
      <div>🪵 +${g.wood} · 🪨 +${g.ore}<span>Matériaux</span></div>${gotText(g.mats) ? `<div style="grid-column:1/-1">${gotText(g.mats)}<span>Extrait des monstres</span></div>` : ''}<div>🗺️ +${g.tiles} · 📖 +${g.monsters} · 🏆 +${g.trophies}<span>Cases · fiches · trophées</span></div>
    </div>
    <div class="note">Le héros oublie son niveau. Toi, tu gardes la carte, le bestiaire, les trophées et le village.</div>
    ${wornOutHTML(S.G.meta.equip)}
    ${
      anyUpgrade()
        ? '<button class="btn" data-newloop data-go="village">❗ AMÉLIORER LE VILLAGE D\'ABORD</button><button class="btn small" data-newloop>NOUVELLE BOUCLE ⟳</button>'
        : '<button class="btn" data-newloop>NOUVELLE BOUCLE ⟳</button>'
    }`;
  S.modalMode = 'loop';
  $('modal').hidden = false;
}
export function openBoss() {
  $('mbox').innerHTML =
    `<div style="text-align:center;font-size:52px">🗽</div><h2>Le Gardien du Sablier est tombé</h2><div class="sub">Fin du contenu du prototype</div>
    <div class="note" style="margin:14px 0">Le sablier se fissure… La suite (la mine, la forge à recettes, les autres époques) arrivera dans les prochaines versions. Tu peux continuer à boucler pour compléter tes trophées.</div>
    <button class="btn" data-close>CONTINUER</button>`;
  S.modalMode = 'boss';
  $('modal').hidden = false;
}
