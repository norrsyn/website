import React from 'react';

// ==========================================
// Base Layout Wrapper for Legal Pages
// ==========================================
/* Per-route head correctness for the SPA: each public page declares its own
   canonical and title (the static index.html only knows the homepage), and
   the 404 route marks itself noindex so the rewrite's 200-status pages never
   pollute the index. Routes are full page loads, so set-and-forget is safe. */
const useRouteMeta = (title, path, noindex) => {
    React.useEffect(() => {
        document.title = `${title} – Norrsyn`;
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && path) canonical.setAttribute('href', `https://norrsyn.se${path}`);
        if (noindex) {
            const robots = document.querySelector('meta[name="robots"]');
            if (robots) robots.setAttribute('content', 'noindex');
        }
    }, [title, path, noindex]);
};

const LegalLayout = ({ title, children, footerLinks, path, noindex }) => {
    useRouteMeta(title, path, noindex);
    return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
        <nav className="on-dark bg-graphite text-white px-6 sm:px-10 py-5 flex items-center justify-between">
            <a href="/" className="font-sans font-bold text-sm tracking-[0.22em] uppercase text-white">
                Norrsyn<span className="text-green">_</span>
            </a>
        </nav>
        <main className="max-w-3xl mx-auto px-6 py-16 md:py-24 flex-grow w-full">
            <h1 className="font-sans font-semibold text-[2.1rem] md:text-[2.6rem] text-ink mb-4 tracking-[-0.035em] leading-[1.1]">{title}</h1>
            <div className="w-16 h-px bg-green-deep mb-10" aria-hidden="true"></div>
            <div className="font-sans text-ink-3 space-y-6 leading-[1.75] text-[15px]">
                {children}
            </div>
            <div className="mt-16 pt-8 border-t border-ink/10">
                <a href="/" className="link-underline inline-flex items-center gap-2 text-sm font-semibold text-green-deep">
                    ← Tillbaka till startsidan
                </a>
            </div>
        </main>
        <footer className="on-dark bg-graphite text-white/35 text-[11.5px] font-mono py-6 px-6 sm:px-10 mt-auto">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between gap-2">
                <span>© 2026 NRSYN AB</span>
                <div className="flex gap-4 sm:gap-6 flex-wrap mt-2 sm:mt-0">
                    {footerLinks.map((link, i) => (
                        <a key={i} href={link.path} className="link-underline hover:text-white/70 transition-colors">{link.label}</a>
                    ))}
                </div>
            </div>
        </footer>
    </div>
    );
};

// ==========================================
// Integritetspolicy
//
// Written against what the site actually does, verified in the repository:
//   · the form POSTs to /api/contact, which sends ONE email via Resend to
//     info@norrsyn.se with the submitter set as reply-to. There is no database
//     and nothing is written to storage — the submission lives in a mailbox.
//   · hosting and analytics are Vercel; Vercel Analytics is cookieless.
//   · the page sets no cookies and uses no localStorage or sessionStorage.
//   · fonts load from Google Fonts and the photographs from Unsplash, so those
//     two also receive the visitor's IP address. That was previously undisclosed.
// No compliance claim is made anywhere, and no retention period is invented.
// ==========================================
export const Integritetspolicy = () => (
    <LegalLayout title="Integritetspolicy" path="/integritetspolicy" footerLinks={[
        { label: "Användarvillkor", path: "/anvandarvillkor" },
        { label: "Cookiepolicy", path: "/cookiepolicy" }
    ]}>
        <p className="font-semibold text-ink text-lg">NRSYN AB, som driver tjänsten Norrsyn, ansvarar för de personuppgifter som behandlas på den här webbplatsen.</p>

        <p className="font-semibold mt-6 text-ink mb-1">Vad vi samlar in</p>
        <p>Webbplatsen har ett enda formulär. Skickar ni det behandlar vi de uppgifter ni själva fyller i:</p>
        <ul className="space-y-1 pl-4">
            <li>• namn</li>
            <li>• företagsnamn</li>
            <li>• e-postadress</li>
            <li>• telefonnummer, om ni anger det</li>
            <li>• det ni skriver om er målmarknad eller verksamhet</li>
        </ul>
        <p>Vi samlar inte in något annat om er. Vi skapar inga konton och vi profilerar inte besökare.</p>

        <p className="font-semibold mt-6 text-ink mb-1">Vad som händer med uppgifterna</p>
        <p>Formuläret sparas inte i någon databas. Innehållet skickas som ett e-postmeddelande till oss på info@norrsyn.se, med er e-postadress som svarsadress. Uppgifterna finns därefter i vår e-post och används för att besvara er förfrågan, förstå ert behov och föra dialogen vidare om ni vill det.</p>
        <p>Vi säljer inte era uppgifter och lämnar dem inte vidare för marknadsföring.</p>

        <p className="font-semibold mt-6 text-ink mb-1">Leverantörer som behandlar uppgifter åt oss</p>
        <ul className="space-y-1 pl-4">
            <li>• <span className="text-ink">Vercel</span> driftar webbplatsen och levererar den till er webbläsare.</li>
            <li>• <span className="text-ink">Resend</span> skickar e-postmeddelandet från formuläret till oss.</li>
        </ul>
        <p>Båda är amerikanska leverantörer. Om ni vill veta mer om hur den överföringen hanteras går det bra att höra av er.</p>

        <p className="font-semibold mt-6 text-ink mb-1">Tjänster som laddas när ni besöker sidan</p>
        <p>Typsnitten hämtas från Google Fonts och fotografierna från Unsplash. Er IP-adress når därför även dessa tjänster när sidan visas. Vi tar inte emot någon uppgift från dem.</p>

        <p className="font-semibold mt-6 text-ink mb-1">Hur länge vi behåller uppgifterna</p>
        <p>Vi behåller er förfrågan så länge den behövs för att hantera kontakten och en eventuell fortsatt dialog. Vill ni att vi raderar den tidigare gör vi det.</p>

        <p className="font-semibold mt-6 text-ink mb-1">Era rättigheter</p>
        <p>Ni har rätt att få veta vilka uppgifter vi har om er, att få dem rättade och att få dem raderade. Hör av er så ordnar vi det:</p>
        <p><a href="mailto:info@norrsyn.se" className="text-green-deep hover:underline font-semibold">info@norrsyn.se</a></p>

        <p className="text-ink/50 text-sm pt-4 border-t border-ink/12">NRSYN AB · Jönköping, Sverige · Senast uppdaterad: augusti 2026</p>
    </LegalLayout>
);

