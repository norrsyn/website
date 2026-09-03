import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/motion.js';
import { createStage } from '../lib/stage.js';
import {
  spineScene, problemetScene, s1Scene, s2Scene, s3Scene, s4Scene, s5Scene, s6Scene,
} from '../lib/scenes.js';
import { COPY, PH_BODY, PH_HAND } from './story.jsx';
import {
  Node, Head, Foot, ProblemHeadline, ProblemGrid,
  Ledger, MarketMap, Screening, Board, Weigh, Finalists, BriefCard, PortalCard,
} from './chapters.jsx';
import '../walkthrough.css';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// THE WALKTHROUGH — Problemet and six chapters as scrolling sections over
// the tiled stage. The fallback for narrow screens and reduced motion; the
// desktop page tells the same story inside one sticky frame (Journey).
// Data, copy and artefacts come from story.jsx / chapters.jsx.
// ==========================================================================

function Chapter({ id, cls, dark = true, copy, children }) {
  return (
    <section id={id} className={`wk-sec jr ${cls} ${dark ? 'jr-dark' : ''} on-dark`}>
      <div className="jr-inner">
        <Node n={copy.n} />
        <Head tag={copy.tag} lead={copy.lead} title={copy.title}>{copy.body}</Head>
        {children}
        <Foot>{copy.foot}</Foot>
      </div>
    </section>
  );
}

export default function Walkthrough() {
  const root = useRef(null);
  const stageEl = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const el = root.current;
    const stage = createStage(stageEl.current, { reduced });
    const q = (sel) => el.querySelector(sel);

    stage.addScene(problemetScene(q('#varfor-norrsyn')));
    stage.addScene(s1Scene(q('#kravbilden')));
    stage.addScene(s2Scene(q('#marknaden')));
    stage.addScene(s3Scene(q('#granskningen')));
    stage.addScene(s4Scene(q('#researchen')));
    stage.addScene(s5Scene(q('#bedomningen')));
    stage.addScene(s6Scene(q('#briefen')));
    stage.setSpine(spineScene());

    const measure = () => {
      const r = el.getBoundingClientRect();
      stage.geo.seamY = r.top + window.scrollY;
      const cssX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spine-x'));
      stage.geo.ax = Number.isFinite(cssX) ? cssX : Math.max(0.5 * document.documentElement.clientWidth, 700);
      stage.measure();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    window.addEventListener('norrsyn:spine', measure);
    let cancelled = false;
    document.fonts?.ready?.then(() => { if (!cancelled) measure(); });

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? stage.start() : stage.stop()),
      { rootMargin: '200px 0px' }
    );
    io.observe(el);

    // Copy resolves as it enters view; the diagrams belong to the line.
    let ctx = null;
    if (!reduced) {
      ctx = gsap.context(() => {
        gsap.utils.toArray('[data-rv]').forEach((node) => {
          gsap.from(node, {
            opacity: 0, y: 8, duration: 1.1, ease: 'power2.out',
            scrollTrigger: { trigger: node, start: 'top 88%', once: true },
          });
        });
      }, el);
    }

    return () => {
      cancelled = true;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('norrsyn:spine', measure);
      ctx?.revert();
      stage.destroy();
    };
  }, []);

  return (
    <div ref={root} className="wk">
      {/* The stage: in-flow canvas tiles, allocated by the engine. */}
      <div ref={stageEl} className="wk-stage" aria-hidden="true" />

      {/* Problemet */}
      <section id="varfor-norrsyn" className="wk-sec jr-dark on-dark">
        <div className="jr-inner">
          <div data-rv className="eyebrow text-white/50 mb-8 md:mb-10">Problemet</div>
          <ProblemHeadline />
          <p data-rv className="wk-ph-copy text-[15px] md:text-base leading-[1.75] max-w-lg mb-14 md:mb-16">
            {PH_BODY}
          </p>
          <ProblemGrid />
          <p data-rv className="mt-16 md:mt-20 max-w-2xl text-white text-[17px] md:text-[19px] leading-[1.6] font-medium tracking-[-0.015em]">
            {PH_HAND}
          </p>
        </div>
      </section>

      <div id="processen">
        <Chapter id="kravbilden" cls="jr-01" copy={COPY.s1}><Ledger /></Chapter>
        <Chapter id="marknaden" cls="jr-02" copy={COPY.s2}><MarketMap /></Chapter>
        <Chapter id="granskningen" cls="jr-03" copy={COPY.s3}><Screening /></Chapter>
        <Chapter id="researchen" cls="jr-04" copy={COPY.s4}><Board /></Chapter>
        <Chapter id="bedomningen" cls="jr-05" copy={COPY.s5}>
          <Weigh />
          <div className="jr-strip" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} className="jm" data-state={i < 2 ? 'solid' : 'struck'} />
            ))}
          </div>
        </Chapter>
        <Chapter id="briefen" cls="jr-06" dark={false} copy={COPY.s6}>
          <Finalists />
          <BriefCard />
          <PortalCard />
        </Chapter>
      </div>
    </div>
  );
}
