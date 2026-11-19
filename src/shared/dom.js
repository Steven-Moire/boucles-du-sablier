// Accès au DOM partagés par toutes les vues.
export const $ = id => document.getElementById(id);
export const setHTML = (el, html) => {
  if (el._h !== html) {
    el.innerHTML = html;
    el._h = html;
  }
};
// relance l'animation portée par la classe cls ; la classe est retirée à la fin pour pouvoir la reposer,
// et si l'animation tourne encore, elle repart du début
export function anim(el, cls) {
  if (!el) return;
  if (el.classList.contains(cls)) {
    for (const a of el.getAnimations()) a.currentTime = 0;
    return;
  }
  el.classList.add(cls);
  const done = e => {
    if (e.target !== el) return; // animationend remonte aussi depuis les enfants (nombres flottants, éclats)
    el.classList.remove(cls);
    el.removeEventListener('animationend', done);
  };
  el.addEventListener('animationend', done);
}

// ---------- toasts ----------
export function toast(title, text) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.innerHTML = `<b>${title}</b>${text}`;
  $('toasts').appendChild(d);
  setTimeout(() => d.remove(), 4000);
}
