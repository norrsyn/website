import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { Philosophy, Tam, OnDemand, Handoff, About, Contact, Footer } from './components/Sections.jsx';
import Process from './components/Process.jsx';
import BriefExample from './components/Brief.jsx';
import { Integritetspolicy, Anvandarvillkor, Cookiepolicy, NotFound } from './components/LegalPages.jsx';
import { prefersReducedMotion, installRevealFailsafe, EASE } from './lib/motion.js';
import { initThread } from './lib/thread.js';
import { Analytics } from '@vercel/analytics/react';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// Navbar — the floating island.
//
// Preserved wholesale from the original build; it is the single strongest
// inherited element on the site. The only changes are tonal: it now sits
// *inside* the photograph (a whisper of scrim above it rather than a bar),
// and on scroll it lands on warm paper instead of mint-tinted cream.
// ==========================================================================
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['#processen', 'Processen'],
    ['#brief', 'Brief'],
    ['#om-norrsyn', 'Om oss'],
  ];

  return (
    <nav
      className={`fixed top-3 md:top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between
                  w-[94%] max-w-5xl rounded-full pl-5 pr-2 sm:pl-6 sm:pr-2.5 py-2 sm:py-2.5
                  transition-[background-color,border-color,color,box-shadow] duration-500 ease-out-quint
                  border ${
        scrolled
          ? 'bg-paper/85 backdrop-blur-xl border-ink/10 text-ink shadow-[0_1px_2px_rgba(21,24,26,0.04)]'
          : 'bg-white/[0.04] backdrop-blur-[2px] border-white/10 text-white'
      }`}
    >
      <a href="#start" className="font-sans font-bold text-[13px] sm:text-sm tracking-[0.22em] uppercase">
        Norrsyn<span className={scrolled ? 'text-green-deep' : 'text-green-hi'}>_</span>
      </a>

      <div className="hidden md:flex items-center gap-7 text-[13px] font-medium">
        {links.map(([href, label]) => (
          <a key={href} href={href} className={`link-underline ${scrolled ? 'text-ink-2' : 'text-white/80'} hover:opacity-100`}>
            {label}
          </a>
        ))}
      </div>

      <a
        href="#kontakt"
        className={`btn px-4 sm:px-5 py-2 sm:py-2.5 font-sans font-semibold text-[11px] sm:text-[12.5px] tracking-tight ${
          scrolled
            ? 'bg-graphite text-paper hover:bg-ink'
            : 'bg-paper/95 text-graphite hover:bg-white'
        }`}
      >
        Kontakta oss
        <ArrowRight size={13} className="hidden sm:block -mr-0.5" strokeWidth={2.2} />
      </a>
    </nav>
  );
}

// ==========================================================================
// Hero
//
// Art direction, not brightness reduction. The photograph is graded in CSS
// (see .hero-photo / .hero-scrim-* in index.css): pulled down in exposure,
// desaturated, given a little local contrast, then read through two neutral
// scrims — one bottom-weighted for depth, one horizontal under the type. The
// scrims are graphite rather than green or teal, which leaves the remaining
// chroma in the trees as the only colour in the frame.
//
// Typography: the contrast between the two lines is carried on four axes —
// family (grotesk / serif), style (roman / italic), scale, and tone (pure
// white / warm ivory) — instead of on size and a mint fill. The serif appears
// here and in exactly one other place on the page.
//
// Entrance: a mask reveal plus ~14px of travel and a slow settle on the
// photograph. It should read as the hero *activating*, and it is finished
// before a visitor could have finished the first line.
// ==========================================================================
/* The eleven trajectories. dx: origin offset from the trunk axis (scaled by
   viewport); y0/yj: origin and join heights as hero fractions; end: for far
   strands, how short of the trunk the trace dissolves; s0/s1: the scroll span
   (hero-height fractions) over which the engine draws it; a/b: curvature of
   the fall; w: stroke width. Far traces resolve first, near ones last, so
   depth collapses front-to-back as the visitor scrolls. */
