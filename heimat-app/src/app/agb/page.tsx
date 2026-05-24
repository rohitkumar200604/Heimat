"use client";

import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/layout/Footer";

export default function AGBPage() {
  const { language } = useLanguage();

  return (
    <>
      <main className="flex-grow py-16 px-5 max-w-[800px] mx-auto w-full space-y-8">
        <h1 className="text-display-lg-mobile md:text-headline-lg font-bold text-primary">
          {language === "de" ? "Allgemeine Geschäftsbedingungen (AGB)" : "Terms of Service (AGB)"}
        </h1>

        <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-headline-md font-bold text-primary">
              {language === "de" ? "1. Geltungsbereich & Dienstleistung" : "1. Scope & Service Description"}
            </h2>
            <p>
              {language === "de"
                ? "Heimat betreibt einen Online-Marktplatz, auf dem Vermieter Wohnräume anbieten und Mieter diese vor der Ankunft buchen können. Die Buchungen unterliegen einer Bonitäts- und Identitätsprüfung (Mietrecht BGB §551)."
                : "Heimat operates an online marketplace where landlords can offer housing and tenants can book them before arrival. Bookings are subject to credit and identity verification processes."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-md font-bold text-primary">
              {language === "de" ? "2. Treuhandzahlungen & Stornierung" : "2. Escrow Payments & Cancellations"}
            </h2>
            <p>
              {language === "de"
                ? "Bei einer erfolgreichen Zusage zahlt der Mieter die Kaution und die erste Monatsmiete auf ein Treuhandkonto (escrow). Die Freigabe an den Vermieter erfolgt 48 Stunden nach dem vertraglich vereinbarten Einzugsdatum, um Betrug vorzubeugen."
                : "Upon successful approval, the tenant pays the deposit and first month's rent into an escrow account. The amount is transferred to the landlord 48 hours after the contracted move-in date to prevent fraud."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-headline-md font-bold text-primary">
              {language === "de" ? "3. Servicegebühr" : "3. Service Fee"}
            </h2>
            <p>
              {language === "de"
                ? "Heimat erhebt eine Vermittlungsgebühr von 8% des gesamten Buchungswerts. Diese Gebühr wird direkt während des Zahlungsvorgangs per Stripe Connect einbehalten."
                : "Heimat collects a service fee of 8% of the total booking value. This fee is automatically deducted during checkout via Stripe Connect."}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
