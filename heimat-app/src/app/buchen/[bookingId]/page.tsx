"use client";

import { useState, use } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/layout/Footer";

export default function BookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const { t, language } = useLanguage();
  const [paid, setPaid] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);

  const uploadDoc = (type: string) => {
    setUploaded((prev) => [...prev, type]);
  };

  const handlePayment = () => {
    setPaid(true);
    alert(
      language === "de"
        ? "Zahlung erfolgreich! Der Betrag wird treuhänderisch verwaltet."
        : "Payment successful! The amount will be safely held in escrow."
    );
  };

  return (
    <>
      <main className="flex-grow py-12 px-5 max-w-[900px] mx-auto w-full space-y-8">
        {/* Header card */}
        <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
          <span className="text-[12px] text-secondary font-bold uppercase tracking-wider block">
            {t("bookingDetails")}
          </span>
          <h1 className="text-headline-lg font-bold text-primary mt-1">
            Application ID: #{bookingId || "mock-apply-87a"}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">
            {t("escrowNotice")}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Document Section */}
          <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-headline-md font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
              {t("verifyTitle")}
            </h2>

            <div className="space-y-4">
              {[
                { key: "passport", label: t("docPassport") },
                { key: "visa", label: t("docVisa") },
                { key: "enroll", label: t("docEnrollment") },
              ].map(({ key, label }) => {
                const ok = uploaded.includes(key);
                return (
                  <div key={key} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 flex justify-between items-center">
                    <div>
                      <p className="text-label-md font-bold text-primary">{label}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        {ok ? "document.pdf" : (language === "de" ? "PDF hochladen" : "Upload PDF")}
                      </p>
                    </div>
                    {ok ? (
                      <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    ) : (
                      <button
                        onClick={() => uploadDoc(key)}
                        className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      >
                        {language === "de" ? "Auswählen" : "Select"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-headline-md font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px]">payments</span>
                {t("costsTitle")}
              </h2>

              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 space-y-2">
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>{t("coldRent")}</span>
                  <span>1.850,00 €</span>
                </div>
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>{t("utilities")}</span>
                  <span>240,00 €</span>
                </div>
                <div className="flex justify-between text-body-md text-on-surface-variant">
                  <span>{t("heatingCosts")}</span>
                  <span>110,00 €</span>
                </div>
                <div className="h-px bg-outline-variant my-2" />
                <div className="flex justify-between text-headline-md font-bold text-primary">
                  <span>{t("totalRent")}</span>
                  <span>2.200,00 €</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              {paid ? (
                <div className="w-full bg-primary-fixed/20 border border-primary/20 p-4 rounded-xl flex items-center justify-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  {language === "de" ? "Kaution hinterlegt" : "Deposit Escrowed"}
                </div>
              ) : (
                <button
                  onClick={handlePayment}
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer text-label-md"
                >
                  {t("payDeposit")}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
