import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Features from './components/Features.jsx';
import { Philosophy, Protocol, About, Contact, Footer, Metrics, ExampleOpportunity } from './components/Sections.jsx';
import { Integritetspolicy, Anvandarvillkor, Cookiepolicy } from './components/LegalPages.jsx';
import { Analytics } from '@vercel/analytics/react';

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
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full transition-all duration-300 md:duration-500 w-[95%] max-w-5xl ${scrolled ? 'bg-background/95 md:bg-background/80 backdrop-blur-md md:backdrop-blur-xl border border-primary/10 shadow-sm md:shadow-lg text-primary' : 'bg-transparent text-white'}`}>
      <a href="#start" className="font-sans font-bold text-sm sm:text-base md:text-lg tracking-widest uppercase">NORRSYN_</a>
      <div className="hidden md:flex gap-6 text-sm font-semibold opacity-90">
        <a href="#start" className="link-lift hover:text-accent font-sans">Start</a>
        <a href="#metod-for-affarsmojligheter" className="link-lift hover:text-accent font-sans">Metod</a>
        <a href="#leveransinnehall" className="link-lift hover:text-accent font-sans">Leverans</a>
        <a href="#om-norrsyn" className="link-lift hover:text-accent font-sans">Om oss</a>
        <a href="#b2b-lead-formular" className="link-lift hover:text-accent font-sans">Kontakt</a>
      </div>
      <a href="#b2b-lead-formular" className="btn-magnetic px-3 sm:px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-accent text-dark font-sans font-bold text-[11px] sm:text-xs md:text-sm shadow-md">
        <span className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2">
          Beskriv er målmarknad <ArrowRight size={14} className="hidden sm:block" />
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
  const bgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation for text/content
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
    <section id="start" ref={heroRef} className="relative h-[100vh] w-full flex items-end pb-16 sm:pb-24 px-6 sm:px-8 md:px-24 overflow-hidden">
      {/* Background Multi-Layer Idle Motion */}
      <div className="absolute inset-0 md:-inset-[15px] z-0 pointer-events-none">
        
        {/* Layer 1: Image Drift (Extremely slow translation) */}
        <div className="absolute inset-0 md:animate-drift-bg animate-breathing">
           <img 
             src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2946&auto=format&fit=crop" 
             alt="Norrsyn — Researchbaserad affärsanalys för B2B-bolag" 
             className="w-full h-full object-cover scale-[1.02] md:scale-100 origin-center"
           />
        </div>
        
        {/* Layer 2: Gradient Overlay Drift (Slower pulse, shift) */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-primary/50 to-transparent md:animate-drift-overlay"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full">
        <h1 className="text-white mb-5 sm:mb-6 pt-16 sm:pt-12 md:pt-0">
          <div ref={el => textRefs.current[0] = el} className="font-mono text-accent/80 text-[9px] sm:text-[10px] md:text-sm mb-3 sm:mb-4 tracking-[0.2em] uppercase leading-relaxed max-w-[240px] sm:max-w-[280px] md:max-w-none">
             RESEARCH, AFFÄRSSIGNALER OCH KONTEXT INFÖR FÖRSTA KONTAKT
          </div>
          <div ref={el => textRefs.current[1] = el} className="font-sans font-bold text-[2rem] leading-tight sm:text-4xl md:text-6xl tracking-tight text-white/90">
            Rätt kunder. 
          </div>
          <div ref={el => textRefs.current[2] = el} className="font-drama italic text-5xl sm:text-7xl md:text-[8rem] leading-[1] md:leading-[0.85] text-accent mt-0.5 sm:mt-0">
            Bättre affärer.
          </div>
        </h1>
        <p ref={el => textRefs.current[3] = el} className="text-white/75 font-sans text-sm sm:text-base md:text-xl max-w-2xl mb-8 sm:mb-8 md:mb-12 leading-relaxed">
            Norrsyn analyserar svenska företag och identifierar affärssituationer där ert erbjudande är relevant.
        </p>
        <div ref={el => textRefs.current[4] = el} className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 sm:items-center">
             <a href="#b2b-lead-formular" className="btn-magnetic bg-accent text-dark px-6 sm:px-8 py-3.5 sm:py-4 md:py-5 rounded-full font-sans font-bold text-sm sm:text-base md:text-xl flex items-center justify-center gap-2 sm:gap-3 md:shadow-[0_4px_16px_rgba(62,207,142,0.15)] w-full sm:w-auto">
               <span className="relative z-10 flex items-center gap-2">Beskriv er målmarknad <ArrowRight size={18} className="sm:w-5 sm:h-5" /></span>
             </a>
             <a href="#metod-for-affarsmojligheter" className="btn-magnetic bg-white/5 backdrop-blur-sm md:backdrop-blur-md text-white border border-white/10 px-6 sm:px-8 py-3.5 sm:py-4 md:py-5 rounded-full font-sans font-bold text-sm sm:text-base md:text-xl flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto hover:bg-white/10 transition-colors">
               <span className="relative z-10 flex items-center gap-2">Hur det fungerar</span>
             </a>
        </div>
        <p ref={el => textRefs.current[5] = el} className="mt-4 sm:mt-5 text-white/40 text-xs sm:text-sm font-sans text-center sm:text-left">
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
    <section id="metod-for-affarsmojligheter" className="py-16 md:py-24 bg-background border-b border-primary/8">
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
    return <><Integritetspolicy /><Analytics /></>;
  }
  if (path === '/anvandarvillkor') {
    return <><Anvandarvillkor /><Analytics /></>;
  }
  if (path === '/cookiepolicy' || path === '/cookies') {
    return <><Cookiepolicy /><Analytics /></>;
  }

  return (
    <div className="bg-background text-dark relative">
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
      <Analytics />
    </div>
  );
}

export default App;
