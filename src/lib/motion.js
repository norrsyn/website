/**
 * Shared motion contract.
 *
 * Two rules, applied everywhere:
 *
 *   1. Content is visible in the DOM. Animations set their own "from" state at
 *      runtime, so a stalled or disabled script leaves a readable page rather
 *      than a blank one. Nothing on this site is revealed by JavaScript alone.
 *
 *   2. `prefers-reduced-motion` is honoured by skipping the animation entirely,
 *      not by shortening it. Scroll-scrubbed layouts fall back to their final
 *      state so the page still communicates the same thing, silently.
 */

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The site's easing vocabulary — weighted, never springy. */
export const EASE = {
  out: 'power3.out',      // arrivals
  inOut: 'power2.inOut',  // transitions between two settled states
  none: 'none',           // anything driven by scroll position
};

/**
 * Reveal failsafe.
 *
 * Scroll reveals are `gsap.from(...)`, which sets its "from" state the moment
 * the tween is created. That is the right trade for a site like this — it
 * avoids the flash you get from deferring the hidden state — but it means a
 * section is invisible in the window between page load and its trigger firing.
 * Normally that window closes on the first scroll measurement.
 *
 * It does not close if ScrollTrigger never measures the page: a throwing effect
 * somewhere else in the tree, a blocked plugin, a browser that suspends rAF for
 * a very long time. The failure mode there is a blank page, which is the one
 * outcome this site is not allowed to have.
 *
 * So: if no ScrollTrigger exists a few seconds after mount, something went
 * wrong, and every reveal is cleared to its natural state. Costs one timer and
 * never fires on a healthy page.
 */
const REVEAL_ATTRS = [
  'data-hero-line', 'data-hero-rise', 'data-hero-eyebrow', 'data-hero-rule',
  'data-phil-line', 'data-phil-item', 'data-phil-rule',
  'data-intro', 'data-funnel-item', 'data-about', 'data-feat-head',
  'data-crit-row', 'data-crit-chip', 'data-stage-count',
  'data-frag', 'data-bundle', 'data-zone', 'data-zone-row',
  'data-fact', 'data-fact-src', 'data-signal', 'data-signal-tier',
  'data-action', 'data-action-rail',
  'data-brief-head', 'data-brief-metric', 'data-brief-group', 'data-brief-block',
  'data-brief-dim', 'data-brief-badge', 'data-brief-src', 'data-brief-rail',
  'data-jrv', 'data-jrz', 'data-portal', 'data-tam', 'data-rv',
].map((a) => `[${a}]`).join(',');

export function installRevealFailsafe(gsap, ScrollTrigger, delay = 4000) {
  const id = setTimeout(() => {
    if (ScrollTrigger.getAll().length > 0) return;
    gsap.set(REVEAL_ATTRS, { clearProps: 'opacity,transform,letterSpacing,strokeDashoffset,width' });
  }, delay);
  return () => clearTimeout(id);
}
