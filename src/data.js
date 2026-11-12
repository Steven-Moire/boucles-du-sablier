// Données du jeu : biomes, cases, monstres, compétences, bâtiments.
// ======================= DONNÉES =======================
export const BASE_LOOP_TIME = 75;               // secondes d'action par boucle
export const HERO_BASE = {hp:40, pow:6, arm:1, dodge:.05, crit:.05, acc:0, speed:.9};
export const HERO_PER_LVL = {hp:6, pow:1.2, arm:.4};
export const xpNeeded = l => Math.round(10 * Math.pow(l, 1.5));
export const REST_RATE = .1;                    // source : 10 % des PV max par seconde

export const BIOMES = {
  village:{name:'Village', color:'#e8d6a8'},
  pres:{name:"Prés de l'Aube", color:'#a5d46c', scene:'linear-gradient(180deg,#9fd0e8 0%,#cfe8b0 45%,#7fb556 46%,#5c8f3c 100%)'},
  collines:{name:'Collines grises', color:'#c2ae9b', scene:'linear-gradient(180deg,#8c9bb0 0%,#c8c2b8 45%,#9a8b7b 46%,#6e6257 100%)'},
  puits:{name:'Puits ancien', color:'#676c78'},
};
export const TYPES = {
  village:{icon:'🏠', label:'Village'},
  combat:{icon:'⚔️', label:'Exploration'},
  elite:{icon:'💀', label:'Repaire'},
  boss:{icon:'👑', label:'Boss'},
  wood:{icon:'🌳', label:'Récolte'},
  ore:{icon:'⛏️', label:'Filon'},
  spring:{icon:'💧', label:'Source'},
  chest:{icon:'🎁', label:'Trésor'},
  locked:{icon:'🔒', label:'Verrouillé'},
};
export const RES = {gold:{icon:'🪙', name:'Or'}, wood:{icon:'🪵', name:'Bois'}, ore:{icon:'🪨', name:'Minerai'}, renown:{icon:'⭐', name:'Renommée'}};

// waves : chaque vague = un groupe d'ennemis combattus en même temps
export const TILES = [
  {x:4,y:6,type:'village', biome:'village', name:'Village', lvl:0},
  {x:4,y:7,type:'locked', biome:'puits', name:'Puits ancien', lvl:0},
  // Prés de l'Aube (nord)
  {x:4,y:5,type:'combat', biome:'pres', name:"Lisière de l'Aube", lvl:1, waves:[['mulot'],['mulot'],['mulot','mulot']]},
  {x:4,y:4,type:'combat', biome:'pres', name:'Prairie haute', lvl:2, waves:[['mulot','mulot'],['sanglier'],['mulot','sanglier']]},
  {x:3,y:4,type:'wood',   biome:'pres', name:'Bosquet', lvl:1},
  {x:5,y:4,type:'combat', biome:'pres', name:'Chemin des bornes', lvl:2, waves:[['sanglier'],['sanglier'],['sanglier','mulot']]},
  {x:6,y:4,type:'spring', biome:'pres', name:'Source claire', lvl:2},
  {x:5,y:3,type:'combat', biome:'pres', name:'Champs brûlés', lvl:3, waves:[['sanglier','mulot'],['mulot','mulot','mulot'],['sanglier']]},
  {x:5,y:2,type:'elite',  biome:'pres', name:'Bauge du Roi', lvl:4, waves:[['sanglier','sanglier'],['sanglier_alpha']]},
  {x:6,y:2,type:'chest',  biome:'pres', name:'Autel oublié', lvl:4},
  // Collines grises (ouest)
  {x:3,y:6,type:'combat', biome:'collines', name:'Pente rocailleuse', lvl:3, waves:[['loup'],['loup','loup'],['loup']]},
  {x:2,y:6,type:'combat', biome:'collines', name:'Col du vent', lvl:4, waves:[['loup','loup'],['golem'],['loup','golem']]},
  {x:2,y:7,type:'ore',    biome:'collines', name:'Affleurement', lvl:3},
  {x:1,y:6,type:'combat', biome:'collines', name:'Éboulis', lvl:5, waves:[['golem'],['golem'],['golem','loup']]},
  {x:1,y:5,type:'spring', biome:'collines', name:'Halte du berger', lvl:5},
  {x:1,y:4,type:'combat', biome:'collines', name:'Crête aux loups', lvl:6, waves:[['loup','loup'],['loup','loup','loup'],['golem']]},
  {x:1,y:3,type:'elite',  biome:'collines', name:"Antre de l'Ours", lvl:7, waves:[['loup','golem'],['ours']]},
  {x:1,y:2,type:'combat', biome:'collines', name:'Escalier de pierre', lvl:7, waves:[['golem','golem'],['loup','loup'],['golem']]},
  {x:1,y:1,type:'boss',   biome:'collines', name:'Sommet du Sablier', lvl:8, waves:[['gardien']]},
];
export const tid = (x,y) => x + ',' + y;
export const TILE_MAP = {}; TILES.forEach(t => { t.id = tid(t.x,t.y); TILE_MAP[t.id] = t; });
export const VILLAGE = TILES[0].id;
export const neighbors = id => { const t = TILE_MAP[id]; return [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy]) => tid(t.x+dx,t.y+dy)).filter(n => TILE_MAP[n]); };

