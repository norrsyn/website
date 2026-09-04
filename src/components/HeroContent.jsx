import React from 'react';
import { ArrowRight } from 'lucide-react';

// ==========================================================================
// The hero's words, shared by the sticky-hero page (HeroField) and the
// single-frame journey (Journey). The host owns the canvas and the logic;
// this is only the markup, with refs handed in for what the logic drives.
// ==========================================================================
export default function HeroContent({ blockRef, cursorRef, collapseRef, footRef, cueRef }) {
  return (
    <>
      <div className="hf-scrim-nav" aria-hidden="true" />

      <div ref={blockRef} className="hf-content">
        <div data-hf-eyebrow data-hf-fade className="hf-eyebrow eyebrow text-green">
          Research · Affärssignaler · Kontext
        </div>
        <h1 className="hf-title">
          <span data-hf-line className="hf-line">
            <span data-hf-text>Rätt kunder.</span>
          </span>
          <span data-hf-line className="hf-line">
            <span data-hf-text>Bättre affärer<span className="sr-only">.</span></span>
            <span ref={cursorRef} data-hf-cursor className="hf-cursor" aria-hidden="true" />
          </span>
        </h1>
        <p data-hf-rise data-hf-fade className="hf-copy">
          Vi går igenom den svenska marknaden och lämnar över de bolag där
          ni har ett verkligt skäl att höra av er. Med källor och en färdig
          ingång till första samtalet.
        </p>
        <div data-hf-rise data-hf-fade className="hf-ctas">
          <a
            href="#kontakt"
            className="btn bg-paper text-graphite hover:bg-white px-7 py-4 font-semibold text-[15px]"
          >
            Se om vi kan hjälpa er
            <ArrowRight size={17} strokeWidth={2.2} />
          </a>
          <a
            href="#processen"
            className="btn border border-white/20 text-white/85 hover:border-white/40 hover:text-white px-7 py-4 font-semibold text-[15px]"
          >
            Se hur vi arbetar
          </a>
        </div>
      </div>

      {/* The statement, in two beats, as the market collapses into the
          line. Driven by lib/cascade.js. */}
      <div ref={collapseRef} className="hf-statement" aria-hidden="true">
        <span data-cas="1" className="hf-cas st-lead">Hela marknaden går in.</span>
        <span data-cas="2" className="hf-cas st-display display">Ett fåtal Briefs kommer ut.</span>
      </div>

      <div ref={footRef} className="hf-foot" aria-hidden="true">
        <span className="hf-legend">Illustration · signalerna och bolagen är fiktiva</span>
        <span className="hf-loc">NRSYN AB · Jönköping · Sverige</span>
      </div>
      <div ref={cueRef} className="hf-cue" aria-hidden="true">Följ linjen</div>
    </>
  );
}
