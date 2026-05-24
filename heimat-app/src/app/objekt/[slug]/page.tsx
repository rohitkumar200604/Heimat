"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";

const GALLERY = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuATFFvL_hJbCGEpFlTZR-5caCD-b_223YbwlvFv4xUX9XbGiuRuKS16mGDYxFnAEqtVUuf5Y5vLs3OoUfZvhXniyUVt53Qy-ZLrDG0mQs_vy6yLshgBp6NE0btvoPuouRR7gERsfZdZkIf-xFiXo1ecRikNqtDrssRAT6KSof_Ir8gkfRbWe9OSH8WczOFlCcT2rfhVfhssqtWq8P-yWlYF7zO9YxoiBi08AoLO0IPgfBTlHq6YOYSym2-jJhNANExmlV7flkObwj_h",
    alt: "Wohnzimmer",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNi9bh1w5ssoEw-vPaMA0CeWenIbVWGiMkFRVVsjLTfT7SYHe7gPPzfb4aNgVpgmiSrHtUXEz6mjc-Kudf5-ZAjWnZNRt8PBG-deWIs-_fRiVBlCr8Gu0zyJ05oM-2ENXRUZityWdWEILCWrfM0txQQS9dR7IYxbjvM7ssaCD0zw8_lofS4hgAeuPNsDEXMpZFWvFASDNNuthk4AeqdqEl3sv_H4xOVwUU4VMdXQQ1uRdIAzC9xmEEr_qxCXgO206nd0uEbibzWkC_",
    alt: "Küche",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDERcVTSRD56ZjV-h8CzxjxY_F8mz5UtpqhjkiBZwbZm2BfBA5SGR2kKbuh5kF6hS7wwYfYTbM_ns_NpImfq-VqaeqvxYxc64XhAYf7wV_TME25qYwFBcD5wXT_X3Vn70YZMGJH4m_KTQ43Y3k_yUiBE9jmqft5pEJUpA0EoCxKmGyivAr7SO5E_CVt3XNoSbQSJLamkBHqjgjtWdxGmsFDacPScEbWDigSniL1vmAQ3BZLoyCtL2x60fpmCsu0dBf03zp7pQrWKtUp",
    alt: "Schlafzimmer",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQe2cvLDAXFCCXQ6Axju7NabxzbzSui6H6mlZoY_nyTfOvn1iSV4MfXoFy9lLHizhXmgW2Jv76P5rY3aCr1RwPylnqeHjmNaZlDNCWoXW-_uJOZUFgTh2gp5U9l2aET273XoJ3WAywaf5mNRoFf122nThM5F-TtZJ3WrKA5WT6EK18DLXg9yJlPA-UbJo-V-sxREf0dkS6N0HUobySGeUzL45h7HWIDl4O5rmYWEu2BtNfe_OTs7xgvhs8rPtE6aECQYI7XgaDTEks",
    alt: "Badezimmer",
  },
];

