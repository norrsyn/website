/**
 * THE PASSAGE
 *
 * As the market collapses into the line, one thought is written down the
 * page, line under line — each stays as the next arrives — until the last
 * line answers it. The whole composition then recedes, and the statement
 * that starts the machine takes its place. Every line is a pure function of
 * the collapse progress; the same function drives the sticky hero and the
 * single-frame journey.
 */
import { smooth, lerp } from './stage.js';

// Where each line of the thought resolves, in collapse progress; each takes
// 0.08 to arrive. The first waits until the hero's own words have gone.
export const THOUGHT = [0.14, 0.25, 0.36, 0.47, 0.64];
// The finished thought holds, then recedes as one.
export const RECEDE = [0.82, 0.9];
// The statement that answers it.
export const STATEMENT = [[0.9, 0.95], [0.95, 1.0]];

function set(el, o, dy) {
  const key = `${o.toFixed(3)}|${dy.toFixed(1)}`;
  if (el.dataset.k === key) return;
  el.dataset.k = key;
  el.style.opacity = o.toFixed(3);
  el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0)`;
}

export function applyCascade({ lines, block, statement }, p) {
  for (let i = 0; i < lines.length; i++) {
    const t = smooth(THOUGHT[i] ?? 0, (THOUGHT[i] ?? 0) + 0.08, p);
    set(lines[i], t, lerp(10, 0, t));
  }
  if (block) {
    const r = smooth(RECEDE[0], RECEDE[1], p);
    set(block, 1 - r, -14 * r);
  }
  for (let i = 0; i < statement.length; i++) {
    const [a, b] = STATEMENT[i] ?? [1, 1];
    const t = smooth(a, b, p);
    set(statement[i], t, lerp(12, 0, t));
  }
}
