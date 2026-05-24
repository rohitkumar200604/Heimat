"use client";

import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/layout/Footer";

export default function TenantDashboard() {
  const { t, language } = useLanguage();

  const pipeline = [
    { labelDe: "Suche", labelEn: "Discovery", active: true },
    { labelDe: "Bewerbung", labelEn: "Intent", active: true },
    { labelDe: "Unterlagen", labelEn: "Documents", active: true },
    { labelDe: "Prüfung", labelEn: "AI Match", active: true },
    { labelDe: "Genehmigung", labelEn: "Approval", active: false },
    { labelDe: "Kaution", labelEn: "Deposit", active: false },
    { labelDe: "Einzug", labelEn: "Move-In", active: false },
  ];

  const documents = [
    { id: 1, nameDe: "Personalausweis / Reisepass", nameEn: "Passport / ID Card", status: "approved" },
    { id: 2, nameDe: "Immatrikulationsbescheinigung", nameEn: "Enrollment Certificate", status: "approved" },
    { id: 3, nameDe: "Einkommensnachweis", nameEn: "Proof of Income", status: "pending" },
    { id: 4, nameDe: "Visum / Aufenthaltstitel", nameEn: "Visa / Residence Permit", status: "pending" },
  ];

  return (
    <>
      <div className="flex-grow py-12 px-5 max-w-[1280px] mx-auto w-full">
        {/* Welcome Header */}
        <div className="mb-10">
          <span className="text-[14px] text-secondary font-bold uppercase tracking-wider block mb-1">
            {t("tenantDashTitle")}
          </span>
          <h1 className="text-display-lg-mobile md:text-headline-lg font-bold text-primary">
            {t("welcome")} Maximilian!
          </h1>
        </div>

        {/* Dashboard Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Visual Status Pipeline - 8 Cols */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
              <h2 className="text-headline-md font-bold text-primary mb-6">
                {t("applicationStatus")}
              </h2>

              <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto my-10">
                {/* Track */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant -z-10 -translate-y-1/2" />
                {/* Progress */}
                <div className="absolute top-1/2 left-0 w-[42%] h-[2px] bg-primary -z-10 -translate-y-1/2" />

                {pipeline.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[12px] font-bold shadow transition-all ${
                        step.active ? "bg-primary text-on-primary" : "bg-outline-variant text-on-surface-variant"
                      }`}
                    >
                      {step.active ? <span className="material-symbols-outlined text-[14px]">check</span> : idx + 1}
                    </div>
                    <span className={`text-[11px] font-bold ${step.active ? "text-primary" : "text-on-surface-variant"}`}>
                      {language === "de" ? step.labelDe : step.labelEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Bookings Countdown card */}
            <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div>
                <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  {language === "de" ? "Wohnung" : "Property"}
                </p>
                <h3 className="text-headline-md font-bold text-primary mt-1">
                  Torstraße 142
                </h3>
                <p className="text-body-md text-on-surface-variant">10119 Berlin</p>
              </div>

              <div className="text-center bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-[28px] mb-1">
                  calendar_today
                </span>
                <p className="text-[12px] text-on-surface-variant font-semibold uppercase">{t("moveInDate")}</p>
                <p className="text-body-md font-bold text-primary mt-0.5">01.09.2024</p>
              </div>

              <div className="text-center bg-primary-fixed/20 p-4 rounded-xl border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[28px] mb-1">
                  hourglass_empty
                </span>
                <p className="text-[12px] text-primary font-bold uppercase">{t("countdownToMoveIn")}</p>
                <p className="text-[28px] font-bold text-primary leading-none mt-1">98</p>
              </div>
            </div>
          </div>

          {/* Verification documents - 4 Cols */}
          <div className="lg:col-span-4 bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-headline-md font-bold text-primary">
              {t("verificationStatus")}
            </h2>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/50">
                  <div>
                    <p className="text-label-md font-bold text-primary">
                      {language === "de" ? doc.nameDe : doc.nameEn}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">PDF</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.status === "approved" ? (
                      <span className="bg-primary text-on-primary px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                        OK
                      </span>
                    ) : (
                      <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                        {language === "de" ? "Wartend" : "Pending"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full bg-primary text-on-primary py-3 rounded-xl text-label-md font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer">
              {language === "de" ? "Dokumente verwalten" : "Manage Documents"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
