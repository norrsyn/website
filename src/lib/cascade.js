/**
 * THE STATEMENT, IN TWO BEATS
 *
 * As the market collapses into the line, the hero's statement resolves in
 * two beats — the plain line first, the serif line as the last of the
 * market goes — and then stays, riding out of the frame with the hero. Each
 * beat is a pure function of the collapse progress: the same function drives
 * the sticky hero (progress 0..1) and the single-frame journey.
 */
import { smooth, lerp } from './stage.js';

// Where each beat resolves, in collapse progress. The first waits until the
// hero's own words have gone (they fade by 0.34).
export const BEATS = [0.3, 0.58];

export function applyCascade(items, p) {
  for (let i = 0; i < items.length; i++) {
    const el = items[i];
    const a = BEATS[i] ?? 0;
    const t = smooth(a, a + 0.16, p);
    const dy = lerp(14, 0, t);
    const key = `${t.toFixed(3)}`;
    if (el.dataset.k === key) continue;
    el.dataset.k = key;
    el.style.opacity = t.toFixed(3);
    el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
  }
}
