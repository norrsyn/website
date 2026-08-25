import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { prefersReducedMotion, EASE } from '../lib/motion.js';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// THE BRIEF
//
// This is the product, so this section carries the most weight on the page.
// It has to do two things that pull against each other: be true to what the
// app actually ships, and make a visitor want it.
//
// TRUTH — everything structural here is taken from the real BriefView:
//   · the three zones (Verifierat → Analys → Rekommendation) and the group
//     headers that separate them ("Ekonomi & bolagsfakta", "Signaler & timing",
//     "Risk & komplexitet", "Nästa steg" …)
//   · the confidence ladder CONFIRMED/LIKELY/POSSIBLE → Bekräftad/Trolig/
//     Hypotes, with the app's own colour semantics (green / amber / neutral)
//   · the seven scoring dimensions and their real maxima (15/20/20/15/15/10/5)
//     and the A ≥ 75 grade threshold
//   · per-fact source links, and the fact that a Brief is reviewed in
//     Redaktion before it can enter a Leverans.
//
// DESIRE — it is composed as a research document rather than a CRM record: a
// numbered margin rail, hairline group rules, a metrics band in tabular
// figures, a narrative column and a decision column. Two greens in the whole
// sheet: the grade, and the Bekräftad badges. Nothing glows.
//
// Everything on it is fictional and labelled as such, twice.
// ==========================================================================

const CONF = {
  ok:   { label: 'Bekräftad', cls: 'border-green-deep/30 bg-green-deep/8 text-green-deep' },
  mid:  { label: 'Trolig',    cls: 'border-amber/40 bg-amber/10 text-[#8A6A22]' },
  low:  { label: 'Hypotes',   cls: 'border-ink/12 bg-ink/[0.04] text-ink-4' },
};

