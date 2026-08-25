import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { prefersReducedMotion, EASE } from '../lib/motion.js';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// Problemet — the bridge.
//
// Rebuilt from scratch. The old composition (rail + terminals + a numbered
// three-row list) read as a website diagram; this is an editorial argument:
//
//   A FIELD of quiet marks — the companies a register knows exist.
//   THREE HOLLOW SLOTS — the intelligence the register does not contain:
//   need, person, timing.
//
// The thread arrives from the hero still unresolved: it crosses the seam,
// steps quietly into the left gutter, descends PAST the field of existing
// companies — able to see them, unable to choose among them — and ends in an
// open ring. That inability is the section's thesis, and the closing line
// hands it to chapter 01: to find the right companies, we first have to
// define what right means.
//
// Fog survives the photographic boundary: a soft apron drifts over the first
// reach of the dark, so the atmosphere surrenders gradually instead of ending.
// ==========================================================================
export const Philosophy = () => {
  const root = useRef(null);

  useEffect(() => {
    let cleanupRoute = () => {};
    const ctx = gsap.context(() => {
      // The route: from the hero trunk's landing, one quiet step left into the
      // gutter, then down past the field to the open terminal. Deterministic
      // viewport geometry — the glide runs at y≈64px, above every glyph.
      const layoutRoute = () => {
        const el = root.current;
        if (!el) return;
        const W = document.documentElement.clientWidth;
        const H = el.offsetHeight;
        const tx = Math.max(0.5 * W, 700);
        const gx = Math.max(16, W / 2 - 576 + 17.6) + 1;
        // One gesture, not an outline: the thread lands from the hero, and a
        // single long sweep carries it from the centre axis into the left
        // margin, through the fog apron, above every glyph. Then it descends
        // as editorial structure.
        const d = [
          `M ${tx} -2`,
          `L ${tx} 28`,
          `C ${tx} 150, ${gx} 60, ${gx} 190`,
          `L ${gx} ${H + 2}`,
        ].join(' ');
        el.querySelectorAll('[data-route]').forEach((p) => p.setAttribute('d', d));
        // The excursion: at the register's height the line regards the field —
        // a short deliberate tick toward it, ending in the open ring it cannot
        // close. Able to see the companies, unable to choose among them.
        const field = el.querySelector('[data-ph-field]');
        const tick = el.querySelector('[data-ring-tick]');
        const ring = el.querySelector('[data-ring]');
        if (field && tick && ring) {
          const fr = field.getBoundingClientRect();
          const er = el.getBoundingClientRect();
          const fy = fr.top - er.top + fr.height * 0.5;
          tick.setAttribute('d', `M ${gx} ${fy} L ${gx + 22} ${fy}`);
          ring.style.left = `${gx + 29}px`;
          ring.style.top = `${fy}px`;
        }
      };
      layoutRoute();
      window.addEventListener('resize', layoutRoute);
      cleanupRoute = () => window.removeEventListener('resize', layoutRoute);

      if (prefersReducedMotion()) return;

      // The route, the ring and the slot activations are engine-driven
      // (src/lib/thread.js). Only content text animates here.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 58%', once: true },
        defaults: { ease: 'power2.out' },
      });
      tl.from('[data-phil-line]', { yPercent: 105, duration: 1.05, stagger: 0.1 })
        .from('[data-ph-copy]', { opacity: 0, y: 10, duration: 0.9 }, 0.4)
        .from('[data-ph-field]', { opacity: 0, duration: 1.2 }, 0.5)
        .from('[data-ph-hand]', { opacity: 0, y: 10, duration: 0.9 }, 1.7);
    }, root);
    return () => {
      cleanupRoute();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="varfor-norrsyn"
      className="on-dark jr-dark relative overflow-hidden bg-graphite text-white"
    >
      {/* Fog surviving the photographic boundary. */}
      <div className="ph-fog" aria-hidden="true" />

      {/* The unresolved strand and its open terminal. */}
      <svg className="ph-route" aria-hidden="true">
        <path data-route fill="none" />
        <path data-ring-tick fill="none" />
      </svg>
      <span data-ring className="ph-ring" aria-hidden="true" />

      <div className="jr-inner">
        <div className="eyebrow text-white/50 mb-8 md:mb-10">Problemet</div>

        <h2 className="max-w-4xl mb-10 md:mb-12">
          <span className="reveal-mask">
            <span
              data-phil-line
              className="block font-sans font-semibold text-white
                         text-[2.2rem] sm:text-5xl md:text-[3.7rem] leading-[1.04] tracking-[-0.035em]"
            >
              Leadlistor
            </span>
          </span>
          <span className="reveal-mask">
            <span
              data-phil-line
              className="display block text-[#E7E1D4]
                         text-[2.6rem] sm:text-[3.6rem] md:text-[4.5rem] leading-[1.02]"
            >
              räcker inte längre.
            </span>
          </span>
        </h2>

        <p data-ph-copy className="text-white/65 text-[15px] md:text-base leading-[1.75] max-w-md mb-14 md:mb-16">
          Ett register talar om vilka bolag som finns. Det säger ingenting om
          vilka som har ett verkligt skäl att köpa, vem som äger frågan, eller
          varför just nu.
        </p>

        {/* The field, and what the list cannot see. */}
        <div className="ph-grid">
          <div>
            <div className="eyebrow text-white/40 mb-4">Bolag som existerar</div>
            <div data-ph-field className="ph-field" aria-hidden="true">
              {Array.from({ length: 912 }, (_, i) => <i key={i} />)}
            </div>
          </div>
          <div className="ph-slots">
            <div className="eyebrow text-white/40 mb-4">Vad listan inte vet</div>
            {[
              ['behov', 'Behov', 'Finns det ett verkligt skäl att köpa?'],
              ['person', 'Person', 'Vem äger frågan internt?'],
              ['timing', 'Timing', 'Varför är det läge just nu?'],
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

        <p data-ph-hand className="mt-16 md:mt-20 max-w-2xl text-white text-[17px] md:text-[19px] leading-[1.6] font-medium tracking-[-0.015em]">
          För att hitta rätt bolag måste vi först definiera vad rätt betyder.
          Det är där arbetet börjar.
        </p>
      </div>
    </section>
  );
};

// ==========================================================================
// Handoff — the exhale after the Brief.
//
// One truth, stated positively: Norrsyn does not do the deal; it removes the
// guessing from the way in. The glyph closes the visual story — a chosen
// company, a line, and an open ring: the conversation, which stays human.
// ==========================================================================
export const Handoff = () => {
  const root = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-ho]', {
        scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        y: 14, opacity: 0, duration: 0.9, stagger: 0.12, ease: EASE.out,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="overlamningen" ref={root} className="bg-paper">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 py-28 md:py-40 text-center">
        <div data-ho className="ho-glyph" aria-hidden="true">
          <span className="ho-mark" />
          <span className="ho-line" />
          <span className="ho-ring" />
        </div>
        <h2
          data-ho
          className="font-sans font-semibold text-ink text-[1.7rem] md:text-[2.3rem] leading-[1.15] tracking-[-0.03em] mb-6"
        >
          När säljaren tar över ska så lite som möjligt vara en gissning.
        </h2>
        <p data-ho className="text-ink-3 text-[15px] md:text-base leading-[1.75] max-w-xl mx-auto mb-8">
          Affären avgörs fortfarande mellan människor. Vi avgör inte vad som
          händer i samtalet, men vi ser till att det finns ett verkligt skäl
          att ta det: rätt bolag, rätt personer, rätt läge och ett underlag
          som går att använda.
        </p>
        <p data-ho className="text-ink font-medium text-[15px] md:text-[17px] max-w-xl mx-auto">
          En Brief är inte ett löfte om en affär. Det är vårt arbete för att
          så lite som möjligt ska lämnas åt slumpen innan första kontakten.
        </p>
      </div>
    </section>
  );
};

