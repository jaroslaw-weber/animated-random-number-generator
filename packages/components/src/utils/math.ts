export function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