// trophy : butin unique (une seule fois, bonus permanent)
export const MONSTERS = {
  mulot:{name:'Mulot dentu', por:'🐀', rank:'normal', hp:.85, pow:.9, arm:0, dodge:.06, speed:.9,
    drops:[{res:'gold',min:1,max:2,chance:1}],
    trophy:{name:'Incisive de mulot', icon:'🦷', chance:.04, desc:'+3 % de critique', apply:s => s.crit += .03}},
  sanglier:{name:'Sanglier', por:'🐗', rank:'normal', hp:1.25, pow:1.05, arm:1, dodge:0, speed:1.25,
    drops:[{res:'gold',min:2,max:4,chance:1},{res:'wood',min:1,max:1,chance:.15}],
    trophy:{name:'Défense de sanglier', icon:'🦴', chance:.03, desc:'+10 PV max', apply:s => s.hp += 10}},
  sanglier_alpha:{name:'Sanglier alpha', por:'🐗', rank:'elite', hp:3, pow:1.35, arm:2, dodge:0, speed:1.2,
    drops:[{res:'gold',min:10,max:15,chance:1},{res:'wood',min:1,max:3,chance:.5}],
    trophy:{name:'Couronne de boue', icon:'🪖', chance:.15, desc:'+1 armure', apply:s => s.arm += 1}},
  loup:{name:'Loup gris', por:'🐺', rank:'normal', hp:.9, pow:1, arm:0, dodge:.1, speed:.8,
    drops:[{res:'gold',min:2,max:4,chance:1}],
    trophy:{name:'Croc de loup', icon:'🐾', chance:.03, desc:"+4 % d'esquive", apply:s => s.dodge += .04}},
  golem:{name:'Golem de pierre', por:'🗿', rank:'normal', hp:1.5, pow:1, arm:2, dodge:0, speed:1.6,
    drops:[{res:'gold',min:3,max:5,chance:1},{res:'ore',min:1,max:1,chance:.4}],
    trophy:{name:'Cœur de pierre', icon:'💠', chance:.03, desc:'+1 armure', apply:s => s.arm += 1}},
  ours:{name:'Ours ancien', por:'🐻', rank:'elite', hp:3.2, pow:1.4, arm:2, dodge:.02, speed:1.3,
    drops:[{res:'gold',min:20,max:30,chance:1},{res:'ore',min:1,max:2,chance:.5}],
    trophy:{name:"Griffe de l'Ours ancien", icon:'🔱', chance:.15, desc:'+2 puissance', apply:s => s.pow += 2}},
  gardien:{name:'Gardien du Sablier', por:'🗽', rank:'boss', hp:6, pow:1.6, arm:3, dodge:.05, speed:1.1,
    drops:[{res:'gold',min:80,max:100,chance:1}],
    trophy:{name:'Fragment de sablier', icon:'⏳', chance:1, desc:'+15 s de boucle', apply:s => s.loopTime += 15}},
};
export const RANK = {normal:{label:'Monstre', xp:1, renown:2}, elite:{label:'Élite', xp:3, renown:10}, boss:{label:'Boss', xp:5, renown:50}};


// compétences actives : se déclenchent seules dès que leur recharge est pleine
export const SKILLS = {
  coup:{name:'Coup puissant', icon:'🗡️', cd:7, desc:'Frappe la cible pour 250 % de la puissance. Ne rate jamais.'},
  tourbillon:{name:'Tourbillon', icon:'🌀', cd:9, desc:'Frappe tous les ennemis pour 120 % de la puissance.', unlock:{upg:'entraineur', lvl:3, txt:'Entraîneur niv 3'}},
  souffle:{name:'Second souffle', icon:'💚', cd:15, desc:'Sous 50 % de PV : rend 25 % des PV max.', unlock:{upg:'forge', lvl:2, txt:'Forge niv 2'}},
};

export const UPGRADES = {
  entraineur:{name:'Entraîneur', icon:'🥋', req:5, max:20, desc:'+8 PV max et +1 puissance par niveau · niv 3 : apprend Tourbillon',
    cost:n => ({gold:Math.round(8 * Math.pow(1.35, n))}), apply:(s,n) => { s.hp += 8*n; s.pow += n; }},
  forge:{name:'Forge', icon:'⚒️', req:20, max:15, desc:'+1 armure et +0,5 puissance par niveau · niv 2 : apprend Second souffle',
    cost:n => ({gold:Math.round(10 * Math.pow(1.4, n)), ore:1 + n}), apply:(s,n) => { s.arm += n; s.pow += .5*n; }},
  horloge:{name:'Horloge du clocher', icon:'🕰️', req:35, max:10, desc:'+10 s de temps de boucle par niveau',
    cost:n => ({gold:Math.round(12 * Math.pow(1.45, n)), wood:2 + n}), apply:(s,n) => { s.loopTime += 10*n; }},
};
