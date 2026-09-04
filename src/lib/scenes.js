/**
 * THE SCENES
 *
 * One painter per chapter. Each scene measures its DOM anchors into
 * document space on measure(geo) and paints from those caches on
 * paint(ctx, f). The chapters also write a handful of DOM states (row read,
 * slot active, verdict visible) — the same states the SVG engine wrote —
 * and only when they change.
 *
 * Shared geometry travels in `geo`: the rail x, the seam, where the single
 * line ends and the six-strand bundle begins (01), where the bundle
 * tightens (02) and where it ends in the Brief (06).
 */
import {
  path, docRect, strokeLine, drawTip, mono, band, smooth,
  lengthAtY, lerp, green, greenHi, white, OFFS, TAU,
} from './stage.js';
import { COLS, MARKS, RANKS, ALIVE_AFTER_03 } from './cohort.js';
import { TONES, STANDOUTS, CANDIDATES } from '../components/story.jsx';

/** A tip fades in the last stretch of its route instead of vanishing. */
const tipFade = (t) => 1 - band(0.86, 1)(t);
const PHASE = [0, 4, 8, 2, 6, 10]; // per-strand breathing offsets in the spindle

const nodeOf = (el, R = docRect) => {
  const sq = el.querySelector('.jr-node-square');
  if (!sq) return null;
  const r = R(sq);
  return { x: r.cx, y: r.cy };
};

/* ── The spine: the seam sweep, the single line, the bundle ───────────── */
export function spineScene() {
  let single = null;
  let s2 = null;

  const drift = (i, y) => {
    let d = Math.sin(y / (460 + i * 41) + i * 1.3) * 0.8;
    // 02: the bundle tightens mid-section — the market being bounded.
    if (s2 && y > s2.t && y < s2.b) {
      const u = (y - s2.t) / (s2.b - s2.t);
      d += -OFFS[i] * 0.5 * Math.sin(Math.PI * u);
    }
    return d;
  };

  // The bundle: six strands, six criteria wide, carried down the page.
  function paintRope(ctx, f) {
    const { railX, ropeStart, ropeEnd } = f.geo;
    const a = Math.max(ropeStart, f.top);
    const b = Math.min(ropeEnd, f.head, f.bot);
    if (b <= a) return;
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = green(0.5);
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      for (let y = a; ; y += 18) {
        const yy = Math.min(y, b);
        const x = railX + OFFS[i] + drift(i, yy);
        if (y === a) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        if (yy >= b) break;
      }
      ctx.stroke();
    }
    if (f.head < ropeEnd && f.head > ropeStart) drawTip(ctx, railX, f.head, 0.8, 9);
  }

  return {
    t: 0, b: 0,
    measure(geo) {
      const { ax, seamY, railX } = geo;
      const endY = geo.singleEndY ?? seamY + 400;
      // The seam: the hero's line lands, and one long sweep carries it from
      // the underscore's axis into the left margin, above every glyph.
      single = path([
        ['M', ax, seamY - 2],
        ['L', ax, seamY + 28],
        ['C', ax, seamY + 150, railX, seamY + 60, railX, seamY + 190, 36],
        ['L', railX, endY],
      ]);
      s2 = geo.s2 || null;
    },
    paint(ctx, f) {
      if (!single) return;
      const { geo } = f;
      const s = lengthAtY(single, f.head);
      strokeLine(ctx, single, s, { alpha: 0.62, width: 2, glow: 1, yTop: f.top, yBot: f.bot });
      if (!geo.desktop && geo.singleEndY != null && f.head >= geo.singleEndY) {
        // The closed square: the line has arrived at the deliverable.
        ctx.fillStyle = green(0.95);
        ctx.fillRect(geo.railX - 4, geo.singleEndY - 4, 8, 8);
      }
      if (geo.desktop && geo.ropeStart != null && geo.ropeEnd != null) paintRope(ctx, f);
    },
  };
}

/* ── Problemet: the register as static; the regard; the three slots ────── */
const PH_NOISE = Array.from({ length: 912 }, (_, i) => {
  let s = ((i + 1) * 2654435761) % 4294967296;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const r1 = rnd();
  const r2 = rnd();
  return {
    o: +(0.09 + r1 * 0.3 + (r2 > 0.96 ? 0.25 : 0)).toFixed(2),
    w: +(0.4 + r2 * 0.6).toFixed(2),
    ph: r1 * 6.28,
  };
});

