/**
 * THE THREAD ENGINE
 *
 * One scroll position → one master head → deterministic visual state for the
 * entire green system. This replaces every load-tween, once-timeline and
 * section-local scrub that used to pretend to be one animation.
 *
 * Model: a "drawing head" lives at a fixed viewport line (REF · vh). Its
 * document position is scrollY + REF. Every segment of the route maps that
 * head position onto its own [startDoc, endDoc] band and derives its state
 * from the resulting 0–1 progress. Scroll down and the head travels forward;
 * scroll up and the exact same construction reverses; stop and it stops;
 * jump and it is already there. There is no "enter animation" — there is only
 * position.
 *
 * Zero animation debt by construction: state is written synchronously in the
 * scroll handler. apply() performs no layout reads — geometry is measured
 * separately (on init, resize, and fonts.ready) and cached in document space.
 *
 * Reduced motion: the engine simply never initializes. Every route element's
 * default DOM/CSS state is its FINAL state (paths undashed, rails scaleY 1,
 * marks visible/struck), so no-JS and reduced-motion both render the
 * completed system.
 */
import { COLS, MARKS, ALIVE_AFTER_03, RANKS } from './cohort.js';

const REF = 0.74; // the head's viewport line, as a fraction of vh

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function initThread() {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  // A perfectly vertical path has bbox width 0 — visibility must accept
  // either dimension.
  const visible = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  };

  /** Segment factory helpers. Each returns {measure(), apply(head)} where
   *  measure() caches document-space anchors and apply() only writes style. */
  const segs = [];
  const add = (seg) => segs.push(seg);

  const dashSeg = (el, band, { setup = true } = {}) => {
    if (!el) return;
    if (setup) {
      el.setAttribute('pathLength', '1');
      el.style.strokeDasharray = '1';
    }
    let s = 0, e = 1, on = false, last = -1;
    add({
      measure() { on = visible(el); if (!on) return; [s, e] = band(); },
      apply(h) {
        if (!on) return;
        const t = clamp01((h - s) / (e - s));
        if (t === last) return; last = t;
        el.style.strokeDashoffset = String(1 - t);
      },
    });
  };

  const scaleSeg = (el, band, axis = 'Y') => {
    if (!el) return;
    el.style.transformOrigin = axis === 'Y' ? 'top center' : 'left center';
    let s = 0, e = 1, on = false, last = -1;
    add({
      measure() { on = visible(el.parentElement || el); if (!on) return; [s, e] = band(); },
      apply(h) {
        if (!on) return;
        const t = clamp01((h - s) / (e - s));
        if (t === last) return; last = t;
        el.style.transform = `scale${axis}(${t})`;
      },
    });
  };

  const fadeSeg = (el, band, from, to) => {
    if (!el) return;
    let s = 0, e = 1, on = false, last = -1;
    add({
      measure() { on = visible(el); if (!on) return; [s, e] = band(); },
      apply(h) {
        if (!on) return;
        const t = clamp01((h - s) / (e - s));
        if (t === last) return; last = t;
        el.style.opacity = String(from + (to - from) * t);
      },
    });
  };

  const fnSeg = (measureFn, applyFn) => {
    let m = null;
    add({
      measure() { m = measureFn(); },
      apply(h) { if (m) applyFn(h, m); },
    });
  };

  /** A node draws as the head passes its own document position. */
  const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
  const nodeBand = (el, lead = 50, span = 110) => () => {
    const y = docTop(el);
    return [y - lead, y - lead + span];
  };
  const rectBand = (el, f0 = 0, f1 = 1) => () => {
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    return [top + r.height * f0, top + r.height * f1];
  };

  /* ── HERO: strands converge, the trunk condenses, atmosphere hands its
        energy to the precise line ─────────────────────────────────────── */
  const hero = $('#start');
  // Each strand carries its own draw span (data-s0/s1, hero-height fractions)
  // from the STRANDS config in App.jsx — far traces resolve first, near ones
  // last, so depth collapses front-to-back under the visitor's scroll.
  $$('[data-strand]').forEach((p) => {
    dashSeg(p, rectBand(hero, parseFloat(p.dataset.s0), parseFloat(p.dataset.s1)));
  });
  $$('[data-trunk],[data-trunk-soft]').forEach((p) => {
    dashSeg(p, rectBand(hero, 0.28, 1.0));
  });
  // Energy transfer: the diffuse presence yields as the line resolves.
  fadeSeg($('.fog-blob'), rectBand(hero, 0.3, 0.75), 1, 0.45);

  /* ── PROBLEMET: the route inks across the seam, pauses at the ring, and
        the three missing-intelligence slots resolve as the head reaches
        them ───────────────────────────────────────────────────────────── */
  const ph = $('#varfor-norrsyn');
  dashSeg($('[data-route]'), rectBand(ph, -0.02, 1.0));
  const tick = $('[data-ring-tick]');
  if (tick) dashSeg(tick, nodeBand(tick, 0, 70));
  const ring = $('[data-ring]');
  fadeSeg(ring, nodeBand(ring, -60, 50), 0, 1);
  $$('[data-ph-slot]').forEach((slot, i) => {
    fnSeg(
      () => (visible(slot) ? nodeBand(slot, 0 - i * 6, 80)() : null),
      (h, [s, e]) => {
        const on = h > (s + e) / 2 ? '1' : '0';
        if (slot.dataset.active !== on) slot.dataset.active = on;
      }
    );
  });

  /* ── 01: the entry rail, the glide, the fold, six connections in reading
        order, then the calibration stroke ─────────────────────────────── */
  const entryRail = $('[data-entry-rail]');
  const form = $('.jr-form');
  // The rail reveals 1:1 with the head over its own extent — the head IS its tip.
  scaleSeg(entryRail, () => {
    const top = docTop(entryRail);
    return [top, top + parseFloat(entryRail.style.height || '1')];
  }, 'Y');

  // The line is the clock. The whole of 01 is one strict causal chain on
  // the head: the glide arrives and folds (T+40..180), the fold dot sets
  // (T+165), and then each row is read IN TURN as the head physically
  // reaches it — text acknowledged (top-8), criterion activated (top+26),
  // connector joining the collector (top+16..96). Only after the sixth
  // criterion has joined does the collected state run home, braid into
  // OfferBrain, and continue down. Nothing fires because the section
  // entered the viewport; everything fires because the line got there.
  dashSeg($('[data-entry]'), () => {
    const top = docTop(form);
    return [top + 10, top + 150]; // a calm traverse; done well before row one
  });
  fnSeg(
    () => (visible(form) ? [docTop(form) + 140] : null),
    (h, [at]) => {
      const dot = $('[data-ob-dot]');
      if (!dot) return;
      const o = h > at ? '1' : '0';
      if (dot.dataset.on !== o) { dot.dataset.on = o; dot.style.opacity = o; }
    }
  );
  const rows = $$('.jr-intake-row');
  rows.forEach((row) => {
    fnSeg(
      () => (visible(row) ? [docTop(row)] : null),
      (h, [top]) => {
        const read = h > top + 22 ? '1' : '0';
        const live = h > top + 48 ? '1' : '0';
        if (row.dataset.read !== read) row.dataset.read = read;
        if (row.dataset.live !== live) row.dataset.live = live;
      }
    );
  });
  // Hook i departs its row (top+20..38); collector segment i then GROWS the
  // vertical by exactly one row (top+36..54), arriving at row i+1 as the head
  // reads it. The closing turn exists only after the sixth criterion. At any
  // scroll position the collector physically ends at the current question.
  $$('[data-form]').forEach((p, i) => {
    const row = rows[i];
    if (row) dashSeg(p, nodeBand(row, -50, 18));
  });
  $$('[data-collect]').forEach((p, i) => {
    const row = rows[i];
    if (row) dashSeg(p, nodeBand(row, -66, 18));
  });
  dashSeg($('[data-collect-close]'), nodeBand(rows[5], -66, 26));
  const wrap = $('.jr-intake-wrap');
  // Collection closed → the completed single line runs home and turns down —
  // and then TRANSFORMS: six strands emerge one after another, breathe apart,
  // and settle into the persistent bundle. OFFERBRAIN resolves at the widest
  // point of the split. From here the page has six lines, not one.
  dashSeg($('[data-form-spine]'), () => {
    const r = wrap.getBoundingClientRect();
    const bottom = r.bottom + window.scrollY;
    return [bottom + 55, bottom + 135];
  });
  $$('[data-ob-strand]').forEach((p, i) => {
    dashSeg(p, () => {
      const t = docTop(form);
      return [t + 680 + i * 7, t + 840 + i * 7];
    });
  });
  const obLabel = $('[data-oblabel]');
  if (obLabel) {
    fadeSeg(obLabel, () => {
      const t = docTop(form);
      return [t + 800, t + 870];
    }, 0, 1);
  }

  /* ── RAILS 02–06: on mobile the plain line reveals 1:1 with the head; on
        desktop the six-strand rope does, drawn as one bundle tip. 06's rope
        ends where the splay takes over and feeds the Brief. ─────────────── */
  $$('.jr-rail-line').forEach((line) => {
    const sec = line.closest('section');
    scaleSeg(line, rectBand(sec, 0, 1), 'Y');
  });
  $$('[data-rope]').forEach((svg) => {
    const sec = svg.closest('section');
    const bw = sec.querySelector('.jr-brief-wrap');
    const band = () => {
      const r = sec.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const end = bw
        ? bw.getBoundingClientRect().top + window.scrollY - 26
        : top + r.height;
      return [top, end];
    };
    Array.from(svg.querySelectorAll('[data-rs]')).forEach((p) => dashSeg(p, band));
  });
  /* ── The splay: the six strands separate and feed the Brief's information
        regions, then terminate. The payoff of the whole system. ─────────── */
  $$('[data-splay] [data-ss]').forEach((p, i) => {
    dashSeg(p, () => {
      const y = docTop(p.closest('svg')) - 26; // the rope's handover point
      return [y + i * 5, y + 85 + i * 5];
    });
  });

  /* ── 02: the carve branches grow from the rail; the cohort resolves in
        rank order as the head crosses the field ───────────────────────── */
  $$('[data-carve]').forEach((p, i) => {
    const svg = p.closest('svg');
    dashSeg(p, () => {
      const r = svg.getBoundingClientRect();
      const y = r.top + window.scrollY + r.height * (i ? 0.86 : 0.14);
      return [y, y + 90];
    });
  });
  const field2 = $('[data-field2]');
  if (field2) {
    const m2 = Array.from(field2.children);
    let last2 = -1;
    fnSeg(
      () => (visible(field2) ? rectBand(field2, -0.35, 0.75)() : null),
      (h, [s, e]) => {
        const alive = Math.round(clamp01((h - s) / (e - s)) * MARKS);
        if (alive === last2) return; last2 = alive;
        m2.forEach((m, i) => {
          const on = RANKS[i] < alive ? '1' : '0';
          if (m.dataset.on !== on) m.dataset.on = on;
        });
      }
    );
  }

  /* ── The fan grammar: wherever a branch leaves the master rail (03's bus,
        04's dossier, 05's ledger), it departs as six hairline filaments —
        the model's internal structure — converging into the single branch.
        OfferBrain is a property of the line, not an icon beside it. ────── */
  $$('.jr-fan').forEach((svg) => {
    Array.from(svg.querySelectorAll('[data-fan]')).forEach((p, i) => {
      dashSeg(p, () => {
        const y = docTop(svg) + i * 5.2; // this filament's own origin on the rail
        return [y, y + 80];
      });
    });
  });

  /* ── 03: the bus grows FROM the fan's convergence, the taps drop, and the
        sweep strikes the doomed in reading order — all from the same head ── */
  const bus = $('.jr-bus');
  // The fan's last filament converges ~94px of scroll after the fan's top;
  // the bus may only continue from that junction, and each tap only once the
  // bus tip has passed its x. Child after parent, everywhere.
  scaleSeg(bus, nodeBand(bus, -94, 60), 'X');
  $$('.jr-tap-line').forEach((t, i) => scaleSeg(t, nodeBand(t, -92 - i * 15, 40), 'Y'));
  const field3 = $('[data-field3]');
  if (field3) {
    const m3 = Array.from(field3.children);
    const taps3 = $$('[data-tap]');
    const count3 = $('[data-count3]');
    const doomedOrder = Array.from({ length: MARKS }, (_, i) => i)
      .filter((i) => RANKS[i] >= ALIVE_AFTER_03)
      .sort((a, b) => (a % COLS) - (b % COLS) || Math.floor(a / COLS) - Math.floor(b / COLS));
    const doomedPos = new Map(doomedOrder.map((idx, k) => [idx, k]));
    let last3 = -1;
    fnSeg(
      () => (visible(field3) ? rectBand(field3, 0.45, 1.2)() : null),
      (h, [s, e]) => {
        const t = clamp01((h - s) / (e - s));
        const struck = Math.round(t * doomedOrder.length);
        const band = t <= 0.02 || t >= 0.98 ? -1 : Math.min(4, Math.floor(t * 5));
        taps3.forEach((tp, i) => {
          const on = i === band ? '1' : '0';
          if (tp.dataset.on !== on) tp.dataset.on = on;
        });
        if (struck === last3) return; last3 = struck;
        m3.forEach((m, i) => {
          const k = doomedPos.get(i);
          const st = k === undefined || k >= struck ? 'solid' : 'struck';
          if (m.dataset.state !== st) m.dataset.state = st;
        });
        if (count3) count3.textContent = Math.round(3120 - t * (3120 - 388)).toLocaleString('sv-SE');
      }
    );
  }

  /* ── 04: the interpretive layer resolves per finding — the fact is
        visible first, the reading against the customer's model arrives as
        the head passes the slip ─────────────────────────────────────────── */
  $$('.jr-branch').forEach((b) => scaleSeg(b, nodeBand(b, 0, 80), 'X'));
  $$('.jr-ev').forEach((slip) => {
    fadeSeg(slip.querySelector('.jr-ev-rel'), nodeBand(slip, 0, 90), 0, 1);
  });

  /* ── 05: the fit ledger — per row: lane draws, the decision mark lands,
        the verdict resolves. Straight lanes; nothing crosses. ──────────── */
  $$('[data-fit-row]').forEach((row) => {
    const lane = row.querySelector('[data-fit-lane]');
    const mark = row.querySelector('[data-fit-mark]');
    const verdict = row.querySelector('[data-fit-verdict]');
    scaleSeg(lane, nodeBand(row, -6, 70), 'X');
    fadeSeg(mark, nodeBand(row, -60, 30), 0, 1);
    fadeSeg(verdict, nodeBand(row, -66, 60), 0, 1);
  });

  /* ── ENGINE ─────────────────────────────────────────────────────────── */
  let refPx = window.innerHeight * REF;
  const measureAll = () => {
    refPx = window.innerHeight * REF;
    segs.forEach((s) => s.measure());
    applyAll();
  };
  const applyAll = () => {
    const head = window.scrollY + refPx;
    for (let i = 0; i < segs.length; i++) segs[i].apply(head);
  };

  // Synchronous application in the scroll handler: state IS position.
  // No layout reads happen in apply(), so this is cheap and debt-free.
  const onScroll = () => applyAll();
  window.addEventListener('scroll', onScroll, { passive: true });
  const ro = new ResizeObserver(() => measureAll());
  ro.observe(document.body);
  document.fonts?.ready?.then(measureAll);
  measureAll();

  return () => {
    window.removeEventListener('scroll', onScroll);
    ro.disconnect();
  };
}