// ==========================================
// Användarvillkor
// ==========================================
export const Anvandarvillkor = () => (
    <LegalLayout title="Användarvillkor" path="/anvandarvillkor" footerLinks={[
        { label: "Integritetspolicy", path: "/integritetspolicy" },
        { label: "Cookiepolicy", path: "/cookiepolicy" }
    ]}>
        <p>Genom att använda den här webbplatsen godkänner ni villkoren nedan.</p>
        <p>Webbplatsen beskriver Norrsyns tjänster inom research, analys och identifiering av affärsmöjligheter för B2B-företag. Norrsyn är ett varumärke och en tjänst från NRSYN AB.</p>
        <p>Exempel på Briefs, bolag, personer och siffror som visas på webbplatsen är påhittade och finns här för att visa hur ett underlag är uppbyggt. De beskriver inga verkliga bolag.</p>
        <p>Att skicka in formuläret innebär inte att ett uppdrag eller avtal uppstår. Ett samarbete kommer till stånd först när vi har kommit överens skriftligen.</p>
        <p>NRSYN AB förbehåller sig rätten att uppdatera innehållet på webbplatsen utan att meddela det i förväg.</p>
        <p>Allt innehåll på webbplatsen tillhör NRSYN AB om inget annat anges och får inte kopieras eller användas kommersiellt utan tillstånd.</p>
        <div className="pt-4 border-t border-ink/12 mt-2 border-dashed">
            <p className="font-semibold text-ink mb-1">Kontakt</p>
            <p><a href="mailto:info@norrsyn.se" className="text-green-deep hover:underline font-semibold">info@norrsyn.se</a></p>
            <p className="text-ink/50 text-sm mt-3">NRSYN AB · Jönköping, Sverige</p>
        </div>
    </LegalLayout>
);

// ==========================================
// Cookiepolicy
// ==========================================
export const Cookiepolicy = () => (
    <LegalLayout title="Cookiepolicy" path="/cookiepolicy" footerLinks={[
        { label: "Integritetspolicy", path: "/integritetspolicy" },
        { label: "Användarvillkor", path: "/anvandarvillkor" }
    ]}>
        <p className="font-semibold text-ink text-lg">Den här webbplatsen sätter inga kakor.</p>
        <p>Vi använder varken kakor för marknadsföring eller för att känna igen er mellan besök. Webbplatsen lagrar heller ingenting i webbläsarens lokala lagring. Därför finns här ingen samtyckesruta att klicka bort.</p>

        <p className="font-semibold mt-6 text-ink mb-1">Besöksstatistik</p>
        <p>Vi använder Vercel Analytics för att se hur webbplatsen används och hur snabbt den laddar. Tjänsten är utformad för att fungera utan kakor och utan att identifiera enskilda besökare, och vi får bara aggregerad statistik.</p>

        <p className="font-semibold mt-6 text-ink mb-1">Innehåll som hämtas från andra</p>
        <p>Typsnitten hämtas från Google Fonts och fotografierna från Unsplash. De sätter inga kakor här, men er IP-adress når dem när sidan laddas. Det är en teknisk följd av att innehållet hämtas därifrån.</p>

        <p className="font-semibold mt-6 text-ink mb-1">Annonsering</p>
        <p>Vi säljer inte er data och vi släpper inte in annonsnätverk på webbplatsen.</p>

        <div className="pt-4 border-t border-ink/12 mt-6 border-dashed">
            <p>Frågor om hur vi hanterar besöksstatistik besvarar vi gärna:</p>
            <p><a href="mailto:info@norrsyn.se" className="text-green-deep hover:underline font-semibold mt-1 inline-block">info@norrsyn.se</a></p>
            <p className="text-ink/50 text-sm mt-3">NRSYN AB · Jönköping, Sverige</p>
        </div>
    </LegalLayout>
);

// ==========================================
// 404
//
// The SPA rewrite sends every unmatched path to index.html, so without this the
// site answered /vad-som-helst with a pixel-perfect copy of the homepage. That
// is worse than an error page: it is a duplicate of the site at every URL a
// crawler or a mistyped link can invent. The HTTP status is still 200 — that
// part is the rewrite's doing and cannot be fixed from the client.
// ==========================================
export const NotFound = () => (
    <LegalLayout title="Sidan finns inte" noindex footerLinks={[
        { label: "Integritetspolicy", path: "/integritetspolicy" },
        { label: "Användarvillkor", path: "/anvandarvillkor" },
        { label: "Cookiepolicy", path: "/cookiepolicy" }
    ]}>
        <p>Adressen ni försökte nå finns inte på norrsyn.se. Den kan ha flyttats,
        eller så har länken blivit fel någonstans på vägen.</p>
        <p>Hör gärna av er om ni letade efter något specifikt:{' '}
            <a href="mailto:info@norrsyn.se" className="text-green-deep hover:underline font-semibold">info@norrsyn.se</a>
        </p>
    </LegalLayout>
);
