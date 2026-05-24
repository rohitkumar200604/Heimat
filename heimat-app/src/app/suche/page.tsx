"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";

const LISTINGS = [
  {
    id: "charlottenburg-3zi",
    titleDe: "Helle 3-Zimmer-Wohnung in Charlottenburg",
    titleEn: "Bright 3-room apartment in Charlottenburg",
    address: "Schloßstraße, 14059 Berlin",
    price: "1.240",
    size: "82",
    rooms: "3,0",
    badge: "Neu",
    tagsDe: ["balcony|Balkon", "kitchen|EBK"],
    tagsEn: ["balcony|Balcony", "kitchen|Fitted Kitchen"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_QulQvOFrVJRkkGsX2BrsSp14xkqlPqes9s9_Il_VRVqvAqO0_bCK4yxVerPirBDIW3TDbPLv5sE7M00UxeZ9xClyqhXSPIbY9FDe4h_7n5Z2XI6OTw2izd62YFf8NOSOHA26K2WlfkuKn8VWj3Jz8sfVyYSiEGkuLLDxNk_86vz9vPOvqxkUnsTOaydTEtWwactXRqb97FZN6qAVv0jTCBlvpzbPliTshl68mBbdX12Eji_WHSNNmt4OwSjNx-7P66bXjvllR5Qy",
    favoured: true,
    mapPrice: "1.240€",
    mapPos: "top-1/3 left-1/4",
  },
  {
    id: "prenzlauer-studio",
    titleDe: "Modernes Studio im Prenzlauer Berg",
    titleEn: "Modern studio apartment in Prenzlauer Berg",
    address: "Kastanienallee, 10435 Berlin",
    price: "890",
    size: "45",
    rooms: "1,5",
    badge: null,
    tagsDe: ["pets|Haustiere", "elevator|Aufzug"],
    tagsEn: ["pets|Pets Allowed", "elevator|Elevator"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFJoBaPwgs-xqXomloR_okL_JLQLgXLKOt7Q50bK0umYjGhDG2FCZAuPoni4Xt6HYxoHnWXMXPxBUI4omVFUYGQwfGRQ3iZZ1pPHgKP19HqjgkEtK_l8Ges70DZRtcPsLlqVrByRwUeoW95A0QMFqEh4YShf-XAWauMy-uBcXqvDjyYVKH8NuL1EpHTnggr0K33YJQ-i_9EigWc96IomN51LFTMXuV229bKe7kyygo-Y-ylsv-YX31xhTbfIQ-OxK6GxG_9RE3LO7l",
    favoured: false,
    mapPrice: "890€",
    mapPos: "top-1/2 left-1/2",
  },
  {
    id: "loft-dachterrasse",
    titleDe: "Industrie-Loft mit Dachterrasse",
    titleEn: "Industrial loft with roof terrace",
    address: "Torstraße, 10119 Berlin",
    price: "1.550",
    size: "110",
    rooms: "2,0",
    badge: "Neu",
    tagsDe: ["deck|Dachterrasse", "fireplace|Kamin"],
    tagsEn: ["deck|Roof Terrace", "fireplace|Fireplace"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNJz3m3geqpIjm1i_Ql6_hGHPLrPJH5retGm-pD479qMgHXX1hZUkl-PyqEREl1lc01sbmWnRfGbX7I8Ws4L2x96v3p7pEaOmHha1iE6j1OoVeCpbfmcHgCqeTSSQPEN7n2HHvnizrGg37TPpWP1E777yydZOkP6Q4bSEAKM61tY0jtk4NTTkoNr6jYWXBODbuhtBCvXlRxXkb0enbmCUL0qsiLXlGau4vIMdHGSZXuuRgLxA5xs6Fh8VtVVoDObJgnzSdqpRSRn1G",
    favoured: false,
    mapPrice: "1.550€",
    mapPos: "bottom-1/4 left-1/3",
  },
  {
    id: "altbau-kudamm",
    titleDe: "Sanierter Altbau nähe Ku'damm",
    titleEn: "Renovated classic apartment near Ku'damm",
    address: "Uhlandstraße, 10719 Berlin",
    price: "1.420",
    size: "95",
    rooms: "3,5",
    badge: null,
    tagsDe: ["park|Parknähe", "garage|Stellplatz"],
    tagsEn: ["park|Near Park", "garage|Parking Spot"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQULqtZ-UEZvvsHONbb0p4pkLsehv56Q9mTIlOKieg3b1QVmO2g7_ywL619av4YTyycHKN7T9ngj_Pha3omTrT4DVxdVEgwlsb1e16H01M6Yi_sTKcc9fydOlA5L7XumMPDDAfDXiHVlcrIUFsvkbav6M3hDH8-5Aaa1BT6o-ADyxbnY_DqXmRIstNA848urPBFOnXNJXunG9eRHifXR2zgdqgR-patqnF0ii0LsCNyJTGwd83PcGy8zkPjF08Lu7lwqqyaIep-mud",
    favoured: false,
    mapPrice: "1.420€",
    mapPos: "top-[45%] right-1/4",
  },
];

export default function SuchePage() {
  const { t, language } = useLanguage();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showMap, setShowMap] = useState(true);

  const filterChips = [
    { id: "balcony", icon: "balcony", label: t("balcony") },
    { id: "kitchen", icon: "countertops", label: t("kitchen") },
    { id: "pets", icon: "pets", label: t("petsAllowed") },
    { id: "price", icon: "euro", label: t("priceUpTo") },
  ];

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col flex-grow overflow-hidden">
      {/* Filter Bar */}
      <section className="bg-surface-container-lowest border-b border-outline-variant px-5 md:px-[48px] py-4 z-40 sticky top-[65px]">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center gap-3">
          <button
            id="filter-all"
            className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">filter_list</span>
            <span className="text-label-md">{t("allFilters")}</span>
          </button>

          <div className="h-6 w-px bg-outline-variant mx-1 hidden md:block" />

          {filterChips.map(({ id, icon, label }) => {
            const active = activeFilters.includes(id);
            return (
              <button
                key={id}
                id={`filter-${id}`}
                onClick={() => toggleFilter(id)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-all cursor-pointer ${
                  active
                    ? "bg-primary-container text-on-primary-container border-primary"
                    : "bg-white border-outline-variant hover:border-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                <span className="text-label-md">{label}</span>
              </button>
            );
          })}

          {/* Mobile map toggle */}
          <button
            id="toggle-map"
            onClick={() => setShowMap(!showMap)}
            className="md:hidden ml-auto flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg border border-outline-variant text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            {showMap ? t("mapOff") : t("mapOn")}
          </button>

          <div className="hidden md:flex items-center gap-2 ml-auto">
            <span className="text-label-sm text-on-surface-variant">{t("sortBy")}:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              id="sort-select"
              className="bg-transparent border-none text-label-md text-primary focus:ring-0 cursor-pointer font-medium"
            >
              <option value="newest">{t("newest")}</option>
              <option value="price_asc">{t("priceAsc")}</option>
              <option value="size_desc">{t("sizeDesc")}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Split View */}
      <div className="flex flex-grow overflow-hidden">
        {/* Map */}
        <aside className={`${showMap ? "block" : "hidden"} md:block w-full md:w-[40%] relative bg-surface-dim flex-shrink-0`}>
          <div className="absolute inset-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEGihrfnuh0wAl41zlcHK1DL64GjtI_wCLHzt5iT6DJD8wsztj61L9rHxm-KTet0jEPiKD4WIf8vx8gXdO6SglirGXWjAYzZ2kUMnMZ2oF-uY3WU-bW5vplxWxgbytgOq3kKlnEs6eNG7WQJvYxNAz96UOSpkCNhRw9ReLFBrqu__lLCYITVatAPdj1FkquBMpdD_VI_mubTHY5_x0QPvLurCybVn3aKNgZG7JdZLxLSDFz8AEcrIECgJJVjxcgzelzBCIkGQsWNVh"
              alt="Stadtplan Berlin"
              className="w-full h-full object-cover grayscale opacity-80"
            />
            {/* Price markers */}
            {LISTINGS.map((l) => (
              <div key={l.id} className={`absolute ${l.mapPos} group cursor-pointer`}>
                <div className="bg-primary text-white font-bold px-3 py-1 rounded-full shadow-lg group-hover:scale-110 transition-transform text-[14px]">
                  {l.mapPrice}
                </div>
                <div className="w-3 h-3 bg-primary rounded-full mx-auto mt-[-4px] border-2 border-white shadow-sm" />
              </div>
            ))}
          </div>
          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {["add", "remove"].map((icon) => (
              <button key={icon} className="bg-white p-2 rounded-lg shadow-md hover:bg-surface-container transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-on-surface text-[20px]">{icon}</span>
              </button>
            ))}
            <button className="bg-white p-2 rounded-lg shadow-md hover:bg-surface-container transition-colors mt-2 cursor-pointer">
              <span className="material-symbols-outlined text-on-surface text-[20px]">my_location</span>
            </button>
          </div>
        </aside>

        {/* Listings */}
        <section className={`${showMap ? "hidden md:block" : "block"} w-full md:w-[60%] overflow-y-auto custom-scrollbar bg-background px-5 md:px-[48px] py-8`}>
          <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary">
                {language === "de" ? "Wohnungen in Berlin" : "Apartments in Berlin"}
              </h1>
              <p className="text-body-md text-on-surface-variant">142 {t("resultsFound")}</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button
                id="view-grid"
                onClick={() => setView("grid")}
                className={`p-2 border rounded-lg transition-colors cursor-pointer ${view === "grid" ? "bg-surface-container border-primary" : "border-outline-variant hover:bg-surface-container"}`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
              </button>
              <button
                id="view-list"
                onClick={() => setView("list")}
                className={`p-2 border rounded-lg transition-colors cursor-pointer ${view === "list" ? "bg-surface-container border-primary" : "border-outline-variant hover:bg-surface-container"}`}
              >
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
            </div>
          </div>

          <div className={`grid gap-[24px] ${view === "grid" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
            {LISTINGS.map((l) => (
              <article
                key={l.id}
                className="group bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <Link href={`/objekt/${l.id}`}>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={l.img}
                      alt={language === "de" ? l.titleDe : l.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {l.badge && (
                      <div className="absolute top-4 left-4 bg-secondary text-on-secondary px-3 py-1 rounded text-[12px] font-semibold uppercase tracking-wider">
                        {l.badge}
                      </div>
                    )}
                    <button
                      id={`fav-${l.id}`}
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors cursor-pointer"
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${l.favoured ? "text-error" : "text-on-surface-variant"}`}
                        style={l.favoured ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        favorite
                      </span>
                    </button>
                  </div>
                  <div className="p-6">
                    <h3 className="text-headline-md text-primary leading-tight mb-1">
                      {language === "de" ? l.titleDe : l.titleEn}
                    </h3>
                    <p className="text-body-md text-on-surface-variant mb-4">{l.address}</p>
                    <div className="flex items-center gap-6 mb-5">
                      {[
                        { label: t("rentWarm"), value: `${l.price} €`, bold: true },
                        { label: t("area"), value: `${l.size} m²` },
                        { label: t("rooms"), value: l.rooms },
                      ].map(({ label, value, bold }) => (
                        <div key={label} className="flex flex-col">
                          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">{label}</span>
                          <span className={`text-[18px] leading-7 ${bold ? "text-primary font-bold" : "text-primary font-semibold"}`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(language === "de" ? l.tagsDe : l.tagsEn).map((t) => {
                        const [icon, label] = t.split("|");
                        return (
                          <span
                            key={t}
                            className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">{icon}</span>
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center items-center gap-4 pb-8">
            <button
              disabled
              className="p-2 border border-outline-variant rounded-full hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`w-10 h-10 rounded-full font-semibold transition-colors cursor-pointer ${
                    p === 1
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  {p}
                </button>
              ))}
              <span className="px-2 self-end text-on-surface-variant">...</span>
              <button className="w-10 h-10 rounded-full border border-outline-variant hover:bg-surface-container transition-colors font-semibold cursor-pointer">
                12
              </button>
            </div>
            <button className="p-2 border border-outline-variant rounded-full hover:bg-surface-container transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          <Footer />
        </section>
      </div>
    </div>
  );
}
