import React from 'react';
import { COLS, MARKS, RANKS, ALIVE_AFTER_03 } from '../lib/cohort.js';
import { LayoutGrid, Send, Building2, ScanSearch, FileText } from 'lucide-react';
import { INTAKE, RAILS, EVIDENCE, DECOY, TIER, CRIT_NOTE, CASE, PORTAL_ROWS } from './story.jsx';

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

export function Head({ tag, lead, title, children }) {
  return (
    <header className="jr-head">
      <div data-rv className="eyebrow text-green mb-4">{tag}</div>
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
        ].map(([kind, t, q]) => (
          <div data-ph-slot data-kind={kind} key={t} className="ph-slot">
            <span className="ph-slot-box" aria-hidden="true" />
            <span>
              <span className="ph-slot-label">{t}</span>
              <span className="ph-slot-q">{q}</span>
            </span>
          </div>
        ))}
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
      <span className="jr-map-label" aria-hidden="true">Den möjliga marknaden</span>
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

/* ── The case file: 04, 05 and 06 follow one company ────────────────────── */
export function Case({ tag }) {
  return (
    <div className="cs-head">
      <span className="jm cs-mark" data-state="chosen" aria-hidden="true" />
      <div className="cs-id">
        <div className="cs-name">{CASE.name}</div>
        <div className="cs-sub">{CASE.sub}</div>
      </div>
      <div className="cs-tag">{tag}</div>
    </div>
  );
}

/* Which colour a dimension speaks in: the requirement green, the need
   amber, the person blue — as Problemet introduced them. */
const DIM_KIND = { Behov: 'behov', Person: 'person' };

/* 04 · the dossier: evidence arrives from its source, is graded, and is
   read to the dimensions of the requirement it bears on. */
export function Board() {
  return (
    <div data-wk-board className="cs">
      <Case tag="Djupresearch · 1 av 96" />
      <div className="rs-cols" aria-hidden="true">
        <span>Källa</span>
        <span />
        <span>Vad som hänt</span>
        <span>Läses mot er kravbild</span>
      </div>
      <ul className="rs-rows">
        {EVIDENCE.map((ev) => (
          <li key={ev.text} data-ev data-tier={ev.tier} className="rs-row">
            <span data-src className="rs-src">
              <b>{ev.src}</b>
              {ev.when && <i>{ev.when}</i>}
            </span>
            <span className="rs-wire" aria-hidden="true" />
            <span className="rs-find">
              <span className="rs-quote">”{ev.text}”</span>
              <span className={`jr-tier ${TIER[ev.tier][1]}`}>{TIER[ev.tier][0]}</span>
            </span>
            <span data-rel className="rs-dims">
              {ev.dims.map((d) => (
                <span key={d} className="rs-dim" data-k={DIM_KIND[d] || 'krav'}>
                  <i>→</i>{d}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 05 · the assessment: the requirement on the left, the findings on the
   right in the requirement's own order, so every connection is short and
   nothing crosses. The verdict is a count and a decision, not a score. */
export function Weigh() {
  const order = INTAKE.map((r) => r.norm);
  const finds = [...EVIDENCE].sort((a, b) => order.indexOf(a.crit) - order.indexOf(b.crit));
  const used = new Set(EVIDENCE.map((e) => e.crit));
  return (
    <div data-wk-weigh className="cs">
      <Case tag="Prövning mot er kravbild" />
      <div className="wg">
        <div className="wg-col">
          <div className="wg-h">Er kravbild · från 01</div>
          {INTAKE.map((r) => (
            <div
              key={r.norm}
              data-crit={r.norm}
              data-used={used.has(r.norm) ? '1' : '0'}
              className="wg-chip"
            >
              <span className="wg-chip-t">{r.norm}</span>
              {CRIT_NOTE[r.norm] && <span className="wg-chip-n">{CRIT_NOTE[r.norm]}</span>}
            </div>
          ))}
        </div>
        <div className="wg-gutter" aria-hidden="true" />
        <div className="wg-col">
          <div className="wg-h">Vad vi hittade · från 04</div>
          {[...finds, DECOY].map((ev) => (
            <div key={ev.text} data-find data-crit={ev.crit} data-decoy={ev.crit ? '0' : '1'} className="wg-find">
              <span className="wg-find-t">{ev.text}</span>
              <span data-judge data-v={ev.verdict} className="wg-judge">{ev.verdict}</span>
              {ev.note && <span className="wg-find-n">{ev.note}</span>}
            </div>
          ))}
        </div>
      </div>
      {/* The decision, in the analyst's words: what held, what is left to
          confirm in the call, and whether the company goes on. */}
      <div data-verdict className="wg-verdict">
        <span className="wg-sum">
          <b>5 av 6</b> kriterier styrkta · erbjudandet bekräftas i samtalet
        </span>
        <span className="wg-go">Går vidare <i aria-hidden="true">→</i></span>
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
          <div className="pm-title">Leverans v.12</div>
          <div className="pm-meta"><b>6 briefs</b> · 20 mars 2026</div>
        </div>
        <div className="pm-list">
          {PORTAL_ROWS.map((r) => (
            <div key={r.name} data-pm-row={r.hero ? '1' : '0'} data-on="0" className="pm-row">
              <span className="pm-row-id">
                <span className="pm-name">{r.name}</span>
                <span className="pm-sub">{r.sub}</span>
              </span>
              {r.hero && <span data-pm-state className="pm-state">Ny</span>}
              <span className="pm-grade" data-g={r.grade}>{r.label}</span>
              <span className="pm-date">20 mars</span>
              <span className="pm-chev" aria-hidden="true">›</span>
            </div>
          ))}
          <div className="pm-more">3 briefs till i leveransen</div>
        </div>
        {/* The Brief, opened: the snapshot the customer reads first. */}
        <div data-pm-brief className="pm-brief">
          <div className="pm-brief-head">
            <span className="pm-mark">Norrsyn<b>_</b></span>
            <i aria-hidden="true" />
            <span className="pm-eyebrow">Brief</span>
            <span className="pm-brief-date">20 mars 2026</span>
          </div>
          <div className="pm-brief-name">{CASE.name}</div>
          <div className="pm-brief-sub">{CASE.sub}</div>
          <p className="pm-brief-headline">
            Det tredje lagret öppnades utan nytt systemstöd. Flaskhalsen är
            orderflödet, inte ekonomin.
          </p>
          <div className="pm-brief-row">
            <span className="pm-eyebrow">Bedömning</span>
            <span className="pm-grade" data-g="A">Stark match</span>
            <span className="pm-brief-why">Behov belagt · person identifierad · läget öppet</span>
          </div>
          <div className="pm-brief-row">
            <span className="pm-eyebrow">Rekommenderad kontakt</span>
            <b>Oskar Lund</b>
            <span>Ekonomichef</span>
            <span className="pm-verified">E-post verifierad</span>
          </div>
          <span className="pm-open">Öppna brief <i aria-hidden="true">→</i></span>
        </div>
      </div>
    </div>
  );
}
