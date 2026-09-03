import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { prefersReducedMotion, EASE } from '../lib/motion.js';
import '../tail.css';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// Handoff — the exhale after the Brief. Act III opens.
//
// One truth, stated positively: Norrsyn does not do the deal; it removes the
// guessing from the way in. The glyph closes the visual story and is drawn
// by the visitor's own scroll: the chosen company, the line (the Brief), and
// the open ring — the conversation, which stays human.
// ==========================================================================
export const Handoff = () => {
  const root = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      // Played once on arrival, never scrubbed: a scrubbed glyph reverses on
      // every flick of the wheel.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        defaults: { ease: 'power2.out' },
      });
      tl.from('.ho-mark', { opacity: 0, duration: 0.5 }, 0)
        .from('.ho-line', { scaleX: 0, duration: 0.9, ease: 'power2.inOut' }, 0.3)
        .from('.ho-ring', { opacity: 0, duration: 0.5 }, 1.1)
        .from('.ho-cap span', { opacity: 0, duration: 0.5, stagger: 0.15 }, 0.5);
      gsap.from('[data-ho]', {
        scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        y: 8, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power2.out',
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="overlamningen" ref={root} className="ho on-dark">
      {/* Dusk: the paper of the last light section falls into the dark, once. */}
      <div className="ho-dusk" aria-hidden="true" />
      <div className="ho-inner mx-auto max-w-3xl px-6 sm:px-10 py-28 md:py-40 text-center">
        <div className="ho-glyph" aria-hidden="true">
          <span className="ho-mark" />
          <span className="ho-line" />
          <span className="ho-ring" />
        </div>
        <div className="ho-cap" aria-hidden="true">
          <span>Rätt bolag</span>
          <span>Briefen</span>
          <span>Samtalet</span>
        </div>
        <h2
          data-ho
          className="font-sans font-semibold text-white text-[1.9rem] md:text-[2.6rem] leading-[1.12] tracking-[-0.03em] mb-6"
        >
          När säljaren tar över ska så lite som möjligt vara en gissning.
        </h2>
        <p data-ho className="text-white/72 text-[15px] md:text-base leading-[1.75] max-w-xl mx-auto mb-8">
          Affären avgörs fortfarande mellan människor. Vi avgör inte vad som
          händer i samtalet, men vi ser till att det finns ett verkligt skäl
          att ta det: rätt bolag, rätt personer, rätt läge och ett underlag
          som går att använda.
        </p>
        <p data-ho className="text-white font-medium text-[15px] md:text-[17px] max-w-xl mx-auto">
          En Brief är inte ett löfte om en affär. Det är vårt arbete för att
          så lite som möjligt ska lämnas åt slumpen innan första kontakten.
        </p>
      </div>
    </section>
  );
};

// ==========================================================================
// Fortsättningen — the market over time.
//
// A compact addendum after the Brief: the work does not stop at one delivery.
// One strip in the company-mark grammar shows a relevant market being worked
// through — investigated, qualified, remaining — with the remaining share in
// a muted violet that appears nowhere else on the site, so "not yet worked"
// reads as its own category rather than another green state. Proportions
// echo the demo cohort (3 120 of an 18 400-company relevant market) and are
// labelled illustrative. No fake live data.
// ==========================================================================
/* The portal's own market story, five stages, in the portal's own words.
   Proportions echo the demo cohort (3 120 searched of 5 900 estimated to match,
   inside an 18 400-company industry universe) and are labelled illustrative.
   No fake live data. */
const STAGES = [
  {
    v: '18 400', l: 'Ert branschuniversum', n: 'Aktiva bolag i de branscher ni säljer till.', k: 'universe',
    // The estimate belongs to the universe, as it does in the portal.
    ext: { v: '5 900', l: 'uppskattas matcha er profil', n: 'Statistisk uppskattning — inte en namnlista.' },
  },
  { v: '3 120', l: 'Genomsökta av Norrsyn', n: 'Hittills. Vi fortsätter tills hela uppskattningen är genomgången.', k: 'searched' },
  { v: '96', l: 'Har hittills kvalificerat sig', n: 'Djupresearch mot er kravbild.', k: 'qualified' },
  { v: '24', l: 'Levererade i briefs', n: 'Granskade av analytiker.', k: 'delivered' },
];

