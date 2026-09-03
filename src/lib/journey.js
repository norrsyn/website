/**
 * THE JOURNEY
 *
 * One sticky, viewport-sized frame holds the whole story — the hero, the
 * problem and the six chapters — and everything inside it is a function of
 * how far the visitor has scrolled through a tall, empty wrapper. Nothing
 * scrolls in the usual sense: the field keeps drifting behind the whole
 * story, the line morphs from the underscore into the spine and then into
 * the six-strand bundle, chapter copy dissolves in and out in place, and
 * each chapter's artefact plays its choreography under a virtual reading
 * head that eases down the frame while the chapter is open.
 *
 * Rhythm. Chapters overlap by T: the outgoing chapter dissolves and lifts
 * while the incoming one dissolves in from just below — a transition, never
 * a cut, and the line never blinks. The reading head follows an S-curve so
 * each chapter eases in and settles out. At the end the frame itself
 * dissolves into the paper of the next section.
 *
 * Why it is smooth: no canvas has to chase the compositor. The frame is
 * sticky (compositor-positioned); every visual is static inside it and only
 * its STATE changes with scroll. Scroll up and everything reverses exactly.
 * "Nästa" glides the scroll position with a tween the journey plays through.
 */
import { createField } from './field.js';
import {
  path, lengthAtY, traceRange, strokeLine, smooth, clamp01, lerp,
  green, greenHi, OFFS, TAU, paintNodeAt,
} from './stage.js';
import {
  problemetScene, s1Scene, s2Scene, s3Scene, s4Scene, s5Scene, s6Scene,
} from './scenes.js';

/* ── The timeline, in viewport heights of wrapper travel ─────────────── */
export const T = 0.5; // the cross-dissolve between chapters
// Scroll per chapter: enough that one flick of the wheel is never a chapter.
const DWELL = [['ph', 1.6], ['s1', 2.0], ['s2', 1.5], ['s3', 1.6], ['s4', 1.75], ['s5', 1.75], ['s6', 1.9]];
export const WIN = { hero: [0, 1], collapse: [1, 2], morph: [2, 2.5] };
{
  let t0 = 2.3;
  for (const [id, d] of DWELL) { WIN[id] = [t0, t0 + d]; t0 += d - T; }
  const e6 = WIN.s6[1];
  WIN.out = [e6, e6 + 0.4];
}
export const TOTAL = WIN.out[1] + 0.05;
export const CH_IDS = DWELL.map(([id]) => id);
export const NEXT = { hero: 'ph', ph: 's1', s1: 's2', s2: 's3', s3: 's4', s4: 's5', s5: 's6', s6: 'brief' };
export const PREV = { ph: 'hero', s1: 'ph', s2: 's1', s3: 's2', s4: 's3', s5: 's4', s6: 's5' };
export const LABEL = {
  ph: 'Problemet', s1: '01 · Kravbilden', s2: '02 · Marknaden', s3: '03 · Granskningen',
  s4: '04 · Researchen', s5: '05 · Bedömningen', s6: '06 · Briefen', brief: 'Ett komplett exempel',
};
const SCENE = { ph: problemetScene, s1: s1Scene, s2: s2Scene, s3: s3Scene, s4: s4Scene, s5: s5Scene, s6: s6Scene };

