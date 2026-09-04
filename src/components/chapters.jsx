import React, { Fragment } from 'react';
import { COLS, MARKS, RANKS, ALIVE_AFTER_03 } from '../lib/cohort.js';
import { LayoutGrid, Send, Building2, ScanSearch, FileText } from 'lucide-react';
import { INTAKE, RAILS, CASE, PORTAL_ROWS, TONES, TONE_LABEL, CANDIDATES, NAMED, CHECKS, FUNNEL, PH_HAND } from './story.jsx';

// ==========================================================================
// THE CHAPTERS — one source of truth for the story's data, copy and
// artefacts. Composed two ways: as scrolling sections over the tiled stage
// (Walkthrough, the fallback for narrow screens and reduced motion), and as
// fading layers inside the single sticky frame (Journey).
// ==========================================================================

/* ── Shared type ────────────────────────────────────────────────────────── */
export function Node({ n }) {
  return (
    <div className="jr-node" aria-hidden="true">
      <span className="jr-node-square" />
      <span className="jr-node-num">{n}</span>
    </div>
  );
}

export function Foot({ children }) {
  return <p data-rv className="jr-foot">{children}</p>;
}

/* Every chapter speaks one sentence, quoted, in the serif the whole page
   speaks in. The opening mark hangs into the margin so the words align. */
function Quoted({ text }) {
  const m = /^”(.*)”$/.exec(text);
  if (!m) return text;
  return (
    <>
      <span className="jr-q" aria-hidden="true">”</span>
      {m[1]}
      <span className="jr-q" aria-hidden="true">”</span>
    </>
  );
}

/** The funnel, one line: the current count lit, what came before settled,
 *  what remains ahead faint — so every chapter says how many are left. */
export function Tally({ step, note }) {
  return (
    <div className="jr-tally" aria-label={`${FUNNEL[step].v} bolag ${note}`}>
      {FUNNEL.map((f, i) => (
        <Fragment key={f.k}>
          {i > 0 && <span className="jr-tally-sep" aria-hidden="true">›</span>}
          <span className="jr-tally-n" data-state={i < step ? 'past' : i === step ? 'now' : 'next'}>{f.v}</span>
        </Fragment>
      ))}
      <span className="jr-tally-note">{note}</span>
    </div>
  );
}

export function Head({ tag, lead, title, tally, children }) {
  return (
    <header className="jr-head">
      <div data-rv className="jr-head-row">
        <div className="eyebrow text-green">{tag}</div>
        {tally && <Tally step={tally.step} note={tally.note} />}
      </div>
      <h2 data-rv className="jr-title st">
        {lead && <span className="st-lead">{lead}</span>}
        <span className="st-display display"><Quoted text={title} /></span>
      </h2>
      <p data-rv className="jr-body">{children}</p>
    </header>
  );
}

/* ── Problemet ──────────────────────────────────────────────────────────── */
export function ProblemHeadline() {
  return (
    <h2 className="st mb-8 md:mb-9">
      <span data-rv className="st-lead">Ett register säger vilka bolag som finns.</span>
      <span data-rv className="st-display display">Inte vilka som behöver er just nu.</span>
    </h2>
  );
}

