import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ShieldCheck, Cpu, Search, GitBranch, Radar } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// Component: Philosophy 
// ==========================================
export const Philosophy = () => {
    const sectionRef = useRef(null);
    const textRef1 = useRef(null);
    const textRef2 = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from([textRef1.current, textRef2.current], {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 60%",
                },
                y: 50,
                opacity: 0,
                duration: 1.2,
                stagger: 0.3,
                ease: "power3.out"
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="B2B-LEADS-PROBLEMET" className="py-24 md:py-32 bg-dark text-white relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay">
                <img src="https://images.unsplash.com/photo-1502657877623-f66bf489d236?q=80&w=2938&auto=format&fit=crop" alt="Organic texture" className="w-full h-full object-cover grayscale" />
            </div>
            
            <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                <h2 ref={textRef1} className="font-sans font-bold text-3xl md:text-5xl md:leading-[1.1] max-w-4xl tracking-tight mb-8">
                    Leadlistor <span className="font-drama italic text-accent font-normal text-4xl md:text-[5rem]">räcker inte längre.</span>
                </h2>
                <div ref={textRef2} className="font-sans text-base text-white/75 max-w-2xl text-left space-y-4">
                    <p>Många IT-konsultbolag arbetar med stora listor av företag att kontakta.</p>
                    <p>Problemet är att listor saknar kontext.</p>
                    <ul className="list-none space-y-2 pl-0">
                        <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> vilka företag som faktiskt har ett behov</li>
                        <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> vem som fattar beslut</li>
                        <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span> varför ert erbjudande är relevant just nu</li>
                    </ul>
                    <p className="text-white/90 font-medium">Norrsyn analyserar marknaden och identifierar affärssituationer där sannolikheten för en affär är högre.</p>
                </div>
            </div>
        </section>
    );
};