export default function ObjektDetailPage() {
  const { t, language } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", tel: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(language === "de" ? "Ihre Anfrage wurde gesendet!" : "Your request has been sent!");
  };

  const amenities = [
    { icon: "balcony", label: language === "de" ? "Balkon mit Südausrichtung" : "Balcony with southern orientation" },
    { icon: "kitchen", label: language === "de" ? "Moderne Einbauküche" : "Modern fitted kitchen" },
    { icon: "elevator", label: language === "de" ? "Personenaufzug" : "Passenger elevator" },
    { icon: "countertops", label: language === "de" ? "Kellerabteil inklusive" : "Cellar compartment included" },
    { icon: "nest_eco_leaf", label: language === "de" ? "Energieeffizienzklasse B" : "Energy efficiency class B" },
    { icon: "garage", label: language === "de" ? "Tiefgaragenstellplatz optional" : "Optional underground parking space" },
  ];

  const costRows = [
    { label: t("coldRent"), value: "1.850,00 €", bold: false, highlight: false },
    { label: t("utilities"), value: "240,00 €", bold: false, highlight: false },
    { label: t("heatingCosts"), value: "110,00 €", bold: false, highlight: false },
    { label: t("warmRent"), value: "2.200,00 €", bold: true, highlight: true },
    { label: t("deposit"), value: `5.550,00 € (${t("depositDetails")})`, bold: false, highlight: false, small: true },
  ];

  return (
    <>
      <main className="max-w-[1280px] mx-auto px-5 md:px-[48px] py-8 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[14px] text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary transition-colors">{t("breadcrumbHome")}</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/suche" className="hover:text-primary transition-colors">{t("breadcrumbSearch")}</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface font-medium">Berlin-Mitte</span>
        </nav>

        {/* Gallery */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 h-[280px] md:h-[500px]">
          {/* Main image */}
          <div className="md:col-span-2 relative overflow-hidden rounded-xl group cursor-pointer">
            <img
              src={GALLERY[0].src}
              alt={GALLERY[0].alt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-4 left-4 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span className="text-[12px] font-semibold">1/12 {language === "de" ? "Bilder" : "Images"}</span>
            </div>
          </div>

          {/* Side column 1 */}
          <div className="hidden md:flex flex-col gap-4 md:col-span-1">
            {GALLERY.slice(1, 3).map((img, i) => (
              <div key={i} className="h-1/2 rounded-xl overflow-hidden group cursor-pointer">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Side column 2 — "All photos" overlay */}
          <div className="hidden md:block md:col-span-1 rounded-xl overflow-hidden group cursor-pointer relative">
            <img
              src={GALLERY[3].src}
              alt={GALLERY[3].alt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <button
              id="btn-alle-bilder"
              className="absolute inset-0 bg-primary/20 flex items-center justify-center text-on-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] cursor-pointer"
            >
              <span className="text-label-md font-semibold">{t("viewAllPhotos")}</span>
            </button>
          </div>
        </section>

        {/* Content + Sidebar grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ── Main content (8 cols) ─────────────────────── */}
          <div className="lg:col-span-8">
            {/* Title + badges */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[12px] font-semibold">
                  {t("premiumListing")}
                </span>
                <span className="bg-surface-container-high text-primary px-3 py-1 rounded-full text-[12px] font-semibold">
                  {t("commissionFree")}
                </span>
              </div>
              <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
                {language === "de" ? "Helle 3-Zimmer-Wohnung in Berlin-Mitte" : "Bright 3-room apartment in Berlin-Mitte"}
              </h1>
              <p className="text-on-surface-variant flex items-center gap-1 text-[16px]">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                Torstraße 142, 10119 Berlin
              </p>
            </div>

            {/* Key facts bento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: "square_foot", label: t("livingArea"), value: "94 m²" },
                { icon: "bed", label: t("rooms"), value: "3.0" },
                { icon: "layers", label: t("floor"), value: "3. OG" },
                { icon: "calendar_today", label: t("availableFrom"), value: t("immediate") },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 text-center"
                >
                  <span className="material-symbols-outlined text-primary text-[24px] mb-2 block">
                    {icon}
                  </span>
                  <p className="text-on-surface-variant text-[12px] font-semibold">{label}</p>
                  <p className="text-headline-md text-on-surface">{value}</p>
                </div>
              ))}
            </div>

            {/* Cost table */}
            <div className="mb-12">
              <h2 className="text-headline-md text-on-surface mb-6">{t("costsTitle")}</h2>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                <div className="p-4 grid grid-cols-2 border-b border-outline-variant bg-surface-container-low">
                  <span className="text-label-md text-on-surface-variant">{t("costItem")}</span>
                  <span className="text-label-md text-on-surface-variant text-right">{t("costAmount")}</span>
                </div>
                {costRows.map(({ label, value, bold, highlight, small }) => (
                  <div
                    key={label}
                    className={`p-4 grid grid-cols-2 border-b border-outline-variant last:border-b-0 ${
                      highlight ? "bg-surface-container-high" : ""
                    }`}
                  >
                    <span
                      className={`${bold ? "font-bold text-primary" : small ? "text-on-surface-variant text-[14px]" : "text-on-surface"}`}
                    >
                      {label}
                    </span>
                    <span
                      className={`text-right ${
                        bold ? "font-bold text-primary text-[20px]" : small ? "text-on-surface text-[14px]" : "text-on-surface"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-headline-md text-on-surface mb-4">{t("descriptionTitle")}</h2>
              <div className="space-y-4 text-body-md text-on-surface-variant leading-relaxed">
                <p>
                  {language === "de"
                    ? "Diese exklusive 3-Zimmer-Wohnung befindet sich in einem hochwertig sanierten Altbau direkt im Herzen von Berlin-Mitte. Die Wohnung besticht durch ihre großzügige Raumaufteilung und die lichtdurchfluteten Zimmer mit einer Deckenhöhe von über 3,20 Metern."
                    : "This exclusive 3-room apartment is located in a beautifully renovated historic building right in the heart of Berlin-Mitte. The apartment stands out due to its spacious floor plan and bright, sunlit rooms with high ceilings exceeding 3.20 meters."}
                </p>
                <p>
                  {language === "de"
                    ? "Der offene Wohn- und Essbereich bildet das Herzstück der Wohnung und ist mit hochwertigem Eichenparkett ausgestattet. Die moderne Einbauküche verfügt über modernste Elektrogeräte und lässt keine Wünsche offen. Das Badezimmer wurde 2023 komplett renoviert und bietet eine bodengleiche Regendusche sowie hochwertige Armaturen."
                    : "The open plan living and dining area represents the heart of the apartment and is fitted with premium oak parquet flooring. The modern kitchen is equipped with state-of-the-art appliances and leaves nothing to be desired. The bathroom was completely renovated in 2023 and features a walk-in rain shower alongside premium fixtures."}
                </p>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-12">
              <h2 className="text-headline-md text-on-surface mb-6">{t("amenitiesTitle")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenities.map(({ icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-primary text-[24px]">{icon}</span>
                    <span className="text-body-md">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mb-12 h-64 w-full rounded-xl overflow-hidden border border-outline-variant relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB29FqRF2ON62xfq8JF1vA3o-iNRvBXGwSPooflyGHpY3UNnarIXNjU0o2I8cvj_2-E---tMXOb2AwkOPJcEws0gHXfVswh7x1R5P6VpVGO6sbX_1loU4NJIeTnfa8pVkEINx0PEYxAqADvIMYSswIXmeAYlLxMrmELoIbAVo7avvBOxEb9oYAJkv0ysHVxS4lNChCb5FhKoWrSW_WrkBegEBIo3ethWfCyULCP1vYZySjGyhZYzW7qYaB8hCghuPmSZKl4o2Bedym"
                alt="Lage Berlin Mitte"
                className="w-full h-full object-cover grayscale"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <span className="material-symbols-outlined text-[22px]">location_on</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar (4 cols) ──────────────────────────── */}
          <aside className="lg:col-span-4">
            <div className="sticky top-[80px] space-y-6">
              {/* Contact form */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-lg shadow-primary/5">
                <h3 className="text-headline-md text-on-surface mb-6">{t("contactSidebarTitle")}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { id: "name", label: t("formName"), type: "text", placeholder: "Erika Mustermann", key: "name" },
                    { id: "email", label: t("formEmail"), type: "email", placeholder: "beispiel@heimat.de", key: "email" },
                    { id: "tel", label: t("formPhone"), type: "tel", placeholder: "+49 123 456789", key: "tel" },
                  ].map(({ id, label, type, placeholder, key }) => (
                    <div key={id}>
                      <label className="block text-label-md text-on-surface-variant mb-1">{label}</label>
                      <input
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[16px]"
                        required={type !== "tel"}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1">{t("formMessage")}</label>
                    <textarea
                      id="form-message"
                      rows={4}
                      placeholder={t("formMessagePlaceholder")}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-[16px]"
                      required
                    />
                  </div>
                  <button
                    id="btn-besichtigung"
                    type="submit"
                    className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    {t("submitRequestBtn")}
                  </button>
                  <p className="text-center text-[12px] text-on-surface-variant">
                    {language === "de"
                      ? "Durch Absenden stimmst du unseren AGB und Datenschutzbestimmungen zu."
                      : "By submitting, you agree to our Terms of Service and Privacy Policy."}
                  </p>
                </form>
              </div>

              {/* Landlord card */}
              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 flex items-center gap-4">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDseZjk82kjQbnLSXbDkHWEWulM4KfFgYBDXycQaSmuqqisRGTl07u31j4oOwXkm3q5WoqT6IO6LZofXIgPbzAayc83Lr7T8iXBp2tOVoBLgekS6R8V2qGgbvQlLprRbdTGED2d7rGiUUVJ2RrQFkFDPJGemX3lLUHYRhfJRoF7vsrrg61HdCLCj5FB3L9IX4kXwG7s-zgEBuZIBROZWg2f81RudBpvhoqL9Yq43cRjmRiaY5FjnWsDwmUR5U4LUqQ2n3lh8S4UeiyL"
                  alt="Markus Weber"
                  className="w-16 h-16 rounded-full object-cover border-2 border-surface flex-shrink-0"
                />
                <div>
                  <p className="text-label-md text-on-surface-variant">{t("provider")}</p>
                  <p className="font-bold text-on-surface">Markus Weber</p>
                  <div className="flex items-center gap-1 text-secondary">
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-[12px] font-semibold">4.9 (42 {t("reviews")})</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
