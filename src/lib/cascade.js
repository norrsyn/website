/**
 * THE PASSAGE
 *
 * As the market collapses into the line, one thought is written down the
 * page, line under line — each stays as the next arrives — until the last
 * line answers it. The thought then holds, and leaves only as Problemet
 * takes the frame: it rides up with the hero and fades from the top down,
 * so the descent is one movement and never a cut. Every value is a pure
 * function of scroll; the same function drives the sticky hero and the
 * single-frame journey.
 */
import { smooth, lerp } from './stage.js';

// Where each line of the thought resolves, in collapse progress; each takes
// 0.08 to arrive. The first waits until the hero's own words have gone.
export const THOUGHT = [0.12, 0.22, 0.32, 0.42, 0.56, 0.66];

function set(el, o, dy) {
  const key = `${o.toFixed(3)}|${dy.toFixed(1)}`;
  if (el.dataset.k === key) return;
  el.dataset.k = key;
  el.style.opacity = o.toFixed(3);
  el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
}

/** `p` is the collapse progress; `exit` (0..1) is how far the hero has left. */
export function applyCascade({ lines, block }, p, exit = 0) {
  for (let i = 0; i < lines.length; i++) {
    const a = THOUGHT[i] ?? 0;
    const t = smooth(a, a + 0.08, p);
    // The upper lines go first and each is gone before it would pass under
    // the nav; the last line lingers longest.
    const e = smooth(0.02 + 0.055 * i, 0.15 + 0.06 * i, exit);
    set(lines[i], t * (1 - e), lerp(10, 0, t));
  }
  // The whole thought lifts a little ahead of the frame as it leaves.
  if (block) set(block, 1, -22 * exit);
}
