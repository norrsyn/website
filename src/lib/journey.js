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
// Problemet rises slowly, while the market is still settling into the line:
// the passage lands inside it rather than cutting to it.
const TIN = { ph: 0.8 };
// Scroll per chapter, arrival and departure included: every artefact gets
// the time to be seen; 06 has room for the Brief to open before the ending.
const DWELL = [['ph', 1.9], ['s1', 2.1], ['s2', 1.7], ['s3', 1.85], ['s4', 2.0], ['s5', 2.0], ['s6', 2.2]];
// The passage: the market collapses over 2.4 viewports of scroll while the
// thought is written down the page and holds; Problemet begins to rise
// before the collapse is quite over.
export const WIN = { hero: [0, 0], collapse: [0, 2.4] };
{
  let t0 = 2.25;
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

export function createJourney({ wrap, frame, canvas, layers, hero, control, end }) {
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
    u: 0, p: 0, amb: 0, out: 0, chrome: 0, world: 0, flow: 0, cur: 'hero', owner: 'hero', hs: 0, dyHero: 0,
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
    st.out = smooth(WIN.out[0] - 0.7, WIN.out[0] - 0.05, u);
    // Two overlapping movements: the portal's surroundings recede and the
    // signal drains into the Brief, which starts growing at once; the world
    // warms to paper around it as it becomes the head of the document.
    st.chrome = smooth(0, 0.45, st.out);
    st.world = smooth(0.3, 0.85, st.out);
    geo.drain = st.chrome;
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
      // The hero's own words go quickly, so the passage has the frame to itself.
      const o = String(1 - sm(0, 0.12, p));
      hero.fades.forEach((el) => { el.style.opacity = o; });
      const blur = `blur(${(9 * sm(0, 0.15, p)).toFixed(2)}px)`;
      hero.texts.forEach((el) => { el.style.opacity = o; el.style.filter = p > 0.001 ? blur : ''; });
      hero.block.style.pointerEvents = p > 0.1 ? 'none' : '';
      hero.cue.style.opacity = String(1 - sm(0, 0.06, p));
      hero.foot.style.opacity = String(1 - sm(0, 0.1, p));
    }
    // The passage runs on the collapse's clock; the thought leaves only as
    // Problemet takes the frame — riding up with the hero, fading from the
    // top down — so the descent is one movement. The underscore stays.
    applyCascade(hero.cascade, (st.u - WIN.collapse[0]) / (WIN.collapse[1] - WIN.collapse[0]), clamp01(-st.dyHero / H));
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
  let lastOut = -1, lastCur = null, lastCtl = null, lastEnd = null, swapToken = 0;
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
    // The ending. The portal's surroundings recede and the signal drains into
    // the Brief, which begins to grow at once; the world warms to paper and
    // the Brief lands at the width of the document below, flush with the
    // bottom of the frame, where that document begins; its words rise above.
    if (st.out !== lastOut) {
      lastOut = st.out;
      const o = st.out;
      const k = st.world;
      const c = FOREST.map((v, i) => Math.round(lerp(v, MIST[i], k)));
      frame.style.backgroundColor = `rgb(${c[0]},${c[1]},${c[2]})`;
      frame.style.setProperty('--jy-vig', (1 - k).toFixed(3));
      // The market's dust stays in the dark and goes with the paper.
      canvas.style.opacity = String(1 - k);
      const L6 = layers.s6;
      L6.el.style.setProperty('--pm-out', st.chrome.toFixed(3));
      // The box stops clipping the moment the Brief starts to move.
      const outAttr = o > 0.001 ? '1' : '0';
      if (L6.el.dataset.out !== outAttr) L6.el.dataset.out = outAttr;
      L6.el.style.setProperty('--jy-brief-end', k.toFixed(3));
      if (L6.lift && L6.flip) {
        // The Brief grows the whole way through — never a small card alone.
        // It grows by `zoom`, not by a transform: the type is laid out and
        // rasterised at the size it is shown, so the head of the document is
        // as sharp as the document. The translate is in the zoomed element's
        // own units, hence divided by the zoom.
        const e = q5(sm(0.06, 0.92, o));
        const { dx, dy, k: kk } = L6.flip;
        const ty = dy - st.dy.s6 / L6.artScale;
        const z = 1 + (kk - 1) * e;
        L6.lift.style.zoom = z.toFixed(4);
        L6.lift.style.transform = `translate(${(dx * e / z).toFixed(2)}px, ${(ty * e / z).toFixed(2)}px)`;
      }
      if (L6.open) {
        // The click: "Öppna brief" takes the press and holds it for as long
        // as the portal is still leaving — click, confirmation, open. Only
        // when the chrome is gone does the link itself go.
        const press = o > 0.004 && st.chrome < 0.999 ? '1' : '0';
        if (L6.open.dataset.press !== press) L6.open.dataset.press = press;
        L6.open.style.opacity = (1 - sm(0.45, 0.62, o)).toFixed(3);
      }
      if (end) {
        // The document's words rise into the paper, one after the other.
        const eo = o.toFixed(3);
        if (eo !== lastEnd) {
          lastEnd = eo;
          end.parts.forEach((el, i) => {
            const t = sm(0.5 + 0.08 * i, 0.76 + 0.08 * i, o);
            el.style.opacity = t.toFixed(3);
            el.style.transform = `translate3d(0, ${(18 * (1 - t)).toFixed(1)}px, 0)`;
          });
        }
      }
      // The nav's shade belongs to the dark; the paper does without it.
      if (hero.scrim) hero.scrim.style.opacity = (1 - k).toFixed(3);
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
    // The bundle: six strands, six criteria wide, from the top of the stretch
    // to the head — and in 06 only as far as the portal, which takes them.
    const endY = Math.min(hv, fB, id === 's6' ? (geo.ropeEnd ?? fB) : fB, sB);
    let y0 = Math.max(-4, sT);
    // 06's ending: the signal drains into the Brief — the bundle's top end
    // runs down to the portal as the chrome recedes, and is gone with it.
    if (id === 's6' && st.chrome > 0) y0 = lerp(y0, endY, st.chrome);
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
    let a = sm(WIN.ph[0], WIN.ph[0] + 0.25 * TIN.ph, st.u) * (1 - st.out);
    if (a <= 0.01) return;
    const L = layers[ow];
    const hv = st.hv[ow];
    const sc = scenes[ow];
    // Where the line has left the spine, the head hands over to the
    // chapter's own tips — with a fade, never a cut.
    const ka = sc.cometAlpha ? sc.cometAlpha(hv) : 1;
    if (ka <= 0.01) return;
    a *= ka;
    let x = gx;
    if (ow === 'ph' && L.sweep) x = polyPoint(L.sweep, lengthAtY(L.sweep, hv))[0];
    const y = hv + st.dy[ow];
    if (y < -70 || y > H + 70) return;
    const g = ctx.createLinearGradient(0, y - 46, 0, y + 4);
    g.addColorStop(0, 'rgba(120,210,170,0)');
    g.addColorStop(0.88, `rgba(140,225,185,${(0.7 * a).toFixed(3)})`);
    g.addColorStop(1, 'rgba(120,210,170,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y - 46); ctx.lineTo(x, y + 4); ctx.stroke();
    const r = ctx.createRadialGradient(x, y, 0, x, y, 12);
    r.addColorStop(0, `rgba(120,210,170,${(0.34 * a).toFixed(3)})`);
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
    // The column of the document that follows the story (max-w-6xl, px-12).
    const colW = Math.min(1152, W) - 96;
    const colL = (W - Math.min(1152, W)) / 2 + 48;
    frame.style.setProperty('--jy-cl', `${colL}px`);
    frame.style.setProperty('--jy-cw', `${colW}px`);
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
      L.artScale = sc;
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
    // The Brief in the portal grows into the head of the document below: its
    // flight is measured here, from where it sits to the document's column,
    // flush with the bottom of the frame.
    {
      const L6 = layers.s6;
      L6.lift = L6.el.querySelector('.pm-brief-lift');
      L6.open = L6.el.querySelector('.pm-open');
      if (L6.lift) {
        L6.lift.style.transform = '';
        L6.lift.style.zoom = '';
        L6.lift.style.width = '';
        const b = R(L6.lift);
        const k = colW / b.w;
        // An explicit width, so zoom scales the box instead of re-wrapping
        // the text inside the same width; then the landing is measured with
        // the zoom applied, so margins and metrics rounding are in the sum.
        L6.lift.style.width = `${(b.w / L6.artScale).toFixed(2)}px`;
        L6.lift.style.zoom = k.toFixed(4);
        const bz = R(L6.lift);
        L6.lift.style.zoom = '';
        const th = bz.h;
        L6.flip = { dx: (colL - bz.l) / L6.artScale, dy: (H - th - bz.t) / L6.artScale, k };
        // The document's words sit just above the Brief's head, on its column:
        // the paper above is the margin, the words open the dossier below.
        if (end?.el) {
          const top = Math.max(100, H - th - end.el.offsetHeight - 26);
          end.el.style.top = `${top.toFixed(0)}px`;
        }
      }
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
    // Geometry changed: everything derived from it is applied again on the
    // next frame, including the ending, which otherwise only re-applies when
    // the scroll moves — a reload deep in the page would leave the Brief
    // where the measurement reset it.
    lastOut = -1; lastEnd = null; lastP = -1;
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
