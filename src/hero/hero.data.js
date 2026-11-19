// Données du héros : statistiques de base, progression, outils, compétences.
export const HERO_BASE = {hp: 40, pow: 6, arm: 1, dodge: 0.05, crit: 0.05, acc: 0, speed: 0.9};
export const HERO_PER_LVL = {hp: 6, pow: 1.2, arm: 0.4};
export const xpNeeded = l => Math.round(10 * Math.pow(l, 1.5));

// outils (= types d'armes, v2) : every = multiplicateur du temps entre deux attaques du héros (0,9 s de base),
// dmg = multiplicateur de dégâts, crit = critique en plus, pierce = armure ignorée ;
// shatter = part des pixels de cœur brisés (perdus), skin = pixels de surface comptés en plus
export const TOOLS = {
  pioche: {
    name: 'Pioche',
    icon: '⛏️',
    every: 1,
    dmg: 1,
    crit: 0,
    pierce: 0,
    shatter: 0,
    skin: 1,
    desc: "Équilibrée. Creuse un tunnel jusqu'au point visé : atteint le cœur intact.",
  },
  marteau: {
    name: 'Marteau',
    icon: '🔨',
    every: 14 / 9,
    dmg: 1.5,
    crit: 0,
    pierce: 2,
    shatter: 0.6,
    skin: 1,
    desc: "Lourd : frappe toutes les 1,4 s pour ×1,5, ignore 2 d'armure. Cratère à l'impact : 60 % du cœur se brise.",
  },
  coutelas: {
    name: 'Coutelas',
    icon: '🔪',
    every: 2 / 3,
    dmg: 0.7,
    crit: 0.05,
    pierce: 0,
    shatter: 0,
    skin: 1.5,
    desc: 'Rapide : frappe toutes les 0,6 s pour ×0,7, +5 % de critique. Écorche la surface : +50 % de matériau commun.',
  },
};
export const DEFAULT_TOOL = 'pioche';

// compétences actives : se déclenchent seules dès que leur recharge est pleine
export const SKILLS = {
  coup: {name: 'Coup puissant', icon: '🗡️', cd: 7, desc: 'Frappe la cible pour 250 % de la puissance. Ne rate jamais.'},
  tourbillon: {
    name: 'Tourbillon',
    icon: '🌀',
    cd: 9,
    desc: 'Frappe tous les ennemis pour 120 % de la puissance.',
    unlock: {upg: 'entraineur', lvl: 3, txt: 'Entraîneur niv 3'},
  },
  souffle: {
    name: 'Second souffle',
    icon: '💚',
    cd: 15,
    desc: 'Sous 50 % de PV : rend 25 % des PV max.',
    unlock: {upg: 'forge', lvl: 2, txt: 'Forge niv 2'},
  },
};
