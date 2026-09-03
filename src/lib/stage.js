/**
 * THE STAGE
 *
 * One fixed canvas behind the whole walkthrough. The sections are
 * transparent DOM over it; the stage paints their tonal bands, the line,
 * the six-strand bundle and every diagram — in document coordinates,
 * translated by the scroll position each frame. Nothing is measured per
 * frame: scenes cache their anchors on measure() (resize, fonts, layout)
 * and paint() only reads them.
 *
 * The head — one viewport line, REF · vh below the top — is the drawing
 * tip for the entire system, exactly as in the SVG thread engine this
 * replaces: scroll forward and the line advances, scroll back and it
 * retreats, stop and it stops, jump and it is already there. Ambient life
 * (flicker, tips, pulses) rides on time but never decides state.
 *
 * Reduced motion: the head is at infinity — every route is complete, every
 * artefact is in its final state — and the stage repaints on scroll only.
 */

export const REF = 0.74;
export const TAU = Math.PI * 2;
export const OFFS = [-5, -3, -1, 1, 3, 5]; // the six strands, six criteria wide

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a, b, t) => a + (b - a) * t;
/** A scroll band: 0 before `a`, 1 after `b`, linear between. */
export const band = (a, b) => (h) => clamp01((h - a) / (b - a));

export const green = (a) => `rgba(69,165,127,${a.toFixed(3)})`;
export const greenHi = (a) => `rgba(88,184,146,${a.toFixed(3)})`;
export const paper = (a) => `rgba(236,232,220,${a.toFixed(3)})`;
export const white = (a) => `rgba(255,255,255,${a.toFixed(3)})`;

/** An element's box in document space. */
export function docRect(el) {
  const r = el.getBoundingClientRect();
  const y = window.scrollY;
  return {
    l: r.left, t: r.top + y, r: r.right, b: r.bottom + y,
    w: r.width, h: r.height,
    cx: r.left + r.width / 2, cy: r.top + y + r.height / 2,
  };
}

/* ── Polylines ───────────────────────────────────────────────────────────
 * Every route is a flat polyline with cumulative lengths, so a prefix, a
 * range, or a point at a given length is one walk — no SVG path length
 * machinery, and curves are sampled once at build time.
 * ─────────────────────────────────────────────────────────────────────── */
export function poly(flat) {
  const n = flat.length >> 1;
  const cum = new Float32Array(n);
  let L = 0;
  for (let i = 1; i < n; i++) {
    const dx = flat[2 * i] - flat[2 * i - 2];
    const dy = flat[2 * i + 1] - flat[2 * i - 1];
    L += Math.hypot(dx, dy);
    cum[i] = L;
  }
  return { p: flat, n, cum, len: L };
}

/** A tiny path language: M/L absolute, Q/C sampled, A an arc about a
 *  centre from angle a0 to a1 (the current point must already be at a0). */
export function path(ops) {
  const pts = [];
  let cx = 0, cy = 0;
  for (const op of ops) {
    switch (op[0]) {
      case 'M':
      case 'L':
        cx = op[1]; cy = op[2];
        pts.push(cx, cy);
        break;
      case 'Q': {
        const qx = op[1], qy = op[2], x = op[3], y = op[4], n = op[5] || 12;
        const x0 = cx, y0 = cy;
        for (let k = 1; k <= n; k++) {
          const t = k / n, mt = 1 - t;
          pts.push(mt * mt * x0 + 2 * mt * t * qx + t * t * x, mt * mt * y0 + 2 * mt * t * qy + t * t * y);
        }
        cx = x; cy = y;
        break;
      }
      case 'C': {
        const x1 = op[1], y1 = op[2], x2 = op[3], y2 = op[4], x = op[5], y = op[6], n = op[7] || 20;
        const x0 = cx, y0 = cy;
        for (let k = 1; k <= n; k++) {
          const t = k / n, mt = 1 - t;
          pts.push(
            mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x,
            mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y,
          );
        }
        cx = x; cy = y;
        break;
      }
      case 'A': {
        const ax = op[1], ay = op[2], r = op[3], a0 = op[4], a1 = op[5], n = op[6] || 12;
        for (let k = 1; k <= n; k++) {
          const a = a0 + (a1 - a0) * (k / n);
          cx = ax + r * Math.cos(a); cy = ay + r * Math.sin(a);
          pts.push(cx, cy);
        }
        break;
      }
      default:
        break;
    }
  }
  return poly(pts);
}

