import React from 'react';

// ==========================================================================
// THE STORY — data and copy for the chapters. Kept apart from the
// components (chapters.jsx) so fast refresh keeps working.
// ==========================================================================

export const INTAKE = [
  { q: 'Vad säljer ni?', raw: '”Vi tar hand om hela flödet, från order till ekonomi.”', norm: 'Erbjudande' },
  { q: 'Vilka kan realistiskt köpa det?', raw: '”Handel och tillverkning. Bolag som hunnit växa lite.”', norm: 'Bransch' },
  { q: 'Vilken storlek är relevant?', raw: '”Under tjugo anställda finns det sällan budget.”', norm: 'Storlek' },
  { q: 'Vilka miljöer passar erbjudandet?', raw: '”Där det redan finns ett affärssystem som vuxit ur sig.”', norm: 'Systemmiljö' },
  { q: 'Vilka roller påverkar beslutet?', raw: '”Oftast ekonomichefen. Ibland en operativ chef.”', norm: 'Beslutsroller' },
  { q: 'Vad diskvalificerar ett bolag?', raw: '”Bemanningsbolag. Och allt som är nystartat.”', norm: 'Diskvalificerare' },
];
export const STRAND = { Erbjudande: 0, Bransch: 1, Storlek: 2, Systemmiljö: 3, Beslutsroller: 4, Diskvalificerare: 5 };
export const RAILS = ['Bransch', 'Storlek', 'Geografi', 'Systemmiljö', 'Diskvalificerare'];

/* The company, as it is named everywhere it appears. */
export const CASE = { name: 'Nordic Flow Distribution AB', sub: 'Partihandel · Borås · 28 anställda' };

/* The signals: a small, controlled set of colours for the different reasons
   a company attracts attention. They live only in 04 and 05; from the
   verdict on, everything returns to the page's green and neutrals. */
export const TONES = {
  rekrytering: '#E08A3C',
  beslut: '#D6609E',
  expansion: '#4FB3C9',
  system: '#45A57F',
};
export const TONE_LABEL = { rekrytering: 'Rekrytering', beslut: 'Ny beslutsfattare', expansion: 'Expansion', system: 'Systembyte' };

/* 04: which of the survivors light up, in order, and why. `at` picks the
   mark among the 39 survivors of 03 (a fraction of the list), so the same
   companies that held in 03 are the ones that stand out here. */
export const STANDOUTS = [
  { at: 0.14, tone: 'expansion', cand: 'hk' },
  { at: 0.33, tone: 'system' },
  { at: 0.58, tone: 'rekrytering', cand: 'nf', multi: ['rekrytering', 'beslut', 'expansion'] },
  { at: 0.72, tone: 'beslut', cand: 'si' },
  { at: 0.9, tone: 'rekrytering' },
];

/* 05: three of them, inspected against the requirement. The criteria are
   the OfferBrain's: fit that 03 already settled, the change, the person,
   the system environment — and the one that decides: whether what happened
   makes the company relevant for what the customer sells. */
export const CHECKS = ['Rätt storlek och geografi', 'Relevant förändring', 'Beslutsroll som går att nå', 'Systemmiljö som passar', 'Relevant för det ni säljer'];
export const CANDIDATES = [
  {
    key: 'hk', name: 'Hallands Kyl & Frys AB', sub: 'Partihandel · Falkenberg', tone: 'expansion',
    signals: ['Ny anläggning i Halmstad'],
    rows: [['ok'], ['ok', 'ny anläggning'], ['ok', 'operativ chef'], ['mid', 'okänd'], ['no', 'expansionen rör kyla, inte orderflödet']],
    verdict: 'stop',
  },
  {
    key: 'si', name: 'Svealands Industripartner AB', sub: 'Tillverkning · Örebro', tone: 'beslut',
    signals: ['Ny VD sedan i våras'],
    rows: [['ok'], ['mid', 'ledningsbyte, inget mer belagt'], ['no', 'ingen ekonomi- eller systemroll att nå'], ['mid', 'okänd'], ['no', 'inget belagt behov']],
    verdict: 'stop',
  },
  {
    key: 'nf', name: CASE.name, sub: 'Partihandel · Borås', tone: 'rekrytering',
    signals: ['Rekryterar systemansvarig', 'Ny ekonomichef', 'Tredje lagret öppnat'],
    rows: [['ok'], ['ok', 'tre signaler på sex månader'], ['ok', 'ny ekonomichef'], ['ok', 'molnekonomi, manuellt orderflöde'], ['ok', 'flödet är flaskhalsen']],
    verdict: 'go',
  },
];

/* The delivery the company lands in, as the portal lists it. */
export const PORTAL_ROWS = [
  { name: 'Nordic Flow Distribution AB', sub: 'Partihandel · Borås', grade: 'A', label: 'Stark match', hero: true },
  { name: 'Lindqvist Industrikomponenter AB', sub: 'Tillverkning · Eskilstuna', grade: 'A', label: 'Stark match' },
  { name: 'Mälardalens Grossist AB', sub: 'Partihandel · Västerås', grade: 'B', label: 'God match' },
];

