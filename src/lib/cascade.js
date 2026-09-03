/**
 * THE CASCADE
 *
 * Between the hero and Problemet the market collapses into the line, and
 * five lines of thought pass through the frame while it happens — small,
 * large, small, large, small — each a pure function of the collapse
 * progress: it resolves, drifts a little upward, and dissolves. The same
 * function drives the sticky hero (progress 0..1) and the single-frame
 * journey, where the progress runs on past 1 as Problemet rises.
 */
import { smooth, lerp } from './stage.js';

// Windows in collapse progress. The first line waits until the hero's own
// words have gone (they fade by 0.34); the last two run past 1, while the
// hero rises out of the frame.
export const CASCADE = [[0.3, 0.6], [0.48, 0.86], [0.7, 1.02], [0.88, 1.34], [1.16, 1.6]];

export function applyCascade(items, p) {
  for (let i = 0; i < items.length; i++) {
    const el = items[i];
    const [a, b] = CASCADE[i] || [0, 0];
    const o = smooth(a, a + 0.12, p) * (1 - smooth(b - 0.12, b, p));
    const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
    const dy = lerp(16, -16, t);
    const key = `${o.toFixed(3)}|${dy.toFixed(1)}`;
    if (el.dataset.k === key) continue;
    el.dataset.k = key;
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
  }
}