const STRANDS = [
  { layer: 'far',  dx: -900, y0: 0.020, yj: 0.360, end: -52, s0: -0.15, s1: 0.30, a: 0.46, b: 0.36, w: 1.4 },
  { layer: 'far',  dx: -330, y0: 0.110, yj: 0.300, end: -36, s0: -0.10, s1: 0.36, a: 0.38, b: 0.42, w: 1.3 },
  { layer: 'far',  dx:  400, y0: 0.040, yj: 0.390, end:  42, s0: -0.05, s1: 0.42, a: 0.50, b: 0.34, w: 1.5 },
  { layer: 'far',  dx:  850, y0: 0.110, yj: 0.470, end:  56, s0:  0.00, s1: 0.50, a: 0.42, b: 0.40, w: 1.3 },
  { layer: 'mid',  dx: -360, y0: 0.055, yj: 0.410, end: 0, s0: 0.12, s1: 0.55, a: 0.44, b: 0.36, w: 1.25 },
  { layer: 'mid',  dx: -150, y0: 0.020, yj: 0.370, end: 0, s0: 0.08, s1: 0.60, a: 0.36, b: 0.44, w: 1.15 },
  { layer: 'mid',  dx:  250, y0: 0.065, yj: 0.450, end: 0, s0: 0.18, s1: 0.66, a: 0.48, b: 0.34, w: 1.3 },
  { layer: 'mid',  dx:  450, y0: 0.140, yj: 0.530, end: 0, s0: 0.24, s1: 0.72, a: 0.40, b: 0.40, w: 1.2 },
  { layer: 'near', dx: -100, y0: 0.175, yj: 0.445, end: 0, s0: 0.30, s1: 0.78, a: 0.42, b: 0.38, w: 1.7 },
  { layer: 'near', dx:   60, y0: 0.150, yj: 0.500, end: 0, s0: 0.32, s1: 0.80, a: 0.50, b: 0.32, w: 1.6 },
  { layer: 'near', dx:  140, y0: 0.230, yj: 0.580, end: 0, s0: 0.35, s1: 0.85, a: 0.38, b: 0.42, w: 1.75 },
];

const HERO_SRC =
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2946&auto=format&fit=crop';

