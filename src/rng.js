// Générateur congruentiel linéaire à graine : même suite de nombres à chaque lancement (simu, captures, effets visuels).
// s reste un entier < 2^32 et s × A < 2^53 : le calcul en flottant est exact.
const A = 1664525;
const C = 1013904223;
const M = 4294967296; // 2^32

export function lcg(seed) {
  let s = seed;
  return () => {
    s = (s * A + C) % M;
    return s / M;
  };
}
