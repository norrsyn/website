/**
 * THE FIELD
 *
 * The hero's market, drawn on one canvas.
 *
 *   · A perspective plane of company marks (the site's own mark grammar,
 *     22×9 at the near plane) flowing slowly toward the viewer. The whole
 *     plane vanishes toward one point: the brand's underscore. The line that
 *     falls from that underscore is therefore the plane's own centre line —
 *     every mark in the market points at it.
 *
 *   · Signals fire in the field: a mark lights, a callout names the signal
 *     and its source, and a beat later the reading against the requirement
 *     arrives. Most are outside it and fade. The ones that hold connect to
 *     the line with one falling curve, and a pulse travels down the line and
 *     out of the frame — into the rest of the page.
 *
 *   · The collapse. On scroll (the hero is pinned for one extra viewport)
 *     the flow accelerates and the entire market is pulled into the line.
 *     At the end of the pin nothing is left but the line, which crosses the
 *     seam into Problemet at exactly the weight Problemet's route expects.
 *
 * Two clocks. Ambient motion runs on time. The collapse — and, behind the
 * story, the travel that flows the plane past the visitor — run on scroll
 * position only, so they reverse, stop and jump with the visitor.
 *
 * Reduced motion: no flow, no signals, no drop; the plane and the full line
 * are drawn once. The component removes the pin.
 */

const MARK_W = 18;
const MARK_H = 7;
const GX = 34;        // column spacing at the near plane (px)
const DZ = 0.14;      // row spacing (depth units); marks jitter within it
const Z_NEAR = 1;
const Z_FAR = 7.5;
const DROPOUT = 0.3;  // share of empty cells: a register, not a lattice
const Z_RANGE = Z_FAR - Z_NEAR;
const N_ROWS = Math.round(Z_RANGE / DZ);
const BASE_SPEED = 0.11;   // depth units per second, toward the viewer
const BUCKETS = 24;
const A_MAX = 0.8;
const MAX_SIGNALS = 3;
const SIGNAL_DUR = 3400;
const DROP_DUR = 850;
const BG = '#0C1310';
const AMBIENT_ALPHA = 0.3; // the market, faint, behind the whole story

