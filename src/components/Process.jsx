import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, EASE } from '../lib/motion.js';
import { COLS, MARKS, RANKS, ALIVE_AFTER_03 } from '../lib/cohort.js';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// PROCESSEN — six scenes, one spine
//
// The spine's semantic state per scene (never decorative continuity):
//   hero      a latent trace appears at the fold
//   problemet three open, unresolved branches — the questions a list can't answer
//   01        six answers physically GROW into six branches that merge into the
//             spine (each branch starts at its own ledger row)
//   02        the spine carves a bounded cohort out of a wider, quieter universe
//   03        the criteria taps cut through the cohort one at a time
//   04        the spine becomes the dossier's margin — it decides what evidence
//             is worth collecting
//   05        evidence is reasoned back against the criteria; the verdict only
//             appears after the connections exist
//   06        the logic becomes the Brief's margin, then the portal receives it
//
// Motion contract (unchanged): every default JSX/CSS state is the FINAL state;
// JS rewinds and animates only when motion is allowed.
// ==========================================================================

// The cohort is shared with the thread engine — one seed, one truth.
// (COLS/ROWS/MARKS/RANKS/ALIVE_AFTER_03 from src/lib/cohort.js)

const INTAKE = [
  { q: 'Vad säljer ni?', raw: '”Vi tar hand om hela flödet, från order till ekonomi.”', norm: 'Erbjudande' },
  { q: 'Vilka kan realistiskt köpa det?', raw: '”Handel och tillverkning. Bolag som hunnit växa lite.”', norm: 'Bransch' },
  { q: 'Vilken storlek är relevant?', raw: '”Under tjugo anställda finns det sällan budget.”', norm: 'Storlek' },
  { q: 'Vilka miljöer passar erbjudandet?', raw: '”Där det redan finns ett affärssystem som vuxit ur sig.”', norm: 'Systemmiljö' },
  { q: 'Vilka roller påverkar beslutet?', raw: '”Oftast ekonomichefen. Ibland en operativ chef.”', norm: 'Beslutsroller' },
  { q: 'Vad diskvalificerar ett bolag?', raw: '”Bemanningsbolag. Och allt som är nystartat.”', norm: 'Diskvalificerare' },
];

const RAILS = ['Bransch', 'Storlek', 'Geografi', 'Systemmiljö', 'Diskvalificerare'];

const EVIDENCE = [
  { text: 'Rekryterar systemansvarig för order och lager', src: 'Jobbannons', tier: 'ok',
    crit: 'Systemmiljö', why: 'aktivt systemansvar i den miljö ni säljer mot.', verdict: 'Matchar' },
  { text: 'Ny ekonomichef sedan i höstas', src: 'LinkedIn', tier: 'ok',
    crit: 'Beslutsroller', why: 'ekonomichef är en av rollerna i er beslutsbild.', verdict: 'Matchar' },
  { text: 'Öppnat ett tredje lager', src: 'Pressmeddelande', tier: 'ok',
    crit: 'Storlek', why: 'ökad operativ komplexitet stärker behovsbilden.', verdict: 'Stärker' },
  { text: 'Ekonomiflödet ligger i ett molnsystem', src: 'Jobbannons', tier: 'mid',
    crit: 'Systemmiljö', why: 'bekräftar miljön ert erbjudande möter.', verdict: 'Matchar' },
  { text: 'Orderflödet delvis manuellt', src: 'Vår tolkning', tier: 'low',
    crit: 'Erbjudande', why: 'kärnan i det problem ni löser, men ännu obekräftad.', verdict: 'Osäkert' },
];
const TIER = { ok: ['Bekräftat', 'jt-ok'], mid: ['Troligt', 'jt-mid'], low: ['Hypotes', 'jt-low'] };

/* Chapter 01 formation geometry. Fixed 56px rows on desktop make every
   coordinate exact without DOM measurement. The causal order is the layout:
   question → answer → criterion → terminal → connection. Connections exit
   AFTER the criterion, gather on a right-hand collector, and the completed
   system runs left under the ledger — its own base rule — before turning down
   into the spine. viewBox is true pixels at ≥1024px, where the SVG is shown.
     0 ……… spine (left gutter, 4.4rem left of the ledger)
     70 …… ledger left edge      902 … ledger right edge
     934 … collector             372 … collector row (under the ledger)      */
