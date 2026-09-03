import React from 'react';
import { COLS, MARKS, RANKS, ALIVE_AFTER_03 } from '../lib/cohort.js';
import { INTAKE, RAILS, EVIDENCE, DECOY, TIER, CRIT_NOTE } from './story.jsx';

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
      <span data-rv className="st-lead">Ett register vet vilka bolag som finns.</span>
      <span data-rv className="st-display display">Det vet inte vilka som är redo.</span>
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
        <div className="cs-name">Nordic Flow Distribution AB</div>
        <div className="cs-sub">Partihandel · Borås · 28 anställda</div>
      </div>
      <div className="cs-tag">{tag}</div>
    </div>
  );
}

export function Board() {
  return (
    <div data-wk-board className="cs">
      <Case tag="1 av 96 · djupresearch" />
      <div className="cs-cols" aria-hidden="true">
        <span>Källa</span>
        <span />
        <span>Vad som hänt</span>
        <span>Läst mot er OfferBrain</span>
      </div>
      <ul className="cs-rows">
        {EVIDENCE.map((ev) => (
          <li key={ev.text} data-ev data-tier={ev.tier} className="cs-row">
            <span data-src className="cs-src">{ev.src}</span>
            <span className="cs-wire" aria-hidden="true" />
            <span className="cs-find">
              <span className="cs-find-t">{ev.text}</span>
              <span className={`jr-tier ${TIER[ev.tier][1]}`}>{TIER[ev.tier][0]}</span>
            </span>
            {/* The three questions the copy asks, answered per finding. */}
            <span data-rel className="cs-rel">
              <span className="cs-tag" data-k="krav" data-on={ev.read.krav ? '1' : '0'}>
                <i>Kravbild</i>{ev.read.krav || '—'}
              </span>
              <span className="cs-tag" data-k="behov" data-on={ev.read.behov ? '1' : '0'}>
                <i>Behov</i>{ev.read.behov || '—'}
              </span>
              <span className="cs-tag" data-k="person" data-on={ev.read.person ? '1' : '0'}>
                <i>Person</i>{ev.read.person || '—'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Weigh() {
  const used = new Set(EVIDENCE.map((e) => e.crit));
  return (
    <div data-wk-weigh className="cs">
      <Case tag="Prövning mot kravbilden" />
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
          {[...EVIDENCE, DECOY].map((ev) => (
            <div key={ev.text} data-find data-crit={ev.crit} data-decoy={ev.crit ? '0' : '1'} className="wg-find">
              <span className="wg-find-t">{ev.text}</span>
              <span className={`jr-tier ${TIER[ev.tier][1]}`}>{TIER[ev.tier][0]}</span>
              <span data-judge data-v={ev.verdict} className="wg-judge">{ev.verdict}</span>
              {ev.note && <span className="wg-find-n">{ev.note}</span>}
            </div>
          ))}
        </div>
      </div>
      {/* The grade, as the portal gives it: A to D, each with its words. */}
      <div data-verdict className="wg-verdict">
        <span className="jr-verdict-scale" aria-hidden="true">
          {[['A', 'Stark match'], ['B', 'God match'], ['C', 'Möjlig match'], ['D', 'Ej match']].map(([g, w]) => (
            <span key={g} data-grade={g === 'A' ? '1' : '0'}><b>{g}</b>{w}</span>
          ))}
        </span>
        <span className="jr-verdict-text">
          A. Behovet är belagt, personen identifierad och läget öppet. Bolaget går vidare till leverans.
        </span>
      </div>
    </div>
  );
}

export function Finalists() {
  return (
    <div className="jr-finalists" aria-hidden="true">
      {Array.from({ length: 11 }, (_, i) => (
        <i key={i} className="jm" data-dim="1" />
      ))}
      <i className="jm" data-state="chosen" />
    </div>
  );
}

export function BriefCard() {
  return (
    <div className="jr-brief-wrap">
      <article data-wk-brief className="jr-brief">
        <header className="jr-brief-head">
          <span className="eyebrow text-green-deep">Norrsyn · Brief</span>
          <span data-wk-review className="jr-brief-review">Granskad av analytiker</span>
          <span className="jr-brief-score"><b>A</b> · Stark match</span>
        </header>
        <div className="jr-brief-name">Nordic Flow Distribution AB</div>
        <div className="jr-brief-sub">Partihandel · Borås · 28 anställda</div>

        {/* Four regions, one per promise in the chapter's copy. */}
        <div className="jr-zones">
          <div className="jr-zone">
            <div className="eyebrow text-green-deep mb-2">Fakta, med källa</div>
            <ul>
              {EVIDENCE.filter((e) => e.tier === 'ok').map((e) => (
                <li key={e.text}>
                  {e.text} <span className="jr-zone-src">{e.src}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="jr-zone">
            <div className="eyebrow text-ink-4 mb-2">
              Tolkning <span className="jr-tier jt-low ml-1">märkt som tolkning</span>
            </div>
            <p>
              Tillväxten har gjort orderflödet till flaskhalsen, inte ekonomin.
              Rekryteringen visar att friktionen redan är någons uppgift.
            </p>
          </div>
          <div className="jr-zone">
            <div className="eyebrow text-[#2F6AA8] mb-2">Rätt personer</div>
            <ul>
              <li>Oskar Lund · Ekonomichef <span className="jr-zone-src">e-post verifierad</span></li>
              <li>Maria Ekström · VD <span className="jr-zone-src">e-post verifierad</span></li>
            </ul>
          </div>
          <div className="jr-zone">
            <div className="eyebrow text-ink-4 mb-2">Ingång till samtalet</div>
            <p>
              Öppna med det tredje lagret, inte med systemet. Fråga ekonomichefen
              hur order, lager och ekonomi hänger ihop i dag.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

export function PortalCard() {
  return (
    <div data-portal className="jr-portal">
      <div className="jr-portal-bar">
        <span className="eyebrow text-ink-3">Er Norrsyn-portal</span>
        <span className="eyebrow text-ink-4">Förenklad illustration</span>
      </div>
      <div className="jr-portal-nav" aria-hidden="true">
        {['Översikt', 'Leveranser', 'Bolag', 'Er profil'].map((t) => (
          <span key={t} data-on={t === 'Leveranser' ? '1' : '0'}>{t}</span>
        ))}
      </div>
      <div className="jr-portal-feat">
        <div className="eyebrow text-green-deep mb-1.5">Veckans leverans</div>
        <div className="jr-portal-title">Vecka 12, 2026</div>
        <div className="jr-portal-meta">20 mars 2026 · 6 briefs · 3 sektioner</div>
        <div data-wk-portal-row className="jr-portal-brief">
          <span className="jm" data-state="chosen" aria-hidden="true" />
          <span className="jr-portal-brief-name">Nordic Flow Distribution AB</span>
          <span className="jr-portal-state">Ny</span>
          <span className="jr-portal-brief-grade">A · Stark match</span>
          <span className="jr-portal-open">Öppna →</span>
        </div>
      </div>
      <ul className="jr-portal-list">
        <li className="jr-portal-row">
          <span>Vecka 11, 2026</span>
          <span className="jr-portal-row-meta">
            <span className="jr-portal-meta">13 mars 2026 · 5 briefs</span>
            <span className="jr-portal-state">3 kontaktade</span>
          </span>
        </li>
        <li className="jr-portal-row">
          <span>Vecka 10, 2026</span>
          <span className="jr-portal-row-meta">
            <span className="jr-portal-meta">6 mars 2026 · 7 briefs</span>
            <span className="jr-portal-state">1 möte bokat</span>
          </span>
        </li>
      </ul>
      <p className="jr-portal-note">
        Granskade Briefs levereras i er portal, samlade per leverans. Varje
        leverans finns kvar att gå tillbaka till, och varje bolag kan följas
        från ny till kontaktad, möte bokat och vunnen.
      </p>
    </div>
  );
}
