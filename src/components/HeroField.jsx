import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import HeroContent from './HeroContent.jsx';
import { prefersReducedMotion, EASE } from '../lib/motion.js';
import { createField } from '../lib/field.js';
import { applyCascade } from '../lib/cascade.js';
import '../hero-field.css';

// ==========================================================================
// Hero — the field. (Sketch.)
//
// The headline ends in the brand's underscore. After the type has resolved,
// the underscore blinks as a cursor, then a drop falls from it and draws the
// line; where the drop lands, the market wakes around the line and starts
// firing signals. Scrolling pins the hero for one viewport and collapses
// the whole market into the line, which is all that crosses the seam.
//
// The line's x is measured from the underscore (fonts move it) and published
// as --spine-x on <html>, so Problemet's route begins exactly where the
// canvas stops drawing. Everything from the seam on is untouched.
// ==========================================================================
const smooth = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function HeroField() {
  const wrap = useRef(null);
  const root = useRef(null);
  const canvas = useRef(null);
  const cursor = useRef(null);
  const block = useRef(null);
  const collapse = useRef(null);
  const cue = useRef(null);
  const foot = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const sec = root.current;
    let wrapTop = 0;
    let span = 0;

    const progress = () =>
      span > 0 ? Math.min(1, Math.max(0, (window.scrollY - wrapTop) / span)) : 0;

    // Scroll position → DOM state. Position decides; nothing here tweens.
    // The underscore is not in the fade set: the copy goes, the origin of the
    // line stays, and at the end of the pin the frame holds "_" and the line.
    const fades = Array.from(sec.querySelectorAll('[data-hf-fade]'));
    const texts = Array.from(sec.querySelectorAll('[data-hf-text]'));
    const applyP = (p) => {
      const s = (a, b) => smooth(a, b, p);
      // The hero's own words go quickly, so the passage has the frame to itself.
      const o = String(1 - s(0, 0.12));
      fades.forEach((el) => { el.style.opacity = o; });
      const blur = `blur(${(9 * s(0, 0.15)).toFixed(2)}px)`;
      texts.forEach((el) => { el.style.opacity = o; el.style.filter = p > 0.001 ? blur : ''; });
      cue.current.style.opacity = String(1 - s(0, 0.06));
      foot.current.style.opacity = String(1 - s(0, 0.1));
    };

    const field = createField(canvas.current, { reduced, progress, onProgress: applyP });

    // The cascade runs on the collapse's clock and keeps running as the hero
    // scrolls out, so its last lines ride up with the frame — the same
    // contract as the single-frame journey.
    const casItems = {
      lines: Array.from(collapse.current.querySelectorAll('[data-ln]')),
      block: collapse.current.querySelector('[data-thought]'),
    };
    const pExt = () => (span > 0 ? Math.max(0, (window.scrollY - wrapTop) / span) : 0);
    // Past the pin the hero scrolls away; the thought fades as it goes.
    const runCascade = () => { const pe = pExt(); applyCascade(casItems, pe, smooth(1, 1.3, pe)); };
    let casRaf = 0;
    const onCasScroll = () => {
      if (casRaf) return;
      casRaf = requestAnimationFrame(() => { casRaf = 0; runCascade(); });
    };
    window.addEventListener('scroll', onCasScroll, { passive: true });

    const layout = () => {
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      const W = sec.clientWidth;
      const H = sec.clientHeight;
      const c = cursor.current.getBoundingClientRect();
      const ax = Math.round(c.left + c.width / 2 - r.left) + 0.5;
      const oy = Math.round(c.bottom - r.top);
      const hy = Math.min(0.5 * H, Math.max(0.2 * H, oy - 0.09 * H));
      const b = block.current.getBoundingClientRect();
      const hole = { l: b.left - r.left, t: b.top - r.top, r: b.right - r.left, b: b.bottom - r.top };
      wrapTop = wrap.current.getBoundingClientRect().top + window.scrollY;
      span = wrap.current.offsetHeight - sec.offsetHeight;
      sec.style.setProperty('--hf-ax', `${ax}px`);
      document.documentElement.style.setProperty('--spine-x', `${ax}px`);
      window.dispatchEvent(new CustomEvent('norrsyn:spine', { detail: { x: ax } }));
      field.layout({ W, H, dpr: Math.min(2, window.devicePixelRatio || 1), ax, oy, hy, hole });
    };

    layout();
    applyP(progress());
    runCascade();
    const ro = new ResizeObserver(layout);
    ro.observe(sec);
    ro.observe(block.current);
    window.addEventListener('resize', layout);
    let cancelled = false;
    document.fonts?.ready?.then(() => { if (!cancelled) layout(); });
    document.fonts?.addEventListener?.('loadingdone', layout);

    let ctx = null;
    let io = null;
    if (!reduced) {
      ctx = gsap.context(() => {
        gsap.set('[data-hf-cursor]', { opacity: 0 });
        const tl = gsap.timeline({ defaults: { ease: EASE.out } });
        tl.from('[data-hf-eyebrow]', { opacity: 0, duration: 1.1 }, 0.1)
          // Exposure, not position: the lines sharpen into place.
          .fromTo('[data-hf-line]',
            { opacity: 0, filter: 'blur(9px)' },
            { opacity: 1, filter: 'blur(0px)', duration: 1.4, stagger: 0.08, ease: 'power2.out', clearProps: 'filter' },
            0.2)
          .from('[data-hf-rise]', { opacity: 0, y: 6, duration: 0.9, stagger: 0.08 }, 0.95)
          // The cursor: three blinks, then it holds — and the drop falls.
          .to('[data-hf-cursor]', { opacity: 1, duration: 0.01 }, 0.95)
          .to('[data-hf-cursor]', { opacity: 0, duration: 0.3, repeat: 3, yoyo: true, ease: 'steps(1)' }, 1.0);
      }, sec);
      if (progress() > 0.04) field.skipIntro();
      else field.scheduleIntro(2350);
      io = new IntersectionObserver(
        ([e]) => (e.isIntersecting ? field.start() : field.stop()),
        { threshold: 0 }
      );
      io.observe(wrap.current);
    }

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener('resize', layout);
      document.fonts?.removeEventListener?.('loadingdone', layout);
      window.removeEventListener('scroll', onCasScroll);
      cancelAnimationFrame(casRaf);
      io?.disconnect();
      ctx?.revert();
      field.destroy();
    };
  }, []);

  return (
    <div id="start" ref={wrap} className="hf-wrap">
      <section ref={root} className="on-dark hf-hero">
        <canvas ref={canvas} className="hf-canvas" aria-hidden="true" />
        <HeroContent blockRef={block} cursorRef={cursor} collapseRef={collapse} footRef={foot} cueRef={cue} />
      </section>
    </div>
  );
}
