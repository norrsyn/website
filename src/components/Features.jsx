import React, { useState, useEffect, useRef } from 'react';
import { Activity, Search, Target, Briefcase, ChevronRight, Clock } from 'lucide-react';
import { gsap } from 'gsap';

// --- Card 1: Diagnostic Shuffler ---
const ShufflerCard = () => {
    const defaultData = [
      { id: 1, label: 'Bolagsdata', value: 'SE-556000', status: 'Verksamhet' },
      { id: 2, label: 'Beslutsfattare', value: 'CIO, CTO', status: 'Aktiv' },
      { id: 3, label: 'Finansiell ställning', value: 'Analys', status: 'Ny' }
    ];
  
    const [items, setItems] = useState(defaultData);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setItems(prevItems => {
          const newItems = [...prevItems];
          const last = newItems.pop();
          newItems.unshift(last);
          return newItems;
        });
      }, 3000);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-primary/10 rounded-[2rem] p-8 shadow-sm flex flex-col h-full relative overflow-hidden group">
        <div className="flex justify-between items-start mb-12">
            <div>
                 <h3 className="font-sans font-bold text-xl text-primary mb-2">Bolagsanalys & Beslutsfattare</h3>
                 <p className="text-dark/70 text-sm">Information om verksamhet, relevanta beslutsfattare och grundläggande bolagsdata.</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-full">
                <Target size={20} className="text-accent" />
            </div>
        </div>
  
        <div className="relative h-48 w-full perspective-[1000px]">
          {items.map((item, index) => {
              // Calculate style based on position
              const isFront = index === 0;
              const translateY = index * 12;
              const scale = 1 - (index * 0.05);
              const opacity = 1 - (index * 0.25);
              const zIndex = items.length - index;

              return (
                 <div 
                    key={item.id}
                    className="absolute top-0 left-0 w-full bg-white border border-primary/5 rounded-2xl p-4 shadow-sm transition-all duration-700 pointer-events-none"
                    style={{
                       transform: `translateY(${translateY}px) scale(${scale})`,
                       opacity: opacity,
                       zIndex: zIndex,
                       transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                 >
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-xs text-primary/70">{item.status}</span>
                        <span className="font-sans font-bold text-accent">{item.value}</span>
                    </div>
                    <div className="font-sans font-semibold text-sm text-dark">{item.label}</div>
                 </div>
              );
          })}
        </div>
      </div>
    );
};