// ==========================================================================
// About
// ==========================================================================
export const About = () => {
  const root = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-about]', {
        scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
        y: 16, opacity: 0, duration: 0.9, stagger: 0.09, ease: EASE.out,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="om-norrsyn" ref={root} className="bg-paper-2 border-t border-ink/8">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-12 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <div data-about className="eyebrow text-ink-4 mb-6">Om Norrsyn</div>
            <h2
              data-about
              className="font-sans font-semibold text-ink text-[1.9rem] md:text-[2.4rem] leading-[1.12] tracking-[-0.035em]"
            >
              Kvalitet slår volym, varje gång.
            </h2>
          </div>
          <div className="md:col-span-8 md:pl-6 grid sm:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-5 text-ink-3 text-[15px] leading-[1.75]">
              <p data-about>
                Vi finns för att lösa ett konkret problem i B2B-försäljning: säljare
                lägger sin bästa tid på bolag ingen har tittat närmare på.
              </p>
              <p data-about>
                Genom att gå igenom svenska bolag kontinuerligt ser vi var behov och
                affärssituationer håller på att uppstå, och vi kan belägga det.
              </p>
            </div>
            <div className="space-y-5 text-ink-3 text-[15px] leading-[1.75]">
              <p data-about>
                Därför levererar vi inte listor. Vi levererar ett fåtal genomarbetade
                Briefs där en affär är rimlig, med källorna kvar så att era säljare
                kan bedöma dem själva.
              </p>
              <p data-about className="text-ink font-medium">
                Målet är inte bättre data. Målet är att en säljare ska kunna öppna
                med något som faktiskt stämmer om just det bolaget, i stället för
                att fråga vem hen borde ringa.
              </p>
            </div>
          </div>
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
    <section id="kontakt" className="on-dark bg-forest text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1600&auto=format&fit=crop"
          alt=""
          className="h-full w-full object-cover grayscale"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 md:px-12 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="eyebrow text-white/50 mb-6">Kontakt</div>
            <h2 className="font-sans font-semibold text-[2.1rem] md:text-[2.9rem] leading-[1.08] tracking-[-0.035em] mb-6">
              Vi börjar med ett samtal.
            </h2>
            <p className="text-white/60 text-[15px] leading-[1.75] max-w-sm mb-10">
              Berätta kort vad ni gör, så hör vi av oss. Vi pratar igenom vad
              ni säljer och vart ni vill, och ser tillsammans om Norrsyn är
              rätt för er.
            </p>
            {/* One quiet human alternative instead of a benefits checklist.
                Whitespace does the rest of the composition's work. */}
            <p className="text-white/50 text-[13px] leading-[1.7] border-t border-white/8 pt-4 max-w-sm">
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
  <footer className="on-dark bg-graphite text-white">
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
            <span className="text-white/75">NRSYN AB</span>, ett självständigt
            svenskt aktiebolag med säte i Jönköping. NRSYN AB har ingen koppling
            till Norrsyn AI HB.
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-7 border-t border-white/10 font-mono text-[11.5px] text-white/50">
        <p>© 2026 NRSYN AB</p>
        <a href="#start" className="link-underline flex items-center gap-1.5">
          Till toppen <ArrowUpRight size={12} />
        </a>
      </div>
    </div>
  </footer>
);
