// Données du lore joué (texte : docs/lore.md) : scène du premier combat, vestiges, phrase du premier matin.

// Scène du premier combat (R2) : au premier Mulot dentu de la sauvegarde, une bulle par geste
export const FIRST_FIGHT = {
  monster: 'mulot',
  vestige: 'cle',
  coup: 'Du temps tassé. Ça se creuse, ça.',
  heartHint: 'Clique sur le cœur.',
  heart: 'On ne tue pas ça. On le descend.',
  stow: 'Il la range, sans se demander à qui elle était.',
};

// Vestiges : restes d'une journée passée, gardés d'une boucle à l'autre (meta.vestiges). Un seul en jeu pour l'instant,
// les quatre autres de lore.md attendent le carnet des vestiges.
export const VESTIGES = {
  cle: {
    name: 'Clé de la lampe de Grésille',
    icon: '🗝️',
    monster: 'mulot',
    text: 'Elle ouvre la lampe de la mine. Tu l’as perdue un matin. Lequel ?',
  },
};

// Pourquoi il part le matin : bulle du Radoteur, une fois, au début de la 1re boucle, juste après l'intro
export const FIRST_MORNING = 'Du sable fin file entre les pavés, vers les Collines grises. Une veine, ça se suit.';