// ==========================================
// Component: Protocol Archive
// ==========================================
export const Protocol = () => {
    const containerRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        let ctx = gsap.context(() => {
            let mm = gsap.matchMedia();

            // Desktop: Full cinematic pinning, scaling and blur
            mm.add("(min-width: 769px)", () => {
                cardsRef.current.forEach((card, i) => {
                    if(i === cardsRef.current.length - 1) return; // Skip last one
                    
                    ScrollTrigger.create({
                        trigger: card,
                        start: "top top",
                        end: "bottom top",
                        pin: true,
                        pinSpacing: false,
                        scrub: true,
                        animation: gsap.to(card, {
                            scale: 0.9,
                            opacity: 0.5,
                            filter: "blur(20px)",
                            ease: "none"
                        })
                    });
                });
            });

            // Mobile: Lightweight non-pinned scroll fade, no blur/scale triggers
            mm.add("(max-width: 768px)", () => {
                cardsRef.current.forEach((card, i) => {
                    if(i === cardsRef.current.length - 1) return;
                    
                    ScrollTrigger.create({
                        trigger: card,
                        start: "top 20%",
                        end: "bottom 30%",
                        scrub: true,
                        animation: gsap.to(card, {
                            opacity: 0.4,
                            filter: "blur(2px)",
                            y: -10,
                            ease: "none"
                        })
                    });
                });
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    const steps = [
        {
            num: "01",
            title: "Ni definierar er målmarknad",
            desc: "Ni beskriver vilken typ av bolag ni vill nå — bransch, storlek, geografi och tekniska behov.",
            icon: <Search className="w-12 h-12 text-accent mb-6" />,
            animationClass: "animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"
        },
        {
            num: "02",
            title: "Vi analyserar marknaden",
            desc: "Tusentals svenska bolag analyseras. Affärssignaler, förändringar och tekniska initiativ identifieras.",
            icon: <Radar className="w-12 h-12 text-accent mb-6" />,
            animationClass: "animate-[spin_5s_cubic-bezier(0.4,0,0.6,1)_infinite] border-t-accent border-r-transparent border-b-transparent border-l-transparent opacity-70"
        },
        {
            num: "03",
            title: "Ni får koncentrerade möjligheter",
            desc: "Ni får ett noggrant urval av analyserade företag levererade med kontext inför första kontakt.",
            icon: <ShieldCheck className="w-12 h-12 text-accent mb-6" />,
            animationClass: "animate-pulse border-accent/50 scale-105"
        }
    ];

    return (
        <section id="RESEARCH-PROCESS" ref={containerRef} className="bg-background relative">
            {steps.map((step, i) => (
                <div 
                    key={i} 
                    ref={el => cardsRef.current[i] = el}
                    className="py-32 md:py-0 w-full md:h-[100dvh] flex items-center justify-center sticky top-0 bg-background border-t border-primary/5"
                >
                    <div className="max-w-4xl w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                        <div className="text-center md:text-left">
                             <div className="font-mono text-accent text-base md:text-lg mb-3 md:mb-4">[ STEG_{step.num} ]</div>
                             <h2 className="font-sans font-bold text-[2rem] leading-tight md:text-6xl text-primary mb-4 md:mb-6 tracking-tight">{step.title}</h2>
                             <p className="text-dark/70 text-base md:text-lg leading-relaxed">{step.desc}</p>
                        </div>
                        <div className="bg-white/50 backdrop-blur-sm md:backdrop-blur-md border border-primary/10 rounded-[2.5rem] md:rounded-[3rem] aspect-square flex items-center justify-center p-8 md:p-12 shadow-sm md:shadow-[0_10px_40px_-10px_rgba(46,64,54,0.06)] max-w-[260px] md:max-w-none mx-auto w-full">
                             {/* Abstract placeholder for the canvas/svg animations required by spec */}
                             <div className="w-full h-full border border-dashed border-primary/20 rounded-full flex flex-col items-center justify-center relative">
                                  {step.icon}
                                  <div className={`absolute inset-0 rounded-full border border-accent/30 ${step.animationClass}`}></div>
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
};

// ==========================================
// Component: About (Om Norrsyn)
// ==========================================
export const About = () => {
    return (
        <section id="om-norrsyn" className="py-24 md:py-32 bg-background relative z-10">
            <div className="max-w-4xl mx-auto px-6">
                <div className="font-mono text-accent text-sm md:text-base mb-6 tracking-wider uppercase">
                     Om Norrsyn
                </div>
                <h2 className="font-sans font-bold text-3xl md:text-5xl text-primary mb-12 tracking-tight leading-[1.2]">
                    Norrsyn hjälper B2B-bolag att identifiera affärsmöjligheter genom <span className="font-drama italic text-accent font-normal relative top-1">research, analys och kontext.</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-12 text-dark/75 text-base leading-relaxed font-sans">
                    <div>
                        <p className="mb-6">Vi existerar för att lösa ett fundamentalt problem inom B2B-försäljning: avsaknaden av kontext. Stora listor med kalla leads skapar sällan verkligt värde utan slösar istället säljteamens tid.</p>
                        <p>Genom att kontinuerligt skanna och analysera svenska bolag kan vi identifiera var tekniska behov och affärssituationer håller på att uppstå.</p>
                    </div>
                    <div>
                        <p className="mb-6">Vår övertygelse är att kvalitet och research alltid slår volym. Därför levererar vi inte generiska listor, utan ett noga utvalt antal koncentrerade möjligheter där en affär faktiskt kan vara realistisk.</p>
                        <p className="font-medium text-primary">Det ger dig och era säljare rätt förutsättningar inför den allra första kontakten.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ==========================================
// Component: Metrics Sektion
// ==========================================
export const Metrics = () => {
    return (
        <section id="RESEARCH-RESULTAT" className="bg-primary text-white py-16 md:py-24 border-y border-white/5">
            <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 gap-8 md:gap-12 text-center divide-x divide-white/8">
                <div className="flex flex-col items-center">
                    <div className="font-drama text-5xl md:text-5xl lg:text-7xl text-accent mb-2 md:mb-3">1000+</div>
                    <div className="font-sans text-xs md:text-sm text-white/60 uppercase tracking-widest max-w-[170px]">Företag filtrerade</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="font-drama text-5xl md:text-5xl lg:text-7xl text-accent mb-2 md:mb-3">100+</div>
                    <div className="font-sans text-xs md:text-sm text-white/60 uppercase tracking-widest max-w-[170px]">Timmar research sparade</div>
                </div>
            </div>
        </section>
    );
};

// ==========================================
// Component: Example Opportunity
// ==========================================
export const ExampleOpportunity = () => {
    return (
        <section id="leveransinnehall" className="py-24 md:py-32 bg-background relative z-10 border-t border-primary/5">
             <div className="max-w-5xl mx-auto px-6 text-center mb-16">
                 <h2 className="font-sans font-bold text-4xl md:text-5xl text-primary mb-4 tracking-tight">
                     Exempel på identifierad <span className="font-drama italic text-accent font-normal">affärsmöjlighet</span>
                 </h2>
                 <p className="text-dark/70 text-base">
                     Så här kan ett researchkort se ut för en IT-konsult innan första kontakt.
                 </p>
             </div>

             {/* Example Card */}
             <div className="max-w-4xl mx-auto bg-white border border-primary/10 rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm md:shadow-[0_10px_30px_-10px_rgba(26,47,43,0.08)] relative overflow-hidden text-left flex flex-col">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-accent/2 md:bg-accent/3 rounded-full blur-xl md:blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                 {/* Header */}
                 <div className="pb-8 border-b border-primary/8 mb-8 relative z-10">
                     <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                             <span className="font-mono text-[9px] text-dark/40 bg-background border border-primary/8 px-2 py-0.5 rounded tracking-widest uppercase">DEMOEXEMPEL • FIKTIVT BOLAG</span>
                             <span className="font-mono text-[9px] text-accent tracking-[0.15em] uppercase">Kvalificerad mot er ICP</span>
                         </div>
                         <div className="flex flex-col items-end shrink-0">
                             <div className="font-drama italic text-3xl text-accent leading-none mb-0.5">86/100</div>
                             <div className="font-mono text-[9px] text-dark/35 uppercase tracking-wider">ICP Score</div>
                         </div>
                     </div>
                     <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                         <div>
                             <h3 className="font-sans font-bold text-2xl md:text-3xl text-primary mb-1">Nordic Flow Distribution AB</h3>
                             <div className="text-dark/40 text-xs font-mono mb-4">Partihandel / Distribution • Västra Götaland • Sverige</div>
                             <p className="text-dark/70 text-sm max-w-xl leading-relaxed">Bolaget distribuerar tekniska komponenter till industri- och installationsbolag och arbetar med lager, orderflöden och flera leverantörsled.</p>
                         </div>
                     </div>
                 </div>

                 {/* Fact / enrichment strip */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-primary/5 rounded-xl overflow-hidden mb-8 md:mb-10 border border-primary/5 relative z-10 w-full">
                     {[
                         { label: 'Omsättning', value: '64,8 MSEK' },
                         { label: 'Resultat', value: '5,7 MSEK' },
                         { label: 'Anställda', value: '28' },
                         { label: 'Tillväxt', value: '+18% YoY', accent: true },
                     ].map(({ label, value, accent }) => (
                         <div key={label} className="bg-white px-5 py-4">
                             <div className="font-mono text-[9px] text-dark/40 uppercase tracking-wider mb-1">{label}</div>
                             <div className={`font-sans font-semibold text-base ${accent ? 'text-accent' : 'text-primary'}`}>{value}</div>
                         </div>
                     ))}
                 </div>

                 {/* Body grid */}
                 <div className="grid md:grid-cols-2 gap-8 md:gap-10 relative z-10">
                     {/* Left col — intelligence */}
                     <div className="space-y-6">

                         {/* Company details */}
                         <div className="py-4 px-4 bg-background rounded-xl border border-primary/5 text-[11px] font-mono text-dark/40 space-y-2 leading-[1.6]">
                             <div className="text-[9px] uppercase tracking-wider text-dark/25 mb-3">Företagsinfo</div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-24 shrink-0">Org.nr</span> <span className="text-dark/70">5594XX-XXXX</span></div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-24 shrink-0">Adress</span> <span className="text-dark/70">Importgatan 12<span className="hidden sm:inline"><br/></span><span className="sm:hidden">, </span>417 55 Göteborg</span></div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-24 shrink-0">Webbplats</span> <span className="text-dark/70">nordicflowdistribution.se</span></div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-24 shrink-0">Bransch</span> <span className="text-dark/70">Distribution / Grossist</span></div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-24 shrink-0">Affärsmodell</span> <span className="text-dark/70">B2B</span></div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-24 shrink-0">Region</span> <span className="text-dark/70">Västra Götaland</span></div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-24 shrink-0">Grundat</span> <span className="text-dark/70">2014</span></div>
                         </div>

                         <div>
                             <h4 className="font-mono text-[10px] text-dark/30 uppercase tracking-wider mb-2">Varför bolaget matchar</h4>
                             <p className="text-dark/70 text-sm leading-relaxed">Bolaget verkar i en verksamhet med många processberoenden mellan lager, order, inköp och leverans. Kombinationen av tillväxt, fler operativa roller och ökad komplexitet gör bolaget relevant för en IT-konsult som säljer ERP, integrationer eller digitalisering av interna flöden.</p>
                         </div>

                         <div>
                             <h4 className="font-mono text-[10px] text-dark/30 uppercase tracking-wider mb-2">Affärssignaler</h4>
                             <p className="text-dark/70 text-sm leading-relaxed">Bolaget har nyligen utökat lagerkapaciteten, rekryterat operativ personal inom logistik och ekonomi samt kommunicerat fokus på effektivare interna processer. Flera signaler tyder på att verksamheten växer i komplexitet och att behovet av bättre systemstöd ökar.</p>
                         </div>

                         <div>
                             <h4 className="font-mono text-[10px] text-dark/30 uppercase tracking-wider mb-2">Möjligt behov</h4>
                             <p className="text-dark/70 text-sm leading-relaxed">När distributionsbolag växer uppstår ofta friktion mellan lagerstyrning, orderflöde, fakturering och rapportering. Om systemen inte hänger ihop riskerar verksamheten onödigt manuellt arbete, sämre överblick och svårare skalbarhet.</p>
                         </div>

                         <div className="py-4 px-4 bg-background rounded-xl border border-primary/5 text-[11px] font-mono text-dark/40 space-y-2 leading-[1.6] mt-4 md:mt-2">
                             <div className="text-[9px] uppercase tracking-wider text-dark/25 mb-3">Identifierade systemmiljöer</div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-36 shrink-0">Affärssystem / ekonomi</span> <span className="text-dark/70">Fortnox (verifierat)</span></div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-36 shrink-0">CRM</span> <span className="text-dark/70">HubSpot (trolig implementation)</span></div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-36 shrink-0">Samarbete / dokument</span> <span className="text-dark/70">Microsoft 365</span></div>
                             <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-0"><span className="text-dark/40 inline-block w-full sm:w-36 shrink-0">Rapportering</span> <span className="text-dark/70">Excel (indikation)</span></div>
                         </div>
                     </div>

                     {/* Right col — contacts + outreach */}
                     <div className="space-y-7 bg-background/60 p-6 rounded-2xl border border-primary/5">
                         <div>
                             <h4 className="font-mono text-[10px] text-dark/30 uppercase tracking-wider mb-3">Beslutsfattare</h4>
                             <ul className="space-y-3">
                                 {[
                                     { name: "Maria Ekström", role: "VD", email: "maria.ekstrom@nordicflowdistribution.se", phone: "070-412 38 11", linkedin: "#" },
                                     { name: "Oskar Lund", role: "Ekonomichef", email: "oskar.lund@nordicflowdistribution.se", phone: "070-455 91 24", linkedin: "#" },
                                     { name: "Henrik Dahl", role: "Operativ chef", email: "henrik.dahl@nordicflowdistribution.se", phone: "070-433 62 08", linkedin: "#" }
                                 ].map((contact, i) => (
                                     <li key={i} className="p-4 bg-white rounded-xl shadow-sm border border-primary/5 space-y-2">
                                         <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-1 sm:gap-2">
                                             <span className="font-semibold text-dark text-[13px] sm:text-sm leading-tight w-full sm:w-auto">{contact.name}</span>
                                             <span className="text-[10px] text-dark/40 font-mono bg-background px-2 py-0.5 rounded shrink-0">{contact.role}</span>
                                         </div>
                                         <div className="font-mono text-[10px] sm:text-[11px] text-dark/50 space-y-1.5 mt-2">
                                             <div className="truncate w-[220px] sm:w-full max-w-full"><a href={`mailto:${contact.email}`} className="hover:text-accent transition-colors">{contact.email}</a></div>
                                             <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                 <a href={`tel:${contact.phone}`} className="hover:text-accent transition-colors whitespace-nowrap">{contact.phone}</a>
                                                 <span className="text-dark/20">•</span>
                                                 <a href={contact.linkedin} className="text-dark/40 hover:text-accent transition-colors" onClick={(e) => e.preventDefault()}>LinkedIn</a>
                                             </div>
                                         </div>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                         
                         <div>
                             <h4 className="font-mono text-[10px] text-dark/30 uppercase tracking-wider mb-3">Exempel på första dialog</h4>
                             <p className="text-dark/75 text-sm italic border-l-2 border-accent pl-4 leading-relaxed font-medium mb-6">
                                 "Hej Maria,<br/><br/>Jag såg att ni nyligen expanderat lagerverksamheten och samtidigt rekryterat fler inom ekonomi och logistik.<br/><br/>I organisationer som växer uppstår ofta mer komplexitet mellan orderflöde, lager och rapportering.<br/><br/>Hur arbetar ni idag med systemen bakom de processerna?"
                             </p>
                             
                             <div className="pt-5 border-t border-primary/10">
                                 <h4 className="font-mono text-[10px] text-dark/30 uppercase tracking-wider mb-3">Inför samtalet</h4>
                                 <ul className="space-y-2">
                                     <li className="flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0"></div>
                                        <span className="text-xs text-dark/70 leading-snug">Hur hanteras order, lager och ekonomi idag</span>
                                     </li>
                                     <li className="flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0"></div>
                                        <span className="text-xs text-dark/70 leading-snug">Arbetar de i ett sammanhängande system eller flera verktyg</span>
                                     </li>
                                     <li className="flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0"></div>
                                        <span className="text-xs text-dark/70 leading-snug">Finns manuella moment i rapportering eller fakturering</span>
                                     </li>
                                 </ul>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Demo tags footer */}
                 <div className="mt-8 pt-5 border-t border-primary/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-3 relative z-10">
                     <div className="text-[10px] text-dark/40 font-mono tracking-wide">
                        <span className="font-semibold text-dark/60">Demo-källor:</span> LinkedIn · Bolagsdata · Företagswebbplats · Offentliga register
                     </div>
                     <div className="flex flex-col items-end gap-1 font-mono text-[9px] text-dark/30 uppercase tracking-widest text-right">
                         <div>Research utförd: mars 2026</div>
                         <div>Researchkort • Norrsyn_ Demo</div>
                     </div>
                 </div>
             </div>

             {/* Disclaimer Footnote */}
             <div className="max-w-xl mx-auto mt-8 text-center px-6">
                 <p className="text-[10px] text-dark/30 font-sans tracking-wide">
                     Illustrativt demoexempel. Innehåll och analys är fiktiva.
                 </p>
             </div>
        </section>
    );
};

// ==========================================
// Component: Contact (Kontakt / Begär analys)
// ==========================================
export const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        description: ''
    });
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', company: '', email: '', phone: '', description: '' });
                // Return to idle after delay
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 4000);
            }
        } catch (error) {
           console.error("Submission failed", error);
           setStatus('error');
           setTimeout(() => setStatus('idle'), 4000);
        }
    };

    return (
        <section id="b2b-lead-formular" className="py-24 md:py-32 bg-dark text-white text-center px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center overflow-hidden">
            {/* Texture Background */}
            <div className="absolute inset-0 md:-inset-[15px] z-0 opacity-[0.08] mix-blend-overlay pointer-events-none md:animate-drift-bg animate-breathing">
                <img src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2946&auto=format&fit=crop" alt="Dark moss texture" className="w-full h-full object-cover grayscale scale-[1.02] md:scale-100 origin-center" />
            </div>

            <div className="relative z-10 w-full max-w-3xl mx-auto">
                <h2 className="font-sans font-bold text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight px-2">
                    Redo att hitta <span className="font-drama italic text-accent font-normal">rätt kunder?</span>
                </h2>
                <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto mb-10 font-sans px-4">
                    Hör av er så diskuterar vi potentiella affärsmöjligheter tillsammans.
                </p>

                {/* Reassurance list */}
                <ul className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center text-sm md:text-sm text-white/50 font-mono mb-10 sm:mb-12">
                    <li className="flex items-center gap-2"><span className="text-accent">✓</span> kostnadsfri initial analys</li>
                    <li className="flex items-center gap-2"><span className="text-accent">✓</span> ingen bindning</li>
                    <li className="flex items-center gap-2"><span className="text-accent">✓</span> vi svarar snabbt</li>
                </ul>

                <form className="bg-white/5 backdrop-blur-md md:backdrop-blur-xl border border-white/8 rounded-[2rem] p-6 sm:p-8 md:p-12 text-left shadow-lg md:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] space-y-5 md:space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/70 ml-1">Namn</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 md:py-3.5 text-white focus:outline-none focus:border-accent transition-colors text-base" placeholder="Förnamn Efternamn" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/70 ml-1">Företag</label>
                            <input type="text" name="company" required value={formData.company} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 md:py-3.5 text-white focus:outline-none focus:border-accent transition-colors text-base" placeholder="Företagsnamn AB" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/70 ml-1">E-post</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 md:py-3.5 text-white focus:outline-none focus:border-accent transition-colors text-base" placeholder="namn@foretag.se" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white/70 ml-1">Telefon</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 md:py-3.5 text-white focus:outline-none focus:border-accent transition-colors text-base" placeholder="070 123 45 67" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/70 ml-1">Beskriv er målmarknad</label>
                        <textarea rows="3" name="description" required value={formData.description} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 md:py-3.5 text-white focus:outline-none focus:border-accent transition-colors resize-none text-base" placeholder="Vilken typ av tjänster erbjuder ni och vilka beslutsfattare vill ni nå?"></textarea>
                    </div>
                    <div className="pt-2 md:pt-4">
                        <button disabled={status === 'loading' || status === 'success'} className={`btn-magnetic w-full px-6 md:px-8 py-4 md:py-4 rounded-xl font-sans font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-colors ${status === 'success' ? 'bg-primary/80 border border-accent/40 text-accent/90 shadow-none' : status === 'error' ? 'bg-amber-900/60 text-amber-100 border border-amber-500/30' : 'bg-accent text-dark shadow-[0_4px_12px_rgba(62,207,142,0.15)] hover:bg-[#2fb579]'}`}>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {status === 'loading' && 'Skickar...'}
                                {status === 'success' && 'Tack — vi har tagit emot er förfrågan och återkommer så snart vi kan.'}
                                {status === 'error' && <span className="text-sm">Kunde inte skicka. Försök igen eller maila info@norrsyn.se.</span>}
                                {status === 'idle' && <><span className="hidden sm:inline">Prata med oss</span><span className="sm:hidden">Skicka förfrågan</span> <ArrowRight size={20} /></>}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

// ==========================================
// Component: Footer
// ==========================================
export const Footer = () => {
    return (
        <footer id="footer" className="bg-dark text-white pt-24 pb-8 px-6 md:px-12 rounded-t-[4rem] relative z-20 -mt-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
                <div className="md:col-span-2">
                    <h3 className="font-sans font-bold text-2xl text-white tracking-widest uppercase mb-5">NORRSYN_</h3>
                    <p className="text-white/50 max-w-sm text-sm leading-relaxed mb-4">
                        Identifierar affärsmöjligheter för B2B-bolag genom research, analys och kontext.
                    </p>
                    <div className="text-white/30 text-sm font-sans space-y-1">
                        <p>info@norrsyn.se</p>
                        <p>Jönköping, Sverige</p>
                    </div>
                </div>
                <div>
                     <h4 className="font-sans font-semibold mb-6 text-white/70 text-sm uppercase tracking-wider">Navigation</h4>
                     <ul className="space-y-3 text-white/45 text-sm">
                         <li><a href="#metod-for-affarsmojligheter" className="hover:text-accent transition-colors">Metod</a></li>
                         <li><a href="#leveransinnehall" className="hover:text-accent transition-colors">Leverans</a></li>
                         <li><a href="#om-norrsyn" className="hover:text-accent transition-colors">Om oss</a></li>
                         <li><a href="#contact" className="hover:text-accent transition-colors">Kontakt</a></li>
                     </ul>
                </div>
                <div>
                     <h4 className="font-sans font-semibold mb-6 text-white/70 text-sm uppercase tracking-wider">Information</h4>
                     <ul className="space-y-3 text-white/45 text-sm">
                         <li><a href="/integritetspolicy" className="hover:text-accent transition-colors">Integritetspolicy</a></li>
                         <li><a href="/anvandarvillkor" className="hover:text-accent transition-colors">Användarvillkor</a></li>
                         <li><a href="/cookiepolicy" className="hover:text-accent transition-colors">Cookiepolicy</a></li>
                         <li className="flex justify-between items-center text-white/30 cursor-default opacity-80 pt-2 border-t border-white/5">
                             <span>Insikter</span>
                             <span className="text-[9px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-white/40">Kommer snart</span>
                         </li>
                         <li className="flex justify-between items-center text-white/30 cursor-default opacity-80">
                             <span>Case</span>
                             <span className="text-[9px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-white/40">Kommer snart</span>
                         </li>
                         <li className="flex justify-between items-center text-white/30 cursor-default opacity-80">
                             <span>Social media</span>
                             <span className="text-[9px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-white/40">Kommer snart</span>
                         </li>
                     </ul>
                </div>
            </div>
            
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/8 text-white/25 text-xs font-mono">
                <p>&copy; 2026 Norrsyn AB</p>
                <div className="flex items-center gap-1.5 mt-4 md:mt-0 opacity-40">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
                    SYSTEM OPERATIVT
                </div>
            </div>
        </footer>
    );
};
