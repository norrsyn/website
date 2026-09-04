/**
 * THE BRIDGE, THEN THE STATEMENT
 *
 * As the market collapses into the line, four beats pass through one place
 * in the frame: the promise, the principle, and then the statement that the
 * machine is starting — its plain line first, its serif line as the last of
 * the market goes. The first two dissolve to make room for the next; the
 * statement stays and rides out of the frame with the hero. Every beat is a
 * pure function of the collapse progress: the same function drives the
 * sticky hero (progress 0..1) and the single-frame journey.
 */
import { smooth, lerp } from './stage.js';

// Windows in collapse progress. The first waits until the hero's own words
// have gone (they fade by 0.34).
export const BEATS = [
  { a: 0.26, b: 0.5 },
  { a: 0.54, b: 0.74 },
  { a: 0.76 },
  { a: 0.88 },
];

export function applyCascade(items, p) {
  for (let i = 0; i < items.length; i++) {
    const el = items[i];
    const { a, b } = BEATS[i] || { a: 0 };
    const tIn = smooth(a, a + 0.1, p);
    const tOut = b == null ? 0 : smooth(b - 0.08, b, p);
    const o = tIn * (1 - tOut);
    const dy = lerp(14, 0, tIn) - 10 * tOut;
    const key = `${o.toFixed(3)}|${dy.toFixed(1)}`;
    if (el.dataset.k === key) continue;
    el.dataset.k = key;
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
  }
}
