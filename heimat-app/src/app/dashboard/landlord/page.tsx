"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function LandlordDashboard() {
  const { t, language } = useLanguage();
  const [whatsApp, setWhatsApp] = useState(false);
  const [proTier, setProTier] = useState(false);

  const bookings = [
    {
      id: "book-1",
      tenant: "Maximilian K.",
      property: "3-Zimmer Charlottenburg",
      income: "2.400 € / Mon.",
      scores: { overall: 94, emp: 90, doc: 98, inc: 95 },
      status: "approved",
    },
    {
      id: "book-2",
      tenant: "Anya S. (Expat)",
      property: "Loft Torstraße",
      income: "4.100 € / Mon.",
      scores: { overall: 88, emp: 85, doc: 90, inc: 90 },
      status: "docs_review",
    },
  ];

  return (
    <>
      <div className="flex-grow py-12 px-5 max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <div>
            <span className="text-[14px] text-secondary font-bold uppercase tracking-wider block mb-1">
              {t("landlordDashTitle")}
            </span>
            <h1 className="text-display-lg-mobile md:text-headline-lg font-bold text-primary">
              {t("welcome")} Markus!
            </h1>
          </div>
          <Link
            href="/inserieren"
            className="bg-primary text-on-primary px-6 py-3.5 rounded-xl text-label-md font-bold hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer"
          >
            {t("addNewProperty")}
          </Link>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Main area - 8 Cols */}
          <div className="lg:col-span-8 space-y-8">
            {/* Booking Requests */}
            <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
              <h2 className="text-headline-md font-bold text-primary mb-6">
                {t("bookingRequests")}
              </h2>
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 border border-outline-variant rounded-2xl hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div>
                      <h4 className="text-headline-md font-bold text-primary">{b.tenant}</h4>
                      <p className="text-body-md text-on-surface-variant mt-1">
                        {language === "de" ? "Bewerbung für:" : "Applied for:"} <span className="font-semibold">{b.property}</span>
                      </p>
                      <p className="text-[12px] text-on-surface-variant font-medium mt-1">
                        {language === "de" ? "Monatliches Einkommen:" : "Monthly income:"} {b.income}
                      </p>
                    </div>

                    {/* AI Score Indicators */}
                    <div className="flex gap-3 flex-wrap">
                      <div className="bg-primary-fixed/20 px-4 py-2.5 rounded-xl border border-primary/20 text-center">
                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                          {t("tenantMatchScore")}
                        </p>
                        <p className="text-[22px] font-bold text-primary leading-tight mt-0.5">
                          {b.scores.overall}%
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <Link
                          href={`/buchen/${b.id}`}
                          className="bg-surface-container-high text-primary px-4 py-2.5 rounded-xl text-[12px] font-bold hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
                        >
                          {language === "de" ? "Prüfen" : "Review"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area - 4 Cols */}
          <div className="lg:col-span-4 space-y-6">
            {/* Subscription Settings */}
            <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-headline-md font-bold text-primary">
                {language === "de" ? "Abonnement &amp; Tiers" : "Subscription &amp; Tiers"}
              </h3>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">
                    {language === "de" ? "Aktueller Tarif" : "Current Plan"}
                  </p>
                  <p className="text-[18px] font-bold text-primary mt-0.5">
                    {proTier ? "Pro Tier" : "Free Tier"}
                  </p>
                </div>
                <button
                  onClick={() => setProTier(!proTier)}
                  className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[12px] font-bold hover:opacity-90 transition-all cursor-pointer"
                >
                  {proTier ? (language === "de" ? "Downgrade" : "Downgrade") : (language === "de" ? "Upgrade" : "Upgrade")}
                </button>
              </div>

              {/* WhatsApp Toggle with Pro Tier Requirement */}
              <div className="pt-4 border-t border-outline-variant flex justify-between items-center">
                <div>
                  <h4 className="text-label-md font-bold text-primary">{t("whatsAppNotifications")}</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {proTier ? (language === "de" ? "WhatsApp Updates aktiv" : "WhatsApp updates active") : `*${t("proTierOnly")}`}
                  </p>
                </div>
                <button
                  disabled={!proTier}
                  onClick={() => setWhatsApp(!whatsApp)}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center p-0.5 cursor-pointer ${
                    !proTier ? "opacity-30 cursor-not-allowed" : ""
                  } ${whatsApp ? "bg-primary" : "bg-outline-variant"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-all transform ${
                      whatsApp ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
