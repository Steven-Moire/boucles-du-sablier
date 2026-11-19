// Sauvegarde : seul module qui touche localStorage. localStorage peut être indisponible (navigation privée,
// quota plein) : aucune fonction ne lève d'exception vers le jeu, chacune renvoie {ok, error}.
export const SAVE_KEY = 'boucles-sablier-v01';
const META_VERSION = 1;

// meta vaut null s'il n'y a pas de sauvegarde, ou si elle est illisible ou d'une autre version
export function readMeta() {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    const m = s ? JSON.parse(s) : null;
    return {ok: true, meta: m?.v === META_VERSION ? m : null};
  } catch (error) {
    return {ok: false, meta: null, error};
  }
}

export function writeMeta(meta) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(meta));
    return {ok: true};
  } catch (error) {
    return {ok: false, error};
  }
}

export function clearMeta() {
  try {
    localStorage.removeItem(SAVE_KEY);
    return {ok: true};
  } catch (error) {
    return {ok: false, error};
  }
}
