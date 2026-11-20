// Données des ennemis : monstres, rangs, composition (quel monstre donne quel matériau).
// trophy : butin unique (une seule fois, bonus permanent)
export const MONSTERS = {
  mulot: {
    name: 'Mulot dentu',
    por: '🐀',
    rank: 'normal',
    hp: 0.85,
    pow: 0.9,
    arm: 0,
    dodge: 0.06,
    speed: 0.9,
    drops: [{res: 'gold', min: 1, max: 2, chance: 1}],
    trophy: {
      name: 'Incisive de mulot',
      icon: '🦷',
      chance: 0.04,
      desc: '+3 % de critique',
      apply: s => (s.crit += 0.03),
    },
  },
  sanglier: {
    name: 'Sanglier',
    por: '🐗',
    rank: 'normal',
    hp: 1.25,
    pow: 1.05,
    arm: 1,
    dodge: 0,
    speed: 1.25,
    drops: [
      {res: 'gold', min: 2, max: 4, chance: 1},
      {res: 'wood', min: 1, max: 1, chance: 0.15},
    ],
    trophy: {name: 'Défense de sanglier', icon: '🦴', chance: 0.03, desc: '+10 PV max', apply: s => (s.hp += 10)},
  },
  sanglier_alpha: {
    name: 'Sanglier alpha',
    por: '🐗',
    rank: 'elite',
    hp: 3,
    pow: 1.35,
    arm: 2,
    dodge: 0,
    speed: 1.2,
    drops: [
      {res: 'gold', min: 10, max: 15, chance: 1},
      {res: 'wood', min: 1, max: 3, chance: 0.5},
    ],
    trophy: {name: 'Couronne de boue', icon: '🪖', chance: 0.15, desc: '+1 armure', apply: s => (s.arm += 1)},
  },
  loup: {
    name: 'Loup gris',
    por: '🐺',
    rank: 'normal',
    hp: 0.9,
    pow: 1,
    arm: 0,
    dodge: 0.1,
    speed: 0.8,
    drops: [{res: 'gold', min: 2, max: 4, chance: 1}],
    trophy: {name: 'Croc de loup', icon: '🐾', chance: 0.03, desc: "+4 % d'esquive", apply: s => (s.dodge += 0.04)},
  },
  golem: {
    name: 'Golem de pierre',
    por: '🗿',
    rank: 'normal',
    hp: 1.5,
    pow: 1,
    arm: 2,
    dodge: 0,
    speed: 1.6,
    drops: [
      {res: 'gold', min: 3, max: 5, chance: 1},
      {res: 'ore', min: 1, max: 1, chance: 0.4},
    ],
    trophy: {name: 'Cœur de pierre', icon: '💠', chance: 0.03, desc: '+1 armure', apply: s => (s.arm += 1)},
  },
  ours: {
    name: 'Ours ancien',
    por: '🐻',
    rank: 'elite',
    hp: 3.2,
    pow: 1.4,
    arm: 2,
    dodge: 0.02,
    speed: 1.3,
    drops: [
      {res: 'gold', min: 20, max: 30, chance: 1},
      {res: 'ore', min: 1, max: 2, chance: 0.5},
    ],
    trophy: {name: "Griffe de l'Ours ancien", icon: '🔱', chance: 0.15, desc: '+2 puissance', apply: s => (s.pow += 2)},
  },
  gardien: {
    name: 'Gardien du Sablier',
    por: '🗽',
    rank: 'boss',
    hp: 6,
    pow: 1.6,
    arm: 3,
    dodge: 0.05,
    speed: 1.1,
    drops: [{res: 'gold', min: 80, max: 100, chance: 1}],
    trophy: {
      name: 'Fragment de sablier',
      icon: '⏳',
      chance: 1,
      desc: '+15 s de boucle',
      apply: s => (s.loopTime += 15),
    },
  },
};
// net : victoires au bout desquelles le carnet nomme l'outil conseillé même sans comparaison (filet, étape 2b)
export const RANK = {
  normal: {label: 'Monstre', xp: 1, renown: 2, net: 10},
  elite: {label: 'Élite', xp: 3, renown: 10, net: 2},
  boss: {label: 'Boss', xp: 5, renown: 50, net: 1},
};

// outil conseillé par le carnet du bestiaire et sa raison (textes provisoires : la session lore des scribes les reprendra)
export const ADVICE = {
  mulot: {tool: 'coutelas', why: "Tout en cuir, presque rien au cœur : on l'écorche."},
  sanglier: {tool: 'coutelas', why: 'Du cuir en pagaille sous la soie : le coutelas en tire moitié plus.'},
  sanglier_alpha: {tool: 'pioche', why: 'Sa défense dort au cœur : le marteau la brise, la pioche la rapporte.'},
  loup: {tool: 'coutelas', why: 'Vif et sans armure : on le prend de vitesse, la fourrure vient avec.'},
  golem: {tool: 'marteau', why: "La pierre se moque des lames : la masse passe outre l'armure."},
  ours: {tool: 'pioche', why: 'Les griffes sont au fond : creuser droit, sans rien casser.'},
  gardien: {tool: 'marteau', why: "On ne vient pas pour le sable : on vient pour qu'il tombe."},
};

// composition : matériau de chaque strate ; veine.sprite = les veines brillantes du sprite,
// sinon veine.frac = part des pixels en veine, tracée au hasard à chaque apparition
export const COMPOSITION = {
  mulot: {commun: 'cuir', peu: 'os', rare: 'defense'},
  sanglier: {commun: 'cuir', peu: 'os', rare: 'defense', veine: {mat: 'braise', frac: 0.03}},
  sanglier_alpha: {commun: 'cuir', peu: 'os', rare: 'defense', veine: {mat: 'braise', frac: 0.06}},
  loup: {commun: 'fourrure', peu: 'os', rare: 'griffe', veine: {mat: 'givre', frac: 0.03}},
  golem: {commun: 'pierre', peu: 'eclat', rare: 'cristal', veine: {mat: 'etincelle', sprite: true}},
  ours: {commun: 'fourrure', peu: 'os', rare: 'griffe', veine: {mat: 'givre', frac: 0.06}},
  gardien: {commun: 'eclat', peu: 'cristal', rare: 'sable', veine: {mat: 'etincelle', sprite: true}},
};