export function ProblemGrid() {
  return (
    <div className="ph-grid">
      <div>
        <div data-rv className="eyebrow text-white/55 mb-3">Vad registret vet</div>
        <div data-rv className="wk-ph-register" aria-hidden="true">
          {['Namn', 'Org.nr', 'SNI-kod', 'Ort', 'Anställda', 'Omsättning'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        {/* The field is painted by the stage; this box only reserves it. */}
        <div data-wk-ph-field className="wk-ph-field" aria-hidden="true" />
        <p data-rv className="ph-field-note">
          Tusentals bolag utan urskiljning är inte en marknad. Det är brus.
        </p>
      </div>
      <div className="ph-slots">
        <div data-rv className="eyebrow text-white/55 mb-4">Vad registret inte vet</div>
        {[
          ['behov', 'Behov', 'Finns det ett verkligt skäl att köpa?'],
          ['person', 'Person', 'Vem äger frågan?'],
          ['timing', 'Timing', 'Varför just nu?'],
          ['passform', 'Passform', 'Varför är bolaget rätt för er?'],
        ].map(([kind, t, q]) => (
          <div data-ph-slot data-kind={kind} key={t} className="ph-slot">
            <span className="ph-slot-box" aria-hidden="true" />
            <span>
              <span className="ph-slot-label">{t}</span>
              <span className="ph-slot-q">{q}</span>
            </span>
          </div>
        ))}
        {/* The conclusion of the four, hung from the last of them: the fit
            is the one question only you can answer, so that is where the
            work starts. */}
        <p data-rv className="ph-hand">
          <span className="ph-hand-mark" aria-hidden="true" />
          <span>{PH_HAND}</span>
        </p>
      </div>
    </div>
  );
}

/* ── 01 · the ledger ────────────────────────────────────────────────────── */
export function Ledger() {
  return (
    <div className="jr-intake-wrap">
      <div data-wk-ledger className="jr-intake" role="list">
        {INTAKE.map((row) => (
          <div key={row.norm} role="listitem" className="jr-intake-row">
            <div className="jr-intake-q">{row.q}</div>
            <div className="jr-intake-raw">{row.raw}</div>
            <div className="jr-intake-norm">{row.norm}</div>
            <span className="jr-out-dot" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 02 · the map ───────────────────────────────────────────────────────── */
export function MarketMap() {
  return (
    <div data-wk-map className="jr-map">
      <span className="jr-map-label" aria-hidden="true">Branschuniversum · 31{'\u00a0'}000 bolag</span>
      <div data-wk-bound className="jr-bound">
        <span className="jr-bound-label">Kravbilden avgränsar</span>
        <div
          data-field2
          className="jr-field"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}
          aria-hidden="true"
        >
          {Array.from({ length: MARKS }, (_, i) => (
            <i key={i} className="jm" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 03 · the screening ─────────────────────────────────────────────────── */
export function Screening() {
  return (
    <>
      <div data-wk-manifold className="jr-manifold" aria-hidden="true">
        <div data-wk-bus className="jr-bus" />
        <div className="jr-taps">
          {RAILS.map((r, i) => (
            <div key={r} data-tap={i} data-on="0" className="jr-tap">
              <span className="jr-tap-line" />
              <span className="jr-tap-label">{r}</span>
            </div>
          ))}
        </div>
      </div>
      <span className="jr-field-label" aria-hidden="true">Bolagen från 02 · 3 120 stycken</span>
      <div
        data-field3
        className="jr-field"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}
        aria-hidden="true"
      >
        {Array.from({ length: MARKS }, (_, i) => (
          <i key={i} data-state={RANKS[i] < ALIVE_AFTER_03 ? 'solid' : 'struck'} className="jm" />
        ))}
      </div>
    </>
  );
}

/* ── 04 · the standouts: the same field as 03, and a few companies that
   begin to stand out from it. Painted by the stage; the DOM lays out the
   marks and names the three we will follow. ─────────────────────────────── */
export function Standouts() {
  return (
    <div data-wk-standouts className="so">
      <div className="so-bar">
        <span className="eyebrow text-white/55">Bolagen som höll i 03 · 388 stycken</span>
        <span className="so-legend" aria-hidden="true">
          {Object.entries(TONE_LABEL).map(([k, l]) => (
            <span key={k}><i style={{ background: TONES[k] }} />{l}</span>
          ))}
        </span>
      </div>
      <div
        data-so-field
        className="jr-field so-field"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}
        aria-hidden="true"
      >
        {Array.from({ length: MARKS }, (_, i) => (
          <i key={i} data-state={RANKS[i] < ALIVE_AFTER_03 ? 'solid' : 'struck'} className="jm" />
        ))}
      </div>
      <ul className="so-cands">
        {NAMED.map((c) => (
          <li key={c.key} data-cand={c.key} className="so-cand">
            <i className="so-dot" style={{ background: TONES[c.tone] }} aria-hidden="true" />
            <b>{c.name}</b>
            <span className="so-sig">{c.signals.join(' · ')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── 05 · the inspection: the three that lit up, tried against the
   requirement, criterion by criterion. One goes on. ────────────────────── */
const GLYPH = { ok: '✓', mid: '~', no: '✕' };
export function Qualify() {
  return (
    <div data-wk-qualify className="qf">
      <div className="qf-bar">
        <span className="eyebrow text-white/55">Prövning mot er kravbild</span>
        <span className="eyebrow text-white/35">3 kandidater från 04</span>
      </div>
      <div className="qf-cards">
        {CANDIDATES.map((c) => (
          <div key={c.key} data-cand={c.key} data-go={c.verdict === 'go' ? '1' : '0'} className="qf-card">
            <div className="qf-head">
              <i className="so-dot" style={{ background: TONES[c.tone] }} aria-hidden="true" />
              <span className="qf-name">{c.name}</span>
              <span className="qf-sub">{c.sub}</span>
            </div>
            <ul className="qf-rows">
              {CHECKS.map((label, i) => (
                <li key={label} data-row data-s={c.rows[i][0]} className="qf-row">
                  <i className="qf-g" aria-hidden="true">{GLYPH[c.rows[i][0]]}</i>
                  <span className="qf-l">{label}</span>
                  {c.rows[i][1] && <span className="qf-n">{c.rows[i][1]}</span>}
                </li>
              ))}
            </ul>
            <div data-verdict className="qf-verdict">
              {c.verdict === 'go' ? <>Går vidare <i aria-hidden="true">→</i></> : 'Går inte vidare'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 06 · the portal, as it is: the rail, the week's delivery, the company's
   row among the others, and its Brief opened. Simplified for the page, but
   the same product a customer signs in to. */
export function PortalMini() {
  return (
    <div data-portal className="pm" aria-label="Förenklad vy av er Norrsyn-portal">
      <aside className="pm-rail" aria-hidden="true">
        <div className="pm-brand">
          <span className="pm-mark">Norrsyn<b>_</b></span>
          <span className="pm-eyebrow">Portal</span>
        </div>
        <div className="pm-client">Ert bolag AB</div>
        <nav className="pm-nav">
          <span><LayoutGrid size={13} strokeWidth={1.75} />Översikt</span>
          <span data-on="1"><Send size={13} strokeWidth={1.75} />Leveranser</span>
          <span><Building2 size={13} strokeWidth={1.75} />Bolag</span>
          <i className="pm-sep" />
          <span><ScanSearch size={13} strokeWidth={1.75} />På begäran</span>
          <span><FileText size={13} strokeWidth={1.75} />Er profil</span>
        </nav>
      </aside>
      <div className="pm-main">
        <div className="pm-head">
          <span className="pm-eyebrow pm-accent">Veckans leverans</span>
          <div className="pm-title">Leverans v.36</div>
          <div className="pm-meta"><b>6 briefs</b> · 3 september 2026</div>
        </div>
        <div className="pm-list">
          {PORTAL_ROWS.map((r) => (
            <div key={r.name} data-pm-row={r.hero ? '1' : '0'} data-on="0" className="pm-row">
              <span className="pm-row-id">
                <span className="pm-name">{r.name}</span>
                <span className="pm-sub">{r.sub}</span>
              </span>
              {r.hero && <span data-pm-state className="pm-state">Ny</span>}
              <span className="pm-grade" data-g={r.grade}><b>{r.grade}</b>{r.label}</span>
              <span className="pm-date">3 sep</span>
              <span className="pm-chev" aria-hidden="true">›</span>
            </div>
          ))}
          <div className="pm-more">3 briefs till i leveransen</div>
        </div>
        {/* The Brief, opened: the snapshot the customer reads first. It is
            also what carries the page into the full Brief below. */}
        <div className="pm-brief-lift"><div data-pm-brief className="pm-brief">
          <div className="pm-brief-head">
            <span className="pm-mark">Norrsyn<b>_</b></span>
            <i aria-hidden="true" />
            <span className="pm-eyebrow">Brief</span>
            <span className="pm-brief-date">3 september 2026</span>
          </div>
          <div className="pm-brief-name">{CASE.name}</div>
          <div className="pm-brief-sub">{CASE.sub}</div>
          <p className="pm-brief-headline">
            Tre lager, snabb tillväxt och en ny ekonomichef. Nu söker bolaget
            någon som ska äga order- och lagerflödet.
          </p>
          <div className="pm-brief-row">
            <span className="pm-eyebrow">Bedömning</span>
            <span className="pm-grade" data-g="A"><b>A</b>Stark match</span>
            <span className="pm-brief-why">Behov uttalat av bolaget · person identifierad · läget öppet</span>
          </div>
          <div className="pm-brief-row">
            <span className="pm-eyebrow">Rekommenderad kontakt</span>
            <b>Oskar Lund</b>
            <span>Ekonomichef</span>
            <span className="pm-verified">E-post verifierad</span>
          </div>
          <span className="pm-open">Öppna brief <i aria-hidden="true">→</i></span>
        </div></div>
      </div>
    </div>
  );
}
