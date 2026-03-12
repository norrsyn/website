import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Features from './components/Features.jsx';
import { Philosophy, Protocol, About, Contact, Footer, Metrics, ExampleOpportunity } from './components/Sections.jsx';
import { Integritetspolicy, Anvandarvillkor } from './components/LegalPages.jsx';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// Component: Navbar
// ==========================================
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500 w-[95%] max-w-5xl ${scrolled ? 'bg-background/80 backdrop-blur-xl border border-primary/10 shadow-lg text-primary' : 'bg-transparent text-white'}`}>
      <a href="#AFFÄRSRESEARCH" className="font-sans font-bold text-lg tracking-widest uppercase">NORRSYN_</a>
      <div className="hidden md:flex gap-6 text-sm font-semibold opacity-90">
        <a href="#AFFÄRSRESEARCH" className="link-lift hover:text-accent font-sans">Start</a>
        <a href="#RESEARCH-PROCESS" className="link-lift hover:text-accent font-sans">Metod</a>
        <a href="#AFFÄRSMÖJLIGHET-INNEHÅLL" className="link-lift hover:text-accent font-sans">Leverans</a>
        <a href="#OM-NORRSYN" className="link-lift hover:text-accent font-sans">Om oss</a>
        <a href="#B2B-LEADS-FORMULÄR" className="link-lift hover:text-accent font-sans">Kontakt</a>
      </div>
      <a href="#B2B-LEADS-FORMULÄR" className="btn-magnetic px-5 py-2.5 rounded-full bg-accent text-dark font-sans font-bold text-sm shadow-md hidden sm:block">
        <span className="relative z-10 flex items-center gap-2">
          Beskriv er målmarknad <ArrowRight size={14} />
        </span>
      </a>
    </nav>
  );
}

// ==========================================
// Component: Hero Section 
// ==========================================
function Hero() {
  const heroRef = useRef(null);
  const textRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRefs.current, {
        y: 60,
        opacity: 0,
        duration: 1.4,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="AFFÄRSRESEARCH" ref={heroRef} className="relative h-[100dvh] w-full flex items-end pb-24 px-8 md:px-24">
      {/* Background Image & Gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2946&auto=format&fit=crop" 
          alt="Norrsyn — Researchbaserad affärsanalys för IT-konsultbolag" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-primary/50 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl">
        <h1 className="text-white mb-6">
          <div ref={el => textRefs.current[0] = el} className="font-mono text-accent/80 text-xs md:text-sm mb-4 tracking-[0.2em] uppercase">
             RESEARCH, AFFÄRSSIGNALER OCH KONTEXT INFÖR FÖRSTA KONTAKT
          </div>
          <div ref={el => textRefs.current[1] = el} className="font-sans font-bold text-4xl md:text-6xl tracking-tight text-white/90">
            Rätt kunder. 
          </div>
          <div ref={el => textRefs.current[2] = el} className="font-drama italic text-7xl md:text-[8rem] leading-[0.85] text-accent">
            Bättre affärer.
          </div>
        </h1>
        <p ref={el => textRefs.current[3] = el} className="text-white/75 font-sans text-lg md:text-xl max-w-2xl mb-12">
            Norrsyn analyserar svenska företag och identifierar affärssituationer där ert erbjudande är relevant.
        </p>
        <div ref={el => textRefs.current[4] = el} className="mt-8 flex flex-col md:flex-row gap-4 md:items-center">
             <a href="#contact" className="btn-magnetic bg-accent text-dark px-8 py-5 rounded-full font-sans font-bold text-lg md:text-xl flex items-center justify-center gap-3 shadow-[0_4px_16px_rgba(62,207,142,0.15)] w-full md:w-auto">
               <span className="relative z-10 flex items-center gap-2">Beskriv er målmarknad <ArrowRight size={20} /></span>
             </a>
             <a href="#protocol" className="btn-magnetic bg-white/5 backdrop-blur-md text-white border border-white/10 px-8 py-5 rounded-full font-sans font-bold text-lg md:text-xl flex items-center justify-center gap-3 w-full md:w-auto hover:bg-white/10 transition-colors">
               <span className="relative z-10 flex items-center gap-2">Hur det fungerar</span>
             </a>
        </div>
        <p ref={el => textRefs.current[5] = el} className="mt-5 text-white/40 text-sm font-sans">
          Tar mindre än en minut.
        </p>
      </div>
    </section>
  );
}

// ==========================================
// Component: How We Work (Credibility Strip)
// ==========================================
function HowWeWork() {
  return (
    <section className="py-16 md:py-24 bg-background border-b border-primary/8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="font-mono text-accent/70 text-xs tracking-[0.2em] uppercase mb-5">Hur Norrsyn arbetar</div>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <p className="font-sans text-xl md:text-2xl text-primary font-semibold leading-snug tracking-tight">
            Norrsyn kombinerar marknadsresearch, analys av affärssignaler och manuell granskning av företag.
          </p>
          <p className="font-sans text-dark/70 text-base leading-relaxed">
            Varje levererad möjlighet är resultatet av analys — inte automatiska listor.
          </p>
        </div>
      </div>
    </section>
  );
}

function App() {
  const path = window.location.pathname;

  if (path === '/integritetspolicy') {
    return <Integritetspolicy />;
  }
  if (path === '/anvandarvillkor') {
    return <Anvandarvillkor />;
  }

  return (
    <div className="min-h-screen bg-background text-dark">
      <Navbar />
      <Hero />
      <HowWeWork />
      <Philosophy />
      <Protocol />
      <Metrics />
      <Features />
      <ExampleOpportunity />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