const ROW01 = 56;
const F_HEAD = 200;         // the arrival band above the ledger — room to travel calmly
const F_RIGHT = 902;        // ledger right edge (52rem wide)
const F_COLLECT_X = 934;
const F_COLLECT_Y = F_HEAD + 6 * ROW01 + 36; // 456
const F_H = 876;                             // the transformation zone breathes
const F_W = 943;
/* The OfferBrain fold: the arriving thread runs the head band, ties one loop
   of radius 7 — the same stroke folding into a knot — and exits downward as
   the collector every criterion then joins. The glyph IS the line. */
const OB_Y = 112;
const OB_R = 7;
const F_ENTRY = [
  `M 1 0`,
  `L 1 ${OB_Y - 26}`,
  `Q 1 ${OB_Y} 27 ${OB_Y}`,
  `L ${F_COLLECT_X - OB_R} ${OB_Y}`,
  `A ${OB_R} ${OB_R} 0 1 1 ${F_COLLECT_X} ${OB_Y + OB_R}`,
  `L ${F_COLLECT_X} ${F_HEAD + 42}`,
].join(' ');

/* The model as a property of the line, never an icon beside it.

   THE COLLECTOR (01): six hooks, five growing segments, one closing turn.
   The vertical collector exists only as far as the reasoning has come: after
   criterion three it physically ends at row three. The geometry IS the
   progress indicator.

   THE TRANSFORMATION (end of 01): once the collection closes, the completed
   single line runs home, turns down the spine — and then splits. Six fine
   strands emerge, breathe apart, and settle into the persistent bundle that
   carries the model through the rest of the page. OFFERBRAIN is written once,
   here, at the state transition. From this point the page has six lines.

   THE ROPE (02–06): the same six strands, generated per section at the rail
   axis with drift that returns to zero at every seam, so one bundle survives
   every tonal boundary. It finally splays into the Brief and terminates.

   THE FAN (03 · 04 · 05): where the bundle addresses an artefact, six
   filaments depart toward it — the strands briefly at work. */
const STRAND_OFFS = [-5, -3, -1, 1, 3, 5]; // the bundle, six criteria wide
const NECK_Y = F_COLLECT_Y + 44;           // 500 — where the single line splits
const PHASE = [0, 4, 8, 2, 6, 10];         // per-strand breathing offsets

/* The persistent bundle: six strands on the rail axis. Geometry is generated
   per section at layout time (drift returns to zero at every seam); the
   engine only dashes it. Desktop art — mobile keeps the plain rail line. */
