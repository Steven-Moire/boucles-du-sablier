import {S, anim} from './state.js';

// ---------- intro : 5 écrans au premier lancement (texte : docs/lore.md) ----------
// image = assets/sprites/<key>.png (clé dans tools/sprites.json) ; si elle manque, le texte seul reste affiché
const SCREENS = [
  {
    key: 'intro_hameau',
    text: 'Au pied des Collines grises, le hameau des Heurelles vit de sa mine, Grésille. On y compte mal les jours, mais on y creuse bien.',
  },
  {
    key: 'intro_veine',
    text: "On l'appelle le Radoteur : depuis trente ans, il ne parle que de sa veine. Il creuse plus profond que tout le monde, et parle à sa pioche, qui a le bon goût de ne jamais répondre.",
  },
  {
    key: 'intro_chambre',
    text: 'Un matin, la roche cède sur une chambre oubliée. Au milieu, un Sablier plus vieux que le village.',
  },
  {key: 'intro_fele', text: "Un coup de pioche de trop. Le verre se fend, et le sable s'envole jusqu'au hameau."},
  {
    key: 'intro_reveil_sablier',
    text: "Le lendemain, c'était hier. Le Radoteur ne s'en souvient pas. Le village, un peu.",
  },
];

export function playIntro() {
  let i = 0;
  const box = document.createElement('div');
  box.className = 'intro';
  box.id = 'intro';
  box.innerHTML = `<div class="in-frame"><img class="in-img" alt=""><p class="in-text"></p>
    <div class="in-foot"><span class="in-dots"></span><span class="in-hint">clic pour continuer</span></div></div>
    <button class="in-skip">Passer ›</button>`;
  const img = box.querySelector('.in-img');
  img.onerror = () => {
    img.hidden = true;
  };
  const show = () => {
    const sc = SCREENS[i];
    img.hidden = false;
    img.src = `assets/sprites/${sc.key}.png`;
    box.querySelector('.in-text').textContent = sc.text;
    box.querySelector('.in-dots').innerHTML = SCREENS.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
    anim(box.querySelector('.in-frame'), 'in-fade');
  };
  const close = () => {
    box.remove();
    document.removeEventListener('keydown', onKey);
    S.modalMode = null;
  };
  const next = () => {
    i += 1;
    if (i >= SCREENS.length) close();
    else show();
  };
  const onKey = e => {
    if (e.key === 'Escape') close();
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      next();
    }
  };
  box.addEventListener('click', e => {
    if (e.target.closest('.in-skip')) close();
    else next();
  });
  document.addEventListener('keydown', onKey);
  S.modalMode = 'intro'; // met la boucle de jeu en pause
  document.body.appendChild(box);
  show();
}
