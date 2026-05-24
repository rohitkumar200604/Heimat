"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";

const PHOTO_PREVIEWS = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqewztWOsWA3pPKxeN1pbAZKo_yo5ILOrtcwmzVoDwtlBJjCF4wUfBVCcuAQoJmQn4ZH5zl7LXq5PQLadp_TlnmhA7ZIdzDP3bRssz7ogpzsS-jDMdWkZAx55_F5zlfPbWbp5iCXRTCqTVmz0KEQ-5K6Ru_eaf_ewIrvLlTz3HwdKY1UIcz2_nNwtjOdvv33tmXQZMkvTsx18V2lf4Je0na_s8cyxdicPzaC5NNJIh_Kxe-hxfoukRAgpsmuwKZGRHCxLLI8LEo4IS",
    alt: "Wohnzimmer",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxwvxlF1vh2kgG2jIRBlES6rqXj31XQOjXfvtKQmZjc54b8J3abMHJVc_oYyyw-_f2HTFLp4QCtre6cPK2EZABy-vfZAacbm-kzQgDOZ5JyZS9JzpJrr-cssypFMn3N3XhquF90rkJ4VYrft1-24u-VkfRzAJ_ygOi-QJvIpLH-FkVHi7Zu9cNWOEaDCnI9WFhPwlPEAnLmD-JHHQqyZ4lKc9SVCe5MNCR0Yx_97CyT15-KJ7Hwo0uLZKsr79FoH-Fwpx1njU4II80",
    alt: "Küche",
  },
];