export const Tam = () => {
  const root = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-tam]', {
        scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
        y: 8, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'power2.out',
      });
      // The story resolves top to bottom: the market being worked through.
      gsap.from('.mp-row', {
        scrollTrigger: { trigger: '.mp', start: 'top 82%', once: true },
        opacity: 0, y: 6, duration: 0.9, stagger: 0.1, delay: 0.15, ease: 'power2.out',
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="fortsattningen" ref={root} className="bg-mist border-t border-ink/8">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-12 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-6">
            <div data-tam className="eyebrow text-ink-4 mb-4">Er marknad över tid</div>
            <h2
              data-tam
              className="font-sans font-semibold text-ink text-[1.6rem] md:text-[2.1rem] leading-[1.15] tracking-[-0.03em] mb-4 max-w-xl"
            >
              Vi fortsätter tills den relevanta marknaden är genomarbetad.
            </h2>
            <p data-tam className="text-ink-3 text-[14.5px] md:text-[15px] leading-[1.7] max-w-lg mb-4">
              Varje leverans arbetar igenom en del av marknaden. I portalen ser
              ni hela vägen: hur stort ert branschuniversum är, hur många som
              uppskattas matcha er profil, hur mycket vi har gått igenom, vad
              som har kvalificerat sig och vad som har levererats.
            </p>
            <p data-tam className="text-ink text-[14.5px] md:text-[15px] font-medium leading-[1.7] max-w-lg">
              Vi håller reda på vad som är undersökt, vad som har kvalificerat
              sig och vad som återstår. Ingenting försvinner mellan leveranserna.
            </p>
          </div>
          <div className="md:col-span-6 md:pt-1">
            <div data-tam className="eyebrow text-ink-4 mb-5">Er marknad · exempelvy från portalen</div>
            <ol className="mp" aria-label="Er marknad i fem steg">
              {STAGES.map((st) => (
                <li key={st.k} className="mp-row" data-stage={st.k}>
                  <span className="mp-value">{st.v}</span>
                  <span>
                    <span className="mp-label">{st.l}</span>
                    <span className="mp-note">{st.n}</span>
                    {st.ext && (
                      <span className="mp-ext">
                        <b>{st.ext.v}</b> {st.ext.l}
                        <span className="mp-note">{st.ext.n}</span>
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
            <p data-tam className="tam-note">
              Illustrativa siffror. Vyn finns under Översikt i er portal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================================================
// På er radar — On-demand Account Intelligence.
//
// The second door into the same machine. The whole page up to here says
// "Norrsyn finds the accounts"; this section completes the sentence: "and
// when you already know the accounts, send them in." One artifact carries
// the story: the customer's own list (in the portal's paper grammar) feeds
// the research engine and comes back as an intelligence card (in the Brief's
// document grammar) — same tiers, same honesty. The second outcome line,
// "Begränsat underlag", is deliberate: honest absence of evidence is part of
// the product, and showing it here inoculates the promise against hype.
//
// Motion contract as everywhere: defaults are the final state; GSAP rewinds
// and animates only when motion is allowed.
// ==========================================================================
const OD_ACCOUNTS = [
  'Skandinavisk Verkstadsteknik AB',
  'Baltzar Components AB',
  'Viggo Logistik AB',
  'Nordana Emballage AB',
];

export const OnDemand = () => {
  const root = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-od]', {
        scrollTrigger: { trigger: root.current, start: 'top 76%', once: true },
        y: 8, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'power2.out',
      });
      // The handover reads left to right: the list settles, the link asserts
      // itself, and only then does the intelligence exist.
      gsap.from('.od-list .od-row', {
        scrollTrigger: { trigger: '.od-flow', start: 'top 80%', once: true },
        opacity: 0, y: 5, duration: 0.8, stagger: 0.08, delay: 0.15, ease: 'power2.out',
      });
      gsap.from('.od-link', {
        scrollTrigger: { trigger: '.od-flow', start: 'top 80%', once: true },
        opacity: 0, duration: 0.7, delay: 0.75, ease: 'power2.out',
      });
      gsap.from('.od-card, .od-alt', {
        scrollTrigger: { trigger: '.od-flow', start: 'top 80%', once: true },
        opacity: 0, y: 8, duration: 1.0, stagger: 0.12, delay: 0.95, ease: 'power2.out',
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="pa-er-radar" ref={root} className="bg-paper border-t border-ink/8">
      <div className="mx-auto max-w-5xl px-6 sm:px-10 py-20 md:py-28">
        <div data-od className="eyebrow text-green-deep mb-4">På er radar</div>
        <h2
          data-od
          className="font-sans font-semibold text-ink text-[1.5rem] md:text-[1.9rem] leading-[1.15] tracking-[-0.03em] mb-4 max-w-2xl"
        >
          Redan bolag i sikte? Skicka dem till oss.
        </h2>
        <p data-od className="text-ink-3 text-[14.5px] md:text-[15px] leading-[1.7] max-w-xl mb-3">
          Norrsyn hittar löpande nya möjligheter i er marknad. Men vissa bolag
          vet ni redan att ni vill vinna — strategiska accounts, drömkunder,
          bolag ert säljteam pekat ut.
        </p>
        <p data-od className="text-ink-3 text-[14.5px] md:text-[15px] leading-[1.7] max-w-xl mb-3">
          De bolagen researchar vi på djupet mot er kravbild: var de står i dag,
          vilka signaler som går att belägga, vilka personer som är rätt att
          tala med — och en ärlig bedömning av om läget är rätt.
        </p>
        <p data-od className="text-ink text-[14.5px] md:text-[15px] font-medium leading-[1.7] max-w-xl mb-10">
          Vi kallar det <span className="jr-term">On-demand Account Intelligence</span>.
        </p>

        {/* The artifact: your list in, intelligence out. */}
        <div data-od className="od-flow" aria-hidden="true">
          <div className="od-list">
            <div className="od-list-bar">
              <span className="eyebrow text-ink-3">Era accounts</span>
              <span className="od-mono">4 bolag</span>
            </div>
            <ul>
              {OD_ACCOUNTS.map((name) => (
                <li key={name} className="od-row">
                  <span className="jm" data-state="chosen" />
                  <span className="od-row-name">{name}</span>
                </li>
              ))}
            </ul>
            <div className="od-send">
              Skicka till Norrsyn
              <ArrowRight size={12} strokeWidth={2.25} />
            </div>
          </div>

          <div className="od-link">
            <span className="od-link-line" />
            <span className="od-link-label">djupresearch mot er kravbild</span>
            <span className="od-link-line" />
          </div>

          <div className="od-result">
            <article className="od-card">
              <header className="od-card-head">
                <span className="eyebrow text-green-deep">Account Intelligence</span>
                <span className="od-mono">På er begäran</span>
              </header>
              <div className="od-card-name">Skandinavisk Verkstadsteknik AB</div>
              <div className="od-card-sub">Verkstadsindustri · Eskilstuna · 46 anställda</div>
              <ul className="od-facts">
                <li><span>Bedömning</span><span className="od-fact-v">A · Stark match</span></li>
                <li><span>Bekräftade signaler</span><span className="od-fact-v">4 <i className="jr-tier jt-ok">Bekräftad</i></span></li>
                <li><span>Relevanta personer</span><span className="od-fact-v">3 · e-post verifierad</span></li>
                <li><span>Timing</span><span className="od-fact-v">Öppet fönster — rekryterar systemansvarig</span></li>
              </ul>
              {/* The tell that this is a document, not a scoreboard: the four
                  rows above are the masthead of a full, reviewed Brief. */}
              <div className="od-open">
                Öppna brief
                <ArrowRight size={11} strokeWidth={2.25} />
              </div>
            </article>
            {/* Honesty is part of the artifact: one of the four came back
                with too little verified evidence, and we say so. */}
            <div className="od-alt">
              <span className="jm" data-dim="1" />
              <span className="od-alt-name">Baltzar Components AB</span>
              <span className="jr-tier jt-low">Begränsat underlag</span>
            </div>
          </div>
        </div>

        <div data-od className="od-steps">
          {[
            ['01', 'Ni skickar bolagen', 'I portalen, under Account Intelligence. Bolagsnamn räcker; org.nr och webbplats om ni har dem. Vi bekräftar upplägg och pris.'],
            ['02', 'Vi gör researchen', 'Med samma källkrav som allt annat vi levererar: signaler, personer och timing, lästa mot er kravbild.'],
            ['03', 'En analytiker granskar', 'Tolkningar märks som tolkningar. Hittar vi inte belägg för köpläge säger vi det rakt ut.'],
            ['04', 'Leverans i portalen', 'Resultatet publiceras som en leverans i er portal, bredvid de övriga.'],
          ].map(([n, t, b]) => (
            <div key={n} className="od-step">
              <span className="od-step-n">{n}</span>
              <span className="od-step-t">{t}</span>
              <span className="od-step-b">{b}</span>
            </div>
          ))}
        </div>
        <p data-od className="tam-note max-w-2xl">
          Illustrativt exempel. Bolagen och siffrorna är fiktiva.
        </p>
        <p data-od className="od-abm">
          För team som arbetar account-baserat (ABM) fungerar Norrsyn som
          research-lagret: vi bevakar marknaden löpande, och era utvalda
          accounts analyseras på djupet när ni behöver det.
        </p>
      </div>
    </section>
  );
};

// ==========================================================================
// About — who we are, and the three rules every Brief is held to.
// ==========================================================================
const PRINCIPLES = [
  ['01', 'Allt går att belägga', 'Varje faktauppgift i en Brief har en källa ni kan öppna själva. Det som saknar källa kallar vi hypotes, aldrig fakta.'],
  ['02', 'Tolkning märks som tolkning', 'Vår analys är värdefull för att den hålls isär från fakta. Ni ser alltid vad som är belagt, vad som är troligt och vad som är vår bedömning.'],
  ['03', 'Kvalitet före volym', 'Ett fåtal bolag där en affär är rimlig är värda mer än tusen namn utan skäl. Vi levererar hellre färre Briefs än en enda som inte håller.'],
];

export const About = () => {
  const root = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-about]', {
        scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
        y: 8, opacity: 0, duration: 1.1, stagger: 0.09, ease: 'power2.out',
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="om-norrsyn" ref={root} className="on-dark bg-forest text-white">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-12 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <div data-about className="eyebrow text-white/55 mb-6">Om Norrsyn</div>
            <h2
              data-about
              className="font-sans font-semibold text-white text-[1.9rem] md:text-[2.4rem] leading-[1.12] tracking-[-0.035em]"
            >
              Vi gör grundarbetet inför era viktigaste samtal.
            </h2>
          </div>
          <div className="md:col-span-8 md:pl-6 grid sm:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-5 text-white/72 text-[15px] leading-[1.75]">
              <p data-about>
                Norrsyn finns av ett enkelt skäl: säljare lägger sin bästa tid på
                bolag som ingen har hunnit titta närmare på. Det vill vi ändra på.
              </p>
              <p data-about>
                Vi bevakar den svenska B2B-marknaden löpande och läser varje
                bolag mot er kravbild: vad som har hänt, vad det betyder för
                just ert erbjudande och vem som äger frågan. Offentliga
                register, finansiell historik, rekryteringar, pressflöden och
                bolagens egna kanaler vägs samman till en bedömning som en
                analytiker står bakom.
              </p>
            </div>
            <div className="space-y-5 text-white/72 text-[15px] leading-[1.75]">
              <p data-about>
                Vi utgår från Jönköping, mitt i det Sverige vi arbetar igenom.
                Våra kunder säljer B2B på den svenska marknaden och vet vem de
                vill nå, oavsett var de själva sitter.
              </p>
              <p data-about>
                Det vi lämnar ifrån oss är aldrig listor. Det är ett fåtal
                genomarbetade Briefs där en affär är rimlig, med källorna öppna
                så att era säljare kan bedöma dem själva.
              </p>
            </div>
          </div>
        </div>

        <div data-about className="ab-principles">
          {PRINCIPLES.map(([n, t, b]) => (
            <div key={n} className="ab-p">
              <span className="ab-p-n">Princip {n}</span>
              <span className="ab-p-t">{t}</span>
              <span className="ab-p-b">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================================================
// Contact
// ==========================================================================
export const Contact = () => {
  const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '', description: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', company: '', email: '', phone: '', description: '' });
        setTimeout(() => setStatus('idle'), 6000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (err) {
      console.error('Submission failed', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const field =
    'w-full bg-white/[0.04] border border-white/12 rounded-md px-3.5 py-3 text-white text-[15px] ' +
    'placeholder:text-white/45 focus:outline-none focus:border-green/60 transition-colors';

  return (
    <section id="kontakt" className="ct on-dark text-white">

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 md:px-12 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="eyebrow text-white/50 mb-6">Kontakt</div>
            <h2 className="font-sans font-semibold text-[2.1rem] md:text-[2.9rem] leading-[1.08] tracking-[-0.035em] mb-6">
              Vi börjar med ett samtal.
            </h2>
            <p className="text-white/72 text-[15px] leading-[1.75] max-w-sm mb-10">
              Berätta kort vad ni gör, så hör vi av oss. Vi pratar igenom vad
              ni säljer och vart ni vill, och ser tillsammans om Norrsyn är
              rätt för er.
            </p>
            {/* One quiet human alternative instead of a benefits checklist.
                Whitespace does the rest of the composition's work. */}
            <p className="text-white/60 text-[13px] leading-[1.7] border-t border-white/10 pt-4 max-w-sm">
              Föredrar ni mejl?{' '}
              <a href="mailto:info@norrsyn.se" className="link-underline text-white/75">info@norrsyn.se</a>
            </p>
          </div>

          <div className="md:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                  <label htmlFor="c-name" className="eyebrow text-white/55 block">Namn</label>
                  <input id="c-name" type="text" name="name" required value={formData.name} onChange={handleChange} className={field} placeholder="Förnamn Efternamn" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="c-company" className="eyebrow text-white/55 block">Företag</label>
                  <input id="c-company" type="text" name="company" required value={formData.company} onChange={handleChange} className={field} placeholder="Företagsnamn AB" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                  <label htmlFor="c-email" className="eyebrow text-white/55 block">E-post</label>
                  <input id="c-email" type="email" name="email" required value={formData.email} onChange={handleChange} className={field} placeholder="namn@foretag.se" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="c-phone" className="eyebrow text-white/55 block">Telefon</label>
                  <input id="c-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} className={field} placeholder="070 123 45 67" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="c-desc" className="eyebrow text-white/55 block">Berätta kort om ert företag</label>
                <textarea id="c-desc" rows="4" name="description" value={formData.description} onChange={handleChange} className={`${field} resize-none`} placeholder="Vad gör ni, och har ni någon fråga?" />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className={`btn w-full px-7 py-4 font-semibold text-[15px] ${
                    status === 'success'
                      ? 'bg-green-deep/20 border border-green/40 text-green-hi'
                      : status === 'error'
                        ? 'bg-amber/15 border border-amber/40 text-amber'
                        : 'bg-paper text-graphite hover:bg-white'
                  }`}
                >
                  {status === 'loading' && 'Skickar …'}
                  {status === 'success' && 'Tack. Vi har tagit emot er förfrågan och hör av oss.'}
                  {status === 'error' && 'Kunde inte skicka. Maila info@norrsyn.se så löser vi det.'}
                  {status === 'idle' && (<>Skicka <ArrowRight size={17} strokeWidth={2.2} /></>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================================================
// Footer
//
// The "SYSTEM OPERATIVT" pulse is gone: it reported nothing, and a status dot
// that is always green is theatre. The roadmap items stay — they are genuine —
// but they are stated once, quietly, without a badge that blinks.
// ==========================================================================
export const Footer = () => (
  <footer className="on-dark bg-forest text-white border-t border-white/8">
    <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-12 pt-20 pb-10">
      <div className="grid md:grid-cols-12 gap-12 md:gap-10 pb-16 md:pb-20">
        <div className="md:col-span-5">
          <div className="font-sans font-bold text-lg tracking-[0.22em] uppercase mb-5">
            Norrsyn<span className="text-green">_</span>
          </div>
          <p className="text-white/55 text-[14px] leading-[1.7] max-w-xs mb-6">
            Vi identifierar affärsmöjligheter för B2B-bolag genom research, analys
            av affärssignaler och kontext inför första kontakt.
          </p>
          {/* The legal entity, stated once in prose and once in the copyright
              line. The brand still reads as Norrsyn everywhere else. */}
          <p className="text-white/55 text-[13px] leading-[1.7] max-w-xs mb-6">
            Norrsyn är ett varumärke och en tjänst från{' '}
            <span className="text-white/75">NRSYN AB</span>, Jönköping.
            Ej att förväxla med Norrsyn AI HB.
          </p>
          <div className="font-mono text-[12.5px] text-white/55 space-y-1">
            <a href="mailto:info@norrsyn.se" className="link-underline block w-fit">info@norrsyn.se</a>
            <p className="text-white/50">Jönköping, Sverige</p>
          </div>
        </div>

        <div className="md:col-span-3 md:col-start-7">
          <div className="eyebrow text-white/55 mb-5">Navigation</div>
          <ul className="space-y-2.5 text-white/55 text-[14px]">
            {[['#processen', 'Processen'], ['#brief', 'Brief'], ['#om-norrsyn', 'Om oss'], ['#kontakt', 'Kontakt']].map(([h, l]) => (
              <li key={h}><a href={h} className="link-underline">{l}</a></li>
            ))}
          </ul>
          {/* The customer portal, introduced quietly where a returning
              customer would look for it — and as a crawlable link so the
              subdomain enters the search graph. */}
          <div className="eyebrow text-white/55 mt-8 mb-3">Kund hos oss?</div>
          <p className="text-white/50 text-[13px] leading-[1.7] mb-2 max-w-[16rem]">
            Era Briefs och leveranser finns i portalen.
          </p>
          <a
            href="https://app.norrsyn.se"
            className="link-underline inline-flex items-center gap-1.5 text-[14px] text-white/75"
          >
            app.norrsyn.se <ArrowUpRight size={13} />
          </a>
        </div>

        <div className="md:col-span-3">
          <div className="eyebrow text-white/55 mb-5">Information</div>
          <ul className="space-y-2.5 text-white/55 text-[14px]">
            <li><a href="/integritetspolicy" className="link-underline">Integritetspolicy</a></li>
            <li><a href="/anvandarvillkor" className="link-underline">Användarvillkor</a></li>
            <li><a href="/cookiepolicy" className="link-underline">Cookiepolicy</a></li>
          </ul>
          <div className="eyebrow text-white/55 mt-8 mb-3">Planerat</div>
          <ul className="space-y-2 text-white/50 text-[14px]">
            {['Insikter', 'Case', 'LinkedIn'].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* The umbrella statement for every diagram and demo on the page: the
          illustrations teach the ideas; the product is the larger thing. The
          Brief demo keeps its own fictional-company clause — this covers the
          rest, once, where fine print professionally lives. */}
      <p className="pt-7 border-t border-white/10 font-mono text-[11px] leading-[1.8] text-white/45 max-w-3xl">
        Illustrationer och exempel på den här webbplatsen är medvetet förenklade —
        de finns för att förklara arbetssättet och idéerna, inte för att avbilda
        systemet. Verkliga Briefs, portalen och analysarbetet är väsentligt mer
        omfattande och detaljerade än vad som visas här.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono text-[11.5px] text-white/50">
        <p>© 2026 NRSYN AB</p>
        <a href="#start" className="link-underline flex items-center gap-1.5">
          Till toppen <ArrowUpRight size={12} />
        </a>
      </div>
    </div>
  </footer>
);
