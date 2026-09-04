/**
 * THE JOURNEY
 *
 * One sticky, viewport-sized frame holds the whole story — the hero, the
 * problem and the six chapters — and everything inside it is a function of
 * how far the visitor has scrolled through a tall, empty wrapper. Nothing
 * scrolls in the usual sense: the field keeps drifting behind the whole
 * story, the chapters travel through the frame as one page, and each
 * chapter's artefact plays its choreography under a reading head.
 *
 * The line. It hangs from the brand's underscore and never leaves it: when
 * the hero lifts away the underscore rises with the top of the line. Below
 * the hero the line sweeps once into the left margin and becomes the spine;
 * in 01 the spine splits into six strands and from 02 on it is the bundle,
 * until the Brief takes the strands in 06. The line is drawn only as far as
 * the head has read: a comet that rides the frame boundary while a chapter
 * arrives and then reads down through it. Every merge — the sweep, the fold,
 * the spindle, the bundle, the splay — is one geometry drawn by one head, so
 * the line never appears out of nothing and never covers what is being read.
 *
 * Rhythm. Over T viewports of scroll the outgoing chapter lifts a full frame
 * up and the incoming one rises from a full frame below, moving as one page;
 * the field flows past at the same time. While a chapter is read it creeps
 * upward a little. At the end the frame dissolves into the paper of the next
 * section, whose first words close the story.
 *
 * Why it is smooth: no canvas has to chase the compositor. The frame is
 * sticky (compositor-positioned); every visual is static inside it and only
 * its STATE changes with scroll. Scroll up and everything reverses exactly.
 * Every anchor and the chapter control glide the scroll position with a
 * tween the journey plays through — the visitor sees the story pass.
 */
import { createField } from './field.js';
import {
  path, lengthAtY, polyPoint, strokeLine, smooth, clamp01, lerp,
  green, greenHi, OFFS, TAU, paintNodeAt,
} from './stage.js';
import {
  problemetScene, s1Scene, s2Scene, s3Scene, s4Scene, s5Scene, s6Scene,
} from './scenes.js';
import { applyCascade } from './cascade.js';

/* ── The timeline, in viewport heights of wrapper travel ─────────────── */
export const T = 0.5; // the travel between chapters, in viewports of scroll
// The first scroll answers at once: the market begins to fall into the line
// on the first notch of the wheel, and Problemet has risen within a viewport
// and a bit. Its arrival is the one travel that is watched, so it is longer.
const TIN = { ph: 0.65 };
// Scroll per chapter, arrival and departure included.
const DWELL = [['ph', 1.9], ['s1', 1.95], ['s2', 1.5], ['s3', 1.55], ['s4', 1.75], ['s5', 1.75], ['s6', 1.85]];
export const WIN = { hero: [0, 0], collapse: [0, 1.0] };
{
  let t0 = 0.85;
  for (const [id, d] of DWELL) { WIN[id] = [t0, t0 + d]; t0 += d - T; }
  const e6 = WIN.s6[1];
  WIN.out = [e6, e6 + 0.12];
}
// The frame stays put exactly until it has cleared to paper, then scrolls.
export const TOTAL = WIN.out[1];
export const CH_IDS = DWELL.map(([id]) => id);
export const NEXT = { hero: 'ph', ph: 's1', s1: 's2', s2: 's3', s3: 's4', s4: 's5', s5: 's6', s6: 'brief' };
export const PREV = { ph: 'hero', s1: 'ph', s2: 's1', s3: 's2', s4: 's3', s5: 's4', s6: 's5' };
export const LABEL = {
  ph: 'Problemet', s1: '01 · Kravbilden', s2: '02 · Marknaden', s3: '03 · Granskningen',
  s4: '04 · Researchen', s5: '05 · Bedömningen', s6: '06 · Briefen', brief: 'Ett komplett exempel',
};
const SCENE = { ph: problemetScene, s1: s1Scene, s2: s2Scene, s3: s3Scene, s4: s4Scene, s5: s5Scene, s6: s6Scene };
// Where the anchors in the navigation land inside the story.
const ANCHOR_TO = { '#start': 'hero', '#varfor-norrsyn': 'ph', '#processen': 's1' };

// A chapter arrives from TRAVEL viewports below and leaves as far above —
// one full frame, so two chapters never share the frame except at their
// edges — and creeps CREEP upward while it is read. FLOW is how far the
// field flows past the visitor, in depth, per viewport of that travel.
const TRAVEL = 1.0;
const CREEP = 0.08;
const FLOW = 1.2;

