// Données du village : bâtiments à améliorer.
export const UPGRADES = {
  entraineur: {
    name: 'Entraîneur',
    icon: '🥋',
    req: 5,
    max: 20,
    desc: '+8 PV max et +1 puissance par niveau · niv 3 : apprend Tourbillon',
    cost: n => ({gold: Math.round(8 * Math.pow(1.35, n))}),
    apply: (s, n) => {
      s.hp += 8 * n;
      s.pow += n;
    },
  },
  forge: {
    name: 'Forge',
    icon: '⚒️',
    req: 20,
    max: 15,
    desc: '+1 armure et +0,5 puissance par niveau · niv 2 : apprend Second souffle',
    cost: n => ({gold: Math.round(10 * Math.pow(1.4, n)), ore: 1 + n}),
    apply: (s, n) => {
      s.arm += n;
      s.pow += 0.5 * n;
    },
  },
  horloge: {
    name: 'Horloge du clocher',
    icon: '🕰️',
    req: 35,
    max: 10,
    desc: '+10 s de temps de boucle par niveau',
    cost: n => ({gold: Math.round(12 * Math.pow(1.45, n)), wood: 2 + n}),
    apply: (s, n) => {
      s.loopTime += 10 * n;
    },
  },
};
