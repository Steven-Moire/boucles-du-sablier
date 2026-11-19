// ======================= COMBAT-MINAGE =======================
// Chaque monstre est sa grille de pixels (src/enemies/grids.generated.js). Les dégâts creusent ; on garde ce qu'on extrait.
// Matériaux extraits (gardés par le village, comme l'or).
export const MATS = {
  cuir: {icon: '🟫', name: 'Cuir'},
  fourrure: {icon: '🐺', name: 'Fourrure'},
  pierre: {icon: '🧱', name: 'Pierre'},
  os: {icon: '🦴', name: 'Os'},
  eclat: {icon: '🔹', name: 'Éclat'},
  defense: {icon: '🦷', name: 'Défense'},
  griffe: {icon: '🐾', name: 'Griffe'},
  cristal: {icon: '💎', name: 'Cristal'},
  braise: {icon: '🔥', name: 'Braise'},
  givre: {icon: '❄️', name: 'Givre'},
  etincelle: {icon: '⚡', name: 'Étincelle'},
  sable: {icon: '⏳', name: 'Sable du sablier'},
};
// strates : vie d'un pixel, et nombre de pixels extraits pour 1 unité de matériau
export const STRATA = {
  croute: {hp: 1, label: 'Croûte'},
  commun: {hp: 1, yield: 450, label: 'Surface'},
  peu: {hp: 2, yield: 300, label: 'Profondeur'},
  rare: {hp: 3, yield: 220, label: 'Cœur'},
  veine: {hp: 2, yield: 100, label: 'Veine'},
};
// effondrement : part de la vie totale des pixels à creuser pour abattre le monstre (calée sur ses PV) ;
// peu : part des pixels profonds en strate « profondeur » ; core : part en cœur selon le rang (le rare vient surtout des élites)
export const DIG = {collapse: 0.3, peu: 0.1, core: {normal: 0.005, elite: 0.08, boss: 0.1}};
