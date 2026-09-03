import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { prefersReducedMotion, EASE } from '../lib/motion.js';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// THE BRIEF
//
// This is the product, so this section carries the most weight on the page,
// and it is built to read exactly like a Brief in the customer portal:
//
//   · the masthead leads with the RECOMMENDED CONTACT — whose inbox works
//     today — and the verdict in words (Stark / God / Möjlig / Ej match),
//     never a letter or a score;
//   · the sections come in the document's own order: Sammanfattning →
//     Evidensöversikt → Varför detta är en möjlighet → Ekonomi & bolagsfakta →
//     Signaler & timing → Systemlandskap → Risk & komplexitet → Relevanta
//     personer → Nästa steg → Slutbedömning → Källor;
//   · the confidence ladder is the product's: Bekräftad / Trolig / Hypotes,
//     with its colour semantics (green / amber / neutral). People are not
//     graded — their contact details are verified or not, and that is what
//     the card says.
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

/* A movement of the document. The rule is what separates one section from
   the next — the same device the portal uses, and the reason the sheet reads
   as a report rather than as a stack of cards. */
function Group({ index, title, children }) {
  return (
    <section className="pt-8 first:pt-0">
      <div data-brief-group className="flex items-baseline gap-3 pb-2.5 mb-5 border-b border-ink/14">
        <span className="eyebrow text-ink-4 tabular">{index}</span>
        <h4 className="eyebrow text-ink-2 flex-1">{title}</h4>
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

const SIGNALS = [
  ['Nytt centrallager i Borås', 'ok', 'pressmeddelande · januari 2026', 'Kapacitetsökningen kommunicerades i januari. Det tredje lagret är i drift.'],
  ['Ny ekonomichef sedan Q4', 'ok', 'LinkedIn', 'Nytt mandat, tidigt i rollen. Det är ofta då systembeslut fattas.'],
  ['Rekryterar systemansvarig för order och lager', 'ok', 'jobbannons · februari 2026', 'Rollen beskrivs som ny. Friktionen har blivit någons uppgift.'],
  ['Omsättning +18 % förra räkenskapsåret', 'ok', 'Bolagsverket · årsredovisning 2025', 'Tillväxten är belagd i årsredovisningen, inte bara kommunicerad.'],
];

const SYSTEMS = [
  ['Fortnox', 'Ekonomi', 'mid', '”faktureras via Fortnox”, ur en jobbannons'],
  ['Microsoft 365', 'Samarbete', 'ok', 'bolagets e-postdomän'],
  ['Excel', 'Rapportering', 'low', 'ingen källa; vanligt mönster i bolag av den här typen'],
];

/* People are not graded. What is verified is the channel. */
const CONTACTS = [
  { name: 'Oskar Lund', title: 'Ekonomichef', verified: true, channel: 'E-post verifierad · direktnummer · LinkedIn', note: 'Rekommenderad kontakt. Äger systemfrågan enligt jobbannonsen.' },
  { name: 'Maria Ekström', title: 'VD', verified: true, channel: 'E-post verifierad · LinkedIn', note: 'Beslutsfattare. Systembeslut över en viss nivå går via henne.' },
  { name: 'Henrik Dahl', title: 'Operativ chef', verified: false, channel: 'E-post härledd från bolagets adressmönster', note: 'Driver lagerfrågan operativt. Bekräfta adressen innan utskick.' },
];

const DISCOVERY = [
  ['Hur hänger lager, order och fakturering ihop i dag?', 'Bekräftar att flödena fortfarande ligger i separata system.', 'Om öppningen är operativ eller ekonomisk.'],
  ['Vad hände med rapporteringen när det tredje lagret öppnade?', 'Prövar vår tolkning mot deras egen upplevelse.', 'Vilket konkret exempel samtalet ska kretsa kring.'],
  ['Vem äger systemvalet efter bytet av ekonomichef?', 'Beslutsmandatet är troligt, men inte bekräftat.', 'Vem som bör vara med i nästa möte.'],
];

const VERDICTS = ['Stark match', 'God match', 'Möjlig match', 'Ej match'];

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
      // draws, the section rules wipe in, and the annotations — confidence and
      // sources — land last, which is the order the analysis happens in.
      tl.from('[data-brief-rail]', { scaleY: 0, transformOrigin: 'top center', duration: 1.2, ease: EASE.inOut }, 0)
        .from('[data-brief-head]', { opacity: 0, y: 12, duration: 0.7, stagger: 0.07 }, 0.05)
        .from('[data-brief-metric]', { opacity: 0, y: 8, duration: 0.55, stagger: 0.06 }, 0.25)
        .from('[data-brief-group]', { opacity: 0, duration: 0.5, stagger: 0.07 }, 0.35)
        .from('[data-brief-block]', { opacity: 0, y: 8, duration: 0.55, stagger: 0.04 }, 0.4)
        .from('[data-brief-dim]', { opacity: 0, duration: 0.4, stagger: 0.04 }, 0.5)
        .from('[data-brief-badge]', { opacity: 0, duration: 0.5, stagger: 0.04 }, 0.85)
        .from('[data-brief-src]', { opacity: 0, duration: 0.4, stagger: 0.03 }, 0.95);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="brief" ref={root} className="bg-mist border-t border-ink/10">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-12 py-24 md:py-32">
        {/* Section lead-in */}
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 mb-12 md:mb-16">
          <div className="md:col-span-7">
            <div className="eyebrow text-ink-3 mb-6">Ett komplett exempel</div>
            <h2 className="font-sans font-semibold text-ink text-[2rem] md:text-[2.7rem] leading-[1.1] tracking-[-0.035em] mb-5">
              Det här är vad ni får.
            </h2>
            <p className="text-ink-3 text-[15px] md:text-base leading-[1.7] max-w-xl">
              Ett bolag, genomarbetat, i samma ordning som i er portal. Det vi
              kan belägga står med sin källa. Det som är vår tolkning är märkt
              som tolkning. Sista avsnittet är vad ni gör härnäst.
            </p>
          </div>
          {/* How to read it: the three tiers, stated once, before the sheet. */}
          <div className="md:col-span-5 md:pt-14">
            <div className="eyebrow text-ink-4 mb-3">Så läser ni en Brief</div>
            <ul className="space-y-2.5">
              {[
                ['ok', 'Belagt av en källa ni kan öppna själva.'],
                ['mid', 'Sannolikt, utifrån ett mönster. Värt att bekräfta i samtalet.'],
                ['low', 'Vår tolkning. Märkt som tolkning, aldrig som fakta.'],
              ].map(([tier, text]) => (
                <li key={tier} className="flex items-start gap-3 text-[13px] text-ink-3 leading-[1.6]">
                  <Badge tier={tier} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── The sheet ──────────────────────────────────────────────────── */}
        <article className="bg-paper-3 border border-ink/12 rounded-2xl overflow-hidden shadow-[0_1px_1px_rgba(21,24,26,0.04),0_12px_32px_-12px_rgba(21,24,26,0.10)]">

          {/* Masthead */}
          <div className="flex items-center justify-between gap-4 px-6 md:px-9 py-3.5 border-b border-ink/10 bg-paper-2">
            <span className="eyebrow text-ink-4">
              Norrsyn · <span className="text-green-deep">Brief</span>
            </span>
            <span className="eyebrow text-ink-4">Demoexempel · fiktivt bolag · 2026-03-18</span>
          </div>

          {/* Header: the company, the headline, the verdict. */}
          <header className="px-6 md:px-9 pt-8 md:pt-10 pb-7 border-b border-ink/10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="max-w-2xl">
                <h3 data-brief-head className="font-sans font-semibold text-ink text-[1.6rem] md:text-[2rem] leading-[1.12] tracking-[-0.032em] mb-2">
                  Nordic Flow Distribution AB
                </h3>
                <p data-brief-head className="font-mono text-[11.5px] text-ink-4">
                  Partihandel, tekniska komponenter · 64,8 MSEK · 28 anst. · Borås · grundat 2014
                </p>
                <p data-brief-head className="mt-4 text-[15px] md:text-[16px] text-ink font-medium leading-[1.55] tracking-[-0.01em]">
                  Det tredje lagret öppnades utan nytt systemstöd. Flaskhalsen
                  är orderflödet, inte ekonomin.
                </p>
              </div>

              {/* The verdict: one of four, in words. The single loudest thing on
                  the page, and the only place it is stated. */}
              <div data-brief-head className="shrink-0 md:text-right md:pl-8 md:border-l md:border-ink/10">
                <div className="eyebrow text-ink-4 mb-2">Bedömning</div>
                <div className="font-sans font-semibold text-[1.6rem] leading-none text-green-deep tracking-[-0.02em]">Stark match</div>
                <div className="mt-3 flex md:justify-end items-center gap-1.5" aria-hidden="true">
                  {VERDICTS.map((v) => (
                    <span
                      key={v}
                      className={`font-mono text-[9px] uppercase tracking-[0.08em] leading-none px-1.5 py-1 rounded-sm border ${
                        v === 'Stark match'
                          ? 'border-green-deep/40 bg-green-deep/8 text-green-deep'
                          : 'border-ink/10 text-ink-4/60'
                      }`}
                    >
                      {v.replace(' match', '')}
                    </span>
                  ))}
                </div>
                <p className="mt-2.5 text-[11.5px] text-ink-4 leading-[1.5] max-w-[26ch] md:ml-auto">
                  Bolaget uppfyller er kravbild på erbjudande, storlek, systemmiljö och beslutsroller.
                </p>
              </div>
            </div>

            {/* The recommended contact leads: whose inbox works today. */}
            <div data-brief-head className="mt-7 grid sm:grid-cols-[auto_1fr] gap-x-6 gap-y-2 items-baseline border border-green-deep/25 bg-green-deep/[0.04] rounded-lg px-4 py-3.5">
              <span className="eyebrow text-green-deep">Rekommenderad kontakt</span>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-sans font-semibold text-[14px] text-ink">Oskar Lund</span>
                <span className="font-mono text-[10.5px] text-ink-4">Ekonomichef</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-green-deep border border-green-deep/30 rounded-sm px-1.5 py-0.5">E-post verifierad</span>
                <span className="font-mono text-[10.5px] text-ink-4">direktnummer · LinkedIn</span>
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
              <Source>Bolagsverket · årsredovisning 2025</Source>
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

              <Group index="§01" title="Sammanfattning">
                <Block title="Vad som har hänt, och varför det spelar roll för er">
                  Bolaget växte 18 procent förra räkenskapsåret och öppnade ett
                  tredje lager utan att byta system. Order, lager och fakturering
                  hanteras fortfarande i separata flöden. Tillväxten har därmed
                  blivit ett operativt problem snarare än ett ekonomiskt, och en
                  ny ekonomichef har mandat att göra något åt det.
                </Block>
              </Group>

              <Group index="§02" title="Evidensöversikt">
                <div data-brief-block className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {[
                    ['ok', '5', 'bekräftade'],
                    ['mid', '2', 'troliga'],
                    ['low', '2', 'hypoteser'],
                  ].map(([tier, n, word]) => (
                    <span key={tier} className="inline-flex items-center gap-2">
                      <span className="font-sans font-semibold text-[15px] text-ink tabular">{n}</span>
                      <Badge tier={tier} />
                      <span className="text-[12px] text-ink-4">{word}</span>
                    </span>
                  ))}
                </div>
                <p data-brief-block className="mt-3 font-mono text-[10.5px] text-ink-4 leading-relaxed max-w-[60ch]">
                  En sammanställning av underlaget, inte ett betyg. Nivåerna
                  räknas aldrig ihop till en poäng.
                </p>
              </Group>

              <Group index="§03" title="Varför detta är en möjlighet">
                <Block title="Smärtanalys" badge="low">
                  Att bolaget rekryterar en systemansvarig för order och lager
                  tyder på att friktionen redan har blivit någons ansvar. Det är
                  vår tolkning. Bolaget har inte sagt det själva.
                </Block>
                <Block title="Koppling till erbjudandet" badge="ok">
                  Ni säljer ett sammanhållet flöde från order till ekonomi, till
                  handels- och tillverkningsbolag som har vuxit ur sitt system.
                  Det är exakt den situation bolaget beskriver i sin egen
                  jobbannons.
                </Block>
              </Group>

              <Group index="§04" title="Ekonomi & bolagsfakta">
                <div className="grid sm:grid-cols-3 gap-5">
                  {[
                    ['Vad de gör', 'Distribuerar tekniska komponenter till installations- och industriföretag.'],
                    ['Hur de verkar', 'Tre lager, gemensam orderingång, flera leverantörsled.'],
                    ['Marknadsposition', 'Regional aktör i Västsverige med växande andel inom installationssegmentet.'],
                  ].map(([t, body]) => (
                    <div data-brief-block key={t}>
                      <div className="eyebrow text-ink-4 mb-1.5">{t}</div>
                      <p className="text-[12.5px] text-ink-3 leading-[1.6]">{body}</p>
                    </div>
                  ))}
                </div>
                <div data-brief-block className="mt-5 flex flex-wrap items-baseline gap-3">
                  <span className="eyebrow text-ink-4">Tillväxt</span>
                  <span className="font-sans font-semibold text-[14px] text-ink tabular">+18 %</span>
                  <span className="text-[12px] text-ink-4">omsättning, förra räkenskapsåret</span>
                  <Source>Bolagsverket · SCB</Source>
                </div>
              </Group>

              <Group index="§05" title="Signaler & timing">
                <div className="space-y-4">
                  {SIGNALS.map(([t, tier, src, note]) => (
                    <div data-brief-block key={t} className="flex items-start justify-between gap-4 pb-4 border-b border-ink/6 last:border-0">
                      <div>
                        <div className="font-sans font-semibold text-[13px] text-ink mb-1">{t}</div>
                        <p className="text-[12.5px] text-ink-3 leading-[1.6] max-w-[52ch]">{note}</p>
                        <div className="mt-1.5"><Source>{src}</Source></div>
                      </div>
                      <Badge tier={tier} />
                    </div>
                  ))}
                </div>
                <Block title="Timing" badge="mid">
                  Tre signaler inom sex månader: nytt lager, ny ekonomichef, ny
                  systemroll. Fönstret är öppet nu. Det stängs sannolikt när
                  rollen är tillsatt och ett system är valt.
                </Block>
              </Group>

              <Group index="§06" title="Systemlandskap">
                <div className="border border-ink/10 rounded-lg overflow-hidden">
                  {SYSTEMS.map(([name, kind, tier, evidence], i) => (
                    <div
                      data-brief-block
                      key={name}
                      className={`grid grid-cols-[1fr_auto] gap-3 px-4 py-3 ${i > 0 ? 'border-t border-ink/8' : ''}`}
                    >
                      <div>
                        <div className="font-sans font-semibold text-[13px] text-ink">
                          {name} <span className="font-normal text-ink-4 font-mono text-[10.5px] ml-1">{kind}</span>
                        </div>
                        <p className="font-mono text-[10.5px] text-ink-4 mt-1 leading-relaxed">Grund: {evidence}</p>
                      </div>
                      <Badge tier={tier} />
                    </div>
                  ))}
                </div>
              </Group>

              <Group index="§07" title="Risk & komplexitet">
                <Block title="Risker & invändningar" badge="low">
                  Bolaget har klarat sig utan ett sammanhållet system i tolv år.
                  Den troligaste invändningen är därför inte priset utan ”det
                  fungerar ju”. Det är också därför det tredje lagret är den
                  öppning som biter.
                </Block>
                <Block title="Konkurrenssituation" badge="mid">
                  Fortnox finns på plats för ekonomin. Ett byte är osannolikt.
                  Det troliga köpet är ett komplement som kopplar order och lager
                  till den befintliga ekonomin.
                </Block>
                <Block title="Operativ komplexitet" badge="ok">
                  Tre lager, en orderingång, flera leverantörsled. Tillräckligt
                  komplext för att ett manuellt flöde ska kosta, men inte så
                  komplext att ett införande blir ett projekt i sig.
                </Block>
              </Group>
            </div>

            {/* Decision column */}
            <aside className="lg:col-span-4 px-6 md:px-9 py-8 md:py-10 bg-paper-2 lg:bg-transparent border-t lg:border-t-0 border-ink/10">

              <Group index="§08" title="Relevanta personer">
                <ul className="space-y-3">
                  {CONTACTS.map((c) => (
                    <li data-brief-block key={c.name} className="border border-ink/10 rounded-lg px-3.5 py-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-sans font-semibold text-[13px] text-ink">{c.name}</span>
                        <span className="font-mono text-[10px] text-ink-4">{c.title}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          data-brief-badge
                          className={`font-mono text-[9px] uppercase tracking-[0.1em] leading-none px-1.5 py-1 rounded-sm border ${
                            c.verified
                              ? 'border-green-deep/30 bg-green-deep/8 text-green-deep'
                              : 'border-ink/12 bg-ink/[0.04] text-ink-4'
                          }`}
                        >
                          {c.verified ? 'Verifierad' : 'Ej verifierad'}
                        </span>
                        <span className="font-mono text-[10px] text-ink-4">{c.channel}</span>
                      </div>
                      <p className="mt-2 text-[12px] text-ink-3 leading-[1.55]">{c.note}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-mono text-[10.5px] text-ink-4 leading-relaxed">
                  Kontaktuppgifterna visas inte i demoexemplet. I portalen:
                  namn, titel, verifierad e-post, direktnummer och LinkedIn.
                </p>
              </Group>

              <Group index="§09" title="Nästa steg">
                <div data-brief-block className="mb-5">
                  <div className="eyebrow text-ink-4 mb-1.5">Rekommenderad ingång</div>
                  <p className="text-[13px] text-ink-2 leading-[1.7]">
                    Öppna samtalet med det tredje lagret, inte med systemet.
                    Behovet är operativt långt innan det blir ett IT-beslut. Ta
                    samtalet med ekonomichefen.
                  </p>
                </div>
                <div data-brief-block>
                  <div className="eyebrow text-ink-4 mb-2">Att bekräfta i samtalet</div>
                  <ol className="space-y-3">
                    {DISCOVERY.map(([q, why, decides], i) => (
                      <li key={q} className="grid grid-cols-[1.25rem_1fr] gap-2 text-[12.5px] leading-[1.6]">
                        <span className="font-mono text-[10px] text-ink-4 pt-1 tabular">{i + 1}</span>
                        <span>
                          <span className="block text-ink-2 font-medium">{q}</span>
                          <span className="block mt-1 text-[11.5px] text-ink-4">
                            <span className="font-mono uppercase tracking-[0.1em] text-[9px] text-green-deep mr-1.5">Varför</span>{why}
                          </span>
                          <span className="block text-[11.5px] text-ink-4">
                            <span className="font-mono uppercase tracking-[0.1em] text-[9px] text-green-deep mr-1.5">Det avgör</span>{decides}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Group>

              <Group index="§10" title="Slutbedömning">
                <p data-brief-block className="text-[13px] text-ink-2 leading-[1.7]">
                  Stark match. Behovet är belagt genom bolagets egna beslut, den
                  som äger frågan är identifierad och nåbar, och tidpunkten är så
                  bra som den går att belägga: tidigt i en ny ekonomichefs
                  period, innan systemrollen är tillsatt.
                </p>
                {/* The three things a register never knew — in the colours the
                    page gave them at the start: need, person, timing. */}
                <div data-brief-dim className="mt-4 flex flex-wrap items-center gap-2">
                  {[
                    ['Behov belagt', 'border-amber/50 bg-amber/10 text-[#8A6A22]'],
                    ['Person identifierad', 'border-[#5C9BD6]/50 bg-[#5C9BD6]/10 text-[#2F6AA8]'],
                    ['Timing öppen', 'border-green-deep/40 bg-green-deep/8 text-green-deep'],
                  ].map(([t, cls]) => (
                    <span key={t} className={`font-mono text-[9.5px] uppercase tracking-[0.1em] rounded-sm px-1.5 py-1 border ${cls}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </Group>
            </aside>
          </div>

          {/* Colophon */}
          <footer className="px-6 md:px-9 py-5 border-t border-ink/10 bg-paper-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="font-mono text-[10.5px] text-ink-4 leading-relaxed">
              Källor: Bolagsverket · SCB · årsredovisning · LinkedIn · jobbannonser · pressmeddelanden · bolagets webbplats
            </div>
            <div className="font-mono text-[10.5px] text-ink-4 sm:text-right leading-relaxed">
              Granskad av analytiker · levererad i portalen
            </div>
          </footer>
        </article>

        <p className="mt-6 font-mono text-[10.5px] text-ink-3 max-w-xl">
          Illustrativt demoexempel. Bolaget, siffrorna och personerna är
          fiktiva, och eventuella likheter med verkliga bolag eller personer
          är en tillfällighet. Strukturen, omdömena och konfidensnivåerna är
          produktens egna.
        </p>
      </div>
    </section>
  );
}
