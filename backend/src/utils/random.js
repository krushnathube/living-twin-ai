export const rnd = (a, b) => a + Math.random() * (b - a);
export const ri = (a, b) => Math.floor(rnd(a, b + 1));
export const pick = (arr) => arr[ri(0, arr.length - 1)];
export const round = (n, d = 2) => +n.toFixed(d);
export const id = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