// --- Card 2: Telemetry Typewriter ---
const TypewriterCard = () => {
    const textToType = "Identifierar affärssignaler... Analyserar marknadskontext... Matchar mot er ICP... Kartlägger smärtpunkter... ";
    const [currentText, setCurrentText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < textToType.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prev => prev + textToType.charAt(index));
                setIndex(prev => prev + 1);
            }, 50); // Typing speed
            return () => clearTimeout(timeout);
        } else {
            // Loop it
            const timeout = setTimeout(() => {
               setCurrentText('');
               setIndex(0);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [index, textToType]);

    return (
        <div className="bg-dark text-white rounded-[2rem] p-8 shadow-sm flex flex-col h-full relative overflow-hidden group">
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600109919741-9a74aa1c85bc?q=80&w=260&auto=format&fit=crop')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="font-sans font-bold text-xl text-white mb-2">Affärssignaler & Smärtpunkt</h3>
                    <p className="text-white/70 text-sm">Förändringar som indikerar ett behov. T.ex. nyrekrytering, expansion eller teknikskifte – och var skon klämmer.</p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-accent animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
                    <span className="font-mono text-[10px] tracking-wider text-white/80">SYSTEMAKTIVITET</span>
                </div>
            </div>

            <div className="flex-grow flex items-center relative z-10">
                <div className="font-mono text-sm leading-relaxed text-white/90">
                    <span className="text-accent/70 mr-2">{'>'}</span>
                    {currentText}
                    <span className="inline-block w-2.5 h-4 bg-accent align-middle ml-1 animate-[pulse_1s_step-end_infinite]"></span>
                </div>
            </div>
        </div>
    );
};


// --- Card 3: Cursor Protocol Scheduler ---
const SchedulerCard = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const cursorRef = useRef(null);
    const containerRef = useRef(null);
    const btnRef = useRef(null);
    const [activeDay, setActiveDay] = useState(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
            
            // 1. Enter
            tl.set(cursorRef.current, { x: 50, y: 150, opacity: 0, scale: 1 });
            tl.to(cursorRef.current, { opacity: 1, duration: 0.3 });
            
            // 2. Move to target cell (Tuesday)
            tl.to(cursorRef.current, { 
                x: 140, // approximate x for 'T'
                y: 50,  // approximate y
                duration: 1, 
                ease: "power2.inOut" 
            });

            // 3. Click interaction
            tl.to(cursorRef.current, { scale: 0.8, duration: 0.1 });
            tl.add(() => setActiveDay(2)); // Set 'T' active (index 2)
            tl.to(cursorRef.current, { scale: 1, duration: 0.1 });

            // 4. Move to Save Button
            tl.to(cursorRef.current, { 
                x: 60, 
                y: 110, 
                duration: 0.8, 
                ease: "power2.inOut",
                delay: 0.5
            });

            // 5. Click Save
            tl.to(cursorRef.current, { scale: 0.8, duration: 0.1 });
            tl.to(btnRef.current, { scale: 0.95, duration: 0.1 }, "<");
            tl.to(cursorRef.current, { scale: 1, duration: 0.1 });
            tl.to(btnRef.current, { scale: 1, duration: 0.1 }, "<");

            // 6. Exit
            tl.to(cursorRef.current, { opacity: 0, duration: 0.3, delay: 0.4 });
            tl.add(() => setActiveDay(null)); // Reset
            
        }, containerRef);
        
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-white/80 backdrop-blur-sm border border-primary/10 rounded-[2rem] p-8 shadow-sm flex flex-col h-full relative overflow-hidden group">
             <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="font-sans font-bold text-xl text-primary mb-2">Affärslogik & Aktion</h3>
                    <p className="text-dark/70 text-sm">Ett konkret förslag på varför ert erbjudande är relevant och exakt hur första kontakten bör tas.</p>
                </div>
                 <div className="bg-primary/5 p-3 rounded-full">
                    <Activity size={20} className="text-accent" />
                </div>
            </div>

            <div className="relative w-full aspect-[4/3] bg-background/50 rounded-xl p-6 border border-primary/5 flex flex-col justify-center">
                
                {/* Simulated Grid UI */}
                <div className="flex justify-between mb-6">
                    {days.map((day, i) => (
                        <div 
                            key={i}
                            className={`w-8 h-8 rounded-md flex items-center justify-center font-mono text-xs transition-colors duration-300 ${activeDay === i ? 'bg-accent text-white font-bold' : 'bg-white text-dark/40 border border-primary/10'}`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                     <div className="w-full h-2 bg-dark/5 rounded-full"></div>
                     <div className="w-2/3 h-2 bg-dark/5 rounded-full"></div>
                </div>

                <div 
                    ref={btnRef}
                    className="mt-6 self-start bg-primary text-white text-xs px-4 py-2 rounded-lg font-sans font-semibold transition-transform"
                >
                    Synka kontext
                </div>

                 {/* The Animated Cursor */}
                 <svg 
                    ref={cursorRef}
                    className="absolute z-20 w-6 h-6 text-dark drop-shadow-md pointer-events-none" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ top: 0, left: 0 }}
                >
                    <path d="M13.64,21.97A1.5,1.5,0,0,1,12.2,21.1L8.56,12.55,3.61,16.27A1.5,1.5,0,0,1,1.16,15.1l3.52-13.6A1.5,1.5,0,0,1,6.5.31l13.6,5.83a1.5,1.5,0,0,1,.15,2.77l-4.22,2.37,3.64,8.55A1.5,1.5,0,0,1,18.4,21.8l-3.38-1.44a1.5,1.5,0,0,1-.83-.75l-4-9.42-2.12,1.55-2.61,10.08L7,15l4.58-3.41,2,6.54,2.39,1.02a.5.5,0,0,0,.46,0,.5.5,0,0,0,.26-.44l-3.39-7.94,4.22-2.37-12.08-5.18L3,14ZM11.14,14.63l4.3,10.21,1.38.59,2.76-6.47-1.38-.59L13.9,8.16l-2.45,1.82Z" transform="translate(-1.16 -0.19)"/>
                 </svg>
            </div>
        </div>
    );
};

export default function Features() {
    const featuresRef = useRef(null);
    const headingRefs = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headingRefs.current, {
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: "top 80%",
                },
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out"
            });
        }, featuresRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="AFFÄRSMÖJLIGHET-INNEHÅLL" ref={featuresRef} className="py-24 md:py-32 px-6 md:px-12 bg-background relative z-20 rounded-t-[3rem] -mt-12">
             <div className="max-w-6xl mx-auto">
                 <div className="mb-20">
                     <h2 ref={el => headingRefs.current[0] = el} className="text-primary font-sans font-bold text-4xl md:text-5xl mb-4 tracking-tight">
                         Det här ingår i varje <span className="font-drama italic text-accent font-normal relative top-1">affärsmöjlighet</span>.
                     </h2>
                     <p ref={el => headingRefs.current[1] = el} className="text-dark/75 max-w-xl text-base relative z-10">
                         En komplett bild av bolaget och affärssituationen för att ert team ska kunna agera med kontext.
                     </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[420px]">
                      <ShufflerCard />
                      <TypewriterCard />
                      <SchedulerCard />
                 </div>
             </div>
        </section>
    );
}