const railXFor = (w) => (w < 640 ? 17 : Math.max(16, w / 2 - 576 + 17.6) + 1);
const drift = (i, y) => Math.sin(y / (460 + i * 41) + i * 1.3) * 0.8;
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

  const st = { u: 0, p: 0, amb: 0, out: 0, cur: 'hero', q: {}, o: {}, dy: {}, hv: {} };
  for (const id of CH_IDS) { st.q[id] = 0; st.o[id] = 0; st.dy[id] = 0; st.hv[id] = 0; }

  const holes = [];
  const field = createField(canvas, {
    drawLine: false,
    progress: () => st.p,
    ambient: () => st.amb,
    holes: () => holes,
    after: paintOverlays,
  });
  const ctx = field.ctx;

  /* ── State ─────────────────────────────────────────────────────────── */
  function compute() {
    const sy = window.scrollY;
    st.u = Math.max(0, Math.min(TOTAL, (sy - wrapTop) / H));
    const u = st.u;
    st.p = clamp01(u - WIN.collapse[0]);
    st.out = smooth(WIN.out[0], WIN.out[0] + 0.36, u);
    // The field stays as it is to the end; the canvas fade carries the ending.
    st.amb = smooth(2.05, 2.5, u);
    holes.length = 0;
    let cur = u < WIN.ph[0] + T * 0.5 ? 'hero' : 'end';
    let best = 0;
    for (const id of CH_IDS) {
      const [a, b] = WIN[id];
      // Asymmetric dissolve: the outgoing chapter leaves in the first two
      // thirds of the overlap, the incoming one arrives in the last two
      // thirds — they pass each other, rather than sit on top of each other.
      const tin = smooth(a + T * 0.3, a + T, u);
      const tout = smooth(b - T, b - T * 0.3, u);
      const o = tin * (1 - tout);
      st.o[id] = o;
      st.dy[id] = (1 - tin) * 24 - tout * 24;
      const L = layers[id];
      // The reading head eases down the frame while the chapter is open.
      st.hv[id] = lerp(L.headTop, L.headBot, smooth(a + T * 0.55, b - T * 0.45, u));
      if (o > best && u < WIN.out[0]) { best = o; cur = id; }
      if (o > 0.001 && L.copyR && L.artR) holes.push({ ...L.copyR, k: o }, { ...L.artR, k: o });
    }
    // Between the last chapter and the ending, "Nästa" still points onward.
    if (cur === 'end' && u < WIN.out[0] + 0.05) cur = 's6';
    st.cur = cur;
  }

  /* ── DOM ───────────────────────────────────────────────────────────── */
  const sm = (a, b, v) => smooth(a, b, v);
  let lastP = -1;
  function applyHero(p) {
    if (p === lastP) return;
    lastP = p;
    const o = String(1 - sm(0, 0.34, p));
    hero.fades.forEach((el) => { el.style.opacity = o; });
    const blur = `blur(${(9 * sm(0, 0.4, p)).toFixed(2)}px)`;
    hero.texts.forEach((el) => { el.style.opacity = o; el.style.filter = p > 0.001 ? blur : ''; });
    hero.block.style.pointerEvents = p > 0.3 ? 'none' : '';
    hero.collapse.style.opacity = String(sm(0.32, 0.5, p) * (1 - sm(0.84, 0.98, p)));
    hero.cue.style.opacity = String(1 - sm(0, 0.18, p));
    hero.foot.style.opacity = String(1 - sm(0, 0.3, p));
  }
  let lastCursor = null, lastOut = -1, lastCur = null, lastCtl = null, swapToken = 0;
  function applyDOM() {
    applyHero(st.p);
    // The underscore holds through the collapse, then gives way to the line.
    if (st.u >= WIN.morph[0] - 0.02) {
      const co = String(1 - sm(WIN.morph[0], WIN.morph[0] + 0.25, st.u));
      if (co !== lastCursor) { hero.cursor.style.opacity = co; lastCursor = co; }
    } else if (lastCursor !== null) {
      hero.cursor.style.opacity = '1';
      lastCursor = null;
    }
    for (const id of CH_IDS) {
      const L = layers[id];
      const o = st.o[id];
      const key = `${o.toFixed(3)}|${st.dy[id].toFixed(1)}`;
      if (L.lastKey === key) continue;
      L.lastKey = key;
      L.el.style.opacity = o.toFixed(3);
      L.el.style.visibility = o > 0.001 ? 'visible' : 'hidden';
      L.el.style.transform = `translate3d(0, ${st.dy[id].toFixed(1)}px, 0)`;
      // The copy resolves like the hero's: exposure, not position.
      const [a, b] = WIN[id];
      const bl = 8 * (1 - sm(a + T * 0.3, a + T, st.u)) + 8 * sm(b - T, b - T * 0.3, st.u);
      const fs = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : '';
      if (L.copy.style.filter !== fs) L.copy.style.filter = fs;
      if (L.hand) L.hand.style.opacity = String(sm(a + T + 0.35, a + T + 0.55, st.u));
    }
    // The ending: the frame dissolves into the paper of the next section.
    if (st.out !== lastOut) {
      lastOut = st.out;
      const k = st.out;
      const c = FOREST.map((v, i) => Math.round(lerp(v, MIST[i], k)));
      frame.style.backgroundColor = `rgb(${c[0]},${c[1]},${c[2]})`;
      canvas.style.opacity = String(1 - k);
    }
    // The control: where we are. Absent until the story begins, gone when
    // it ends; the label swaps with a short settle when the chapter changes.
    if (control) {
      const c0 = WIN.ph[0] + T * 0.3;
      const co = (sm(c0, c0 + 0.25, st.u) * (1 - sm(WIN.out[0] - 0.15, WIN.out[0] + 0.02, st.u))).toFixed(3);
      if (co !== lastCtl) {
        control.el.style.opacity = co;
        control.el.style.pointerEvents = co === '0.000' ? 'none' : '';
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
  function paintLine() {
    const u = st.u;
    const fs = field.state();

    if (u < WIN.morph[0]) {
      // The hero's line: born from the underscore, falling with the drop.
      const end = fs.dropDone ? H + 2 : fs.lineEnd;
      if (end == null) return;
      const p = st.p;
      ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(ax, oy); ctx.lineTo(ax, end);
      ctx.strokeStyle = green(0.07 * (1 - p)); ctx.lineWidth = 18; ctx.stroke();
      ctx.strokeStyle = green(0.16 * (1 - 0.7 * p)); ctx.lineWidth = 6; ctx.stroke();
      const g = ctx.createLinearGradient(0, oy, 0, H);
      g.addColorStop(0, greenHi(0.95));
      g.addColorStop(0.3, green(0.8));
      g.addColorStop(1, green(0.62));
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke();
      if (!fs.dropDone) {
        const r = ctx.createRadialGradient(ax, end, 0, ax, end, 14);
        r.addColorStop(0, 'rgba(120,210,170,0.6)');
        r.addColorStop(1, 'rgba(120,210,170,0)');
        ctx.fillStyle = r;
        ctx.beginPath(); ctx.arc(ax, end, 14, 0, TAU); ctx.fill();
        ctx.fillStyle = '#9BE3C4';
        ctx.beginPath(); ctx.arc(ax, end, 2.8, 0, TAU); ctx.fill();
      }
      return;
    }

    // The morph: the line reaches the top, then sweeps its lower half into
    // the left margin; in 01 the upper half follows and the spine is straight.
    const yTop = lerp(oy, 0, sm(WIN.morph[0], WIN.morph[0] + 0.2, u));
    const lowX = lerp(ax, gx, sm(WIN.morph[0] + 0.18, WIN.morph[1], u));
    const topX = lerp(ax, gx, sm(WIN.s1[0], WIN.s1[0] + 0.3, u));
    const rope = sm(WIN.s2[0], WIN.s2[0] + 0.3, u);

    if (rope < 1) {
      const P = path([
        ['M', topX, yTop],
        ['L', topX, yTop + 28],
        ['C', topX, yTop + 150, lowX, yTop + 60, lowX, yTop + 190, 36],
        ['L', lowX, H + 2],
      ]);
      // During 01 the line leaves the spine at the fold and 01 draws the
      // rest itself; the plain spine below the fold crossfades away.
      const o1 = st.o.s1;
      const foldEnd = o1 > 0 && geo.singleEndY != null ? geo.singleEndY : H + 2;
      const sEnd = lengthAtY(P, foldEnd);
      const a = 0.62 * (1 - rope);
      strokeLine(ctx, P, sEnd, { alpha: a, width: 2, glow: 1 - rope, tip: false });
      if (sEnd < P.len && (1 - o1) > 0.001) {
        ctx.beginPath();
        traceRange(ctx, P, sEnd, P.len);
        ctx.strokeStyle = green(a * (1 - o1)); ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.stroke();
      }
    }
    if (rope > 0) {
      // The bundle: six strands, full height, until the Brief takes them.
      const o6 = st.o.s6;
      const ropeEnd = o6 > 0 && geo.ropeEnd != null ? geo.ropeEnd : H + 2;
      ctx.lineWidth = 1.1; ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const strand = (y0, y1, alpha) => {
          if (y1 <= y0 || alpha <= 0.001) return;
          ctx.beginPath();
          for (let y = y0; ; y += 18) {
            const yy = Math.min(y, y1);
            const x = gx + OFFS[i] * rope + drift(i, yy);
            if (y === y0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
            if (yy >= y1) break;
          }
          ctx.strokeStyle = green(alpha);
          ctx.stroke();
        };
        strand(-2, ropeEnd, 0.5 * rope);
        strand(ropeEnd, H + 2, 0.5 * rope * (1 - o6));
      }
    }
  }

  /* ── Overlays: the open chapters' choreography ─────────────────────── */
  function paintOverlays(_ctx, now) {
    paintLine();
    for (const id of CH_IDS) {
      const o = st.o[id];
      if (o <= 0.001) continue;
      const L = layers[id];
      const f = {
        now, dt: 0, sy: 0, W, H, dpr, head: st.hv[id],
        top: -200, bot: H + 200, reduced: false, desktop: true, geo, pulse() {},
      };
      ctx.save();
      ctx.globalAlpha = o;
      ctx.translate(0, st.dy[id]);
      if (L.node) paintNodeAt(ctx, gx, L.node.y, st.hv[id]);
      scenes[id].paint(ctx, f);
      ctx.restore();
    }
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
    frame.style.setProperty('--jy-left', `${gx + 70}px`);

    const c = R(hero.cursor);
    ax = Math.round(c.cx) + 0.5;
    oy = Math.round(c.b);
    frame.style.setProperty('--hf-ax', `${ax}px`);
    const hy = Math.min(0.5 * H, Math.max(0.2 * H, oy - 0.09 * H));
    const b = R(hero.block);
    field.layout({ W, H, dpr, ax, oy, hy, hole: { l: b.l, t: b.t, r: b.r, b: b.b } });

    geo.railX = gx; geo.W = W; geo.H = H; geo.dpr = dpr; geo.desktop = true;
    geo.foldGap = 56; geo.spindleEnd = H + 40;

    for (const id of CH_IDS) {
      const L = layers[id];
      // Measure untransformed: the slide must not leak into the geometry.
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
      L.headTop = (L.node ? L.node.y : ar.t) - 80;
      L.headBot = ar.b + 260;
    }
    if (!running) { compute(); applyDOM(); field.render(performance.now()); }
  }

  /* ── Glide: "Nästa" and the anchors move the scroll with a tween the
        journey plays through — never a jump. ───────────────────────────── */
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
    const dur = Math.max(700, Math.min(1900, (dist / H) * 850));
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
    if (id === 'brief') {
      const el = document.getElementById('brief');
      if (el) glideTo(el.getBoundingClientRect().top + window.scrollY);
      return;
    }
    if (!WIN[id]) return;
    glideTo(wrapTop + (WIN[id][0] + T + 0.12) * H);
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
    measure, start, stop, destroy, goTo, goNext, goPrev,
    scheduleIntro: (ms) => field.scheduleIntro(ms),
    skipIntro: () => field.skipIntro(),
    progress: () => { compute(); return st.u; },
  };
}
