"use client";

import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/layout/Footer";

export default function ImpressumPage() {
  const { language } = useLanguage();

  return (
    <>
      <main className="flex-grow py-16 px-5 max-w-[800px] mx-auto w-full space-y-8">
        <h1 className="text-display-lg-mobile md:text-headline-lg font-bold text-primary">
          {language === "de" ? "Impressum" : "Legal Notice (Impressum)"}
        </h1>

        <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-headline-md font-bold text-primary">
              {language === "de" ? "Angaben gemäß § 5 TMG" : "Specifications according to § 5 TMG"}
            </h2>
            <p className="font-semibold text-primary">Heimat Immobilien GmbH</p>
            <p>Torstraße 142</p>
            <p>10119 Berlin</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-headline-md font-bold text-primary">
              {language === "de" ? "Kontakt" : "Contact"}
            </h2>
            <p>Telefon: +49 (0) 30 123 456 78</p>
            <p>E-Mail: kontakt@heimat-immobilien.de</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-headline-md font-bold text-primary">
              {language === "de" ? "Vertretungsberechtigte Geschäftsführer" : "Represented by Managing Directors"}
            </h2>
            <p>Markus Weber, Rohit Kumar</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-headline-md font-bold text-primary">
              {language === "de" ? "Registereintrag" : "Register entry"}
            </h2>
            <p>Registergericht: Amtsgericht Charlottenburg (Berlin)</p>
            <p>Registernummer: HRB 987654 B</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