export function polyPoint(P, s) {
  const p = P.p;
  if (s <= 0) return [p[0], p[1]];
  if (s >= P.len) return [p[2 * P.n - 2], p[2 * P.n - 1]];
  let lo = 0, hi = P.n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (P.cum[mid] <= s) lo = mid; else hi = mid;
  }
  const t = (s - P.cum[lo]) / ((P.cum[hi] - P.cum[lo]) || 1);
  return [lerp(p[2 * lo], p[2 * hi], t), lerp(p[2 * lo + 1], p[2 * hi + 1], t)];
}

/** For routes that only ever descend: the length at which the route
 *  reaches document y — so a vertical run's tip is exactly at the head. */
export function lengthAtY(P, y) {
  const p = P.p;
  if (y <= p[1]) return 0;
  for (let i = 1; i < P.n; i++) {
    const y0 = p[2 * i - 1], y1 = p[2 * i + 1];
    if (y1 >= y) {
      const t = (y - y0) / ((y1 - y0) || 1);
      return P.cum[i - 1] + (P.cum[i] - P.cum[i - 1]) * clamp01(t);
    }
  }
  return P.len;
}

/** Trace the route from its start up to length s. Segments entirely outside
 *  the [yTop, yBot] window are skipped with a moveTo, which keeps very long
 *  routes cheap. Returns the end point, or null if nothing was traced. */
export function tracePrefix(ctx, P, s, yTop = -Infinity, yBot = Infinity) {
  if (s <= 0) return null;
  const p = P.p;
  ctx.moveTo(p[0], p[1]);
  let end = null;
  for (let i = 1; i < P.n; i++) {
    const x0 = p[2 * i - 2], y0 = p[2 * i - 1], x1 = p[2 * i], y1 = p[2 * i + 1];
    const c0 = P.cum[i - 1], c1 = P.cum[i];
    if (c1 <= s) {
      if ((y0 < yTop && y1 < yTop) || (y0 > yBot && y1 > yBot)) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      if (i === P.n - 1) end = [x1, y1];
    } else {
      const t = (s - c0) / ((c1 - c0) || 1);
      const x = lerp(x0, x1, t), y = lerp(y0, y1, t);
      ctx.lineTo(x, y);
      end = [x, y];
      break;
    }
  }
  return end;
}

/** Trace the route between lengths sa and sb (for pulses). */
export function traceRange(ctx, P, sa, sb) {
  const [x0, y0] = polyPoint(P, sa);
  ctx.moveTo(x0, y0);
  for (let i = 1; i < P.n; i++) {
    if (P.cum[i] <= sa) continue;
    if (P.cum[i] >= sb) break;
    ctx.lineTo(P.p[2 * i], P.p[2 * i + 1]);
  }
  const [x1, y1] = polyPoint(P, sb);
  ctx.lineTo(x1, y1);
}

/** Stroke a prefix of a route in the line's own grammar: an optional glow
 *  under a crisp core, and a living tip while the route is still growing. */
export function strokeLine(ctx, P, s, {
  color = green, alpha = 0.62, width = 2, glow = 0, tip = true, tipA = 1, yTop, yBot,
} = {}) {
  ctx.beginPath();
  const end = tracePrefix(ctx, P, s, yTop, yBot);
  if (!end) return null;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (glow > 0) {
    ctx.strokeStyle = color(0.07 * glow); ctx.lineWidth = width + 14; ctx.stroke();
    ctx.strokeStyle = color(0.15 * glow); ctx.lineWidth = width + 4; ctx.stroke();
  }
  ctx.strokeStyle = color(alpha);
  ctx.lineWidth = width;
  ctx.stroke();
  if (tip && s < P.len) drawTip(ctx, end[0], end[1], tipA);
  return end;
}