function Rope() {
  return (
    <svg data-rope className="jr-rope" aria-hidden="true">
      {STRAND_OFFS.map((_, i) => (
        <path key={i} data-rs={i} pathLength="1" fill="none" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

const FAN_YS = [0, 5.2, 10.4, 15.6, 20.8, 26];
function Fan() {
  return (
    <svg className="jr-fan" viewBox="0 0 70 26" preserveAspectRatio="none" aria-hidden="true">
      {FAN_YS.map((y, i) => (
        <path
          key={i}
          data-fan
          d={`M 0 ${y} C 26 ${y}, 42 13, 70 13`}
          pathLength="1"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function Node({ n }) {
  return (
    <div className="jr-node" aria-hidden="true">
      <span className="jr-node-square" />
      <span className="jr-node-num">{n}</span>
    </div>
  );
}

function Foot({ children }) {
  return <p className="jr-foot">{children}</p>;
}

/* ── 01 · DEFINE ── knowledge becomes structure ─────────────────────────── */
function S1() {
  return (
    <section id="kravbilden" className="jr jr-01">
      <div data-entry-rail className="jr-entry" aria-hidden="true" />
      <div className="jr-inner">
        <Node n="01" />
        <header className="jr-head">
          <div className="eyebrow text-green-deep mb-4">Kravbilden</div>
          <h2 className="jr-title">”Först definierar vi vad rätt betyder.”</h2>
          <p className="jr-body">
            Det gör vi tillsammans med er. Vad ni säljer, vilka som realistiskt
            köper det och vad som gör ett bolag ointressant. Svaren blir er{' '}
            <span className="jr-term">OfferBrain</span>, kravbilden som resten av
            arbetet mäts mot. Ni ser den som den gröna linjen härifrån och ned.
          </p>
        </header>

        {/* The ledger. Each row carries a tap at its left edge; the branch SVG
            grows one curve from each tap, merging them into the spine. */}
        <div className="jr-intake-wrap">
          <svg
            className="jr-form"
            viewBox={`0 0 ${F_W} ${F_H}`}
            width={F_W}
            height={F_H}
            aria-hidden="true"
          >
            <path data-entry d={F_ENTRY} pathLength="1" fill="none" />
            <circle data-ob-dot cx={F_COLLECT_X} cy={OB_Y} r="2.4" />
            {/* Six hooks: each criterion's exit from its own row. */}
            {INTAKE.map((_, i) => {
              const y = F_HEAD + i * ROW01 + ROW01 / 2;
              return (
                <path
                  key={i}
                  data-form
                  d={`M ${F_RIGHT + 16} ${y} L ${F_COLLECT_X - 12} ${y} Q ${F_COLLECT_X} ${y} ${F_COLLECT_X} ${y + 14}`}
                  pathLength="1"
                  fill="none"
                />
              );
            })}
            {/* The collector grows downward ONE ROW AT A TIME: segment i only
                exists once criterion i has joined. After criterion three the
                collector physically ends at row three. */}
            {INTAKE.slice(0, 5).map((_, i) => {
              const y = F_HEAD + i * ROW01 + ROW01 / 2 + 14;
              return (
                <path
                  key={i}
                  data-collect
                  d={`M ${F_COLLECT_X} ${y} L ${F_COLLECT_X} ${y + ROW01}`}
                  pathLength="1"
                  fill="none"
                />
              );
            })}
            {/* The closing turn: only after the sixth criterion. */}
            <path
              data-collect-close
              d={`M ${F_COLLECT_X} ${F_HEAD + 5 * ROW01 + 42} L ${F_COLLECT_X} ${F_COLLECT_Y - 24} Q ${F_COLLECT_X} ${F_COLLECT_Y} ${F_COLLECT_X - 24} ${F_COLLECT_Y}`}
              pathLength="1"
              fill="none"
            />
            {/* The completed requirement runs home and turns down the spine. */}
            <path
              data-form-spine
              d={`M ${F_COLLECT_X - 24} ${F_COLLECT_Y} L 25 ${F_COLLECT_Y} Q 1 ${F_COLLECT_Y} 1 ${F_COLLECT_Y + 24} L 1 ${NECK_Y}`}
              pathLength="1"
              fill="none"
            />
            {/* THE TRANSFORMATION. The single line splits: six strands emerge,
                breathe apart wider than their final spacing, and settle into
                the persistent bundle. One line becomes six, for good. */}
            {STRAND_OFFS.map((f, i) => {
              const w = f * 2.6;
              const p = PHASE[i];
              return (
                <path
                  key={i}
                  data-ob-strand
                  d={[
                    `M 1 ${NECK_Y}`,
                    `C 1 ${NECK_Y + 44 + p}, ${1 + w} ${NECK_Y + 60 + p}, ${1 + w} ${NECK_Y + 92 + p}`,
                    `C ${1 + w} ${NECK_Y + 126 + p}, ${1 + f} ${NECK_Y + 156 + p}, ${1 + f} ${NECK_Y + 200}`,
                    `L ${1 + f} ${F_H}`,
                  ].join(' ')}
                  pathLength="1"
                  fill="none"
                />
              );
            })}
            <g data-oblabel className="jr-oblabel">
              <line x1={1 + 15.5} y1={NECK_Y + 78} x2={1 + 21} y2={NECK_Y + 78} />
              <text x={1 + 26} y={NECK_Y + 81.5}>OFFERBRAIN</text>
            </g>
          </svg>
          <span className="jr-tail-m" aria-hidden="true" />
          <div className="jr-intake" role="list">
            {INTAKE.map((row) => (
              <div key={row.norm} role="listitem" className="jr-intake-row">
                <div className="jr-intake-q">{row.q}</div>
                <div className="jr-intake-raw">{row.raw}</div>
                <div className="jr-intake-norm">{row.norm}</div>
                <span data-dot className="jr-out-dot" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 02 · MAP ── a wide universe, a bounded cohort ──────────────────────── */
function S2() {
  return (
    <section id="marknaden" className="jr jr-02">
      <div className="jr-rail" aria-hidden="true"><span data-jrv className="jr-rail-line" /><Rope /></div>
      <div className="jr-inner">
        <Node n="02" />
        <header className="jr-head">
          <div className="eyebrow text-green-deep mb-4">Marknaden</div>
          <h2 className="jr-title">”Sedan avgränsar vi marknaden.”</h2>
          <p className="jr-body">
            Den möjliga marknaden är många gånger större än någon enskild
            genomgång. Kravbilden avgör vilka bolag som är värda att pröva, och
            de blir kohorten vi följer härifrån: 3&nbsp;120 bolag i den här
            illustrativa genomgången.
          </p>
        </header>

        {/* The universe: a quiet dot lattice wider than the cohort. The spine
            carves the boundary; only what falls inside becomes marks. */}
        <div className="jr-map">
          <svg className="jr-carve" viewBox="0 0 70 100" preserveAspectRatio="none" aria-hidden="true">
            {[14, 86].map((y, i) => (
              <path key={i} data-carve d={`M 0 ${y} L 70 ${y}`} pathLength="1" fill="none" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          <span className="jr-map-label" aria-hidden="true">Den möjliga marknaden</span>
          <div className="jr-bound">
            <span className="jr-bound-label">Kravbilden avgränsar</span>
            <div data-field2 className="jr-field" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }} aria-hidden="true">
              {Array.from({ length: MARKS }, (_, i) => (
                <i key={i} data-on="1" className="jm" />
              ))}
            </div>
          </div>
        </div>

        <Foot>
          Punkterna utanför ramen är den bredare möjliga marknaden. Siffrorna
          är illustrativa; ett streck motsvarar tio bolag.
        </Foot>
      </div>
    </section>
  );
}

/* ── 03 · ELIMINATE ── the criteria cut, one at a time ──────────────────── */
function S3() {
  return (
    <section id="granskningen" className="jr jr-03 jr-dark">
      <div className="jr-rail" aria-hidden="true"><span data-jrv className="jr-rail-line" /><Rope /></div>
      <div className="jr-inner">
        <Node n="03" />
        <header className="jr-head">
          <div className="eyebrow text-green mb-4">Granskningen</div>
          <h2 className="jr-title">”Det mesta ska bort.”</h2>
          <p className="jr-body">
            Varje bolag prövas mot kravbilden, kriterium för kriterium. Fel
            bransch, fel storlek, fel geografi eller något som diskvalificerar
            direkt: avgjort i kod, inte av en språkmodell. De flesta bolag ska
            aldrig bli leads.
          </p>
        </header>

        <div className="jr-manifold" aria-hidden="true">
          <Fan />
          <div data-jrv className="jr-bus" />
          <div className="jr-taps">
            {RAILS.map((r, i) => (
              <div key={r} data-tap={i} data-on="0" className="jr-tap">
                <span data-jrv className="jr-tap-line" />
                <span className="jr-tap-label">{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div data-field3 className="jr-field" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }} aria-hidden="true">
          {Array.from({ length: MARKS }, (_, i) => (
            <i key={i} data-state={RANKS[i] < ALIVE_AFTER_03 ? 'solid' : 'struck'} className="jm" />
          ))}
        </div>

        <Foot>
          <span data-count3 className="jr-count">388</span> bolag håller. Resten
          ligger kvar som blekt bläck: ni ser vad som sorterades bort, inte bara
          vad som blev kvar.
        </Foot>
      </div>
    </section>
  );
}

/* ── 04 · INVESTIGATE ── evidence accumulates around one company ────────── */
function S4() {
  return (
    <section id="researchen" className="jr jr-04">
      <div className="jr-rail" aria-hidden="true"><span data-jrv className="jr-rail-line" /><Rope /></div>
      <div className="jr-inner">
        <Node n="04" />
        <header className="jr-head">
          <div className="eyebrow text-green-deep mb-4">Researchen</div>
          <h2 className="jr-title">”De som återstår granskas på djupet.”</h2>
          <p className="jr-body">
            Vi läser bolaget från flera håll och letar efter vad som faktiskt
            har förändrats. Men samma händelse betyder olika saker för olika
            erbjudanden. Därför läses varje fynd mot er{' '}
            <span className="jr-term">OfferBrain</span>: passar det kravbilden,
            stärker det behovsbilden och pekar det mot rätt personer?
          </p>
        </header>

        <div className="jr-dossier-wrap">
          <Fan />
          <span className="jr-branch" aria-hidden="true" />
          <article className="jr-dossier">
            <header className="jr-dossier-head">
              <span className="jm jm-big" aria-hidden="true" />
              <div>
                <div className="jr-dossier-name">Nordic Flow Distribution AB</div>
                <div className="jr-dossier-sub">Partihandel · Borås · 28 anställda</div>
              </div>
              <div className="jr-dossier-tag">1 av 96 · demoexempel</div>
            </header>
            <div className="jr-srcstrip" aria-hidden="true">
              {['Jobbannons', 'LinkedIn', 'Pressmeddelande', 'Webbplats', 'Register'].map((c) => (
                <span key={c} data-src={c}>{c}</span>
              ))}
            </div>
            <ul className="jr-evlist">
              {EVIDENCE.map((ev) => (
                <li key={ev.text} data-jrv className="jr-ev">
                  <span className="jr-ev-text">{ev.text}</span>
                  <span className="jr-ev-meta">
                    <span className="jr-ev-src">{ev.src}</span>
                    <span className={`jr-tier ${TIER[ev.tier][1]}`}>{TIER[ev.tier][0]}</span>
                  </span>
                  {/* The layer that makes a fact commercial: why it matters
                      against THIS customer's model. */}
                  <span className="jr-ev-rel">
                    <span className="jr-ev-rel-k">Relevans för er</span>
                    <span className="jr-ev-rel-a" aria-hidden="true">→</span>
                    <span className="jr-ev-rel-c">{ev.crit}</span>
                    <span className="jr-ev-rel-w">{ev.why}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <Foot>96 bolag går till djupresearch. Källorna är kategorier, aldrig namngivna leverantörer.</Foot>
      </div>
    </section>
  );
}

/* ── 05 · REASON ── findings meet requirements; the verdict comes last ──── */
function S5() {
  return (
    <section id="bedomningen" className="jr jr-05 jr-dark">
      <div className="jr-rail" aria-hidden="true"><span data-jrv className="jr-rail-line" /><Rope /></div>
      <div className="jr-inner">
        <Node n="05" />
        <header className="jr-head">
          <div className="eyebrow text-green mb-4">Bedömningen</div>
          <h2 className="jr-title">”Intressant räcker inte.”</h2>
          <p className="jr-body">
            Ett bolag kan vara intressant utan att vara rätt för er. Därför
            prövas varje fynd mot kravbilden från steg 01. Ett fynd som inte
            gör bolaget mer relevant för ert erbjudande får inte väga tyngre
            bara för att det låter bra.
          </p>
        </header>

        {/* The fit ledger: criterion → lane → decision mark → finding →
            verdict. One straight lane per judgement; nothing crosses. */}
        <div className="jr-fit-wrap">
          <Fan />
          <span className="jr-branch" aria-hidden="true" />
          <div className="jr-fit">
            <div className="jr-fit-cols" aria-hidden="true">
              <span>Er kravbild</span>
              <span>Vad vi har hittat</span>
              <span>Bedömning</span>
            </div>
            {EVIDENCE.map((ev, i) => (
              <div key={ev.text} data-fit-row data-fi={i} className="jr-fit-row">
                <span className="jr-fit-crit">{ev.crit}</span>
                <span className="jr-fit-lanewrap" aria-hidden="true">
                  <span data-fit-lane className="jr-fit-lane" />
                  <span data-fit-mark className="jr-fit-mark" />
                </span>
                <span className="jr-fit-find">
                  <span className="jr-fit-text">{ev.text}</span>
                  <span className={`jr-tier ${TIER[ev.tier][1]}`}>{TIER[ev.tier][0]}</span>
                </span>
                <span data-fit-verdict className={`jr-fit-verdict ${ev.tier === 'low' ? 'is-open' : ''}`}>
                  {ev.verdict}
                </span>
              </div>
            ))}
          </div>
        </div>

                {/* The verdict: what the ledger above adds up to. */}
        <div data-verdict className="jr-verdict">
          <span className="jr-verdict-scale" aria-hidden="true">
            {['A', 'B', 'C', 'D'].map((g) => (
              <span key={g} data-grade={g === 'A' ? '1' : '0'}>{g}</span>
            ))}
          </span>
          <span className="jr-verdict-text">Klass A. Håller mot kravbilden och går vidare till leverans.</span>
        </div>

                <div className="jr-strip" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} className="jm" data-state={i < 2 ? 'solid' : 'struck'} />
          ))}
        </div>

        <Foot>
          Varje fynd bedöms i ett av fyra lägen: matchar, stärker, osäkert
          eller diskvalificerar. Av 96 djupanalyserade bolag håller 24 hela
          vägen.
        </Foot>
      </div>
    </section>
  );
}

/* ── 06 · DELIVER ── complexity collapses into the document ─────────────── */
function S6() {
  return (
    <section id="briefen" className="jr jr-06">
      <div className="jr-rail jr-rail-end" aria-hidden="true"><span data-jrv className="jr-rail-line" /><Rope /></div>
      <div className="jr-inner">
        <Node n="06" />
        <header className="jr-head">
          <div className="eyebrow text-green-deep mb-4">Briefen</div>
          <h2 className="jr-title">”De starkaste fallen blir Briefs.”</h2>
          <p className="jr-body">
            För varje bolag som håller hela vägen skriver vi en{' '}
            <span className="jr-term">Brief</span>: fakta med källa, tolkning
            märkt som tolkning, rätt personer och en konkret ingång till
            samtalet. En analytiker läser varje Brief innan den lämnar oss.
          </p>
        </header>

        {/* The survivors: the assessed cohort as pale marks, and the one
            company this Brief is about, stepped forward. No counter — the
            row says "many were weighed, this one carried". */}
        <div className="jr-finalists" aria-hidden="true">
          {Array.from({ length: 11 }, (_, i) => (
            <i key={i} className="jm" data-dim="1" />
          ))}
          <i className="jm" data-state="chosen" />
        </div>

        <div className="jr-brief-wrap">
          {/* The payoff: the six strands that were founded in 01 and carried
              through 02–05 separate here and feed the Brief's information
              regions. The document is physically authored by the system
              above it; the strands terminate in it. */}
          <svg data-splay className="jr-splay" aria-hidden="true">
            {STRAND_OFFS.map((_, i) => (
              <path key={i} data-ss={i} pathLength="1" fill="none" />
            ))}
          </svg>
          <span className="jr-branch" aria-hidden="true" />
          <article className="jr-brief">
            <header className="jr-brief-head">
              <span className="eyebrow text-green-deep">Brief</span>
              <span className="jr-brief-score">Klass A</span>
            </header>
            <div className="jr-brief-name">Nordic Flow Distribution AB</div>
            <div className="jr-brief-sub">Partihandel · Borås · 28 anställda</div>

            <div className="jr-zones">
              <div className="jr-zone">
                <div className="eyebrow text-green-deep mb-2">Verifierat</div>
                <ul>
                  {EVIDENCE.filter((e) => e.tier === 'ok').map((e) => (
                    <li key={e.text} data-jrz>
                      {e.text} <span className="jr-zone-src">{e.src}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="jr-zone">
                <div className="eyebrow text-ink-4 mb-2">Analys</div>
                <p data-jrz>
                  Tillväxten har gjort orderflödet till flaskhalsen, inte
                  ekonomin. Rekryteringen visar att friktionen redan är någons
                  uppgift.
                </p>
              </div>
              <div className="jr-zone">
                <div className="eyebrow text-ink-4 mb-2">Rekommendation</div>
                <p data-jrz>
                  Öppna i det tredje lagret, inte i systemet. Ta samtalet med
                  ekonomichefen och fråga hur order, lager och ekonomi hänger
                  ihop idag.
                </p>
              </div>
            </div>
          </article>
        </div>

        <div data-portal className="jr-portal">
          <div className="jr-portal-bar">
            <span className="eyebrow text-ink-3">Er Norrsyn-portal</span>
            <span className="eyebrow text-ink-4">Leveranser</span>
          </div>
          {/* The featured delivery, in the portal’s own vocabulary: weekly
              deliveries, each a titled collection of reviewed Briefs. The
              company the page just followed is the first row inside it. */}
          <div className="jr-portal-feat">
            <div className="eyebrow text-green-deep mb-1.5">Veckans leverans</div>
            <div className="jr-portal-title">Vecka 12, 2026</div>
            <div className="jr-portal-meta">20 mars 2026 · 6 briefs · 3 sektioner</div>
            <div className="jr-portal-brief">
              <span className="jm" data-state="chosen" aria-hidden="true" />
              <span className="jr-portal-brief-name">Nordic Flow Distribution AB</span>
              <span className="jr-portal-brief-grade">Klass A</span>
            </div>
          </div>
          <ul className="jr-portal-list">
            <li className="jr-portal-row">
              <span>Vecka 11, 2026</span>
              <span className="jr-portal-meta">13 mars 2026 · 5 briefs</span>
            </li>
            <li className="jr-portal-row">
              <span>Vecka 10, 2026</span>
              <span className="jr-portal-meta">6 mars 2026 · 7 briefs</span>
            </li>
          </ul>
          <p className="jr-portal-note">
            Granskade Briefs levereras i er portal, samlade per leverans. Ni
            öppnar dem när säljarbetet börjar och har varje leverans kvar att
            gå tillbaka till.
          </p>
        </div>

        <Foot>Nedan: ett komplett exempel på hur en Brief ser ut.</Foot>
      </div>
    </section>
  );
}

/* ── Orchestration ──────────────────────────────────────────────────────── */

export default function Process() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      const q = gsap.utils.selector(root);

      // Rails, entry, fold, connectors, calibration, rings, carve, bus, taps,
      // cohort reveal, elimination sweep and reasoning links are ALL driven by
      // the thread engine (src/lib/thread.js) from one master head. This file
      // animates content only.

      // 01 is entirely engine-owned: the descending line is the clock, and
      // every row state (read, criterion live, connector joined) derives
      // from the head's physical position. No viewport trigger touches it.

      // 02 — the carve lines run from the spine to the boundary, the boundary
      // asserts itself, and the cohort resolves inside it in rank order.
      gsap.from(q('.jr-bound'), {
        '--bound-alpha': 0, duration: 1.6, ease: 'power2.out', delay: 0.35,
        scrollTrigger: { trigger: q('.jr-map')[0], start: 'top 82%', once: true },
      });
      // 03 — elimination in waves: while the scrub crosses each fifth of its
      // range, the corresponding criterion tap is lit — the cut has an author.
      // 04 — evidence slips arrive with a slight physical settle, and each
      // finding's source category gains presence as it lands.
      const srcChips = q('.jr-srcstrip span');
      q('.jr-ev').forEach((el, i) => {
        gsap.from(el, {
          opacity: 0, y: 16, rotation: (i % 2 ? 1 : -1) * 0.9, x: (i % 2 ? 1 : -1) * 7,
          duration: 0.95, delay: i * 0.16, ease: 'power3.out',
          scrollTrigger: { trigger: q('.jr-dossier')[0], start: 'top 80%', once: true },
        });
        const chip = srcChips.find((c) => c.dataset.src === EVIDENCE[i].src);
        if (chip) {
          gsap.to(chip, {
            opacity: 1, duration: 0.6, delay: i * 0.16 + 0.5, ease: 'power2.out',
            scrollTrigger: { trigger: q('.jr-dossier')[0], start: 'top 80%', once: true },
          });
        }
      });

      // 05 — rows settle, connections draw with the scroll, and only then does
      // the verdict exist.
      gsap.from(q('.jr-fit-row'), {
        opacity: 0, y: 8, duration: 0.8, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: q('.jr-fit')[0], start: 'top 82%', once: true },
      });
      gsap.from(q('[data-verdict]'), {
        opacity: 0, y: 8, duration: 1.1, ease: 'power2.out',
        scrollTrigger: { trigger: q('.jr-fit')[0], start: 'bottom 62%', once: true },
      });

      // 06 — composing, then delivering.
      q('[data-jrz]').forEach((el, i) => {
        gsap.from(el, {
          opacity: 0, y: 10 + (i % 3) * 4, x: (i % 2 ? 1 : -1) * 8, rotation: (i % 2 ? 1 : -1) * 0.6,
          duration: 0.9, delay: i * 0.11, ease: 'power3.out',
          scrollTrigger: { trigger: q('.jr-brief')[0], start: 'top 78%', once: true },
        });
      });
      gsap.from(q('[data-portal]'), {
        opacity: 0, y: 14, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: q('[data-portal]')[0], start: 'top 85%', once: true },
      });

      ScrollTrigger.refresh();
    }, root);

    // The arriving thread: a rail from 01's top edge down to the exact point
    // where the formation SVG's entry path begins (svg top + 8). Measured from
    // real anchors, cached, recomputed only on resize — never per frame.
    const sec = root.current?.querySelector('#kravbilden');
    const wrap = root.current?.querySelector('.jr-intake-wrap');
    const entryRail = root.current?.querySelector('[data-entry-rail]');
    const layoutEntry = () => {
      if (!sec || !wrap || !entryRail) return;
      const top = wrap.getBoundingClientRect().top - sec.getBoundingClientRect().top;
      entryRail.style.height = `${Math.max(0, top - 200 + 9)}px`;
    };
    // The rope: six strand paths per section, generated from measured section
    // height. Drift shapes are zero at both ends of every section, so each
    // strand crosses every tonal seam at its exact canonical offset — one
    // bundle, no teleports. 02 pinches toward the axis mid-section (the
    // market being bounded); 06 ends at the splay's handover point.
    const OFFS = [-5, -3, -1, 1, 3, 5];
    const layoutStrands = () => {
      const rootEl = root.current;
      if (!rootEl) return;
      rootEl.querySelectorAll('[data-rope]').forEach((svg) => {
        const s = svg.closest('section');
        if (!s) return;
        const H = s.offsetHeight;
        let endY = H + 2;
        if (s.id === 'briefen') {
          const bw = s.querySelector('.jr-brief-wrap');
          if (bw) endY = bw.getBoundingClientRect().top - s.getBoundingClientRect().top - 26;
        }
        svg.setAttribute('viewBox', `0 0 2 ${H}`);
        svg.querySelectorAll('[data-rs]').forEach((p, i) => {
          const x = 1 + OFFS[i];
          const a = (i % 2 ? 1 : -1) * (1 + (i % 3)) * 0.55;
          const pinch = s.id === 'marknaden' ? -OFFS[i] * 0.5 : 0;
          const m1 = x + a + pinch;
          const m2 = x - a * 0.7 + pinch * 0.6;
          p.setAttribute('d', [
            `M ${x} -2`,
            `C ${m1} ${endY * 0.22}, ${m1} ${endY * 0.34}, ${x + pinch * 0.8} ${endY * 0.5}`,
            `C ${m2} ${endY * 0.66}, ${m2} ${endY * 0.8}, ${x} ${endY}`,
          ].join(' '));
        });
      });
      const splay = rootEl.querySelector('[data-splay]');
      const brief = rootEl.querySelector('.jr-brief');
      if (splay && brief) {
        const bh = brief.offsetHeight;
        const gw = 70.4;
        splay.setAttribute('viewBox', `0 0 ${gw} ${bh}`);
        splay.setAttribute('width', gw);
        splay.setAttribute('height', bh);
        const targets = [0.09, 0.17, 0.25, 0.45, 0.62, 0.8];
        splay.querySelectorAll('[data-ss]').forEach((p, i) => {
          const x = 1 + OFFS[i];
          const ty = Math.round(bh * targets[i]);
          p.setAttribute('d',
            `M ${x} -26 L ${x} ${Math.round(ty * 0.3)} C ${x} ${Math.round(ty * 0.75)}, ${gw * 0.45} ${ty}, ${gw} ${ty}`);
        });
      }
    };
    const layoutAll = () => { layoutEntry(); layoutStrands(); };
    layoutAll();
    const ro = new ResizeObserver(layoutAll);
    if (root.current) ro.observe(root.current);
    document.fonts?.ready?.then(layoutAll);

    return () => { ro.disconnect(); ctx.revert(); };
  }, []);

  return (
    <div id="processen" ref={root}>
      <S1 />
      <S2 />
      <S3 />
      <S4 />
      <S5 />
      <S6 />
    </div>
  );
}
