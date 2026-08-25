/**
 * The shared cohort: one seeded population used by chapter 02 (reveal),
 * chapter 03 (elimination) and the thread engine. One source of truth so the
 * companies revealed are exactly the companies later struck.
 */
export const COLS = 24;
export const ROWS = 13;
export const MARKS = COLS * ROWS; // 312 · one mark = ten companies
export const ALIVE_AFTER_03 = 39; // 388 companies / 10

export function buildRanks(n = MARKS, seed = 20260826) {
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({ length: n }, (_, i) => ({ i, r: rnd() }))
    .sort((a, b) => a.r - b.r)
    .map((x, rank) => ({ index: x.i, rank }))
    .sort((a, b) => a.index - b.index)
    .map((x) => x.rank);
}
export const RANKS = buildRanks();
