import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { Tam, OnDemand, About, Contact, Footer } from './components/Sections.jsx';
import HeroField from './components/HeroField.jsx';
import Walkthrough from './components/Walkthrough.jsx';
import Journey from './components/Journey.jsx';
import BriefExample from './components/Brief.jsx';
import { Integritetspolicy, Anvandarvillkor, Cookiepolicy, NotFound } from './components/LegalPages.jsx';
import { prefersReducedMotion, installRevealFailsafe } from './lib/motion.js';
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

/**
 * Reveals measure pixel positions at mount. Web fonts swap in after that and
 * change every heading's height, so one refresh once the fonts have settled
 * keeps every trigger honest.
 */
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
  // Two renderings of one story: the single-frame Journey on desktop, or
  // the sectioned Walkthrough (also forced by ?mode=sections) on narrow
  // screens and under reduced motion.
  const params = new URLSearchParams(window.location.search);
  const sectioned = params.get('mode') === 'sections' || window.innerWidth < 1024 || prefersReducedMotion();
  useScrollTriggerRefreshOnFonts();

  if (path === '/integritetspolicy') return <><Integritetspolicy /><Analytics /></>;
  if (path === '/anvandarvillkor') return <><Anvandarvillkor /><Analytics /></>;
  if (path === '/cookiepolicy' || path === '/cookies') return <><Cookiepolicy /><Analytics /></>;
  // Everything the SPA rewrite forwards here that is not a real route.
  if (path !== '/' && path !== '/index.html') return <><NotFound /><Analytics /></>;

  return (
    <div className="bg-paper text-ink relative">
      <Navbar />
      {sectioned ? (
        <>
          <HeroField />
          {/* The stage: Problemet and 01–06 as sections over canvas tiles. */}
          <Walkthrough />
        </>
      ) : (
        /* One sticky frame: the hero, the problem and the six chapters. */
        <Journey />
      )}
      {/* The tail sits above the stage's fixed canvas. */}
      <div className="relative z-[2] bg-paper">
        <BriefExample />
        <Tam />
        {/* The second door: the market is worked through continuously (Tam),
            AND the accounts the customer already knows can be sent in. Placed
            before About so the exhale still closes the whole story. */}
        <OnDemand />
        <About />
        <Contact />
        <Footer />
      </div>
      <Analytics />
    </div>
  );
}

export default App;