export default function InserierenPage() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);

  const [step1, setStep1] = useState({ typ: "apartment", strasse: "", plz: "", stadt: "" });
  const [step2, setStep2] = useState({ kaltmiete: "", nebenkosten: "", flaeche: "", zimmer: "" });
  const [step4, setStep4] = useState({ titel: "", beschreibung: "" });

  const stepsList = [
    { num: 1, label: t("indicatorBasis"), icon: "location_on" },
    { num: 2, label: t("indicatorPrice"), icon: "euro_symbol" },
    { num: 3, label: t("indicatorPhotos"), icon: "add_a_photo" },
    { num: 4, label: t("indicatorDesc"), icon: "description" },
  ];

  const amenityOpts = [
    t("balcony"),
    t("kitchen"),
    language === "de" ? "Aufzug" : "Elevator",
    language === "de" ? "Parkplatz" : "Parking Spot",
    t("petsAllowed"),
    language === "de" ? "Garten" : "Garden",
    language === "de" ? "Keller" : "Cellar",
    language === "de" ? "Klimaanlage" : "Air conditioning",
  ];

  const progressPct = ((step - 1) / (stepsList.length - 1)) * 100;

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const goNext = () => {
    if (step < stepsList.length) setStep(step + 1);
    else {
      alert(
        language === "de"
          ? "Vielen Dank! Ihr Inserat wird nun geprüft und innerhalb von 24 Stunden veröffentlicht."
          : "Thank you! Your listing is now being verified and will be published within 24 hours."
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    if (step > 1) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="max-w-[1280px] mx-auto px-5 md:px-[48px] py-12 w-full">
        {/* ── Wizard Header ────────────────────────── */}
        <section className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            {t("wizardTitle")}
          </h1>
          <p className="text-on-surface-variant text-body-md mb-8">
            {t("wizardSubtitle")}
          </p>

          {/* Step Indicators */}
          <div className="relative flex justify-between items-center w-full max-w-md mx-auto mb-3">
            {/* Track */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant -z-10 -translate-y-1/2" />
            {/* Progress */}
            <div
              className="absolute top-1/2 left-0 h-[2px] bg-primary -z-10 -translate-y-1/2 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
            {stepsList.map(({ num }) => {
              const done = num < step;
              const active = num === step;
              return (
                <div key={num} className="flex flex-col items-center gap-2" id={`step-indicator-${num}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] border-4 border-background transition-all ${
                      done
                        ? "bg-primary text-on-primary"
                        : active
                        ? "bg-primary text-on-primary shadow-[0_0_0_4px_rgba(0,32,70,0.1)]"
                        : "bg-outline-variant text-on-surface-variant"
                    }`}
                  >
                    {done ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      num
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between max-w-md mx-auto px-1">
            {stepsList.map(({ num, label }) => (
              <span
                key={num}
                className={`text-[12px] font-semibold transition-colors ${
                  num <= step ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* ── Step Cards ──────────────────────────── */}
        <div className="max-w-4xl mx-auto">
          <form id="wizard-form" onSubmit={(e) => e.preventDefault()}>
            {/* Step 1: Basisdaten */}
            {step === 1 && (
              <div id="step-1" className="glass-card rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary text-[32px]">location_on</span>
                  <h2 className="text-headline-md">{t("step1Title")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface font-medium">{t("propertyType")}</label>
                    <select
                      id="step1-typ"
                      value={step1.typ}
                      onChange={(e) => setStep1({ ...step1, typ: e.target.value })}
                      className="w-full h-14 bg-surface border border-outline-variant rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-[16px]"
                    >
                      <option value="apartment">{t("apartment")}</option>
                      <option value="house">{t("house")}</option>
                      <option value="studio">{t("studio")}</option>
                      <option value="sharedRoom">{t("sharedRoom")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface font-medium">{t("streetNumber")}</label>
                    <input
                      id="step1-strasse"
                      type="text"
                      placeholder="Beispielstraße 12"
                      value={step1.strasse}
                      onChange={(e) => setStep1({ ...step1, strasse: e.target.value })}
                      className="w-full h-14 bg-surface border border-outline-variant rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-[16px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface font-medium">{t("zipCode")}</label>
                    <input
                      id="step1-plz"
                      type="text"
                      placeholder="10115"
                      value={step1.plz}
                      onChange={(e) => setStep1({ ...step1, plz: e.target.value })}
                      className="w-full h-14 bg-surface border border-outline-variant rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-[16px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface font-medium">{t("city")}</label>
                    <input
                      id="step1-stadt"
                      type="text"
                      placeholder="Berlin"
                      value={step1.stadt}
                      onChange={(e) => setStep1({ ...step1, stadt: e.target.value })}
                      className="w-full h-14 bg-surface border border-outline-variant rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-[16px]"
                    />
                  </div>
                </div>

                {/* Map preview */}
                <div className="mt-8 rounded-xl overflow-hidden h-64 relative bg-surface-container">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD94nyJ1YRRt89xS3wi1OzlMWVTkpAwVuGUUQkDsnBuoc7dFQoDXrr6psrlKaT9upkVFPozd2j_Tgs5vVEaIRCMjShiPimpsXJVun_NL2iHaznZWol5qSQ0wxqwnBzlBbGF69gZEB4pRGslCUrEhK5F46sbP9Tc8O-ELFwIw32cGCVCCeelmQH3h0yJMlV_pB5SIyQHTHx4oBn-cmvsxx0xG_FU95DPByq3vtFHezsh2FSiaMA3o5k_Szc2Jzo3Ekbb_LKMg3lAFX-f"
                    alt="Kartenvorschau"
                    className="w-full h-full object-cover grayscale opacity-80"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg animate-pulse" />
                </div>
              </div>
            )}

            {/* Step 2: Preis & Maße */}
            {step === 2 && (
              <div id="step-2" className="glass-card rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary text-[32px]">euro_symbol</span>
                  <h2 className="text-headline-md">{t("step2Title")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                  {[
                    { id: "kaltmiete", label: `${t("coldRent")} (€)`, placeholder: "0.00", key: "kaltmiete" },
                    { id: "nebenkosten", label: `${t("utilities")} (€)`, placeholder: "0.00", key: "nebenkosten" },
                    { id: "flaeche", label: `${t("livingArea")} (m²)`, placeholder: "z.B. 75", key: "flaeche" },
                    { id: "zimmer", label: `${t("rooms")}`, placeholder: "z.B. 3", key: "zimmer" },
                  ].map(({ id, label, placeholder, key }) => (
                    <div key={id} className="space-y-2">
                      <label className="text-label-md text-on-surface font-medium">{label}</label>
                      <input
                        id={`step2-${id}`}
                        type="number"
                        placeholder={placeholder}
                        value={step2[key as keyof typeof step2]}
                        onChange={(e) => setStep2({ ...step2, [key]: e.target.value })}
                        className="w-full h-14 bg-surface border border-outline-variant rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-[16px]"
                      />
                    </div>
                  ))}
                </div>

                {/* Market insight */}
                <div className="mt-8 p-6 bg-surface-container-low rounded-xl flex items-center gap-6 border border-outline-variant">
                  <span className="material-symbols-outlined text-primary text-[40px] flex-shrink-0">analytics</span>
                  <div>
                    <p className="text-label-md text-primary font-bold">{t("marketAnalysis")}</p>
                    <p className="text-body-md text-on-surface-variant mt-0.5">
                      {t("marketAnalysisDesc")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Fotos */}
            {step === 3 && (
              <div id="step-3" className="glass-card rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary text-[32px]">add_a_photo</span>
                  <h2 className="text-headline-md">{t("step3Title")}</h2>
                </div>

                {/* Drop zone */}
                <div
                  id="dropzone"
                  className="border-2 border-dashed border-outline rounded-xl p-10 md:p-12 text-center bg-surface-container-lowest hover:bg-surface-container transition-colors group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[64px] text-outline-variant group-hover:text-primary mb-4 transition-colors block">
                    cloud_upload
                  </span>
                  <p className="text-headline-md mb-2">{t("dragDropText")}</p>
                  <p className="text-on-surface-variant text-body-md mb-6">
                    {t("dragDropSubtext")}
                  </p>
                  <button
                    id="btn-select-files"
                    type="button"
                    className="bg-primary text-on-primary px-8 py-3 rounded-lg text-label-md transition-all active:scale-95 font-semibold cursor-pointer"
                  >
                    {t("selectFilesBtn")}
                  </button>
                </div>

                {/* Preview grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {PHOTO_PREVIEWS.map((p, i) => (
                    <div key={i} className="aspect-video bg-surface-container rounded-lg relative overflow-hidden group">
                      <img src={p.src} alt={p.alt} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                  {[0, 1].map((i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-video bg-surface-container border-2 border-dashed border-outline-variant rounded-lg flex items-center justify-center text-outline-variant cursor-pointer hover:border-primary hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[28px]">add</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Beschreibung */}
            {step === 4 && (
              <div id="step-4" className="glass-card rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary text-[32px]">description</span>
                  <h2 className="text-headline-md">{t("step4Title")}</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface font-medium">{t("listingTitleLabel")}</label>
                    <input
                      id="step4-titel"
                      type="text"
                      placeholder={t("listingTitlePlaceholder")}
                      value={step4.titel}
                      onChange={(e) => setStep4({ ...step4, titel: e.target.value })}
                      className="w-full h-14 bg-surface border border-outline-variant rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-[16px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface font-medium">{t("descriptionLabel")}</label>
                    <textarea
                      id="step4-beschreibung"
                      rows={6}
                      placeholder={t("descriptionPlaceholder")}
                      value={step4.beschreibung}
                      onChange={(e) => setStep4({ ...step4, beschreibung: e.target.value })}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none text-[16px]"
                    />
                  </div>

                  {/* Amenity checkboxes */}
                  <div>
                    <p className="text-label-md text-on-surface font-medium mb-3">{t("amenitiesLabel")}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {amenityOpts.map((a) => (
                        <label
                          key={a}
                          htmlFor={`amenity-${a}`}
                          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                            amenities.includes(a)
                              ? "border-primary bg-primary-fixed"
                              : "border-outline-variant hover:bg-surface-container-low"
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`amenity-${a}`}
                            checked={amenities.includes(a)}
                            onChange={() => toggleAmenity(a)}
                            className="w-5 h-5 rounded accent-primary"
                          />
                          <span className="text-label-md">{a}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation Controls ─────────────── */}
            <div className="flex justify-between items-center mt-10 pt-8 border-t border-outline-variant flex-wrap gap-4">
              <button
                id="btn-prev"
                type="button"
                onClick={goPrev}
                className={`flex items-center gap-2 text-primary text-label-md px-6 py-3 rounded-lg hover:bg-surface-container transition-all active:scale-95 font-medium cursor-pointer ${
                  step === 1 ? "invisible" : "visible"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                {t("backBtn")}
              </button>

              <div className="flex gap-4">
                <button
                  id="btn-entwurf"
                  type="button"
                  className="hidden md:block text-on-surface-variant text-label-md px-6 py-3 rounded-lg hover:bg-surface-container transition-all font-medium cursor-pointer"
                >
                  {t("saveDraftBtn")}
                </button>
                <button
                  id="btn-next"
                  type="button"
                  onClick={goNext}
                  className={`flex items-center gap-2 text-label-md px-8 py-3 rounded-lg hover:opacity-90 shadow-lg transition-all active:scale-95 font-semibold cursor-pointer ${
                    step === stepsList.length
                      ? "bg-secondary text-on-secondary shadow-secondary/20"
                      : "bg-primary text-on-primary shadow-primary/20"
                  }`}
                >
                  {step === stepsList.length ? (
                    <>
                      {t("publishBtn")}
                      <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                    </>
                  ) : (
                    <>
                      {t("nextBtn")}
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
