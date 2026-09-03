import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import HeroContent from './HeroContent.jsx';
import { COPY, PH_BODY, PH_HAND } from './story.jsx';
import {
  Head, Foot, ProblemHeadline, ProblemGrid,
  Ledger, MarketMap, Screening, Board, Weigh, Finalists, BriefCard, PortalCard,
} from './chapters.jsx';
import { createJourney, WIN, TOTAL, CH_IDS, LABEL } from '../lib/journey.js';
import { EASE } from '../lib/motion.js';
import '../hero-field.css';
import '../walkthrough.css';
import '../journey.css';

// ==========================================================================
// THE JOURNEY — the whole story in one sticky frame. (Sketch.)
//
// A tall, empty wrapper provides the scroll; the frame stays put and plays
// the story by scroll position: the hero and its collapse, the line morphing
// into the spine, then seven chapters that dissolve in and out in place
// while their artefacts play under a virtual reading head. No section cuts,
// no tonal bands — one field, one line, one scroll. "Nästa" glides.
//
// Desktop only; narrow screens and reduced motion get the sectioned
// Walkthrough instead.
// ==========================================================================

function Layer({ id, n, tag, title, body, foot, children, wide }) {
  return (
    <div className="jy-layer" data-ch={id}>
      <div className="jy-node jr-node" aria-hidden="true">
        <span className="jr-node-square" />
        <span className="jr-node-num">{n}</span>
      </div>
      <div className="jy-copy">
        <Head tag={tag} title={title}>{body}</Head>
      </div>
      <div className={`jy-art${wide ? ' jy-art-wide' : ''}`}>
        {children}
        {foot && <Foot>{foot}</Foot>}
      </div>
    </div>
  );
}

const ANCHOR_TO = { '#processen': 's1', '#varfor-norrsyn': 'ph', '#start': 'hero' };