const railXFor = (w) => (w < 640 ? 17 : Math.max(16, w / 2 - 576 + 17.6) + 1);
const drift = (i, y) => Math.sin(y / (460 + i * 41) + i * 1.3) * 0.8;
/** The travel's ease: still at both ends, heavy in the middle. */
const q5 = (t) => { t = clamp01(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const FOREST = [12, 19, 16];
const MIST = [231, 233, 230];

export function createJourney({ wrap, frame, canvas, layers, hero, control }) {
  let W = 0, H = 0, dpr = 1, wrapTop = 0, ax = 0, oy = 0, gx = 0;
  let FR = { left: 0, top: 0 };
  let running = false, raf = 0;

  /** A box in frame space: the frame is the world. */
  const R = (el) => {
    const r = el.getBoundingClientRect();
    const l = r.left - FR.left, t = r.top - FR.top;
    return { l, t, r: l + r.width, b: t + r.height, w: r.width, h: r.height, cx: l + r.width / 2, cy: t + r.height / 2 };
  };

  const geo = { railX: 0, desktop: true, W: 0, H: 0, dpr: 1, foldGap: 56, spindleEnd: 0 };
  const scenes = {};
  for (const id of CH_IDS) scenes[id] = SCENE[id](layers[id].el, R);

  const st = {
    u: 0, p: 0, amb: 0, out: 0, flow: 0, cur: 'hero', owner: 'hero', hs: 0, dyHero: 0,
    o: {}, oi: {}, oo: {}, dy: {}, hv: {},
  };
  for (const id of CH_IDS) { st.o[id] = 0; st.oi[id] = 0; st.oo[id] = 0; st.dy[id] = 0; st.hv[id] = 0; }

  const holes = [];
  const field = createField(canvas, {
    drawLine: false,
    progress: () => st.p,
    ambient: () => st.amb,
    holes: () => holes,
    travel: () => st.flow * FLOW,
    after: paintOverlays,
  });
  const ctx = field.ctx;

  /* ── State ─────────────────────────────────────────────────────────── */
  function compute() {
    const sy = window.scrollY;
    st.u = Math.max(0, Math.min(TOTAL, (sy - wrapTop) / H));
    const u = st.u;
    st.p = clamp01((u - WIN.collapse[0]) / (WIN.collapse[1] - WIN.collapse[0]));
    // The ending begins while the Brief is still lifting away and is complete
    // before the next section's paper can enter the frame from below: the
    // field clears to the paper the Brief lands on, and the two papers meet
    // as one colour.
    st.out = smooth(WIN.out[0] - 0.42, WIN.out[0] - 0.05, u);
    // The field re-emerges, faint, as Problemet rises out of the hero.
    st.amb = smooth(WIN.collapse[1] - 0.08, WIN.collapse[1] + 0.4, u);
    holes.length = 0;
    let cur = u < WIN.ph[0] + TIN.ph * 0.5 ? 'hero' : 'end';
    let owner = 'hero', best = 0, flow = 0;
    for (const id of CH_IDS) {
      const [a, b] = WIN[id];
      const tin = TIN[id] || T;
      const L = layers[id];
      // The travel. A chapter rises from TRAVEL below over its arrival,
      // creeps upward while it is read, and lifts away over the next
      // chapter's arrival; the two share one ease and move as one page,
      // (TRAVEL + CREEP) apart. Exposure rides on top: the incoming chapter
      // resolves as it arrives, the outgoing one dissolves as it leaves.
      const ti = q5((u - a) / tin);
      // The last chapter does not leave: the portal's Brief stays where it
      // is while the frame clears to paper, and the next section carries it on.
      const last = id === 's6';
      const to = last ? 0 : q5((u - (b - T)) / T);
      const dw = smooth(a + tin, b - T, u);
      const oi = smooth(a + 0.05 * tin, a + 0.62 * tin, u);
      const oo = last ? 1 : 1 - smooth(b - 0.62 * T, b - 0.08 * T, u);
      const o = oi * oo;
      st.o[id] = o; st.oi[id] = oi; st.oo[id] = oo;
      const dy = (TRAVEL * (1 - ti) - CREEP * dw - TRAVEL * to) * H;
      st.dy[id] = dy;
      flow += TRAVEL * ti + CREEP * dw;
      // The head. It waits on the chapter's node while the chapter arrives,
      // reads down through it while it is read, and by the time the chapter
      // leaves it sits exactly on the next chapter's node — the same point
      // in both chapters' space, so the hand-off is invisible.
      st.hv[id] = lerp(L.headTop, L.headBot, smooth(a + tin, b - T, u));
      if (u >= a) owner = id;
      if (o > best && u < WIN.out[0]) { best = o; cur = id; }
      if (o > 0.001 && L.copyR && L.artR) {
        holes.push(
          { l: L.copyR.l, r: L.copyR.r, t: L.copyR.t + dy, b: L.copyR.b + dy, k: o },
          { l: L.artR.l, r: L.artR.r, t: L.artR.t + dy, b: L.artR.b + dy, k: o },
        );
      }
    }
    st.flow = flow;
    st.owner = owner;
    st.hs = owner === 'hero' ? H + 2 : st.hv[owner] + st.dy[owner];
    // The hero is the frame above Problemet and travels with it.
    st.dyHero = st.dy.ph - TRAVEL * H;
    // Between the last chapter and the ending, "Nästa" still points onward.
    if (cur === 'end' && u < WIN.out[0] + 0.05) cur = 's6';
    st.cur = cur;
  }

  /* ── DOM ───────────────────────────────────────────────────────────── */
  const sm = (a, b, v) => smooth(a, b, v);
  let lastP = -1, lastHeroDy = null;
  function applyHero(p) {
    if (p !== lastP) {
      lastP = p;
      const o = String(1 - sm(0, 0.34, p));
      hero.fades.forEach((el) => { el.style.opacity = o; });
      const blur = `blur(${(9 * sm(0, 0.4, p)).toFixed(2)}px)`;
      hero.texts.forEach((el) => { el.style.opacity = o; el.style.filter = p > 0.001 ? blur : ''; });
      hero.block.style.pointerEvents = p > 0.3 ? 'none' : '';
      hero.cue.style.opacity = String(1 - sm(0, 0.18, p));
      hero.foot.style.opacity = String(1 - sm(0, 0.3, p));
    }
    // The cascade runs on the collapse's clock and keeps running past it,
    // so its last lines ride up with the hero as Problemet rises.
    applyCascade(hero.cascade, (st.u - WIN.collapse[0]) / (WIN.collapse[1] - WIN.collapse[0]));
    const key = st.dyHero.toFixed(1);
    if (key !== lastHeroDy) {
      lastHeroDy = key;
      const tf = `translate3d(0, ${key}px, 0)`;
      hero.block.style.transform = tf;
      hero.collapse.style.transform = tf;
      hero.foot.style.transform = tf;
      hero.cue.style.transform = tf;
    }
  }
  let lastOut = -1, lastCur = null, lastCtl = null, swapToken = 0;
  function applyDOM() {
    applyHero(st.p);
    for (const id of CH_IDS) {
      const L = layers[id];
      const o = st.o[id];
      const key = `${o.toFixed(3)}|${st.dy[id].toFixed(1)}`;
      if (L.lastKey === key) continue;
      L.lastKey = key;
      L.el.style.opacity = o.toFixed(3);
      L.el.style.visibility = o > 0.001 ? 'visible' : 'hidden';
      L.el.style.transform = `translate3d(0, ${st.dy[id].toFixed(1)}px, 0)`;
      // The copy resolves like the hero's: exposure as well as position.
      const [a] = WIN[id];
      const tin = TIN[id] || T;
      const bl = 5 * (1 - st.oi[id]) + 5 * (1 - st.oo[id]);
      const fs = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : '';
      if (L.copy.style.filter !== fs) L.copy.style.filter = fs;
      if (L.hand) L.hand.style.opacity = String(sm(a + tin + 0.25, a + tin + 0.45, st.u));
    }
    // The ending: the frame dissolves into the paper of the next section.
    if (st.out !== lastOut) {
      lastOut = st.out;
      const k = st.out;
      const c = FOREST.map((v, i) => Math.round(lerp(v, MIST[i], k)));
      frame.style.backgroundColor = `rgb(${c[0]},${c[1]},${c[2]})`;
      frame.style.setProperty('--jy-vig', (1 - k).toFixed(3));
      canvas.style.opacity = String(1 - k);
      // The portal's surroundings recede with the field; its Brief stays.
      layers.s6.el.style.setProperty('--pm-out', k.toFixed(3));
    }
    // The control: where we are. Absent until the story begins, gone when
    // it ends; the label swaps with a short settle when the chapter changes.
    if (control) {
      const c0 = WIN.ph[0] + TIN.ph * 0.4;
      const co = (sm(c0, c0 + 0.25, st.u) * (1 - sm(WIN.out[0] - 0.15, WIN.out[0] + 0.02, st.u))).toFixed(3);
      if (co !== lastCtl) {
        control.el.style.opacity = co;
        control.el.style.pointerEvents = co === '0.000' ? 'none' : 'auto';
        lastCtl = co;
      }
      if (st.cur !== lastCur) {
        lastCur = st.cur;
        const cur = st.cur;
        const text = LABEL[cur] || '';
        control.dots.forEach((dot, id) => { dot.dataset.on = id === cur ? '1' : '0'; });
        if (control.prev) control.prev.disabled = !PREV[cur];
        if (control.label.textContent !== text) {
          const token = ++swapToken;
          control.label.classList.add('is-swap');
          setTimeout(() => {
            if (token !== swapToken) return;
            control.label.textContent = text;
            control.label.classList.remove('is-swap');
          }, 140);
        }
      }
    }
  }

  /* ── The line ──────────────────────────────────────────────────────── */
  /** The hero's line: born from the underscore, falling with the drop, and
   *  later rising with the underscore — it ends where Problemet begins. */
  function paintHeroLine() {
    const fs = field.state();
    const dyH = st.dyHero;
    if (dyH <= -H - 24) return;
    const top = oy + dyH;
    let endY;
    if (!fs.dropDone) { endY = fs.lineEnd; if (endY == null) return; }
    else endY = Math.min(H + 2, st.dy.ph - 2);
    if (endY <= top) return;
    const p = st.p;
    ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(ax, top); ctx.lineTo(ax, endY);
    ctx.strokeStyle = green(0.05 * (1 - p)); ctx.lineWidth = 18; ctx.stroke();
    ctx.strokeStyle = green(0.12 * (1 - 0.7 * p)); ctx.lineWidth = 6; ctx.stroke();
    const g = ctx.createLinearGradient(0, top, 0, Math.max(top + 1, H + dyH));
    g.addColorStop(0, greenHi(0.92));
    g.addColorStop(0.3, green(0.78));
    g.addColorStop(1, green(0.62));
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke();
    if (!fs.dropDone) {
      const r = ctx.createRadialGradient(ax, endY, 0, ax, endY, 14);
      r.addColorStop(0, 'rgba(120,210,170,0.55)');
      r.addColorStop(1, 'rgba(120,210,170,0)');
      ctx.fillStyle = r;
      ctx.beginPath(); ctx.arc(ax, endY, 14, 0, TAU); ctx.fill();
      ctx.fillStyle = '#9BE3C4';
      ctx.beginPath(); ctx.arc(ax, endY, 2.8, 0, TAU); ctx.fill();
    }
  }

  /** A chapter's stretch of the spine, in the chapter's own space (the
   *  context is already translated), drawn only as far as the head. Each
   *  stretch runs from the chapter's top to just past its bottom, so the
   *  stretches meet under the travel and nothing is drawn twice. */
  function paintSpine(id, L, hv, sT, sB) {
    const fB = (TRAVEL + CREEP) * H + 4;
    if (id === 'ph') {
      if (!L.sweep) return;
      const s = lengthAtY(L.sweep, Math.min(hv, fB));
      if (s > 0) strokeLine(ctx, L.sweep, s, { alpha: 0.62, width: 2, glow: 0.5, tip: false, yTop: sT, yBot: sB });
      return;
    }
    if (id === 's1') {
      // The single line, down to the fold; the ledger draws the rest.
      const endY = Math.min(hv, geo.singleEndY ?? fB);
      if (endY <= -4) return;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(gx, -4); ctx.lineTo(gx, endY);
      ctx.strokeStyle = green(0.07); ctx.lineWidth = 9; ctx.stroke();
      ctx.strokeStyle = green(0.62); ctx.lineWidth = 2; ctx.stroke();
      return;
    }
    // The bundle: six strands, until the Brief takes them.
    const endY = Math.min(hv, fB, id === 's6' ? (geo.ropeEnd ?? fB) : fB, sB);
    const y0 = Math.max(-4, sT);
    if (endY <= y0) return;
    const dy = st.dy[id];
    ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.strokeStyle = green(0.46);
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      for (let y = y0; ; y += 18) {
        const yy = Math.min(y, endY);
        // The drift is a function of screen height, so two stretches meet
        // at exactly the same x under the travel.
        const x = gx + OFFS[i] + drift(i, yy + dy);
        if (y === y0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        if (yy >= endY) break;
      }
      ctx.stroke();
    }
  }

  /** The head: a comet on the line, wherever the line is being read. */
  function paintHead() {
    const ow = st.owner;
    if (ow === 'hero') return;
    const a = sm(WIN.ph[0], WIN.ph[0] + 0.25 * TIN.ph, st.u) * (1 - st.out);
    if (a <= 0.01) return;
    const L = layers[ow];
    const hv = st.hv[ow];
    const sc = scenes[ow];
    if (sc.cometOk && !sc.cometOk(hv)) return;
    let x = gx;
    if (ow === 'ph' && L.sweep) x = polyPoint(L.sweep, lengthAtY(L.sweep, hv))[0];
    const y = hv + st.dy[ow];
    if (y < -70 || y > H + 70) return;
    const g = ctx.createLinearGradient(0, y - 52, 0, y + 4);
    g.addColorStop(0, 'rgba(120,210,170,0)');
    g.addColorStop(0.88, `rgba(140,225,185,${(0.8 * a).toFixed(3)})`);
    g.addColorStop(1, 'rgba(120,210,170,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y - 52); ctx.lineTo(x, y + 4); ctx.stroke();
    const r = ctx.createRadialGradient(x, y, 0, x, y, 14);
    r.addColorStop(0, `rgba(120,210,170,${(0.42 * a).toFixed(3)})`);
    r.addColorStop(1, 'rgba(120,210,170,0)');
    ctx.fillStyle = r;
    ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill();
    ctx.fillStyle = `rgba(155,227,196,${(0.95 * a).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(x, y, 2.3, 0, TAU); ctx.fill();
  }

  /* ── Overlays: the line and the open chapters' choreography ───────── */
  function paintOverlays(_ctx, now) {
    paintHeroLine();
    for (const id of CH_IDS) {
      const o = st.o[id];
      if (o <= 0.001) continue;
      const L = layers[id];
      const hv = st.hv[id];
      const dy = st.dy[id];
      const f = {
        now, dt: 0, sy: 0, W, H, dpr, head: hv,
        top: -dy - 200, bot: H - dy + 200, reduced: false, desktop: true, geo, pulse() {},
      };
      ctx.save();
      ctx.globalAlpha = o;
      ctx.translate(0, dy);
      paintSpine(id, L, hv, -dy - 4, H - dy + 4);
      if (L.node) paintNodeAt(ctx, gx, L.node.y, hv);
      scenes[id].paint(ctx, f);
      ctx.restore();
    }
    paintHead();
  }

  /* ── Layout ────────────────────────────────────────────────────────── */
  function measure() {
    const fr = frame.getBoundingClientRect();
    FR = { left: fr.left, top: fr.top };
    W = frame.clientWidth;
    H = frame.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
    gx = railXFor(document.documentElement.clientWidth);
    frame.style.setProperty('--jy-gx', `${gx}px`);
    document.documentElement.style.setProperty('--jy-gx', `${gx}px`);
    frame.style.setProperty('--jy-left', `${gx + 70}px`);

    // Measure the hero untransformed: the travel must not leak into the geometry.
    for (const el of [hero.block, hero.collapse, hero.foot, hero.cue]) el.style.transform = '';
    lastHeroDy = null;
    const c = R(hero.cursor);
    ax = Math.round(c.cx) + 0.5;
    oy = Math.round(c.b);
    frame.style.setProperty('--hf-ax', `${ax}px`);
    const hy = Math.min(0.5 * H, Math.max(0.2 * H, oy - 0.09 * H));
    const b = R(hero.block);
    field.layout({ W, H, dpr, ax, oy, hy, hole: { l: b.l, t: b.t, r: b.r, b: b.b } });

    geo.railX = gx; geo.W = W; geo.H = H; geo.dpr = dpr; geo.desktop = true;
    geo.foldGap = 56;
    // 01's spindle runs to the bottom of its stretch, where 02's bundle begins.
    geo.spindleEnd = (TRAVEL + CREEP) * H + 4;

    for (const id of CH_IDS) {
      const L = layers[id];
      // Measure untransformed: the travel must not leak into the geometry.
      L.el.style.transform = '';
      L.lastKey = null;
      // Fit: an artefact that does not fit under its copy is scaled, never
      // clipped, so every viewport shows the whole thing.
      L.art.style.transform = '';
      const at = R(L.art).t;
      const natural = L.art.offsetHeight;
      const avail = H - 40 - at;
      const sc = Math.min(1, avail / Math.max(1, natural));
      L.art.style.transform = sc < 0.999 ? `scale(${sc.toFixed(3)})` : '';
      scenes[id].measure(geo);
      const sq = L.el.querySelector('.jr-node-square');
      L.node = sq ? { y: R(sq).cy } : null;
      const ar = R(L.art);
      L.artR = ar;
      L.copyR = R(L.copy);
      // The head waits on the node while the chapter arrives (Problemet has
      // none: its head enters at the top of its stretch, on the sweep).
      L.headTop = L.node ? L.node.y : 0;
    }
    // Each chapter's head ends exactly on the next chapter's node, one
    // stretch further down — the same point in both chapters' space.
    CH_IDS.forEach((id, i) => {
      const next = CH_IDS[i + 1];
      layers[id].headBot = (TRAVEL + CREEP) * H + (next ? layers[next].headTop : 90);
    });
    // The sweep: the hero's line, hanging from the underscore's axis, curves
    // once into the left margin and is the spine from there on.
    layers.ph.sweep = path([
      ['M', ax, -4],
      ['L', ax, 30],
      ['C', ax, 186, gx, 68, gx, 236, 40],
      ['L', gx, (TRAVEL + CREEP) * H + 4],
    ]);
    if (!running) { compute(); applyDOM(); field.render(performance.now()); }
  }

  /* ── Glide: every anchor and the chapter control move the scroll with a
        tween the journey plays through — never a jump. The longer the way,
        the longer the ride, so the story is seen passing. ──────────────── */
  let anim = 0;
  const cancelGlide = () => {
    if (!anim) return;
    cancelAnimationFrame(anim);
    anim = 0;
    document.documentElement.style.scrollBehavior = '';
  };
  const glideTo = (toY) => {
    cancelGlide();
    const fromY = window.scrollY;
    const dist = Math.abs(toY - fromY);
    if (dist < 2) return;
    const dur = Math.max(1400, Math.min(5500, (dist / H) * 420));
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    document.documentElement.style.scrollBehavior = 'auto';
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, fromY + (toY - fromY) * ease(t));
      if (t < 1) anim = requestAnimationFrame(step);
      else { anim = 0; document.documentElement.style.scrollBehavior = ''; }
    };
    anim = requestAnimationFrame(step);
  };
  const userInput = () => cancelGlide();
  window.addEventListener('wheel', userInput, { passive: true });
  window.addEventListener('touchstart', userInput, { passive: true });
  window.addEventListener('keydown', userInput, { passive: true });

  function goTo(id) {
    if (id === 'hero') { glideTo(0); return; }
    if (id === 'brief') { goToAnchor('#brief'); return; }
    if (!WIN[id]) return;
    glideTo(wrapTop + (WIN[id][0] + (TIN[id] || T) + 0.1) * H);
  }
  /** An anchor anywhere on the page: into the story, or down to a section. */
  function goToAnchor(hash) {
    const id = ANCHOR_TO[hash];
    if (id) { goTo(id); return true; }
    let el = null;
    try { el = document.querySelector(hash); } catch { el = null; }
    if (!el) return false;
    glideTo(Math.max(0, el.getBoundingClientRect().top + window.scrollY - 12));
    return true;
  }
  function goNext() {
    const next = NEXT[st.cur];
    if (next) goTo(next);
  }
  function goPrev() {
    const prev = PREV[st.cur];
    if (prev) goTo(prev);
  }

  /* ── Loop ──────────────────────────────────────────────────────────── */
  function frameLoop(now) {
    if (!running) return;
    compute();
    applyDOM();
    field.render(now);
    raf = requestAnimationFrame(frameLoop);
  }
  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frameLoop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function destroy() {
    stop();
    cancelGlide();
    window.removeEventListener('wheel', userInput);
    window.removeEventListener('touchstart', userInput);
    window.removeEventListener('keydown', userInput);
    field.destroy();
  }

  return {
    measure, start, stop, destroy, goTo, goToAnchor, goNext, goPrev,
    scheduleIntro: (ms) => field.scheduleIntro(ms),
    skipIntro: () => field.skipIntro(),
    progress: () => { compute(); return st.u; },
  };
}
