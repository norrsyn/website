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

/* Each finding, and how it reads against the OfferBrain's three questions:
   does it fit the requirement (krav), does it strengthen the need (behov),
   does it point to the right person (person). */
export const EVIDENCE = [
  { text: 'Rekryterar systemansvarig för order och lager', src: 'Jobbannons', tier: 'ok',
    crit: 'Systemmiljö', verdict: 'Matchar',
    read: { krav: 'Systemmiljö', behov: 'Stärker', person: 'Ny systemroll' } },
  { text: 'Ny ekonomichef sedan i höstas', src: 'LinkedIn', tier: 'ok',
    crit: 'Beslutsroller', verdict: 'Matchar',
    read: { krav: 'Beslutsroller', behov: '', person: 'Ekonomichef' } },
  { text: 'Öppnat ett tredje lager', src: 'Pressmeddelande', tier: 'ok',
    crit: 'Storlek', verdict: 'Stärker',
    read: { krav: 'Storlek', behov: 'Stärker', person: '' } },
  { text: 'Ekonomiflödet ligger i ett molnsystem', src: 'Jobbannons', tier: 'mid',
    crit: 'Systemmiljö', verdict: 'Matchar',
    read: { krav: 'Systemmiljö', behov: '', person: '' } },
  { text: 'Orderflödet delvis manuellt', src: 'Vår tolkning', tier: 'low',
    crit: 'Erbjudande', verdict: 'Osäkert',
    read: { krav: 'Erbjudande', behov: 'Kärnan', person: '' } },
];
/* The finding that sounds good and counts for nothing — the point of 05. */
export const DECOY = {
  text: 'Utsedd till Årets grossist 2025', src: 'Pressmeddelande', tier: 'ok',
  crit: '', verdict: 'Väger inte', note: 'Låter bra. Ingen koppling till er kravbild.',
};
export const TIER = { ok: ['Bekräftat', 'jt-ok'], mid: ['Troligt', 'jt-mid'], low: ['Hypotes', 'jt-low'] };
export const CRIT_NOTE = {
  Bransch: 'Prövad i 03 · uppfylld',
  Diskvalificerare: 'Prövad i 03 · ingen träff',
};

/* ── Copy ───────────────────────────────────────────────────────────────── */
export const PH_BODY =
  'Behov, rätt person och rätt tidpunkt står inte i något register. Det är det vi tar reda på, bolag för bolag, innan ni lyfter luren.';
export const PH_HAND =
  'Därför börjar vi inte med en lista. Vi börjar med vad rätt betyder för er.';

export const COPY = {
  s1: {
    n: '01', tag: '01 · Kravbilden', lead: 'Vad betyder rätt bolag för er?', title: 'Det avgör vi innan vi letar.',
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
    n: '02', tag: '02 · Marknaden', lead: 'Hela marknaden är inte er marknad.', title: 'Kravbilden ringar in den som är.',
    body: (
      <>
        Av alla bolag i Sverige är det en avgränsad del som är värd att
        undersöka för er. I det här exemplet: 3&nbsp;120 bolag, som vi
        följer genom resten av processen.
      </>
    ),
    foot: 'Punkterna utanför ramen är den bredare möjliga marknaden. Siffrorna är illustrativa; ett streck motsvarar tio bolag.',
  },
  s3: {
    n: '03', tag: '03 · Granskningen', lead: 'Det mesta ska bort.', title: 'Samma regler för alla, varje gång.',
    body: 'Sedan sorterar vi bort de bolag som inte passar: fel bransch, fel storlek, fel geografi eller något som diskvalificerar direkt. Steget är rent regelstyrt, så ingenting slinker igenom för att det låter lovande.',
    foot: (
      <>
        Samma bolag som i 02: <span data-count3 className="jr-count">388</span>{' '}
        av 3&nbsp;120 håller. Resten ligger kvar som blekt bläck.
        Siffrorna är illustrativa.
      </>
    ),
  },
  s4: {
    n: '04', tag: '04 · Researchen', lead: 'De som håller granskas på djupet.', title: 'Vad har hänt, och vad betyder det för er?',
    body: (
      <>
        Vi läser bolaget från flera håll och letar efter vad som faktiskt
        har förändrats. Samma händelse betyder olika saker för olika
        erbjudanden, så varje fynd läses mot er{' '}
        <span className="jr-term">OfferBrain</span>: kravbild, behov och
        rätt person.
      </>
    ),
    foot: 'Förenklad illustration. 96 bolag går till djupresearch. Källorna är kategorier, aldrig namngivna leverantörer. Varje fynd bär sin konfidensnivå och läses mot kravbilden, behovsbilden och rätt person.',
  },
  s5: {
    n: '05', tag: '05 · Bedömningen', lead: 'Intressant räcker inte.', title: 'Bara det som gör bolaget rätt för er väger.',
    body: 'Ett bolag kan vara intressant utan att vara rätt för er. Därför prövar vi varje fynd mot kravbilden från steg 01. Ett fynd som inte gör bolaget mer relevant för ert erbjudande får inte väga tyngre bara för att det låter bra.',
    foot: 'Förenklad illustration. Varje fynd bedöms som matchar, stärker, osäkert eller väger inte. Bolaget som helhet får ett av fyra omdömen, A till D, där A är en stark match. Av 96 djupanalyserade bolag håller 24 hela vägen.',
  },
  s6: {
    n: '06', tag: '06 · Briefen', lead: 'De starkaste fallen blir Briefs.', title: 'Fakta, tolkning och en ingång till samtalet.',
    body: (
      <>
        För varje bolag som håller hela vägen skriver vi en{' '}
        <span className="jr-term">Brief</span>: fakta med källa, tolkning
        märkt som tolkning, rätt personer och en konkret ingång till
        samtalet. En analytiker läser varje Brief innan den lämnar oss.
      </>
    ),
    foot: 'Förenklade illustrationer. Både Briefen och portalen är mer omfattande i verkligheten; nedan följer ett komplett exempel på hur en Brief faktiskt ser ut.',
  },
};

