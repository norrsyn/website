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
//     today — and the grade as the portal gives it: A to D, each with its
//     words (A Stark match … D Ej match), never a numeric score;
//   · the sections come in the document's own order: Sammanfattning →
//     Evidensöversikt → Varför detta är en möjlighet → Ekonomi & bolagsfakta →
//     Signaler & timing → Systemlandskap → Risk & komplexitet → Relevanta
//     personer → Nästa steg → Slutbedömning → Källor;
//   · the confidence ladder is the product's: Bekräftad / Trolig / Hypotes,
//     with its colour semantics (green / amber / neutral) — on evidence, and
//     only on evidence. Analysis is prose. People are not graded — their
//     contact details are verified or not, and that is what the card says.
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
      className={`inline-block shrink-0 self-start align-middle font-mono text-[9px] uppercase tracking-[0.12em] leading-none px-1.5 py-1 rounded-sm border ${c.cls}`}
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

/* The signals, in the order they happened. Every one has a source. */
const SIGNALS = [
  ['Omsättning +18 % räkenskapsåret 2025', 'ok', 'Bolagsverket · årsredovisning 2025', 'Tillväxten är belagd i årsredovisningen, inte bara kommunicerad. Resultatet följde med: 5,7 MSEK.'],
  ['Tredje lagret öppnat i Borås', 'ok', 'pressmeddelande · juni 2026', 'Lagerytan mer än fördubblades enligt bolaget. Lagret är i drift sedan juni.'],
  ['Ny ekonomichef', 'ok', 'LinkedIn · bolagets webbplats · juli 2026', 'Oskar Lund tillträdde i juli. Den utlysta systemrollen rapporterar till honom.'],
  ['Söker systemansvarig för order och lager', 'ok', 'jobbannons · 27 augusti 2026', 'Ny roll. Uppdraget är formulerat: färre manuella moment mellan tre lager och ett utvecklat systemstöd för order, lager och leverans.'],
];

const SYSTEMS = [
  ['Fortnox', 'Ekonomi', 'ok', '”faktureras via Fortnox”, ur jobbannonsen 27 augusti 2026'],
  ['Microsoft 365', 'Samarbete', 'ok', 'bolagets e-postdomän'],
  ['Order & lager', 'Inget sammanhållet system', 'mid', 'annonsen beskriver manuella moment mellan lagren; inget ordersystem nämns'],
  ['Excel', 'Rapportering', 'low', 'ingen källa; antagande utifrån mönstret i bolag av den här typen'],
];

/* People are not graded. What is verified is the channel. */
const CONTACTS = [
  { name: 'Oskar Lund', title: 'Ekonomichef', verified: true, channel: 'E-post verifierad · direktnummer · LinkedIn', note: 'Rekommenderad kontakt. Tillträdde i juli 2026; den utlysta systemrollen rapporterar till honom enligt annonsen.' },
  { name: 'Maria Ekström', title: 'VD', verified: true, channel: 'E-post verifierad · LinkedIn', note: 'Beslutsfattare. Ett systembeslut av den här storleken går sannolikt via henne.' },
  { name: 'Henrik Dahl', title: 'Operativ chef', verified: false, channel: 'E-post härledd från bolagets adressmönster', note: 'Driver lagerfrågan operativt. Bekräfta adressen innan utskick.' },
];

/* What to ask, why, and what the answer decides: known from open. */
const DISCOVERY = [
  ['Hur hanteras order mellan de tre lagren i dag?', 'Bekräftar om de manuella moment som annonsen nämner fortfarande är ett problem.', 'Om öppningen är operativ eller ekonomisk.'],
  ['Vad vill ni att den nya systemansvariga ska förändra först?', 'Visar var friktionen faktiskt är störst.', 'Vilket konkret exempel samtalet ska kretsa kring.'],
  ['Finns det redan ett beslut om att utveckla eller byta systemstöd?', 'Skiljer ett aktivt köpinitiativ från ett internt förbättringsarbete.', 'Tempot, och vem som bör vara med i nästa möte.'],
];