export function problemetScene(el, R = docRect) {
  let F = null, slots = [], grid = null;
  const buckets = Array.from({ length: 12 }, () => []);
  return {
    el, bg: '#15181A', t: 0, b: 0,
    measure() {
      const sec = R(el);
      this.t = sec.t; this.b = sec.b;
      const fEl = el.querySelector('[data-wk-ph-field]');
      F = fEl ? R(fEl) : null;
      slots = Array.from(el.querySelectorAll('[data-ph-slot]')).map((s) => ({ el: s, r: R(s) }));
      if (F) {
        const cols = 38, gapX = 3, mh = 5, gapY = 4;
        const mw = (F.w - (cols - 1) * gapX) / cols;
        const rows = Math.max(1, Math.floor((F.h + gapY) / (mh + gapY)));
        grid = { cols, rows, mw, mh, gapX, gapY };
      }
    },
    paint(ctx, f) {
      const { railX } = f.geo;
      if (F && grid && F.b > f.top && F.t < f.bot) {
        const ts = f.now / 1000;
        // The regard: as the head crosses the field, one pass of attention
        // sweeps across it. Every record brightens as it is seen — and is
        // no more distinguishable afterwards than before.
        const pass = band(F.t - 30, F.b + 30)(f.head);
        const scanX = F.l - 40 + pass * (F.w + 80);
        for (const bk of buckets) bk.length = 0;
        for (let r = 0; r < grid.rows; r++) {
          for (let c = 0; c < grid.cols; c++) {
            const k = r * grid.cols + c;
            const m = PH_NOISE[k % 912];
            const x = F.l + c * (grid.mw + grid.gapX);
            const y = F.t + r * (grid.mh + grid.gapY);
            let a = m.o * (f.reduced ? 1 : 0.82 + 0.18 * Math.sin(ts * 1.6 + m.ph));
            if (pass > 0 && pass < 1) {
              const d = x - scanX;
              a += 0.32 * Math.exp(-(d * d) / 3200);
            }
            const bi = Math.min(11, (a * 12) | 0);
            if (bi <= 0) continue;
            buckets[bi].push(x, y, grid.mw * m.w, grid.mh);
          }
        }
        for (let bi = 1; bi < 12; bi++) {
          const arr = buckets[bi];
          if (!arr.length) continue;
          ctx.fillStyle = white(Math.min(0.92, (bi + 0.5) / 12));
          for (let n = 0; n < arr.length; n += 4) ctx.fillRect(arr[n], arr[n + 1], arr[n + 2], arr[n + 3]);
        }
        // The tick and the open ring, at the field's height: the line sees
        // the companies and cannot choose among them.
        if (f.desktop) {
          const cy = F.cy;
          // Only once the line has physically reached the field's height.
          const ra = smooth(cy, cy + 36, f.head);
          if (ra > 0) {
            ctx.beginPath();
            ctx.moveTo(railX, cy); ctx.lineTo(railX + 22 * ra, cy);
            ctx.strokeStyle = green(0.62); ctx.lineWidth = 2; ctx.lineCap = 'round';
            ctx.stroke();
            const rr = smooth(cy + 20, cy + 40, f.head);
            if (rr > 0) {
              ctx.beginPath();
              ctx.arc(railX + 29, cy, 4.5, 0, TAU);
              ctx.strokeStyle = green(0.85 * rr); ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        }
      }
      slots.forEach((s, i) => {
        const on = f.head > s.r.cy - i * 6 ? '1' : '0';
        if (s.el.dataset.active !== on) s.el.dataset.active = on;
      });
    },
  };
}

/* ── 01: six answers become six strands, and the strands become the line ─ */
export function s1Scene(el, R = docRect) {
  let sec, LG, rows = [], entry = null, A = [], B = [], C = [], turnLen = [], foldLen = [];
  let foldY = 0, cX = 0, neckY = 0, home = [], labelAt = null, desktop = false, rowsT = 0;
  let hb = 0, y0 = 0; // where the run home completes, and where the descent resumes
  const LANE = (i) => cX + i * 2.2;      // ribbon lanes on the collector
  const TURN = (i) => 13 + i * 2.2;      // nested right corner
  const FOLD = (i) => 26 - i * 2.2;      // nested left corner
  const NECK = (i) => -2.75 + i * 1.1;   // spindle entry offsets

  return {
    el, bg: '#0C1310', t: 0, b: 0, node: null,
    measure(geo) {
      sec = R(el);
      this.t = sec.t; this.b = sec.b; this.node = nodeOf(el, R);
      LG = R(el.querySelector('[data-wk-ledger]'));
      rows = Array.from(el.querySelectorAll('.jr-intake-row')).map((r) => ({ el: r, r: R(r) }));
      desktop = geo.desktop;
      if (!desktop) { entry = null; A = []; B = []; C = []; return; }
      const { railX } = geo;
      // The fold crosses between the copy and the first row of the ledger:
      // a fixed distance above the rows where there is room, midway where
      // there is not — never over the words.
      const copyEl = el.querySelector('.jy-copy');
      const copyB = copyEl ? R(copyEl).b : -Infinity;
      rowsT = rows.length ? rows[0].r.t : LG.t;
      const gap = rowsT - copyB;
      foldY = gap >= 130 ? rowsT - 96 : copyB + gap * 0.5;
      cX = LG.r + 32;
      geo.singleEndY = foldY - 26;
      // The arrival: down the rail, a fold to the right, across the head of
      // the ledger, one knot at the collector, then down the collector to
      // where the first answer will join.
      entry = path([
        ['M', railX, foldY - 26],
        ['Q', railX, foldY, railX + 26, foldY, 8],
        ['L', cX - 7, foldY],
        ['A', cX, foldY, 7, Math.PI, Math.PI * 2.5, 20],
        ['L', cX, rowsT + 42],
      ]);
      const collectY = LG.b + 36;
      neckY = collectY + 44;
      home = rows.map((_, i) => collectY - 12 + i * 2.4);
      // Each criterion is one continuous fiber: from its own row into its
      // own lane on the collector, down, and home under the ledger.
      A = rows.map((row, i) => {
        const y = row.r.cy;
        return path([
          ['M', LG.r + 16, y],
          ['L', LANE(i) - 12, y],
          ['Q', LANE(i), y, LANE(i), y + 14, 6],
          ['L', LANE(i), home[i] - TURN(i)],
          ['Q', LANE(i), home[i], LANE(i) - TURN(i), home[i], 8],
          ['L', LG.r + 18, home[i]],
        ]);
      });
      turnLen = A.map((P, i) => lengthAtY(P, home[i] - TURN(i)));
      B = rows.map((_, i) => path([
        ['M', LG.r + 18, home[i]],
        ['L', railX + NECK(i) + FOLD(i), home[i]],
        ['Q', railX + NECK(i), home[i], railX + NECK(i), home[i] + FOLD(i), 8],
        ['L', railX + NECK(i), neckY],
      ]));
      foldLen = B.map((P, i) => lengthAtY(P, home[i] + FOLD(i)));
      // The horizontal runs are drawn over scroll bands (a vertical head
      // cannot trace a horizontal line 1:1). Everything after them descends
      // from a lagged head that starts where the fold ends and catches the
      // real head up over the next hundred pixels — no jump, no teleport.
      hb = home[5] - TURN(5) + 150;
      y0 = home[0] + FOLD(0);
      // The spindle: the six fibers breathe apart and settle into the bundle
      // that carries the model through the rest of the page.
      C = OFFS.map((fo, i) => {
        const w = fo * 2.6, ph = PHASE[i], x0 = railX + NECK(i);
        return path([
          ['M', x0, neckY],
          ['C', x0, neckY + 44 + ph, railX + w, neckY + 60 + ph, railX + w, neckY + 92 + ph, 16],
          ['C', railX + w, neckY + 126 + ph, railX + fo, neckY + 156 + ph, railX + fo, neckY + 200, 16],
          ['L', railX + fo, geo.spindleEnd ?? sec.b + 2],
        ]);
      });
      geo.ropeStart = geo.spindleEnd ?? sec.b + 2;
      labelAt = [railX + 26, neckY + 81.5];
    },
    // The head rides the spine until the fold; from there the ledger's own
    // tips carry it — with a fade, never a cut.
    cometAlpha(y) { return !entry ? 1 : smooth(foldY - 40, foldY - 110, y); },
    paint(ctx, f) {
      const h = f.head;
      // The ledger is read in turn as the head physically reaches each row:
      // the question is acknowledged, the criterion goes live, and only then
      // does its fiber leave the row — at the row's own height.
      rows.forEach((row) => {
        const read = h > row.r.t + 6 ? '1' : '0';
        const live = h > row.r.t + 26 ? '1' : '0';
        if (row.el.dataset.read !== read) row.el.dataset.read = read;
        if (row.el.dataset.live !== live) row.el.dataset.live = live;
      });
      if (!desktop || !entry) return;
      const yT = f.top, yB = f.bot;
      const et = band(foldY - 26, foldY + 106)(h);
      if (et > 0) strokeLine(ctx, entry, entry.len * et, { alpha: 0.62, width: 1.75, glow: 0.6, tip: et < 1, tipA: 0.7 * tipFade(et), yTop: yT, yBot: yB });
      if (h > rowsT - 60) {
        ctx.fillStyle = green(1);
        ctx.beginPath(); ctx.arc(cX, foldY, 2.4, 0, TAU); ctx.fill();
      }
      // Each lane grows with the head — its tip IS the head — until the turn;
      // the turn and the run home draw over the next forty pixels of scroll.
      let lanesLive = 0, lanesGrowing = false;
      rows.forEach((row, i) => {
        const P = A[i];
        if (h <= row.r.t + 26) return;
        lanesLive++;
        let s = Math.min(lengthAtY(P, h), turnLen[i]);
        if (s < turnLen[i]) lanesGrowing = true;
        const tb = band(home[i] - TURN(i), home[i] - TURN(i) + 40)(h);
        if (tb > 0) s = turnLen[i] + (P.len - turnLen[i]) * tb;
        strokeLine(ctx, P, s, { alpha: 0.5, width: 1, tip: false, yTop: yT, yBot: yB });
      });
      // One tip for the whole collector, on the ribbon's centre.
      if (lanesGrowing) drawTip(ctx, LANE(0) + (lanesLive - 1) * 1.1, Math.min(h, home[0] - TURN(0)), 0.85, 8);
      // The lagged head: parked at the fold's end while the ribbon runs home,
      // then catching the real head at two and a half times its speed.
      const hl = h > hb ? Math.min(h, y0 + 2.5 * (h - hb)) : -Infinity;
      B.forEach((P, i) => {
        const b0 = home[i] - TURN(i) + 40;
        const bt = band(b0, b0 + 110)(h);
        if (bt <= 0) return;
        let s = foldLen[i] * bt;
        if (bt >= 1) s = Math.max(s, lengthAtY(P, hl));
        strokeLine(ctx, P, s, { alpha: 0.5, width: 1, tip: false, yTop: yT, yBot: yB });
      });
      if (hl > neckY) {
        C.forEach((P) => {
          const s = lengthAtY(P, hl);
          if (s > 0) strokeLine(ctx, P, s, { alpha: 0.55, width: 1.1, tip: false, yTop: yT, yBot: yB });
        });
        if (hl < (f.geo.spindleEnd ?? sec.b)) drawTip(ctx, f.geo.railX, hl, 0.8, 9);
      }
      const la = band(neckY + 120, neckY + 180)(h);
      if (la > 0 && labelAt) {
        ctx.beginPath();
        ctx.moveTo(labelAt[0] - 10.5, labelAt[1] - 3.5); ctx.lineTo(labelAt[0] - 5, labelAt[1] - 3.5);
        ctx.strokeStyle = green(0.5 * la); ctx.lineWidth = 1; ctx.stroke();
        mono(ctx, 'OFFERBRAIN', labelAt[0], labelAt[1], { size: 10, color: green(la), tracking: '0.18em' });
        mono(ctx, 'er kravbild, med i varje beslut härifrån och ned', labelAt[0], labelAt[1] + 15.5, { size: 9, color: white(0.5 * la), tracking: '0.05em' });
      }
    },
  };
}

/* ── 02: a wide universe, a bounded cohort ────────────────────────────── */
export function s2Scene(el, R = docRect) {
  let M, Bd, F, marks = [], onAt = null, carve1, carve2, frameT, frameB;
  let pattern = null, patDpr = 0;
  return {
    el, bg: '#15181A', t: 0, b: 0, node: null,
    measure(geo) {
      const sec = R(el);
      this.t = sec.t; this.b = sec.b; this.node = nodeOf(el, R);
      geo.s2 = { t: sec.t, b: sec.b };
      M = R(el.querySelector('[data-wk-map]'));
      Bd = R(el.querySelector('[data-wk-bound]'));
      const fEl = el.querySelector('[data-field2]');
      F = R(fEl);
      marks = Array.from(fEl.children).map(R);
      if (!onAt) onAt = new Float64Array(MARKS).fill(-1);
      const { railX } = geo;
      // The spine carves: two branches leave the rail at the boundary's
      // heights, and the boundary itself grows out of them.
      // The branches leave the bundle tangent to it — a peel, not a tee.
      carve1 = path([['M', railX, Bd.t - 60], ['C', railX, Bd.t - 18, Bd.l - 44, Bd.t, Bd.l, Bd.t, 20]]);
      carve2 = path([['M', railX, Bd.b - 60], ['C', railX, Bd.b - 18, Bd.l - 44, Bd.b, Bd.l, Bd.b, 20]]);
      frameT = path([['M', Bd.l, Bd.t], ['L', Bd.r, Bd.t], ['L', Bd.r, Bd.b]]);
      frameB = path([['M', Bd.l, Bd.b], ['L', Bd.r, Bd.b]]);
    },
    paint(ctx, f) {
      const h = f.head;
      // The wider universe: a quiet lattice, a pattern so its thousands cost nothing.
      if (!pattern || patDpr !== f.dpr) {
        const off = document.createElement('canvas');
        off.width = Math.round(13 * f.dpr); off.height = Math.round(13 * f.dpr);
        const oc = off.getContext('2d');
        oc.fillStyle = white(0.14);
        oc.beginPath(); oc.arc(6.5 * f.dpr, 6.5 * f.dpr, 1.05 * f.dpr, 0, TAU); oc.fill();
        pattern = ctx.createPattern(off, 'repeat');
        if (pattern && pattern.setTransform) pattern.setTransform(new DOMMatrix().scale(1 / f.dpr));
        patDpr = f.dpr;
      }
      if (M.b > f.top && M.t < f.bot) {
        const t0 = Math.max(M.t, f.top), t1 = Math.min(M.b, f.bot);
        ctx.fillStyle = pattern;
        ctx.fillRect(M.l, t0, M.w, t1 - t0);
      }
      const c1 = band(Bd.t - 60, Bd.t + 20)(h);
      if (c1 > 0) strokeLine(ctx, carve1, carve1.len * c1, { alpha: 0.45, width: 1.5, tipA: 0.7 });
      const t1 = band(Bd.t + 20, Bd.t + 240)(h);
      if (t1 > 0) strokeLine(ctx, frameT, frameT.len * t1, { alpha: 0.45, width: 1, tipA: 0.7 });
      const c2 = band(Bd.b - 60, Bd.b + 20)(h);
      if (c2 > 0) strokeLine(ctx, carve2, carve2.len * c2, { alpha: 0.45, width: 1.5, tipA: 0.7 });
      const t2 = band(Bd.b + 20, Bd.b + 180)(h);
      if (t2 > 0) strokeLine(ctx, frameB, frameB.len * t2, { alpha: 0.45, width: 1, tipA: 0.7 });
      const ba = band(Bd.b + 180, Bd.b + 220)(h);
      if (ba > 0) {
        ctx.strokeStyle = green(0.8 * ba); ctx.lineWidth = 2; ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.moveTo(Bd.l - 1, Bd.t + 9); ctx.lineTo(Bd.l - 1, Bd.t - 1); ctx.lineTo(Bd.l + 9, Bd.t - 1);
        ctx.moveTo(Bd.r + 1, Bd.b - 9); ctx.lineTo(Bd.r + 1, Bd.b + 1); ctx.lineTo(Bd.r - 9, Bd.b + 1);
        ctx.stroke();
      }
      // The cohort resolves in rank order as the head crosses the field.
      const alive = Math.round(band(F.t - 0.35 * F.h, F.t + 0.75 * F.h)(h) * MARKS);
      for (let i = 0; i < MARKS; i++) {
        const on = RANKS[i] < alive;
        if (on) { if (onAt[i] < 0) onAt[i] = f.now; } else onAt[i] = -1;
        if (!on) continue;
        const m = marks[i];
        if (m.b < f.top || m.t > f.bot) continue;
        ctx.fillStyle = white(0.55);
        ctx.fillRect(m.l, m.t, m.w, m.h);
      }
      // The cohort, counted as it resolves: one mark is ten companies.
      if (alive > 0) {
        mono(ctx, `${(alive * 10).toLocaleString('sv-SE')} bolag`, Bd.r - 2, Bd.b + 17, {
          size: 9.5, align: 'right', color: green(0.9 * Math.min(1, alive / 40)), tracking: '0.12em', upper: true,
        });
      }
    },
  };
}

/* ── 03: the criteria cut, one at a time ──────────────────────────────── */
export function s3Scene(el, R = docRect) {
  let MF, busY = 0, taps = [], tapEls = [], F, marks = [], fans = [], bus = null, count = null;
  let order = [], pos = null, struckAt = null;
  return {
    el, bg: '#0C1310', t: 0, b: 0, node: null,
    measure(geo) {
      const sec = R(el);
      this.t = sec.t; this.b = sec.b; this.node = nodeOf(el, R);
      MF = R(el.querySelector('[data-wk-manifold]'));
      busY = R(el.querySelector('[data-wk-bus]')).cy;
      tapEls = Array.from(el.querySelectorAll('[data-tap]'));
      taps = tapEls.map((t) => {
        const ln = R(t.querySelector('.jr-tap-line'));
        return { x: ln.cx, y0: ln.t, y1: ln.b };
      });
      const fEl = el.querySelector('[data-field3]');
      F = R(fEl);
      marks = Array.from(fEl.children).map(R);
      count = el.querySelector('[data-count3]');
      const { railX } = geo;
      // The fan: six filaments peel off the bundle, tangent to it, and
      // converge into the bus.
      fans = geo.desktop
        ? OFFS.map((o, i) => {
          const y = busY - 70 + 4 * i;
          return path([['M', railX + o, y], ['C', railX + o, y + 34, MF.l - 36, busY, MF.l, busY, 18]]);
        })
        : [path([['M', railX, busY - 40], ['C', railX, busY - 8, MF.l - 20, busY, MF.l, busY, 12]])];
      bus = path([['M', MF.l, busY], ['L', MF.r, busY]]);
      if (!order.length) {
        order = Array.from({ length: MARKS }, (_, i) => i)
          .filter((i) => RANKS[i] >= ALIVE_AFTER_03)
          .sort((a, b) => (a % COLS) - (b % COLS) || Math.floor(a / COLS) - Math.floor(b / COLS));
        pos = new Map(order.map((idx, k) => [idx, k]));
        struckAt = new Float64Array(MARKS).fill(-1);
      }
    },
    paint(ctx, f) {
      const h = f.head;
      fans.forEach((P, i) => {
        const y = f.desktop ? busY - 70 + 4 * i : busY - 40;
        const t = band(y, y + 100)(h);
        if (t > 0) strokeLine(ctx, P, P.len * t, { alpha: 0.55, width: 0.85, tip: false });
      });
      const bt = band(busY + 50, busY + 110)(h);
      if (bt > 0) strokeLine(ctx, bus, bus.len * bt, { alpha: 0.5, width: 2, tip: bt < 1, tipA: 0.7 * tipFade(bt) });
      // The sweep: the criteria strike the doomed in reading order, and the
      // one currently cutting is lit.
      const t = band(F.t + 0.45 * F.h, F.t + 1.2 * F.h)(h);
      const struck = Math.round(t * order.length);
      const active = t <= 0.02 || t >= 0.98 ? -1 : Math.min(4, Math.floor(t * 5));
      taps.forEach((tp, i) => {
        const tt = band(busY + 100 + i * 12, busY + 140 + i * 12)(h);
        const lit = i === active;
        if (tt > 0) {
          ctx.beginPath();
          ctx.moveTo(tp.x, busY); ctx.lineTo(tp.x, tp.y0 + (tp.y1 - tp.y0) * tt);
          ctx.strokeStyle = lit ? greenHi(1) : green(0.5);
          ctx.lineWidth = 2; ctx.lineCap = 'butt';
          ctx.stroke();
          if (lit) drawTip(ctx, tp.x, tp.y1, 0.8, 8);
        }
        const on = lit ? '1' : '0';
        if (tapEls[i].dataset.on !== on) tapEls[i].dataset.on = on;
      });
      if (t > 0 && t < 1) {
        // The front: the cut moving across the cohort.
        const fx = F.l + t * F.w;
        const g = ctx.createLinearGradient(fx - 46, 0, fx + 10, 0);
        g.addColorStop(0, green(0)); g.addColorStop(0.85, green(0.16)); g.addColorStop(1, green(0));
        ctx.fillStyle = g;
        ctx.fillRect(fx - 46, F.t - 8, 56, F.h + 16);
      }
      for (let i = 0; i < MARKS; i++) {
        const m = marks[i];
        const k = pos.get(i);
        const isStruck = k !== undefined && k < struck;
        if (isStruck) { if (struckAt[i] < 0) struckAt[i] = f.now; } else struckAt[i] = -1;
        if (m.b < f.top || m.t > f.bot) continue;
        if (!isStruck) {
          ctx.fillStyle = white(0.55);
          ctx.fillRect(m.l, m.t, m.w, m.h);
          continue;
        }
        // Hollowed, not dimmed: the outline keeps its place in the ledger
        // while the ink is gone.
        ctx.strokeStyle = white(0.1); ctx.lineWidth = 1;
        ctx.strokeRect(m.l + 0.5, m.t + 0.5, m.w - 1, m.h - 1);
        ctx.fillStyle = white(0.2);
        ctx.fillRect(m.l, m.cy - 0.5, m.w, 1);
      }
      if (count) {
        const v = Math.round(3120 - t * (3120 - 388)).toLocaleString('sv-SE');
        if (count.textContent !== v) count.textContent = v;
      }
    },
  };
}

/* ── 04: the same field as 03; a few companies begin to stand out ────────── */
const hexRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const tone = (hex, a) => { const c = hexRgb(hex); return `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`; };

export function s4Scene(el, R = docRect) {
  let B = null, F = null, barY = 0, marks = [], stand = [], cands = [], fans = [], desktop = true;
  return {
    el, bg: '#15181A', t: 0, b: 0, node: null,
    measure(geo) {
      const sec = R(el);
      this.t = sec.t; this.b = sec.b; this.node = nodeOf(el, R);
      desktop = geo.desktop;
      const box = el.querySelector('[data-wk-standouts]');
      B = R(box);
      barY = R(box.querySelector('.so-bar')).cy;
      const fEl = el.querySelector('[data-so-field]');
      F = R(fEl);
      marks = Array.from(fEl.children).map(R);
      // The standouts are survivors of 03, chosen by their place in the list
      // of survivors, so the same companies that held are the ones that
      // light up.
      const survivors = [];
      for (let i = 0; i < MARKS; i++) if (RANKS[i] < ALIVE_AFTER_03) survivors.push(i);
      stand = STANDOUTS.map((sd) => ({ ...sd, i: survivors[Math.round(sd.at * (survivors.length - 1))] }));
      cands = Array.from(el.querySelectorAll('[data-cand]')).map((c) => ({ el: c, key: c.dataset.cand }));
      const { railX } = geo;
      fans = desktop
        ? OFFS.map((o, i) => {
          const y = barY - 70 + 4 * i;
          return path([['M', railX + o, y], ['C', railX + o, y + 34, B.l - 36, barY, B.l, barY, 18]]);
        })
        : [path([['M', railX, barY - 40], ['C', railX, barY - 8, B.l - 20, barY, B.l, barY, 12]])];
    },
    paint(ctx, f) {
      const h = f.head;
      if (!F) return;
      fans.forEach((P, i) => {
        const y = desktop ? barY - 70 + 4 * i : barY - 40;
        const t = band(y, y + 100)(h);
        if (t > 0) strokeLine(ctx, P, P.len * t, { alpha: 0.55, width: 0.85, tip: false });
      });
      if (h > barY + 50) { ctx.fillStyle = green(1); ctx.fillRect(B.l - 3, barY - 3, 6, 6); }
      // 03's struck marks leave; the survivors stay and quieten as the few
      // light up; the camera moves toward the ones that matter.
      const gone = band(F.t - 80, F.t + 30)(h);
      const lit = stand.map((sd, k) => band(F.t + 10 + k * 30, F.t + 60 + k * 30)(h));
      const quiet = band(F.t + 40, F.b + 40)(h);
      const zoom = band(F.t + 90, F.b + 160)(h);
      const named = stand.filter((sd) => sd.cand);
      let cx = 0, cy = 0;
      named.forEach((sd) => { cx += marks[sd.i].cx; cy += marks[sd.i].cy; });
      cx /= named.length; cy /= named.length;
      const sc = 1 + 0.1 * zoom;
      const map = (x, y) => [cx + (x - cx) * sc, cy + (y - cy) * sc];
      ctx.save();
      ctx.beginPath(); ctx.rect(F.l - 6, F.t - 6, F.w + 12, F.h + 12); ctx.clip();
      const standAt = new Map(stand.map((sd, k) => [sd.i, k]));
      for (let i = 0; i < marks.length; i++) {
        const m = marks[i];
        const [x, y] = map(m.l, m.t);
        const w = m.w * sc, hh = m.h * sc;
        if (RANKS[i] >= ALIVE_AFTER_03) {
          const a = 0.1 * (1 - gone);
          if (a <= 0.005) continue;
          ctx.strokeStyle = white(a); ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, w - 1, hh - 1);
          continue;
        }
        const k = standAt.get(i);
        if (k === undefined) {
          ctx.fillStyle = white(0.55 - 0.33 * quiet);
          ctx.fillRect(x, y, w, hh);
          continue;
        }
        const sd = stand[k];
        const t = lit[k];
        ctx.fillStyle = white(0.55 * (1 - t) + 0.1 * t);
        ctx.fillRect(x, y, w, hh);
        if (t <= 0) continue;
        // The halo first, then the mark takes the colour of its signal.
        const mcx = x + w / 2, mcy = y + hh / 2;
        const r = (sd.multi ? 30 : 20) * (0.6 + 0.4 * t);
        const g = ctx.createRadialGradient(mcx, mcy, 0, mcx, mcy, r);
        g.addColorStop(0, tone(TONES[sd.tone], 0.42 * t));
        g.addColorStop(1, tone(TONES[sd.tone], 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(mcx, mcy, r, 0, TAU); ctx.fill();
        ctx.fillStyle = tone(TONES[sd.tone], 0.95 * t);
        ctx.fillRect(x, y, w, hh);
        // A company with several signals wears them as small marks beside it.
        if (sd.multi) {
          sd.multi.forEach((tn, j) => {
            if (j === 0) return;
            const a = band(0.5 + j * 0.2, 0.8 + j * 0.2)(t);
            if (a <= 0) return;
            ctx.fillStyle = tone(TONES[tn], 0.95 * a);
            ctx.fillRect(x + w + 3 + (j - 1) * 6, y + hh / 2 - 2, 4, 4);
          });
        }
      }
      ctx.restore();
      // The names, in the margin beside the field at their marks' height —
      // a tick at the field's edge, never a line across other companies.
      if (desktop) {
        ctx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0.04em';
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
        let lastY = -Infinity;
        stand.filter((sd) => sd.cand).map((sd) => ({ sd, k: stand.indexOf(sd), y: map(0, marks[sd.i].cy)[1] }))
          .sort((a, b) => a.y - b.y)
          .forEach(({ sd, k, y: my }) => {
            const t = band(0.55, 1)(lit[k]);
            if (t <= 0) return;
            const c = CANDIDATES.find((cc) => cc.key === sd.cand);
            const y = Math.max(my, lastY + 28);
            lastY = y;
            const x0 = F.r + 6, tx = F.r + 22;
            ctx.strokeStyle = tone(TONES[sd.tone], 0.8 * t); ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x0, y - 1); ctx.lineTo(x0 + 9, y - 1); ctx.stroke();
            ctx.fillStyle = white(0.88 * t);
            ctx.fillText(c.name, tx, y + 2);
            ctx.fillStyle = tone(TONES[sd.tone], 0.95 * t);
            ctx.fillText(c.signals.length > 1 ? `${c.signals.length} signaler` : c.signals[0], tx, y + 15);
          });
      }
      // The three named, listed as they light.
      cands.forEach((cd) => {
        const k = stand.findIndex((sd) => sd.cand === cd.key);
        const o = (k < 0 ? 1 : band(0.6, 1)(lit[k])).toFixed(3);
        if (cd.el.style.opacity !== o) cd.el.style.opacity = o;
      });
    },
  };
}

/* ── 05: the three, inspected; one goes on and rejoins the rail ─────────── */
export function s5Scene(el, R = docRect) {
  let B = null, barY = 0, cards = [], fans = [], back = null, backY = 0, desktop = true, lastRowB = 0;
  return {
    el, bg: '#0C1310', t: 0, b: 0, node: null,
    measure(geo) {
      const sec = R(el);
      this.t = sec.t; this.b = sec.b; this.node = nodeOf(el, R);
      desktop = geo.desktop;
      const box = el.querySelector('[data-wk-qualify]');
      B = R(box);
      barY = R(box.querySelector('.qf-bar')).cy;
      cards = Array.from(el.querySelectorAll('[data-cand]')).map((c) => ({
        el: c, r: R(c), go: c.dataset.go === '1',
        rows: Array.from(c.querySelectorAll('[data-row]')).map((rw) => ({ el: rw, r: R(rw) })),
        verdict: c.querySelector('[data-verdict]'),
      }));
      lastRowB = Math.max(...cards.map((c) => c.rows[c.rows.length - 1].r.b));
      const { railX } = geo;
      fans = desktop
        ? OFFS.map((o, i) => {
          const y = barY - 70 + 4 * i;
          return path([['M', railX + o, y], ['C', railX + o, y + 34, B.l - 36, barY, B.l, barY, 18]]);
        })
        : [path([['M', railX, barY - 40], ['C', railX, barY - 8, B.l - 20, barY, B.l, barY, 12]])];
      // The winner rejoins the rail: down out of its card, under the
      // artefact's last words, then home to the spine, tangent to it — the
      // bundle carries it on to 06.
      const w = cards.find((c) => c.go);
      const foot = el.querySelector('.jr-foot');
      const under = (foot ? R(foot).b : B.b) + 18;
      backY = w ? w.r.b : B.b;
      back = w && desktop
        ? path([
          ['M', w.r.cx, w.r.b],
          ['L', w.r.cx, under - 30],
          ['C', w.r.cx, under, w.r.cx - 60, under, w.r.cx - 90, under, 12],
          ['L', railX + 70, under],
          ['C', railX + 30, under, railX, under, railX, under + 44, 16],
        ])
        : null;
    },
    paint(ctx, f) {
      const h = f.head;
      if (!B) return;
      fans.forEach((P, i) => {
        const y = desktop ? barY - 70 + 4 * i : barY - 40;
        const t = band(y, y + 100)(h);
        if (t > 0) strokeLine(ctx, P, P.len * t, { alpha: 0.55, width: 0.85, tip: false });
      });
      if (h > barY + 50) { ctx.fillStyle = green(1); ctx.fillRect(B.l - 3, barY - 3, 6, 6); }
      // Criterion by criterion, across all three at once; the verdicts last;
      // then the two that fall recede and the one that holds is lit.
      const decided = band(lastRowB + 20, lastRowB + 70)(h);
      cards.forEach((c) => {
        c.rows.forEach((rw) => {
          const o = (desktop ? 0.18 + 0.82 * band(rw.r.t - 50, rw.r.t + 4)(h) : 1).toFixed(3);
          if (rw.el.style.opacity !== o) rw.el.style.opacity = o;
        });
        if (c.verdict) {
          const vo = (desktop ? band(lastRowB + 10, lastRowB + 50)(h) : 1).toFixed(3);
          if (c.verdict.style.opacity !== vo) c.verdict.style.opacity = vo;
        }
        const state = decided >= 1 ? (c.go ? 'on' : 'out') : '';
        if (c.el.dataset.state !== state) c.el.dataset.state = state;
      });
      if (back && decided >= 1) {
        const t = band(backY + 20, backY + 120)(h);
        if (t > 0) strokeLine(ctx, back, back.len * t, { alpha: 0.62, width: 1.6, glow: 0.3, tip: t < 1, tipA: 0.7 * tipFade(t) });
      }
    },
  };
}

/* ── 06: the bundle delivers the company into its row in the portal ─────── */
export function s6Scene(el, R = docRect) {
  let PT = null, row = null, rowEl = null, stateEl = null, briefEl = null, splay = [], ends = [], desktop = true;
  const LAND = [7, 12, 17, 22, 27, 32]; // where the six strands land, down the row's edge
  return {
    el, bg: '#15181A', t: 0, b: 0, node: null,
    measure(geo) {
      const sec = R(el);
      this.t = sec.t; this.b = sec.b; this.node = nodeOf(el, R);
      desktop = geo.desktop;
      const p = el.querySelector('[data-portal]');
      PT = p ? R(p) : null;
      rowEl = el.querySelector('[data-pm-row="1"]');
      row = rowEl ? R(rowEl) : null;
      stateEl = rowEl ? rowEl.querySelector('[data-pm-state]') : null;
      briefEl = el.querySelector('[data-pm-brief]');
      if (!PT) return;
      geo.ropeEnd = PT.t - 26;
      if (!desktop) geo.singleEndY = PT.t - 26;
      const { railX } = geo;
      const ry = row ? row.t + 4 : PT.t + 60;
      // The payoff: the six strands founded in 01 come down the spine to the
      // company's row and turn into the portal's edge at its height.
      splay = desktop
        ? OFFS.map((o, i) => {
          const x = railX + o;
          const y = ry + LAND[i];
          return path([
            ['M', x, PT.t - 26],
            ['L', x, y - 48],
            ['C', x, y - 16, PT.l - 28, y, PT.l, y, 20],
          ]);
        })
        : [];
      ends = splay.map((_, i) => [PT.l, ry + LAND[i]]);
    },
    // The head rides the bundle to the portal; the strands carry it from
    // there, with a fade.
    cometAlpha(y) { return !PT ? 1 : smooth(PT.t - 40, PT.t - 110, y); },
    paint(ctx, f) {
      const h = f.head;
      if (!PT) return;
      // The ending: the signal drains into the Brief. Everything above the
      // row's height goes first, top down; the landing marks go last.
      const drain = f.geo.drain ?? 0;
      const yTop = drain > 0 ? lerp(PT.t - 26, (row ? row.t + 4 : PT.t + 60) + 40, drain) : undefined;
      const markA = 1 - smooth(0.6, 1, drain);
      // The last of the strands fades rather than snapping off.
      const strandA = 1 - smooth(0.85, 1, drain);
      let landed = 0;
      splay.forEach((P, i) => {
        const t = band(PT.t - 26 + i * 4, PT.t + 96 + i * 4)(h);
        if (t <= 0) return;
        if (strandA > 0.01) strokeLine(ctx, P, P.len * t, { alpha: 0.55 * strandA, width: 1.1, tip: t < 1, tipA: 0.6 * tipFade(t) * strandA, yTop });
        if (t >= 1) {
          landed++;
          if (markA > 0) {
            ctx.fillStyle = green(0.9 * markA);
            ctx.beginPath(); ctx.arc(ends[i][0] + 1, ends[i][1], 1.8, 0, TAU); ctx.fill();
          }
        }
      });
      // Delivered: the closed square at the portal's edge, the row lights,
      // and the Brief opens as the head reads on.
      const on = !desktop || landed === 6;
      if (on && desktop && markA > 0) {
        ctx.fillStyle = green(0.95 * markA);
        ctx.fillRect(PT.l - 5, (row ? row.cy : PT.t + 60) - 4, 8, 8);
      }
      const rowOn = on ? '1' : '0';
      if (rowEl && rowEl.dataset.on !== rowOn) rowEl.dataset.on = rowOn;
      if (stateEl) {
        const so = desktop ? band(PT.t + 110, PT.t + 140)(h).toFixed(3) : '1';
        if (stateEl.style.opacity !== so) stateEl.style.opacity = so;
      }
      if (briefEl) {
        const bt = desktop ? band(PT.t + 150, PT.t + 250)(h) : 1;
        const bo = (0.12 + 0.88 * bt).toFixed(3);
        if (briefEl.style.opacity !== bo) {
          briefEl.style.opacity = bo;
          briefEl.style.transform = `translate3d(0, ${(8 * (1 - bt)).toFixed(1)}px, 0)`;
        }
      }
    },
  };
}
