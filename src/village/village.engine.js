// Moteur pur (aucun DOM) : améliorations du village.
import {UPGRADES} from './village.data.js';

export function canAfford(meta, cost) {
  return Object.keys(cost).every(k => meta[k] >= cost[k]);
}
export function upgradeState(G, key) {
  const u = UPGRADES[key],
    n = G.meta.upgrades[key] || 0,
    cost = u.cost(n);
  return {
    u,
    n,
    cost,
    unlocked: G.meta.renown >= u.req,
    maxed: n >= u.max,
    ok: G.meta.renown >= u.req && n < u.max && canAfford(G.meta, cost),
  };
}
export function buy(G, key) {
  const s = upgradeState(G, key);
  if (!s.ok) return false;
  for (const k in s.cost) G.meta[k] -= s.cost[k];
  G.meta.upgrades[key] = s.n + 1;
  return true;
}