export function drawTip(ctx, x, y, a = 1, r = 8) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, greenHi(0.45 * a));
  g.addColorStop(1, greenHi(0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = `rgba(155,227,196,${(0.95 * a).toFixed(3)})`;
  ctx.beginPath(); ctx.arc(x, y, 1.5, 0, TAU); ctx.fill();
}

export function mono(ctx, text, x, y, {
  size = 10, align = 'left', color = white(0.6), tracking = '0.12em', upper = false,
} = {}) {
  ctx.font = `${size}px "IBM Plex Mono", ui-monospace, monospace`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = tracking;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(upper ? text.toUpperCase() : text, x, y);
}

/** The chapter node lights as the line reaches it — on the line's own x. */
export function paintNodeAt(ctx, x, y, head) {
  const d = head - y;
  const a = smooth(-60, 0, d) * (1 - 0.7 * smooth(0, 420, d));
  if (a <= 0.01) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 24);
  g.addColorStop(0, green(0.26 * a));
  g.addColorStop(1, green(0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, 24, 0, TAU); ctx.fill();
}

/* ── The stage ───────────────────────────────────────────────────────────
 * Not one fixed canvas: a fixed canvas is repositioned by JavaScript from
 * scrollY, one frame behind the compositor, and on a fast flick everything
 * drawn on it visibly slides against the text. The stage is instead a set of
 * IN-FLOW canvas tiles, absolutely positioned inside the walkthrough, that
 * scroll with the document exactly like the DOM they sit behind. Tiles are
 * allocated only around the viewport and redrawn every frame; their
 * position is never computed by script.
 * ─────────────────────────────────────────────────────────────────────── */
const TILE_H = 1024;
const TILE_MARGIN = 0.5; // viewports of look-ahead above and below

export function createStage(container, { reduced = false } = {}) {
  let W = 0, H = 0, dpr = 1, last = 0, raf = 0, running = false, onScroll = null;
  let wkTop = 0, wkH = 0;
  const pool = [];
  const scenes = [];
  const pulses = [];
  const geo = { railX: 0, desktop: true, W: 0, H: 0 };
  let spine = null;
  let base = '#15181A';

  // The rail: the same x as every .jr-rail — 1.1rem inside a 72rem column,
  // never closer than 1rem to the edge.
  const railXFor = (w) => (w < 640 ? 17 : Math.max(16, w / 2 - 576 + 17.6) + 1);

  function sizeTile(t) {
    t.canvas.width = Math.round(W * dpr);
    t.canvas.height = Math.round(TILE_H * dpr);
    t.canvas.style.width = `${W}px`;
    t.canvas.style.height = `${TILE_H}px`;
  }
  function acquire(k) {
    let t = pool.find((x) => x.k === k);
    if (t) return t;
    t = pool.find((x) => x.k < 0);
    if (!t) {
      const canvas = document.createElement('canvas');
      canvas.className = 'wk-tile';
      canvas.setAttribute('aria-hidden', 'true');
      container.appendChild(canvas);
      t = { canvas, ctx: canvas.getContext('2d', { alpha: false }), k: -1 };
      sizeTile(t);
      pool.push(t);
    }
    t.k = k;
    t.canvas.style.top = `${k * TILE_H}px`;
    t.canvas.style.display = 'block';
    return t;
  }
  function release(t) {
    t.k = -1;
    t.canvas.style.display = 'none';
  }

  function resize() {
    W = container.clientWidth || window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const t of pool) { sizeTile(t); release(t); }
    geo.W = W; geo.H = H; geo.dpr = dpr;
    geo.railX = railXFor(document.documentElement.clientWidth);
    geo.desktop = document.documentElement.clientWidth >= 1024;
  }

  function measure() {
    resize();
    const r = container.getBoundingClientRect();
    wkTop = r.top + window.scrollY;
    wkH = container.offsetHeight;
    for (const s of scenes) s.measure?.(geo);
    spine?.measure?.(geo);
    if (!running) draw(performance.now(), 0);
  }

  // The chapter node lights as the line reaches it — on the line's own x,
  // so square, glow and line never disagree by a pixel.
  function paintNode(ctx, f, n) {
    const d = f.head - n.y;
    const a = smooth(-60, 0, d) * (1 - 0.7 * smooth(0, 420, d));
    if (a <= 0.01) return;
    const x = f.geo.railX;
    const g = ctx.createRadialGradient(x, n.y, 0, x, n.y, 24);
    g.addColorStop(0, green(0.26 * a));
    g.addColorStop(1, green(0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, n.y, 24, 0, TAU); ctx.fill();
  }

  function pulse(P, { dur = 1000, s0 = 0, s1 } = {}) {
    pulses.push({ P, born: performance.now(), dur, s0, s1: s1 == null ? P.len : s1 });
  }
  function paintPulses(ctx, f) {
    for (let i = pulses.length - 1; i >= 0; i--) {
      const q = pulses[i];
      const t = (f.now - q.born) / q.dur;
      if (t >= 1) { pulses.splice(i, 1); continue; }
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const s = q.s0 + (q.s1 - q.s0) * e;
      ctx.beginPath();
      traceRange(ctx, q.P, Math.max(q.s0, s - 34), s);
      ctx.strokeStyle = 'rgba(140,225,185,0.95)';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  function paintTile(t, now, dt, sy, head) {
    const ctx = t.ctx;
    const tileTop = wkTop + t.k * TILE_H;
    const tileBot = tileTop + TILE_H;
    ctx.setTransform(dpr, 0, 0, dpr, 0, -tileTop * dpr);
    ctx.fillStyle = base;
    ctx.fillRect(0, tileTop, W, TILE_H);
    const f = {
      now, dt, sy, W, H, dpr, head,
      top: tileTop - 40, bot: tileBot + 40,
      reduced, desktop: geo.desktop, geo, pulse,
    };
    for (const s of scenes) {
      if (s.b <= tileTop || s.t >= tileBot) continue;
      if (s.bg) { ctx.fillStyle = s.bg; ctx.fillRect(0, s.t, W, s.b - s.t); }
      ctx.fillStyle = white(0.06);
      ctx.fillRect(0, s.t, W, 1);
    }
    spine?.paint(ctx, f);
    for (const s of scenes) {
      if (s.b < f.top || s.t > f.bot) continue;
      if (s.node) paintNode(ctx, f, s.node);
      s.paint(ctx, f);
    }
    paintPulses(ctx, f);
  }

  function draw(now, dt) {
    if (!W || !H || !wkH) return;
    const sy = window.scrollY;
    const head = reduced ? Infinity : sy + REF * H;
    const y0 = sy - H * TILE_MARGIN;
    const y1 = sy + H * (1 + TILE_MARGIN);
    const kMax = Math.ceil(wkH / TILE_H) - 1;
    const k0 = Math.max(0, Math.floor((y0 - wkTop) / TILE_H));
    const k1 = Math.min(kMax, Math.floor((y1 - wkTop) / TILE_H));
    for (const t of pool) if (t.k >= 0 && (t.k < k0 || t.k > k1)) release(t);
    for (let k = k0; k <= k1; k++) paintTile(acquire(k), now, dt, sy, head);
  }

  function frame(now) {
    if (!running) return;
    let dt = (now - last) / 1000;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    last = now;
    draw(now, dt);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    if (reduced) {
      onScroll = () => draw(performance.now(), 0);
      window.addEventListener('scroll', onScroll, { passive: true });
      draw(performance.now(), 0);
      return;
    }
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    if (onScroll) { window.removeEventListener('scroll', onScroll); onScroll = null; }
  }
  function destroy() {
    stop();
    for (const t of pool) t.canvas.remove();
    pool.length = 0;
    scenes.length = 0;
    pulses.length = 0;
  }

  return {
    geo,
    addScene(s) { scenes.push(s); return s; },
    setSpine(s) { spine = s; },
    setBase(c) { base = c; },
    measure, start, stop, destroy, pulse,
  };
}