const SIGNALS = [
  ['Ny ekonomichef', 'LinkedIn'],
  ['Rekryterar systemansvarig', 'jobbannons'],
  ['Nytt centrallager', 'pressmeddelande'],
  ['Tredje lagret öppnat', 'webbplats'],
  ['Ägarbyte', 'Bolagsverket'],
  ['Flyttar huvudkontor', 'pressmeddelande'],
  ['Omsättning +18 %', 'årsredovisning'],
  ['Ny VD tillträdd', 'LinkedIn'],
  ['Öppnar kontor i Göteborg', 'webbplats'],
  ['Byter affärssystem', 'jobbannons'],
  ['Förvärv genomfört', 'pressmeddelande'],
  ['Nytt dotterbolag', 'Bolagsverket'],
  ['Rekryterar säljchef', 'jobbannons'],
  ['ISO-certifiering', 'webbplats'],
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Deterministic per-mark noise: the grid must read as organic, not as a
 *  lattice, and the same company must look the same every frame. */
function hash(i, j) {
  let h = (Math.imul(i + 1, 73856093) ^ Math.imul(j + 1000003, 19349663)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function createField(canvas, hooks = {}) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduced = !!hooks.reduced;

  let W = 0, H = 0, dpr = 1;
  let ax = 0;        // the line's x (crisp: n + 0.5)
  let oy = 0;        // the line's origin: the underscore's bottom edge
  let hy = 0;        // the horizon
  let hole = null;   // the copy block: marks thin out around it

  let phase = 0;
  let scrollPhase = 0; // the story's travel, as depth: the field flows past
  let last = 0;
  let p = 0;         // collapse progress, 0..1
  let amb = 0;       // ambient: the field re-emerging, faint, after the collapse
  let raf = 0;
  let running = false;
  let lineEnd = null; // the drop's position while it falls (for an external line)

  // Reduced motion: the line and the market are simply there.
  let dropAt = Infinity;
  let impactAt = reduced ? -Infinity : Infinity;
  let dropDone = reduced;
  let fullWake = reduced;
  let nextSignalAt = Infinity;
  let lastLabel = -1;

  const signals = [];
  const pulses = [];
  const buckets = Array.from({ length: BUCKETS }, () => []);

  const K = () => H - hy + 40; // z = 1 lands just under the bottom edge
  const rowZ = (i) => Z_NEAR + ((((i * DZ + phase + scrollPhase) % Z_RANGE) + Z_RANGE) % Z_RANGE);
  // Each mark sits somewhere inside its row's depth band, so rows never
  // resolve into stripes: the field is continuous.
  const markZ = (i, j, z) => z + (hash(i + 7919, j) - 0.5) * DZ * 0.95;
  const markX = (i, j, z) => ax + (j * GX + (hash(i, j) - 0.5) * GX * 0.7) / z;

  function layout(g) {
    W = g.W; H = g.H; dpr = g.dpr;
    ax = g.ax; oy = g.oy; hy = g.hy; hole = g.hole;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    if (!running) draw(performance.now());
  }

  function scheduleIntro(delayMs) {
    dropAt = performance.now() + delayMs;
  }
  function skipIntro() {
    dropAt = -Infinity;
    dropDone = true;
    fullWake = true;
    impactAt = -Infinity;
    if (nextSignalAt === Infinity) nextSignalAt = performance.now() + 600;
  }

  function spawn(now) {
    if (signals.length >= MAX_SIGNALS || p > 0.08 || amb > 0.05) return;
    const k = K();
    for (let tries = 0; tries < 18; tries++) {
      const i = (Math.random() * N_ROWS) | 0;
      if (signals.some((s) => s.i === i)) continue;
      const zr = rowZ(i);
      if (zr < 1.5 || zr > 3.6) continue;
      const jMin = Math.ceil(((60 - ax) * zr) / GX);
      const jMax = Math.floor(((W - 60 - ax) * zr) / GX);
      const j = jMin + ((Math.random() * (jMax - jMin + 1)) | 0);
      if (hash(j, i) < DROPOUT) continue;
      const z = markZ(i, j, zr);
      const sy = hy + k / z;
      if (sy < hy + 50 || sy > H - 150) continue;
      const sx = markX(i, j, z);
      if (Math.abs(sx - ax) < 110) continue;
      if (hole && sx > hole.l - 50 && sx < hole.r + 50 && sy > hole.t - 50 && sy < hole.b + 50) continue;
      if (!fullWake && impactAt !== Infinity) {
        const wakeR = ((now - impactAt) / 1000) * 1500;
        if (Math.abs(sx - ax) > wakeR - 340) continue;
      }
      let li = (Math.random() * SIGNALS.length) | 0;
      if (li === lastLabel) li = (li + 1) % SIGNALS.length;
      lastLabel = li;
      signals.push({
        i, j, born: now,
        ok: Math.random() < 0.42,
        label: `${SIGNALS[li][0]} · ${SIGNALS[li][1]}`,
        fall: 70 + Math.random() * 60,
        pulsed: false,
      });
      return;
    }
  }

  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    if (!W || !H) return;

    const k = K();
    // Ambient undoes the collapse: the marks return to their places, faint,
    // and keep drifting behind the whole story.
    const conv = smooth(0.12, 0.85, p) * (1 - amb);
    const fade = (1 - smooth(0.5, 0.96, p)) * (1 - amb) + AMBIENT_ALPHA * amb;
    // The rush: marks stretch into streaks and thin as the flow accelerates.
    const streakY = 1 + 10 * p * p * (1 - amb);
    const streakX = 1 - 0.5 * smooth(0.1, 0.8, p) * (1 - amb);
    const rush = 1 - 0.35 * smooth(0.1, 0.8, p) * (1 - amb);
    const holeK = (1 - smooth(0, 0.35, p)) * (1 - amb);
    const wakeR = fullWake ? Infinity : impactAt === Infinity ? -Infinity : ((now - impactAt) / 1000) * 1500;
    const extraHoles = hooks.holes ? hooks.holes() : null;

    /* ── the market ──────────────────────────────────────────────────── */
    for (let b = 0; b < BUCKETS; b++) buckets[b].length = 0;
    if (wakeR > -Infinity) {
      for (let i = 0; i < N_ROWS; i++) {
        const zr = rowZ(i);
        if (hy + k / (zr + DZ) > H + 30) continue;
        if (Math.pow(clamp01((Z_FAR - zr + DZ) / Z_RANGE), 2.2) < 0.03) continue;
        const jMin = Math.ceil(((-ax - 40) * (zr + DZ)) / GX);
        const jMax = Math.floor(((W - ax + 40) * (zr + DZ)) / GX);
        for (let j = jMin; j <= jMax; j++) {
          const h2 = hash(j, i);
          if (h2 < DROPOUT) continue;
          const z = markZ(i, j, zr);
          const sy = hy + k / z;
          if (sy > H + 30) continue;
          const fog = Math.pow(clamp01((Z_FAR - z) / Z_RANGE), 2.2);
          if (fog < 0.03) continue;
          const mw = (MARK_W / z) * streakX;
          const mh = (MARK_H / z) * streakY;
          let sx = markX(i, j, z);
          let a = 0.46 * fog * rush * (0.35 + 0.65 * h2 + (h2 > 0.985 ? 0.5 : 0));
          if (wakeR !== Infinity) {
            const w = smooth(0, 340, wakeR - Math.abs(sx - ax));
            if (w <= 0.001) continue;
            a *= w;
          }
          if (hole && holeK > 0) {
            const dx = Math.max(hole.l - sx, sx - hole.r, 0);
            const dy = Math.max(hole.t - sy, sy - hole.b, 0);
            const d = Math.sqrt(dx * dx + dy * dy);
            a *= 1 - holeK * 0.88 * (1 - smooth(0, 120, d));
          }
          // In ambient mode the story's open chapter clears the field under
          // its copy and its artefact: the market stays, but never competes.
          if (amb > 0.001 && extraHoles) {
            for (let hh = 0; hh < extraHoles.length; hh++) {
              const eh = extraHoles[hh];
              const dx = Math.max(eh.l - sx, sx - eh.r, 0);
              const dy = Math.max(eh.t - sy, sy - eh.b, 0);
              const d = Math.sqrt(dx * dx + dy * dy);
              a *= 1 - 0.92 * amb * eh.k * (1 - smooth(0, 90, d));
            }
          }
          if (conv > 0) sx += (ax - sx) * conv;
          a *= fade;
          if (a < 0.012) continue;
          const b = Math.min(BUCKETS - 1, ((a / A_MAX) * (BUCKETS - 1)) | 0);
          buckets[b].push(sx - mw / 2, sy - mh / 2, mw, mh);
        }
      }
      for (let b = 0; b < BUCKETS; b++) {
        const arr = buckets[b];
        if (!arr.length) continue;
        const a = Math.min(1, ((b + 0.5) / (BUCKETS - 1)) * A_MAX);
        ctx.fillStyle = `rgba(236,232,220,${a.toFixed(3)})`;
        for (let n = 0; n < arr.length; n += 4) ctx.fillRect(arr[n], arr[n + 1], arr[n + 2], arr[n + 3]);
      }
    }

    /* ── signals ─────────────────────────────────────────────────────── */
    ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0.03em';
    ctx.textBaseline = 'alphabetic';
    for (let s = signals.length - 1; s >= 0; s--) {
      const sg = signals[s];
      const u = (now - sg.born) / SIGNAL_DUR;
      if (u >= 1) { signals.splice(s, 1); continue; }
      const z = markZ(sg.i, sg.j, rowZ(sg.i));
      const sx = markX(sg.i, sg.j, z);
      const sy = hy + k / z;
      const mw = Math.max(8, MARK_W / z);
      const mh = Math.max(3.5, MARK_H / z);
      const env = fade * (1 - smooth(0.84, 0.96, u));
      if (env <= 0.001) continue;

      const lit = smooth(0, 0.08, u) * env;
      ctx.fillStyle = sg.ok
        ? `rgba(69,165,127,${(0.95 * lit).toFixed(3)})`
        : `rgba(236,232,220,${(0.9 * lit).toFixed(3)})`;
      ctx.fillRect(sx - mw / 2, sy - mh / 2, mw, mh);

      const la = smooth(0.05, 0.16, u) * env;
      if (la > 0.01) {
        const right = sx + ctx.measureText(sg.label).width > W - 28;
        const top = sy - mh / 2;
        const tx = right ? sx + 1 : sx - 1;
        ctx.textAlign = right ? 'right' : 'left';
        ctx.strokeStyle = `rgba(236,232,220,${(0.3 * la).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(sx) + 0.5, top - 3);
        ctx.lineTo(Math.round(sx) + 0.5, top - 18);
        ctx.stroke();
        ctx.fillStyle = `rgba(236,232,220,${(0.8 * la).toFixed(3)})`;
        ctx.fillText(sg.label, tx, top - 38);
        const va = smooth(0.28, 0.4, u) * env;
        if (va > 0.01) {
          ctx.fillStyle = sg.ok
            ? `rgba(88,184,146,${(0.95 * va).toFixed(3)})`
            : `rgba(236,232,220,${(0.42 * va).toFixed(3)})`;
          ctx.fillText(sg.ok ? 'matchar kravbilden' : 'utanför kravbilden', tx, top - 24);
        }
      }

      if (sg.ok) {
        const ct = smooth(0.34, 0.6, u);
        if (ct > 0) {
          const jy = sy + sg.fall;
          const dx = ax - sx;
          const c1x = sx + dx * 0.15, c1y = sy + sg.fall * 0.42;
          const c2x = ax, c2y = jy - sg.fall * 0.36;
          let L = 0, px = sx, py = sy;
          for (let q = 1; q <= 14; q++) {
            const t = q / 14, mt = 1 - t;
            const x = mt * mt * mt * sx + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * ax;
            const y = mt * mt * mt * sy + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * jy;
            L += Math.hypot(x - px, y - py);
            px = x; py = y;
          }
          ctx.strokeStyle = `rgba(69,165,127,${(0.62 * env).toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          ctx.setLineDash([L, L]);
          ctx.lineDashOffset = L * (1 - ct);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ax, jy);
          ctx.stroke();
          ctx.setLineDash([]);
          if (!sg.pulsed && ct >= 1) { sg.pulsed = true; pulses.push({ y0: jy, born: now }); }
        }
      }
    }

    /* ── the line ────────────────────────────────────────────────────── */
    let end = null;
    if (dropDone) end = H + 2;
    else if (now >= dropAt) {
      const t = (now - dropAt) / DROP_DUR;
      if (t >= 1) { dropDone = true; end = H + 2; }
      else end = oy + (H + 24 - oy) * t * t;
      if (t >= 0.42 && impactAt === Infinity) { impactAt = now; nextSignalAt = now + 900; }
    }
    if (dropDone && impactAt === Infinity) { impactAt = now; nextSignalAt = now + 900; }
    lineEnd = end;
    if (end !== null && hooks.drawLine !== false) {
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(ax, oy);
      ctx.lineTo(ax, end);
      ctx.strokeStyle = `rgba(69,165,127,${(0.07 * (1 - p)).toFixed(3)})`;
      ctx.lineWidth = 18;
      ctx.stroke();
      ctx.strokeStyle = `rgba(69,165,127,${(0.16 * (1 - 0.7 * p)).toFixed(3)})`;
      ctx.lineWidth = 6;
      ctx.stroke();
      // Core: bright where it leaves the underscore, and exactly Problemet's
      // route weight (2px · 0.62) where it crosses the seam.
      const g = ctx.createLinearGradient(0, oy, 0, H);
      g.addColorStop(0, 'rgba(88,184,146,0.95)');
      g.addColorStop(0.3, 'rgba(69,165,127,0.8)');
      g.addColorStop(1, 'rgba(69,165,127,0.62)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (!dropDone) {
        const r = ctx.createRadialGradient(ax, end, 0, ax, end, 14);
        r.addColorStop(0, 'rgba(120,210,170,0.6)');
        r.addColorStop(1, 'rgba(120,210,170,0)');
        ctx.fillStyle = r;
        ctx.beginPath(); ctx.arc(ax, end, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#9BE3C4';
        ctx.beginPath(); ctx.arc(ax, end, 2.8, 0, Math.PI * 2); ctx.fill();
      }
    }

    /* ── pulses: qualified companies travelling down and out ─────────── */
    for (let q = pulses.length - 1; q >= 0; q--) {
      const pl = pulses[q];
      const t = (now - pl.born) / 1100;
      if (t >= 1) { pulses.splice(q, 1); continue; }
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const y = pl.y0 + (H + 40 - pl.y0) * e;
      const g = ctx.createLinearGradient(0, y - 34, 0, y + 6);
      g.addColorStop(0, 'rgba(120,210,170,0)');
      g.addColorStop(0.85, `rgba(140,225,185,${(0.95 * fade).toFixed(3)})`);
      g.addColorStop(1, 'rgba(120,210,170,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, Math.max(oy, y - 34));
      ctx.lineTo(ax, Math.min(H, y + 6));
      ctx.stroke();
    }
  }

  function tick(now) {
    let dt = (now - last) / 1000;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    last = now;
    const np = hooks.progress ? clamp01(hooks.progress()) : 0;
    if (Math.abs(np - p) > 0.0005) { p = np; hooks.onProgress?.(p); }
    amb = hooks.ambient ? clamp01(hooks.ambient()) : 0;
    // Scroll moves the visitor forward through the plane; time keeps drifting.
    scrollPhase = hooks.travel ? -hooks.travel() : 0;
    // The hero's signals belong to the hero: none may drift into the story.
    if (amb > 0.02 && (signals.length || pulses.length)) { signals.length = 0; pulses.length = 0; }
    if (p > 0.15 && !dropDone) skipIntro();
    phase -= (BASE_SPEED * (1 + 12 * p * p) * (1 - amb) + BASE_SPEED * 0.35 * amb) * dt;
    if (now >= nextSignalAt) { spawn(now); nextSignalAt = now + 1000 + Math.random() * 800; }
    draw(now);
    hooks.after?.(ctx, now);
  }

  function frame(now) {
    if (!running) return;
    tick(now);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function destroy() {
    stop();
    signals.length = 0;
    pulses.length = 0;
  }

  /** For an external loop: one frame, no scheduling. */
  function render(now) {
    if (last === 0) last = now;
    tick(now);
  }
  /** What an external line renderer needs to draw the drop. */
  const state = () => ({ dropDone, lineEnd, oy, ax });

  return { layout, start, stop, destroy, scheduleIntro, skipIntro, render, state, ctx };
}