export default function Journey() {
  const wrap = useRef(null);
  const frame = useRef(null);
  const canvas = useRef(null);
  const block = useRef(null);
  const cursor = useRef(null);
  const collapse = useRef(null);
  const cue = useRef(null);
  const foot = useRef(null);
  const ctl = useRef(null);

  useEffect(() => {
    const fr = frame.current;
    const layers = {};
    for (const id of CH_IDS) {
      const el = fr.querySelector(`[data-ch="${id}"]`);
      layers[id] = {
        el,
        copy: el.querySelector('.jy-copy'),
        art: el.querySelector('.jy-art'),
        hand: el.querySelector('.jy-hand'),
        lastKey: null, node: null, headTop: 0, headBot: 0,
      };
    }
    const hero = {
      block: block.current, cursor: cursor.current, collapse: collapse.current,
      cue: cue.current, foot: foot.current,
      fades: Array.from(fr.querySelectorAll('[data-hf-fade]')),
      texts: Array.from(fr.querySelectorAll('[data-hf-text]')),
    };
    const ctlEl = ctl.current;
    const control = {
      el: ctlEl,
      label: ctlEl.querySelector('[data-cur-label]'),
      prev: ctlEl.querySelector('[data-go="prev"]'),
      dots: new Map(Array.from(ctlEl.querySelectorAll('.jy-dots [data-go]')).map((d) => [d.dataset.go, d])),
    };
    const journey = createJourney({ wrap: wrap.current, frame: fr, canvas: canvas.current, layers, hero, control });
    journey.measure();

    const ro = new ResizeObserver(() => journey.measure());
    ro.observe(fr);
    window.addEventListener('resize', journey.measure);
    let cancelled = false;
    document.fonts?.ready?.then(() => { if (!cancelled) journey.measure(); });

    // "Nästa", the dots, and every anchor into the story glide instead of jumping.
    const onCtl = (e) => {
      const go = e.target.closest('[data-go]');
      if (!go) return;
      e.preventDefault();
      if (go.dataset.go === 'next') journey.goNext();
      else if (go.dataset.go === 'prev') journey.goPrev();
      else journey.goTo(go.dataset.go);
    };
    ctlEl.addEventListener('click', onCtl);
    const onAnchor = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = ANCHOR_TO[a.getAttribute('href')];
      if (!id) return;
      e.preventDefault();
      journey.goTo(id);
    };
    document.addEventListener('click', onAnchor);

    // The hero's entrance, exactly as on the sectioned page.
    const ctx = gsap.context(() => {
      gsap.set('[data-hf-cursor]', { opacity: 0 });
      const tl = gsap.timeline({ defaults: { ease: EASE.out } });
      tl.from('[data-hf-eyebrow]', { opacity: 0, duration: 1.1 }, 0.1)
        .fromTo('[data-hf-line]',
          { opacity: 0, filter: 'blur(9px)' },
          { opacity: 1, filter: 'blur(0px)', duration: 1.4, stagger: 0.08, ease: 'power2.out', clearProps: 'filter' },
          0.2)
        .from('[data-hf-rise]', { opacity: 0, y: 6, duration: 0.9, stagger: 0.08 }, 0.95)
        .to('[data-hf-cursor]', { opacity: 1, duration: 0.01 }, 0.95)
        .to('[data-hf-cursor]', { opacity: 0, duration: 0.3, repeat: 3, yoyo: true, ease: 'steps(1)' }, 1.0);
    }, fr);
    if (journey.progress() > 0.04) journey.skipIntro();
    else journey.scheduleIntro(2350);

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? journey.start() : journey.stop()),
      { threshold: 0 }
    );
    io.observe(wrap.current);

    return () => {
      cancelled = true;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('resize', journey.measure);
      ctlEl.removeEventListener('click', onCtl);
      document.removeEventListener('click', onAnchor);
      ctx.revert();
      journey.destroy();
    };
  }, []);

  return (
    // One extra viewport: the frame stays stuck until the story is over.
    <div id="start" ref={wrap} className="jy-wrap" style={{ height: `${(TOTAL + 1) * 100}vh` }}>
      {/* Anchors for the navigation, at the chapters' scroll positions. */}
      <div id="varfor-norrsyn" className="jy-anchor" style={{ top: `${(WIN.ph[0] + 0.5) * 100}vh` }} />
      <div id="processen" className="jy-anchor" style={{ top: `${(WIN.s1[0] + 0.5) * 100}vh` }} />

      <section ref={frame} className="jy-frame on-dark">
        <canvas ref={canvas} className="jy-canvas" aria-hidden="true" />
        <HeroContent blockRef={block} cursorRef={cursor} collapseRef={collapse} footRef={foot} cueRef={cue} />

        <div className="wk jy-layers jr-dark">
          {/* Problemet */}
          <div className="jy-layer" data-ch="ph">
            <div className="jy-copy jy-copy-ph">
              <div className="eyebrow text-white/55 mb-6">Problemet</div>
              <ProblemHeadline />
              <p className="wk-ph-copy text-[15px] leading-[1.65] max-w-lg">{PH_BODY}</p>
            </div>
            <div className="jy-art jy-art-ph">
              <ProblemGrid />
              <p className="jy-hand mt-8 max-w-2xl text-white text-[17px] leading-[1.6] font-medium tracking-[-0.015em]">
                {PH_HAND}
              </p>
            </div>
          </div>

          <Layer id="s1" {...COPY.s1}><Ledger /></Layer>
          <Layer id="s2" {...COPY.s2}><MarketMap /></Layer>
          <Layer id="s3" {...COPY.s3}><Screening /></Layer>
          <Layer id="s4" {...COPY.s4}><Board /></Layer>
          <Layer id="s5" {...COPY.s5}><Weigh /></Layer>
          <Layer id="s6" {...COPY.s6} wide>
            <Finalists />
            <div className="jy-deliver">
              <BriefCard />
              <PortalCard />
            </div>
          </Layer>
        </div>

        {/* Where you are, with a way back and a way on. */}
        <div ref={ctl} className="jy-ctl" aria-label="Kapitel">
          <div className="jy-dots">
            {CH_IDS.map((id) => (
              <button key={id} type="button" data-go={id} data-on="0" aria-label={LABEL[id]} title={LABEL[id]} />
            ))}
          </div>
          <div className="jy-cur">
            <button type="button" data-go="prev" aria-label="Föregående" title="Föregående">↑</button>
            <span data-cur-label className="jy-cur-l">Problemet</span>
            <button type="button" data-go="next" aria-label="Nästa" title="Nästa">↓</button>
          </div>
        </div>
      </section>
    </div>
  );
}