const GRADES = [['A', 'Stark match'], ['B', 'God match'], ['C', 'Möjlig match'], ['D', 'Ej match']];

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
      tl.from('[data-brief-lead]', { opacity: 0, y: 10, duration: 0.9, stagger: 0.1 }, 0)
        .from('[data-brief-rail]', { scaleY: 0, transformOrigin: 'top center', duration: 1.2, ease: EASE.inOut }, 0)
        .from('[data-brief-head]', { opacity: 0, y: 12, duration: 0.7, stagger: 0.07 }, 0.05)
        .from('[data-brief-metric]', { opacity: 0, y: 8, duration: 0.55, stagger: 0.06 }, 0.25)
        .from('[data-brief-group]', { opacity: 0, duration: 0.5, stagger: 0.07 }, 0.35)
        .from('[data-brief-block]', { opacity: 0, y: 8, duration: 0.55, stagger: 0.04 }, 0.4)
        .from('[data-brief-dim]', { opacity: 0, duration: 0.4, stagger: 0.04 }, 0.5)
        .from('.brief-sheet [data-brief-badge]', { opacity: 0, duration: 0.5, stagger: 0.04 }, 0.85)
        .from('[data-brief-src]', { opacity: 0, duration: 0.4, stagger: 0.03 }, 0.95);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="brief" ref={root} className="relative bg-mist border-t border-ink/10">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-12 pt-14 pb-24 md:pt-16 md:pb-32">
        {/* One thought. On the single-frame page these words arrive inside
            the frame, above the Brief the portal opened; here they lead the
            sectioned page. */}
        <div className="brief-lead grid md:grid-cols-12 gap-8 md:gap-12 mb-10 md:mb-12">
          <div className="md:col-span-7">
            <div data-brief-lead className="eyebrow text-ink-3 mb-5">Ett komplett exempel</div>
            <h2 data-brief-lead className="st st-sec mb-4">
              <span className="st-display display">Ett samtal värt att ta.</span>
            </h2>
            <p data-brief-lead className="text-ink-3 text-[15px] md:text-base leading-[1.7] max-w-xl">
              Det här är en Brief, levererad direkt till er portal. Den samlar
              det ni behöver veta för att förstå bolaget, läget och samtalet.
            </p>
            <div data-brief-lead className="brief-cue">Så här kan det se ut <span aria-hidden="true">↓</span></div>
          </div>
        </div>

        {/* ── The sheet ──────────────────────────────────────────────────── */}
        <article className="brief-sheet bg-paper-3 border border-ink/12 rounded-2xl overflow-hidden shadow-[0_1px_1px_rgba(21,24,26,0.04),0_12px_32px_-12px_rgba(21,24,26,0.10)]">

          {/* Masthead */}
          <div className="brief-masthead flex items-center justify-between gap-4 px-6 md:px-9 py-3.5 border-b border-ink/10 bg-paper-2">
            <span className="eyebrow text-ink-4">
              Norrsyn · <span className="text-green-deep">Brief</span>
            </span>
            <span className="eyebrow text-ink-4">Demoexempel · fiktivt bolag · 3 september 2026</span>
          </div>

          {/* Header: the company, the headline, the verdict. On the
              single-frame page the Brief from the portal is this header. */}
          <header className="brief-header px-6 md:px-9 pt-8 md:pt-10 pb-7 border-b border-ink/10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="max-w-2xl">
                <h3 data-brief-head className="font-sans font-semibold text-ink text-[1.6rem] md:text-[2rem] leading-[1.12] tracking-[-0.032em] mb-2">
                  Nordic Flow Distribution AB
                </h3>
                <p data-brief-head className="font-mono text-[11.5px] text-ink-4">
                  Partihandel, tekniska komponenter · 64,8 MSEK · 28 anst. · Borås · grundat 2014
                </p>
                <p data-brief-head className="mt-4 text-[15px] md:text-[16px] text-ink font-medium leading-[1.55] tracking-[-0.01em]">
                  Tre lager, snabb tillväxt och en ny ekonomichef. Nu söker
                  bolaget någon som ska äga order- och lagerflödet.
                </p>
              </div>

              {/* The grade: one of four, with its words. The single loudest
                  thing on the page, and the only place it is stated. */}
              <div data-brief-head className="shrink-0 md:text-right md:pl-8 md:border-l md:border-ink/10">
                <div className="eyebrow text-ink-4 mb-2">Bedömning</div>
                <div className="flex md:justify-end items-baseline gap-3">
                  <span className="font-sans font-semibold text-[2.5rem] leading-none text-green-deep tracking-[-0.03em]">A</span>
                  <span className="font-sans font-semibold text-[1.05rem] text-ink tracking-[-0.01em]">Stark match</span>
                </div>
                <div className="mt-3 flex md:justify-end items-center gap-1.5" aria-hidden="true">
                  {GRADES.map(([g, w]) => (
                    <span
                      key={g}
                      title={w}
                      className={`font-mono text-[9.5px] uppercase tracking-[0.08em] leading-none px-2 py-1 rounded-sm border ${
                        g === 'A'
                          ? 'border-green-deep/40 bg-green-deep/8 text-green-deep'
                          : 'border-ink/10 text-ink-4/60'
                      }`}
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <p className="mt-2.5 text-[11.5px] text-ink-4 leading-[1.5] max-w-[28ch] md:ml-auto">
                  Stämmer mot er kravbild på erbjudande, storlek, systemmiljö
                  och beslutsroller. Behovet är uttalat av bolaget självt,
                  tidpunkten belagd.
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
                  Sedan i juni har tre saker hänt i bolaget: ett tredje lager
                  öppnade i Borås, en ny ekonomichef tillträdde, och nu söker
                  bolaget en systemansvarig med uppdraget att minska de manuella
                  momenten mellan de tre lagren. Var för sig är det vardag i ett
                  bolag som växer 18 procent om året. Tillsammans är det en
                  systemfråga som har blivit operativ, med en ny person som
                  äger den. Det är den situation ni säljer in i.
                </Block>
              </Group>

              <Group index="§02" title="Evidensöversikt">
                <div data-brief-block className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {[
                    ['ok', '7', 'bekräftade'],
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
                <Block title="Vad som skaver" badge="ok" source={<Source>Jobbannons · 27 augusti 2026</Source>}>
                  Bolaget söker en systemansvarig ”med uppdrag att effektivisera
                  order- och lagerflödena mellan bolagets tre lager och minska
                  manuella moment”, som ska ”ansvara för att utveckla
                  systemstödet för order, lager och leverans”. Friktionen är
                  alltså formulerad av bolaget självt, och den har fått en
                  ägare.
                </Block>
                <Block title="Vår tolkning" badge="mid">
                  Expansionen har gjort systemfrågan operativ. Nytt lager i
                  juni, ny ekonomichef i juli och ett uttalat ansvar för order-
                  och lagerflödet i augusti gör tidpunkten ovanligt relevant
                  för ett sammanhållet flöde från order till ekonomi. Ingen
                  enskild signal bevisar ett systembyte; det är kombinationen
                  som gör läget värt ett samtal nu.
                </Block>
                <Block title="Koppling till ert erbjudande">
                  Ni säljer ett sammanhållet flöde från order till ekonomi, till
                  handels- och tillverkningsbolag som har vuxit ur sina system.
                  Det är precis vad annonsen beskriver: tre lager, manuella
                  moment däremellan och en ekonomi som redan ligger i Fortnox.
                </Block>
              </Group>

              <Group index="§04" title="Ekonomi & bolagsfakta">
                <div className="grid sm:grid-cols-3 gap-5">
                  {[
                    ['Vad de gör', 'Distribuerar tekniska komponenter till installations- och industriföretag.'],
                    ['Hur de verkar', 'Tre lager sedan juni 2026, gemensam orderingång, flera leverantörsled.'],
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
                  <span className="text-[12px] text-ink-4">omsättning, räkenskapsåret 2025</span>
                  <Source>Bolagsverket · årsredovisning 2025</Source>
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
                <Block title="Timing">
                  Tre belagda händelser på tre månader: nytt lager i juni, ny
                  ekonomichef i juli, ny systemroll i augusti. Fönstret är
                  öppet nu och stängs sannolikt när rollen är tillsatt och ett
                  arbetssätt har satt sig. Det är därför Briefen levereras den
                  här veckan och inte nästa kvartal.
                </Block>
                <Block title="Vad vi inte vet" badge="low">
                  Om bolaget redan har bestämt sig för att utvärdera eller byta
                  systemstöd, och i så fall när. Ingen källa säger det. Det är
                  den första frågan att få svar på.
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
                <Block title="Den troligaste invändningen">
                  Bolaget har vuxit i tolv år utan ett sammanhållet system.
                  Invändningen blir därför inte priset utan ”det fungerar ju”.
                  Annonsen säger själv var det slutade fungera: mellan de tre
                  lagren. Det är där samtalet ska börja.
                </Block>
                <Block title="Konkurrenssituation">
                  Fortnox finns på plats för ekonomin och ett byte är
                  osannolikt. Det rimliga köpet är ett komplement som kopplar
                  order och lager till den ekonomi de redan har. En utlyst
                  roll kan också läsas av andra leverantörer; det talar för att
                  höra av sig nu, inte när rollen är tillsatt.
                </Block>
                <Block title="Operativ komplexitet">
                  Tre lager, en orderingång, flera leverantörsled. Tillräckligt
                  komplext för att ett manuellt flöde ska kosta, men inte så
                  komplext att ett införande blir ett projekt i sig.
                </Block>
              </Group>
            </div>

            {/* Decision column */}
            <aside className="lg:col-span-4 px-6 md:px-9 py-8 md:py-10 bg-paper-2 lg:bg-transparent border-t lg:border-t-0 border-ink/10">

              <Group index="§08" title="Beslutsfattare">
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
                    Öppna med lagret och rekryteringen, inte med systemet.
                    Behovet är operativt innan det blir ett IT-beslut. Ta
                    samtalet med ekonomichefen och låt honom beskriva flödet
                    innan ni beskriver er lösning.
                  </p>
                  <p className="mt-3 text-[13px] text-ink leading-[1.65] font-serif italic border-l-2 border-green-deep/40 pl-3">
                    ”Ni öppnade ert tredje lager i somras och söker nu någon
                    som ska utveckla order- och lagerflödet. Hur har
                    systemstödet hängt med i den förändringen?”
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
                  <span className="font-semibold text-ink">A, stark match.</span>{' '}
                  Behovet är uttalat av bolaget självt, i en annons som
                  beskriver just den friktion ni löser. Den som äger frågan är
                  ny i rollen, identifierad och nåbar. Tidpunkten är belagd:
                  tre händelser på tre månader, innan systemrollen är tillsatt.
                  Det vi inte vet står under Nästa steg, tillsammans med
                  frågorna som tar reda på det.
                </p>
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

        <div className="mt-6 grid md:grid-cols-12 gap-6">
          {/* How to read the document: evidence from analysis, at a glance. */}
          <div className="md:col-span-7 brief-legend">
            <div className="brief-legend-k">Så läser ni briefen</div>
            <dl className="brief-legend-list">
              <dt><Badge tier="ok" /></dt><dd>Uppgiften finns i en angiven källa.</dd>
              <dt><Badge tier="mid" /></dt><dd>Flera signaler pekar åt samma håll, men uppgiften är inte direkt bekräftad.</dd>
              <dt><Badge tier="low" /></dt><dd>Norrsyns tolkning. Något att pröva i samtalet, aldrig presenterat som fakta.</dd>
              <dt><b>A–D</b></dt><dd>Hur starkt bolaget matchar ert erbjudande och hur tydligt köpläget är.</dd>
            </dl>
          </div>
          <p className="md:col-span-5 font-mono text-[10.5px] text-ink-3 leading-[1.7]">
            Illustrativt demoexempel. Bolaget, siffrorna och personerna är
            fiktiva, och eventuella likheter med verkliga bolag eller personer
            är en tillfällighet. Strukturen, omdömena och konfidensnivåerna är
            produktens egna.
          </p>
        </div>
      </div>
    </section>
  );
}