function Badge({ tier }) {
  const c = CONF[tier];
  return (
    <span
      data-brief-badge
      className={`shrink-0 self-start font-mono text-[9px] uppercase tracking-[0.12em] leading-none px-1.5 py-1 rounded-sm border ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

function Source({ children }) {
  return (
    <span data-brief-src className="inline-flex items-center gap-0.5 font-mono text-[10.5px] text-ink-4 hover:text-green-deep transition-colors">
      {children}
      <ArrowUpRight size={9} strokeWidth={2} />
    </span>
  );
}

/* A movement of the document. The rule is what separates one zone from the
   next — the same device the app uses, and the reason the sheet reads as a
   report rather than as a stack of cards. */
function Group({ index, title, zone, children }) {
  return (
    <section className="pt-8 first:pt-0">
      <div data-brief-group className="flex items-baseline gap-3 pb-2.5 mb-5 border-b border-ink/14">
        <span className="eyebrow text-ink-4 tabular">{index}</span>
        <h4 className="eyebrow text-ink-2 flex-1">{title}</h4>
        {zone && <span className="eyebrow text-ink-4">{zone}</span>}
      </div>
      {children}
    </section>
  );
}

function Block({ title, badge, children, source }) {
  return (
    <div data-brief-block className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-1.5">
        <h5 className="font-sans font-semibold text-[13.5px] text-ink tracking-[-0.012em]">{title}</h5>
        {badge && <Badge tier={badge} />}
      </div>
      <p className="text-[13px] text-ink-3 leading-[1.72] max-w-[64ch]">{children}</p>
      {source && <div className="mt-1.5">{source}</div>}
    </div>
  );
}

const METRICS = [
  ['Omsättning', '64,8', 'MSEK'],
  ['Resultat', '5,7', 'MSEK'],
  ['Anställda', '28', ''],
  ['Marginal', '8,8', '%'],
];
const CONTACTS = [
  ['Oskar Lund', 'Ekonomichef', 'Verifierad', true],
  ['Maria Ekström', 'VD', 'Verifierad', true],
  ['Henrik Dahl', 'Operativ chef', 'Trolig (mönster)', false],
];

const DISCOVERY = [
  'Hur hänger lager, order och fakturering ihop idag?',
  'Vad hände med rapporteringen när tredje lagret öppnade?',
  'Vem äger systemvalet efter CFO-bytet?',
];

export default function BriefExample() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        defaults: { ease: EASE.out },
      });

      // The document does not fly apart. It gains structure: the margin rail
      // draws, the group rules wipe in, and the annotations — confidence and
      // sources — land last, which is the order the analysis happens in.
      tl.from('[data-brief-rail]', { scaleY: 0, transformOrigin: 'top center', duration: 1.2, ease: EASE.inOut }, 0)
        .from('[data-brief-head]', { opacity: 0, y: 12, duration: 0.7, stagger: 0.07 }, 0.05)
        .from('[data-brief-metric]', { opacity: 0, y: 8, duration: 0.55, stagger: 0.06 }, 0.25)
        .from('[data-brief-group]', { opacity: 0, duration: 0.5, stagger: 0.09 }, 0.35)
        .from('[data-brief-block]', { opacity: 0, y: 8, duration: 0.55, stagger: 0.05 }, 0.4)
        .from('[data-brief-dim]', { opacity: 0, duration: 0.4, stagger: 0.04 }, 0.5)
        .from('[data-brief-badge]', { opacity: 0, scale: 0.94, duration: 0.4, stagger: 0.05 }, 0.85)
        .from('[data-brief-src]', { opacity: 0, duration: 0.4, stagger: 0.04 }, 0.95);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="brief" ref={root} className="bg-mist border-t border-ink/10">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-12 py-24 md:py-32">
        {/* Section lead-in */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <div className="eyebrow text-ink-3 mb-6">Ett komplett exempel</div>
          <h2 className="font-sans font-semibold text-ink text-[2rem] md:text-[2.7rem] leading-[1.1] tracking-[-0.035em] mb-5">
            Det här är vad ni får.
          </h2>
          <p className="text-ink-3 text-[15px] md:text-base leading-[1.7]">
            Ett bolag, genomarbetat. Allt vi kan belägga står med sin källa. Allt
            som är vår tolkning är märkt som tolkning. Sista sidan är vad ni gör
            i morgon.
          </p>
        </div>

        {/* ── The sheet ──────────────────────────────────────────────────── */}
        <article className="bg-paper-3 border border-ink/12 rounded-2xl overflow-hidden shadow-[0_1px_1px_rgba(21,24,26,0.04),0_12px_32px_-12px_rgba(21,24,26,0.10)]">

          {/* Masthead */}
          <div className="flex items-center justify-between gap-4 px-6 md:px-9 py-3.5 border-b border-ink/10 bg-paper-2">
            <span className="eyebrow text-ink-4">
              Norrsyn · <span className="text-green-deep">Brief</span>
            </span>
            <span className="eyebrow text-ink-4">Demoexempel · fiktivt bolag</span>
          </div>

          {/* Header */}
          <header className="px-6 md:px-9 pt-8 md:pt-10 pb-7 border-b border-ink/10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <h3 data-brief-head className="font-sans font-semibold text-ink text-[1.6rem] md:text-[2rem] leading-[1.12] tracking-[-0.032em] mb-2">
                  Nordic Flow Distribution AB
                </h3>
                <p data-brief-head className="font-mono text-[11.5px] text-ink-4">
                  Partihandel, tekniska komponenter · Borås, Västra Götaland · grundat 2014
                </p>
                <p data-brief-head className="mt-4 text-[13.5px] text-ink-3 leading-[1.7] max-w-xl">
                  Distribuerar tekniska komponenter till installations- och
                  industribolag. Tre lager, gemensam orderingång, flera leverantörsled.
                </p>
              </div>

              {/* Verdict — the single loudest number on the page, and the only
                  place the grade is stated. */}
              <div data-brief-head className="shrink-0 md:text-right md:pl-8 md:border-l md:border-ink/10">
                {/* The customer-facing model is a classification, not a score:
                    A/B/C/D, stated once and never gamified. */}
                <div className="flex md:justify-end items-baseline gap-2">
                  <span className="font-sans font-semibold text-[2.4rem] leading-none text-green-deep">A</span>
                </div>
                <div className="mt-2 flex md:justify-end items-center gap-1.5" aria-hidden="true">
                  {['A', 'B', 'C', 'D'].map((g) => (
                    <span
                      key={g}
                      className={`font-mono text-[10px] leading-none px-1.5 py-1 rounded-sm border ${
                        g === 'A'
                          ? 'border-green-deep/40 bg-green-deep/8 text-green-deep'
                          : 'border-ink/10 text-ink-4/60'
                      }`}
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <div className="eyebrow text-ink-4 mt-2.5">Klassificering</div>
              </div>
            </div>
          </header>

          {/* Metrics band */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-ink/10 divide-x divide-ink/8">
            {METRICS.map(([label, value, unit], i) => (
              <div
                data-brief-metric
                key={label}
                className={`px-6 md:px-9 py-5 ${i > 1 ? 'border-t border-ink/8 md:border-t-0' : ''}`}
              >
                <div className="eyebrow text-ink-4 mb-1.5">{label}</div>
                <div className="font-sans text-ink tabular">
                  <span className="text-[1.35rem] font-semibold tracking-[-0.02em]">{value}</span>
                  {unit && <span className="ml-1 text-[11.5px] text-ink-4 font-mono">{unit}</span>}
                </div>
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 px-6 md:px-9 pb-4 -mt-1">
              <Source>bolagsregister · bokslut 2025</Source>
            </div>
          </div>

          {/* Body */}
          <div className="relative grid lg:grid-cols-12">

            {/* Margin rail — the device that makes the sheet read as a report. */}
            <div
              data-brief-rail
              className="hidden lg:block absolute left-[calc(66.666%_-_1px)] top-0 bottom-0 w-px bg-ink/10"
              aria-hidden="true"
            />

            {/* Narrative column */}
            <div className="lg:col-span-8 px-6 md:px-9 py-8 md:py-10">

              <Group index="§01" title="Varför detta är en möjlighet" zone="Verifierat">
                <Block title="Sammanfattning">
                  Bolaget växte 18 procent senaste räkenskapsåret och öppnade ett
                  tredje lager utan att byta systemstöd. Order, lager och fakturering
                  ligger kvar i separata flöden. Tillväxten har därför blivit en
                  operativ belastning snarare än en ekonomisk fråga.
                </Block>
                <Block
                  title="Smärtbild"
                  badge="low"
                >
                  Rekryteringen av en systemansvarig för order och lager pekar mot
                  att friktionen redan har blivit någons uppgift. Det är vår tolkning.
                  Bolaget har inte sagt det själva.
                </Block>
              </Group>

              <Group index="§02" title="Signaler & timing" zone="Verifierat">
                <div className="space-y-4">
                  {[
                    ['Nytt centrallager i Borås', 'ok', 'pressmeddelande · 2026-01', 'Kapacitetsökning kommunicerad i januari.'],
                    ['Ny ekonomichef tillträdd Q4', 'ok', 'LinkedIn', 'Nytt mandat och tidigt i sin period, vilket ofta är fönstret för systembeslut.'],
                    ['Rekryterar systemansvarig, order & lager', 'ok', 'jobbannons · 2026-02', 'Rollen beskrivs som ny.'],
                  ].map(([t, tier, src, note]) => (
                    <div data-brief-block key={t} className="flex items-start justify-between gap-4 pb-4 border-b border-ink/6 last:border-0">
                      <div>
                        <div className="font-sans font-semibold text-[13px] text-ink mb-1">{t}</div>
                        <p className="text-[12.5px] text-ink-3 leading-[1.6] max-w-[46ch]">{note}</p>
                        <div className="mt-1.5"><Source>{src}</Source></div>
                      </div>
                      <Badge tier={tier} />
                    </div>
                  ))}
                </div>
              </Group>

              <Group index="§03" title="Systemlandskap" zone="Analys">
                <div className="border border-ink/10 rounded-lg overflow-hidden">
                  {[
                    ['Fortnox', 'Ekonomi', 'mid', '”faktureras via Fortnox”, ur en jobbannons'],
                    ['Microsoft 365', 'Samarbete', 'ok', 'MX-uppslag mot bolagets domän'],
                    ['Excel', 'Rapportering', 'low', 'Ingen källa. Vanligt mönster i liknande bolag.'],
                  ].map(([name, kind, tier, evidence], i) => (
                    <div
                      data-brief-block
                      key={name}
                      className={`grid grid-cols-[1fr_auto] gap-3 px-4 py-3 ${i > 0 ? 'border-t border-ink/8' : ''}`}
                    >
                      <div>
                        <div className="font-sans font-semibold text-[13px] text-ink">
                          {name} <span className="font-normal text-ink-4 font-mono text-[10.5px] ml-1">{kind}</span>
                        </div>
                        <p className="font-mono text-[10.5px] text-ink-4 mt-1 leading-relaxed">{evidence}</p>
                      </div>
                      <Badge tier={tier} />
                    </div>
                  ))}
                </div>
              </Group>

              <Group index="§04" title="Risk & komplexitet" zone="Analys">
                <Block title="Invändning att räkna med" badge="low">
                  Bolaget har klarat sig utan ett sammanhållet system i tolv år. Den
                  troligaste invändningen är därför inte pris utan ”det fungerar ju”.
                  Det gör det tredje lagret till den öppning som faktiskt biter.
                </Block>
              </Group>
            </div>

            {/* Decision column */}
            <aside className="lg:col-span-4 px-6 md:px-9 py-8 md:py-10 bg-paper-2 lg:bg-transparent border-t lg:border-t-0 border-ink/10">

              <Group index="§05" title="Bedömning">
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-sans font-semibold text-[19px] text-green-deep">Klass A</span>
                    <span className="text-[12px] text-ink-4">stark matchning mot kravbilden</span>
                  </div>
                  {[
                    ['Erbjudandematch', 'stark'],
                    ['Systemmiljö', 'bekräftad'],
                    ['Timing', 'aktiv'],
                    ['Beslutsmandat', 'troligt lokalt'],
                    ['Risk', 'låg'],
                  ].map(([label, value]) => (
                    <div
                      data-brief-dim
                      key={label}
                      className="flex items-baseline justify-between gap-3 py-2 border-b border-ink/6 last:border-0"
                    >
                      <span className="text-[12px] text-ink-3">{label}</span>
                      <span className="text-[12px] text-ink-2">{value}</span>
                    </div>
                  ))}
                  <p className="mt-3 font-mono text-[10.5px] text-ink-4 leading-relaxed">
                    Klassificeringen väger hur väl bolaget passar er kravbild.
                  </p>
                </div>
              </Group>

              <Group index="§06" title="Beslutsfattare" zone="Rekommendation">
                <ul className="space-y-3">
                  {CONTACTS.map(([name, role, status, verified]) => (
                    <li data-brief-block key={name} className="border border-ink/10 rounded-lg px-3.5 py-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-sans font-semibold text-[13px] text-ink">{name}</span>
                        <span className="font-mono text-[10px] text-ink-4">{role}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          data-brief-badge
                          className={`font-mono text-[9px] uppercase tracking-[0.1em] leading-none px-1.5 py-1 rounded-sm border ${
                            verified
                              ? 'border-green-deep/30 bg-green-deep/8 text-green-deep'
                              : 'border-amber/40 bg-amber/10 text-[#8A6A22]'
                          }`}
                        >
                          {status}
                        </span>
                        <span className="font-mono text-[10px] text-ink-4">e-post · direktnummer</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-mono text-[10.5px] text-ink-4 leading-relaxed">
                  Kontaktuppgifter döljs i demoexemplet.
                </p>
              </Group>

              <Group index="§07" title="Nästa steg" zone="Rekommendation">
                <div data-brief-block className="mb-5">
                  <div className="eyebrow text-ink-4 mb-1.5">Rekommenderad ingång</div>
                  <p className="text-[13px] text-ink-2 leading-[1.7]">
                    Öppna i det tredje lagret, inte i systemet. Behovet är operativt
                    långt innan det blir ett IT-beslut.
                  </p>
                </div>
                <div data-brief-block>
                  <div className="eyebrow text-ink-4 mb-2">Discovery</div>
                  <ol className="space-y-2.5">
                    {DISCOVERY.map((q, i) => (
                      <li key={q} className="grid grid-cols-[1.25rem_1fr] gap-2 text-[12.5px] text-ink-3 leading-[1.6]">
                        <span className="font-mono text-[10px] text-ink-4 pt-1 tabular">{i + 1}</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Group>
            </aside>
          </div>

          {/* Colophon */}
          <footer className="px-6 md:px-9 py-5 border-t border-ink/10 bg-paper-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="font-mono text-[10.5px] text-ink-4 leading-relaxed">
              Källor: bolagsregister · offentliga register · LinkedIn · jobbannonser · bolagets webbplats
            </div>
            <div className="font-mono text-[10.5px] text-ink-4 sm:text-right leading-relaxed">
              Granskad av analytiker · mars 2026
            </div>
          </footer>
        </article>

        <p className="mt-6 font-mono text-[10.5px] text-ink-3 max-w-xl">
          Illustrativt demoexempel. Bolaget, siffrorna och personerna är fiktiva.
          Strukturen, klassificeringen och konfidensnivåerna är produktens egna.
        </p>
      </div>
    </section>
  );
}
