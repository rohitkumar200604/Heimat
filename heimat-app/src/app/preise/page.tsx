"use client";

import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/layout/Footer";

export default function PreisePage() {
  const { t, language } = useLanguage();

  return (
    <>
      <main className="flex-grow py-16 px-5 max-w-[1200px] mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-headline-lg font-bold text-primary">
            {t("pricingTitle")}
          </h1>
          <p className="text-on-surface-variant text-body-md">
            {t("pricingSubtitle")}
          </p>
        </div>

        {/* Pricing Cards Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Tenant early access */}
          <div className="bg-white border border-outline-variant rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-6">
              <span className="text-[12px] text-secondary font-bold uppercase tracking-wider bg-secondary-container/50 px-3 py-1 rounded-full">
                {t("earlyAccess")}
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[40px] font-bold text-primary">9 €</span>
                <span className="text-on-surface-variant text-[14px]">/ {language === "de" ? "Einmalig" : "One-time"}</span>
              </div>
              <ul className="space-y-3 text-body-md text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                  {language === "de" ? "Bevorzugte Bewerbungen" : "Priority applications"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                  {language === "de" ? "WhatsApp Status-Updates" : "WhatsApp status updates"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                  {language === "de" ? "Escrow Buchungsverfahren" : "Escrow booking process"}
                </li>
              </ul>
            </div>
            <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all mt-8 cursor-pointer">
              {language === "de" ? "Early Access sichern" : "Secure Early Access"}
            </button>
          </div>

          {/* Free Landlord */}
          <div className="bg-white border border-outline-variant rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-6">
              <span className="text-[12px] text-on-surface-variant font-bold uppercase tracking-wider bg-surface-container-high px-3 py-1 rounded-full">
                {language === "de" ? "Vermieter Kostenlos" : "Landlord Free"}
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[40px] font-bold text-primary">0 €</span>
                <span className="text-on-surface-variant text-[14px]">/ {language === "de" ? "Monat" : "Month"}</span>
              </div>
              <ul className="space-y-3 text-body-md text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                  {language === "de" ? "1 aktives Inserat" : "1 active listing"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                  {language === "de" ? "Standard Bewerber-Liste" : "Standard applicant list"}
                </li>
                <li className="flex items-center gap-2 text-outline-variant">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                  {language === "de" ? "Keine AI Eignungs-Filter" : "No AI matching filters"}
                </li>
              </ul>
            </div>
            <button className="w-full border border-outline-variant text-primary py-3 rounded-xl font-bold hover:bg-surface-container-low active:scale-95 transition-all mt-8 cursor-pointer">
              {language === "de" ? "Kostenlos starten" : "Start Free"}
            </button>
          </div>

          {/* Pro Landlord */}
          <div className="bg-white border-2 border-primary rounded-2xl p-8 flex flex-col justify-between shadow-lg relative">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              {language === "de" ? "Empfohlen" : "Recommended"}
            </div>
            <div className="space-y-6">
              <span className="text-[12px] text-primary font-bold uppercase tracking-wider bg-primary-fixed px-3 py-1 rounded-full">
                {language === "de" ? "Vermieter Pro" : "Landlord Pro"}
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[40px] font-bold text-primary">29 €</span>
                <span className="text-on-surface-variant text-[14px]">/ {language === "de" ? "Monat" : "Month"}</span>
              </div>
              <ul className="space-y-3 text-body-md text-on-surface-variant">
                <li className="flex items-center gap-2 font-bold text-primary">
                  <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                  {language === "de" ? "Unbegrenzte Inserate" : "Unlimited listings"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                  {language === "de" ? "AI Eignungs-Filter (98% Match)" : "AI matching filters (98% match)"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                  {language === "de" ? "Automatische WhatsApp Updates" : "Automated WhatsApp updates"}
                </li>
              </ul>
            </div>
            <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all mt-8 cursor-pointer shadow">
              {language === "de" ? "Pro 14 Tage testen" : "Try Pro for 14 Days"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
