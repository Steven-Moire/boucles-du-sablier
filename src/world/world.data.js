// Données du monde : durée de boucle, biomes, types de cases, ressources, cases de la carte.
export const BASE_LOOP_TIME = 75; // secondes d'action par boucle
export const REST_RATE = 0.1; // source : 10 % des PV max par seconde

export const BIOMES = {
  village: {name: 'Village', color: '#e8d6a8'},
  pres: {
    name: "Prés de l'Aube",
    color: '#a5d46c',
    scene: 'linear-gradient(180deg,#9fd0e8 0%,#cfe8b0 45%,#7fb556 46%,#5c8f3c 100%)',
  },
  collines: {
    name: 'Collines grises',
    color: '#c2ae9b',
    scene: 'linear-gradient(180deg,#8c9bb0 0%,#c8c2b8 45%,#9a8b7b 46%,#6e6257 100%)',
  },
  puits: {name: 'Puits ancien', color: '#676c78'},
};
export const TYPES = {
  village: {icon: '🏠', label: 'Village'},
  combat: {icon: '⚔️', label: 'Exploration'},
  elite: {icon: '💀', label: 'Repaire'},
  boss: {icon: '👑', label: 'Boss'},
  wood: {icon: '🌳', label: 'Récolte'},
  ore: {icon: '⛏️', label: 'Filon'},
  spring: {icon: '💧', label: 'Source'},
  chest: {icon: '🎁', label: 'Trésor'},
  locked: {icon: '🔒', label: 'Verrouillé'},
};
export const RES = {
  gold: {icon: '🪙', name: 'Or'},
  wood: {icon: '🪵', name: 'Bois'},
  ore: {icon: '🪨', name: 'Minerai'},
  renown: {icon: '⭐', name: 'Renommée'},
};

// waves : chaque vague = un groupe d'ennemis combattus en même temps
export const TILES = [
  {x: 4, y: 6, type: 'village', biome: 'village', name: 'Village', lvl: 0},
  {x: 4, y: 7, type: 'locked', biome: 'puits', name: 'Puits ancien', lvl: 0},
  // Prés de l'Aube (nord)
  {
    x: 4,
    y: 5,
    type: 'combat',
    biome: 'pres',
    name: "Lisière de l'Aube",
    lvl: 1,
    waves: [['mulot'], ['mulot'], ['mulot', 'mulot']],
  },
  {
    x: 4,
    y: 4,
    type: 'combat',
    biome: 'pres',
    name: 'Prairie haute',
    lvl: 2,
    waves: [['mulot', 'mulot'], ['sanglier'], ['mulot', 'sanglier']],
  },
  {x: 3, y: 4, type: 'wood', biome: 'pres', name: 'Bosquet', lvl: 1},
  {
    x: 5,
    y: 4,
    type: 'combat',
    biome: 'pres',
    name: 'Chemin des bornes',
    lvl: 2,
    waves: [['sanglier'], ['sanglier'], ['sanglier', 'mulot']],
  },
  {x: 6, y: 4, type: 'spring', biome: 'pres', name: 'Source claire', lvl: 2},
  {
    x: 5,
    y: 3,
    type: 'combat',
    biome: 'pres',
    name: 'Champs brûlés',
    lvl: 3,
    waves: [['sanglier', 'mulot'], ['mulot', 'mulot', 'mulot'], ['sanglier']],
  },
  {
    x: 5,
    y: 2,
    type: 'elite',
    biome: 'pres',
    name: 'Bauge du Roi',
    lvl: 4,
    waves: [['sanglier', 'sanglier'], ['sanglier_alpha']],
  },
  {x: 6, y: 2, type: 'chest', biome: 'pres', name: 'Autel oublié', lvl: 4},
  // Collines grises (ouest)
  {
    x: 3,
    y: 6,
    type: 'combat',
    biome: 'collines',
    name: 'Pente rocailleuse',
    lvl: 3,
    waves: [['loup'], ['loup', 'loup'], ['loup']],
  },
  {
    x: 2,
    y: 6,
    type: 'combat',
    biome: 'collines',
    name: 'Col du vent',
    lvl: 4,
    waves: [['loup', 'loup'], ['golem'], ['loup', 'golem']],
  },
  {x: 2, y: 7, type: 'ore', biome: 'collines', name: 'Affleurement', lvl: 3},
  {
    x: 1,
    y: 6,
    type: 'combat',
    biome: 'collines',
    name: 'Éboulis',
    lvl: 5,
    waves: [['golem'], ['golem'], ['golem', 'loup']],
  },
  {x: 1, y: 5, type: 'spring', biome: 'collines', name: 'Halte du berger', lvl: 5},
  {
    x: 1,
    y: 4,
    type: 'combat',
    biome: 'collines',
    name: 'Crête aux loups',
    lvl: 6,
    waves: [['loup', 'loup'], ['loup', 'loup', 'loup'], ['golem']],
  },
  {x: 1, y: 3, type: 'elite', biome: 'collines', name: "Antre de l'Ours", lvl: 7, waves: [['loup', 'golem'], ['ours']]},
  {
    x: 1,
    y: 2,
    type: 'combat',
    biome: 'collines',
    name: 'Escalier de pierre',
    lvl: 7,
    waves: [['golem', 'golem'], ['loup', 'loup'], ['golem']],
  },
  {x: 1, y: 1, type: 'boss', biome: 'collines', name: 'Sommet du Sablier', lvl: 8, waves: [['gardien']]},
];
export const tid = (x, y) => x + ',' + y;
export const TILE_MAP = {};
TILES.forEach(t => {
  t.id = tid(t.x, t.y);
  TILE_MAP[t.id] = t;
});
export const VILLAGE = TILES[0].id;
export const neighbors = id => {
  const t = TILE_MAP[id];
  return [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
    .map(([dx, dy]) => tid(t.x + dx, t.y + dy))
    .filter(n => TILE_MAP[n]);
};