function Hero() {
  const root = useRef(null);

  useEffect(() => {
    // The condensation field. Eleven trajectories live in the fog at three
    // depths. FAR strands sit inside the photograph itself: blurred, fog-
    // toned, occluded by the nearer mist layers, drifting on the photo's
    // parallax clock, and dissolving (via a mask around the trunk axis)
    // before they ever touch the line: distant signals that point toward the
    // convergence without reaching it. MID and NEAR strands live on the
    // diagram plane and physically join the trunk, each as one cubic that
    // leaves its origin falling and arrives falling: tangent-continuous with
    // the vertical line it becomes. Colour is carried by three gradients on
    // one vertical axis, so every strand condenses from fog-neutral through
    // sage into the final green with no switch point anywhere.
    //
    // Geometry is deterministic from the viewport. The trunk sits at
    // max(50% of W, 700px) measured on clientWidth (the same basis Problemet
    // uses, so the seam is exact regardless of scrollbar style). Left-hand
    // strands never fall past 46% of the hero, which keeps them above the
    // copy block. Draw spans (data-s0/s1, fractions of the hero's height in
    // document space) stagger the resolve: far traces are already latent at
    // load, near ones only become perceptible as the visitor scrolls.
    const layoutFil = () => {
      const W = document.documentElement.clientWidth;
      const H = root.current?.offsetHeight || window.innerHeight;
      const k = Math.max(0.68, Math.min(1, W / 1512));
      const xT = Math.max(0.5 * W, 700);
      root.current?.style.setProperty('--xt', `${xT}px`);
      root.current?.querySelectorAll('[data-strand]').forEach((el) => {
        const c = STRANDS[+el.dataset.si];
        if (!c) return;
        const x0 = Math.min(W + 80, Math.max(-80, xT + c.dx * k));
        const xJ = xT + (c.end || 0) * k;
        const y0 = c.y0 * H;
        const yJ = c.yj * H;
        const fall = yJ - y0;
        el.setAttribute('d', [
          `M ${x0} ${y0}`,
          `C ${x0 + (xJ - x0) * 0.14} ${y0 + fall * c.a}, ${xJ} ${yJ - fall * c.b}, ${xJ} ${yJ}`,
        ].join(' '));
      });
      const trunkD = `M ${xT} ${0.18 * H} L ${xT} ${H + 2}`;
      root.current?.querySelectorAll('[data-trunk],[data-trunk-soft]').forEach((p) => p.setAttribute('d', trunkD));
      root.current?.querySelectorAll('[data-filg],[data-filg-near]').forEach((g) => {
        g.setAttribute('x1', xT); g.setAttribute('y1', 0.1 * H);
        g.setAttribute('x2', xT); g.setAttribute('y2', H);
      });
      // The far layer lives high in the frame, so its colour axis starts at
      // the top — on the shared axis everything above 0.16H would clamp to
      // the transparent first stop and the layer would never exist.
      root.current?.querySelectorAll('[data-filg-far]').forEach((g) => {
        g.setAttribute('x1', xT); g.setAttribute('y1', 0);
        g.setAttribute('x2', xT); g.setAttribute('y2', 0.55 * H);
      });
    };
    layoutFil();
    window.addEventListener('resize', layoutFil);

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      // The hero does not arrive. It comes into focus.
      //
      // The previous entrance slid each line up from 108% of its own height,
      // one after the other, which is a title card: the eye tracks the movement
      // instead of reading the words. There is now no vertical travel on the
      // type at all. The composition is already in place on the first frame and
      // simply resolves — tracking closes, exposure comes up, and the serif line
      // sharpens from a soft focus rather than moving into position.
      //
      // The two lines resolve together, 60ms apart. That is under the threshold
      // where a stagger reads as a sequence, so they behave as one block of type
      // being brought up rather than as two elements being animated.
      const tl = gsap.timeline({ defaults: { ease: EASE.out } });

      tl.from('[data-hero-photo]', { scale: 1.035, duration: 3.2, ease: 'power2.out' }, 0)
        .from('[data-hero-eyebrow]', { opacity: 0, duration: 1.2 }, 0.1)
        .from('[data-hero-eyebrow] span:last-child', { letterSpacing: '0.34em', duration: 1.4 }, 0.1)
        .from('[data-hero-line]', {
          opacity: 0,
          letterSpacing: '0.012em',
          duration: 1.5,
          stagger: 0.06,
        }, 0.18)
        // Exposure, not position: the serif line is the one element allowed to
        // sharpen, and it is a single short-lived filter on one node.
        .fromTo('[data-hero-serif]',
          { filter: 'blur(7px)' },
          { filter: 'blur(0px)', duration: 1.6, ease: 'power2.out' }, 0.18)
        .from('[data-hero-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 1.1 }, 0.5)
        .from('[data-hero-rise]', { y: 6, opacity: 0, duration: 1.0, stagger: 0.07 }, 0.55);

      // The tree is engine-driven now: every strand and the trunk derive
      // their drawn state from the master head in src/lib/thread.js. Nothing
      // here animates the route.
      // Parallax: the photograph drifts a little slower than the page. Small
      // enough to be felt rather than seen.
      gsap.to('[data-hero-photo]', {
        yPercent: 9,
        ease: EASE.none,
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      // The far trajectories drift at an intermediate speed: slower than the
      // page, faster than the photograph — the depth cue that separates the
      // three planes. Scrubbed, so it is position, not animation.
      gsap.to('[data-fil-far]', {
        yPercent: 6,
        ease: EASE.none,
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => {
      window.removeEventListener('resize', layoutFil);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="start"
      ref={root}
      className="on-dark relative h-[100svh] lg:h-screen min-h-[600px] w-full overflow-hidden bg-forest"
    >
      {/* Photograph, plus two masked copies of it drifting as mist. See the
          .mist-* rules in index.css for why it is the picture moving against
          itself rather than an overlay. */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          data-hero-photo
          src={HERO_SRC}
          alt="Dimmig granskog i norra Sverige"
          className="hero-photo h-[112%] w-full object-cover"
          fetchPriority="high"
        />
        <div className="mist-layer mist-far" style={{ backgroundImage: `url(${HERO_SRC})` }} aria-hidden="true" />
        <div className="mist-layer mist-mid" style={{ backgroundImage: `url(${HERO_SRC})` }} aria-hidden="true" />
        {/* Distant trajectories, inside the photograph: blurred and fog-toned,
            they sit behind the near mist (which visibly crosses in front of
            them), drift on an intermediate parallax clock, and are masked out
            around the trunk axis so they dissolve into depth instead of
            touching the diagram plane. */}
        <svg data-fil-far className="hero-fil-far" aria-hidden="true">
          <defs>
            <linearGradient id="filgfar" data-filg-far gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#9FB2A6" stopOpacity="0" />
              <stop offset="0.45" stopColor="#93A79B" stopOpacity="0.44" />
              <stop offset="0.8" stopColor="#8CA396" stopOpacity="0.3" />
              <stop offset="1" stopColor="#8CA396" stopOpacity="0.1" />
            </linearGradient>
            <filter id="fblur" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
          </defs>
          <g filter="url(#fblur)">
            {STRANDS.map((c, i) => c.layer === 'far' && (
              <path key={i} data-strand data-si={i} data-s0={c.s0} data-s1={c.s1}
                fill="none" stroke="url(#filgfar)" strokeWidth={c.w} strokeLinecap="round" />
            ))}
          </g>
        </svg>
        <div className="fog-blob" aria-hidden="true" />
        <div className="mist-layer mist-near" style={{ backgroundImage: `url(${HERO_SRC})` }} aria-hidden="true" />
        <div className="mist-layer mist-low" style={{ backgroundImage: `url(${HERO_SRC})` }} aria-hidden="true" />
        <div className="mist-layer mist-wisp" style={{ backgroundImage: `url(${HERO_SRC})` }} aria-hidden="true" />
      </div>
      <div className="absolute inset-0 z-[1] hero-scrim-base" aria-hidden="true" />
      {/* The filament: the green thread being born from the fog. It starts as
          a pale, diffuse presence in the open valley right of the copy, drops
          through pure fog, sweeps under the CTA row and resolves — one
          controlled curve — onto the spine axis exactly at the fold. Geometry
          is computed from the viewport (never measured from the DOM), so the
          path always travels through reserved negative space. */}
      <svg data-fil className="hero-fil" aria-hidden="true">
        <defs>
          {/* One vertical colour axis for the whole system: fog-neutral at the
              top of the frame, sage through the fall, the final UI green only
              at the fold. The colour change travels with the convergence. */}
          <linearGradient id="filg" data-filg gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#A8BCB0" stopOpacity="0" />
            <stop offset="0.4" stopColor="#9BB3A5" stopOpacity="0.22" />
            <stop offset="0.65" stopColor="#7FAE93" stopOpacity="0.42" />
            <stop offset="0.85" stopColor="#55A47F" stopOpacity="0.58" />
            <stop offset="1" stopColor="#45A57F" stopOpacity="0.62" />
          </linearGradient>
          <linearGradient id="filgnear" data-filg-near gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#B7C6BC" stopOpacity="0" />
            <stop offset="0.35" stopColor="#93B4A1" stopOpacity="0.3" />
            <stop offset="0.65" stopColor="#5FA886" stopOpacity="0.55" />
            <stop offset="1" stopColor="#45A57F" stopOpacity="0.66" />
          </linearGradient>
          <filter id="filblur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="filblurmid" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>
        {/* The trunk's atmospheric core: the same line, wide and diffuse. */}
        <path data-trunk-soft filter="url(#filblur)" fill="none" stroke="url(#filg)" strokeWidth="12" strokeLinecap="round" opacity="0.38" />
        <g filter="url(#filblurmid)">
          {STRANDS.map((c, i) => c.layer === 'mid' && (
            <path key={i} data-strand data-si={i} data-s0={c.s0} data-s1={c.s1}
              fill="none" stroke="url(#filg)" strokeWidth={c.w} strokeLinecap="round" />
          ))}
        </g>
        {STRANDS.map((c, i) => c.layer === 'near' && (
          <path key={i} data-strand data-si={i} data-s0={c.s0} data-s1={c.s1}
            fill="none" stroke="url(#filgnear)" strokeWidth={c.w} strokeLinecap="round" />
        ))}
        <path data-trunk fill="none" stroke="url(#filg)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 z-[1] hero-scrim-read" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-40 z-[1] hero-scrim-nav" aria-hidden="true" />

      {/* Composition: type anchored bottom-left, a quiet locative mark bottom-right. */}
      <div className="absolute inset-0 z-10 flex items-end">
        <div className="w-full px-6 sm:px-10 md:px-16 lg:px-20 pb-14 sm:pb-16 md:pb-20">
          <div className="max-w-[62rem]">
            <div data-hero-eyebrow className="flex items-center gap-3 mb-4 md:mb-5">
              <span className="h-px w-6 bg-green/70" aria-hidden="true" />
              <span className="eyebrow text-green tracking-[0.17em]">
                Research · Affärssignaler · Kontext
              </span>
            </div>

            <h1 className="mb-5 md:mb-6">
              <span className="reveal-mask">
                <span
                  data-hero-line
                  className="block font-sans font-semibold text-white
                             text-[2.6rem] leading-[1.0] sm:text-[3.5rem] md:text-[4.2rem] lg:text-[4.9rem]
                             tracking-[-0.038em]"
                >
                  Rätt kunder.
                </span>
              </span>
              <span className="reveal-mask">
                <span
                  data-hero-line
                  data-hero-serif
                  className="display block text-[#EFE8DA]
                             text-[2.95rem] leading-[0.98] sm:text-[3.9rem] md:text-[4.7rem] lg:text-[5.5rem]"
                >
                  Bättre affärer.
                </span>
              </span>
            </h1>

            <div data-hero-rule className="h-px w-16 bg-green/70 mb-5" aria-hidden="true" />

            <p
              data-hero-rise
              className="text-white/80 text-[15px] sm:text-base md:text-[17px] leading-[1.65] max-w-xl mb-8 md:mb-9"
            >
              Vi går igenom den svenska marknaden och lämnar över de bolag där
              ni har ett verkligt skäl att höra av er. Med källor och en färdig
              ingång till första samtalet.
            </p>

            <div data-hero-rise className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <a
                href="#kontakt"
                className="btn bg-paper text-graphite hover:bg-white px-7 py-4 font-semibold text-[15px] w-full sm:w-auto"
              >
                Se om vi kan hjälpa er
                <ArrowRight size={17} strokeWidth={2.2} />
              </a>
              <a
                href="#processen"
                className="btn border border-white/20 text-white/85 hover:border-white/40 hover:text-white px-7 py-4 font-semibold text-[15px] w-full sm:w-auto"
              >
                Se hur vi arbetar
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Locative mark — real, quiet, and it balances the bottom-left block. */}
      <div
        data-hero-rise
        className="hidden md:block absolute z-10 bottom-20 right-16 lg:right-20 text-right"
      >
        <div className="eyebrow text-white/45 leading-[1.9]">
          NRSYN AB<br />Jönköping<br />Sverige
        </div>
      </div>
    </section>
  );
}

/**
 * The pinned Step stack measures pixel positions at mount. Web fonts swap in
 * after that and change every heading's height, which would leave the pins
 * measured against a layout that no longer exists. One refresh once the fonts
 * have settled is the difference between a stack that lines up and one that
 * drifts by a hundred pixels.
 */
/**
 * The thread engine owns the entire green route. Initialized once at the App
 * level (after every child's geometry effect has run), skipped entirely under
 * reduced motion — the route's default DOM state is its finished state.
 */
function useThreadEngine() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const destroy = initThread();
    return destroy;
  }, []);
}

function useScrollTriggerRefreshOnFonts() {
  useEffect(() => {
    const cancelFailsafe = installRevealFailsafe(gsap, ScrollTrigger);
    if (!document.fonts?.ready) return cancelFailsafe;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => { cancelled = true; cancelFailsafe(); };
  }, []);
}

function App() {
  const path = window.location.pathname;
  useScrollTriggerRefreshOnFonts();
  useThreadEngine();

  if (path === '/integritetspolicy') return <><Integritetspolicy /><Analytics /></>;
  if (path === '/anvandarvillkor') return <><Anvandarvillkor /><Analytics /></>;
  if (path === '/cookiepolicy' || path === '/cookies') return <><Cookiepolicy /><Analytics /></>;
  // Everything the SPA rewrite forwards here that is not a real route.
  if (path !== '/' && path !== '/index.html') return <><NotFound /><Analytics /></>;

  return (
    <div className="bg-paper text-ink relative">
      <Navbar />
      <Hero />
      {/* The problem sets up the need; the Process section answers it end to
          end and is now the centre of gravity of the page. It absorbed the old
          model overview, the three Steg sheets and the three Brief cards —
          three explanations of one process, replaced by one demonstration. */}
      <Philosophy />
      <Process />
      <BriefExample />
      <Tam />
      {/* The second door: the market is worked through continuously (Tam),
          AND the accounts the customer already knows can be sent in. Placed
          before the Handoff so the exhale still closes the whole story. */}
      <OnDemand />
      <Handoff />
      <About />
      <Contact />
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;
