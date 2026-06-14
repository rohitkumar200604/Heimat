"use client";

import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/layout/Footer";

export default function DatenschutzPage() {
  const { language } = useLanguage();

  return (
    <>
      <main className="flex-grow py-16 px-5 max-w-[800px] mx-auto w-full space-y-8">
        <h1 className="text-display-lg-mobile md:text-headline-lg font-bold text-primary">
          {language === "de" ? "Datenschutzerklärung (DSGVO)" : "Privacy Policy (GDPR)"}
        </h1>

        <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-headline-md font-bold text-primary">
              {language === "de" ? "1. Datenschutz auf einen Blick" : "1. Privacy at a Glance"}
            </h2>
            <p>
              {language === "de"
                ? "Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Personenbezogene Dokumente, die Sie für das \"Book Before Arrival\"-Verfahren hochladen (wie Reisepass, Visum, Immatrikulationsbescheinigung und Einkommensnachweise), werden ausschließlich verschlüsselt auf deutschen Servern gespeichert."
                : "We take the protection of your personal data extremely seriously. Personal documents uploaded for the \"Book Before Arrival\" process (such as passport, visa, enrollment certificate, and proof of income) are stored fully encrypted on servers in Germany."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-md font-bold text-primary">
              {language === "de" ? "2. Erhebung und Speicherung personenbezogener Daten" : "2. Collection and Storage of Personal Data"}
            </h2>
            <p>
              {language === "de"
                ? "Für die Bereitstellung unserer Dienstleistungen erfassen wir Kontaktdaten (Name, E-Mail-Adresse, Telefonnummer) und Bonitätsunterlagen. Diese Unterlagen werden nach Mietvertragsabschluss bzw. spätestens 90 Tage nach Ablauf der Buchungsanfrage gelöscht."
                : "To provide our services, we collect contact information (name, email address, phone number) and credit documents. These documents are permanently deleted upon lease completion or at the latest 90 days after the booking request expires."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-md font-bold text-primary">
              {language === "de" ? "3. Ihre Rechte (Auskunft, Löschung, Widerruf)" : "3. Your Rights (Access, Deletion, Revocation)"}
            </h2>
            <p>
              {language === "de"
                ? "Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen."
                : "You have the right at any time to receive free information about the origin, recipient, and purpose of your stored personal data. You also have a right to demand the correction, blocking, or deletion of this data."}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