/* ── Copy ───────────────────────────────────────────────────────────────── */
export const PH_BODY =
  'Behov, rätt person och rätt tidpunkt står inte i något register. Det är det vi tar reda på, bolag för bolag, innan ni lyfter luren.';
export const PH_HAND =
  'Därför börjar vi inte med en lista. Vi börjar med vad rätt betyder för er.';

// The funnel: ONE set of numbers used everywhere on the page — the six
// chapters, the market-over-time view and the Brief. Illustrative, and the
// same in every place so the reader can follow how many are left.
export const FUNNEL = [
  { k: 'universe', v: '31\u00a0000', l: 'i ert branschuniversum' },
  { k: 'cohort', v: '3\u00a0120', l: 'matchar er kravbild' },
  { k: 'held', v: '388', l: 'håller i granskningen' },
  { k: 'deep', v: '96', l: 'går till djupresearch' },
  { k: 'qualified', v: '24', l: 'kvalificerade' },
];

export const COPY = {
  s1: {
    n: '01', tag: '01 · Kravbilden', title: '”Först definierar vi vad rätt betyder.”',
    tally: { step: 0, note: 'aktiva bolag i ert branschuniversum' },
    body: (
      <>
        Det gör vi tillsammans med er. Vad ni säljer, vilka som realistiskt
        köper det och vad som gör ett bolag ointressant. Svaren blir er{' '}
        <span className="jr-term">OfferBrain</span>, kravbilden som resten
        av arbetet mäts mot.
      </>
    ),
    foot: 'Förenklat exempel på en kravbild. Er OfferBrain byggs ut med fler kriterier och mer detalj.',
  },
  s2: {
    n: '02', tag: '02 · Marknaden', title: '”Hela marknaden är inte er marknad.”',
    tally: { step: 1, note: 'kvar efter kravbilden' },
    body: (
      <>
        Er kravbild ringar in de bolag som är värda att undersöka: i det
        här exemplet 3&nbsp;120 av de 31&nbsp;000 bolagen i ert
        branschuniversum. Dem följer vi genom resten av processen.
      </>
    ),
    foot: 'Punkterna utanför ramen är branschuniversumet: 31\u00a0000 aktiva bolag i de branscher ni säljer till. Siffrorna är illustrativa; ett streck motsvarar tio bolag.',
  },
  s3: {
    n: '03', tag: '03 · Granskningen', title: '”Det mesta ska bort.”',
    tally: { step: 2, note: 'kvar efter granskningen' },
    body: 'Sedan sorterar vi bort de bolag som inte passar: fel bransch, fel storlek, fel geografi eller något som diskvalificerar direkt. Det steget är rent regelstyrt. Samma kravbild ger alltid samma urval, och ingenting slinker igenom för att det låter lovande.',
    foot: (
      <>
        Samma bolag som i 02: <span data-count3 className="jr-count">388</span>{' '}
        av 3&nbsp;120 håller. Resten ligger kvar som blekt bläck.
        Siffrorna är illustrativa.
      </>
    ),
  },
  s4: {
    n: '04', tag: '04 · Researchen', title: '”Bolagen som sticker ut granskas på djupet.”',
    tally: { step: 3, note: 'går till djupresearch' },
    body: 'Förändringar lämnar spår: en ny beslutsfattare, en rekrytering, ett nytt lager, ett systembyte. Vi bevakar bolagen som håller, och när något börjar hända går vi närmare.',
    foot: 'Förenklad illustration. Samma bolag som höll i 03; färgerna markerar olika slags signaler. Bolagen och signalerna är fiktiva.',
  },
  s5: {
    n: '05', tag: '05 · Bedömningen', title: '”Men intressant räcker inte.”',
    tally: { step: 4, note: 'kvalificerade av 96' },
    body: 'Ett bolag kan vara intressant utan att vara rätt för er. Varje kandidat prövas mot er kravbild från 01, och den avgörande frågan är alltid densamma: gör det som hänt bolaget relevant för det ni säljer?',
    foot: 'Förenklad illustration. Bolagen som håller får ett av fyra omdömen, A till D. Av 96 djupresearchade bolag går 24 vidare till leverans; resten faller på kravbilden.',
  },
  s6: {
    n: '06', tag: '06 · Briefen', title: '”De starkaste fallen blir Briefs.”',
    tally: { step: 4, note: 'levererade i briefs · 6 den här veckan' },
    body: (
      <>
        För varje bolag som håller hela vägen skriver vi en{' '}
        <span className="jr-term">Brief</span>: fakta med källa, tolkning
        märkt som tolkning, rätt personer och en konkret ingång till
        samtalet. En analytiker läser varje Brief innan den läggs i er portal.
      </>
    ),
    foot: 'Förenklad vy av er portal. Den riktiga är mer omfattande.',
  },
};

