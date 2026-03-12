import React from 'react';

// ==========================================
// Integritetspolicy
// ==========================================
export const Integritetspolicy = () => (
    <div className="min-h-screen bg-background text-dark">
        <nav className="bg-dark text-white px-8 py-5 flex items-center justify-between">
            <a href="/" className="font-sans font-bold text-lg tracking-widest uppercase text-white hover:text-accent transition-colors">NORRSYN_</a>
        </nav>
        <main className="max-w-3xl mx-auto px-6 py-24">
            <h1 className="font-sans font-bold text-4xl text-primary mb-3 tracking-tight">Integritetspolicy</h1>
            <div className="w-12 h-0.5 bg-accent mb-10"></div>
            <div className="prose prose-lg font-sans text-dark/80 space-y-6 leading-relaxed">
                <p className="font-semibold text-primary text-lg">NORRSYN_ värnar om din personliga integritet.</p>
                <p>När du skickar en förfrågan via vårt formulär kan vi samla in följande uppgifter:</p>
                <ul className="space-y-1 pl-4">
                    <li>• namn</li>
                    <li>• företagsnamn</li>
                    <li>• e-postadress</li>
                    <li>• telefonnummer</li>
                    <li>• information om er målmarknad eller verksamhet</li>
                </ul>
                <p>Vi använder uppgifterna för att:</p>
                <ul className="space-y-1 pl-4">
                    <li>• besvara er förfrågan</li>
                    <li>• förstå ert behov</li>
                    <li>• bedöma om och hur vi kan hjälpa er</li>
                    <li>• följa upp kontakt som ni själva har initierat</li>
                </ul>
                <p>Vi säljer inte vidare era personuppgifter till tredje part.</p>
                <p>Uppgifterna sparas endast så länge det är nödvändigt för att hantera er förfrågan eller vår fortsatta dialog.</p>
                <p>Vill ni få information om vilka uppgifter vi har sparat eller begära att de raderas kan ni kontakta:</p>
                <p><a href="mailto:info@norrsyn.se" className="text-accent hover:underline font-semibold">info@norrsyn.se</a></p>
                <p className="text-dark/50 text-sm pt-4 border-t border-primary/10">Senast uppdaterad: mars 2026</p>
            </div>
            <div className="mt-12">
                <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-primary transition-colors">
                    ← Tillbaka till startsidan
                </a>
            </div>
        </main>
        <footer className="bg-dark text-white/40 text-xs font-mono py-6 px-8 mt-24">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between gap-2">
                <span>© 2026 Norrsyn AB</span>
                <a href="/anvandarvillkor" className="hover:text-accent transition-colors">Användarvillkor</a>
            </div>
        </footer>
    </div>
);

// ==========================================
// Användarvillkor
// ==========================================
export const Anvandarvillkor = () => (
    <div className="min-h-screen bg-background text-dark">
        <nav className="bg-dark text-white px-8 py-5 flex items-center justify-between">
            <a href="/" className="font-sans font-bold text-lg tracking-widest uppercase text-white hover:text-accent transition-colors">NORRSYN_</a>
        </nav>
        <main className="max-w-3xl mx-auto px-6 py-24">
            <h1 className="font-sans font-bold text-4xl text-primary mb-3 tracking-tight">Användarvillkor</h1>
            <div className="w-12 h-0.5 bg-accent mb-10"></div>
            <div className="font-sans text-dark/80 space-y-6 leading-relaxed">
                <p>Genom att använda denna webbplats godkänner du följande villkor.</p>
                <p>Innehållet på webbplatsen beskriver NORRSYN_s tjänster inom research, analys och identifiering av affärsmöjligheter för B2B-företag.</p>
                <p>Att skicka in en förfrågan via formuläret innebär inte att ett uppdrag eller avtal automatiskt uppstår.</p>
                <p>NORRSYN_ förbehåller sig rätten att uppdatera innehåll och information på webbplatsen utan föregående meddelande.</p>
                <p>Allt innehåll på webbplatsen tillhör NORRSYN_ om inget annat anges och får inte kopieras eller användas kommersiellt utan tillstånd.</p>
                <div className="pt-4 border-t border-primary/10">
                    <p className="font-semibold text-primary mb-1">Kontakt</p>
                    <p><a href="mailto:info@norrsyn.se" className="text-accent hover:underline font-semibold">info@norrsyn.se</a></p>
                </div>
            </div>
            <div className="mt-12">
                <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-primary transition-colors">
                    ← Tillbaka till startsidan
                </a>
            </div>
        </main>
        <footer className="bg-dark text-white/40 text-xs font-mono py-6 px-8 mt-24">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between gap-2">
                <span>© 2026 Norrsyn AB</span>
                <a href="/integritetspolicy" className="hover:text-accent transition-colors">Integritetspolicy</a>
            </div>
        </footer>
    </div>
);
