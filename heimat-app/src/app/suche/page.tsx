"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/utils/supabase/client";
import Footer from "@/components/layout/Footer";

function SuchePageContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  
  const stadtParam = searchParams.get("stadt") || "";
  const zimmerParam = searchParams.get("zimmer") || "all";
  const preisParam = searchParams.get("preis") || "";

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("properties")
          .select(`
            *,
            property_photos (
              cdn_url,
              is_primary
            )
          `)
          .eq("status", "active");

        if (stadtParam) {
          query = query.ilike("city", `%${stadtParam}%`);
        }
        if (zimmerParam !== "all") {
          query = query.gte("rooms", parseFloat(zimmerParam));
        }
        if (preisParam) {
          query = query.lte("rent_cold", parseFloat(preisParam));
        }

        // Apply filters
        if (activeFilters.includes("balcony")) {
          query = query.contains("amenities", ["balcony"]);
        }
        if (activeFilters.includes("kitchen")) {
          query = query.contains("amenities", ["kitchen"]);
        }
        if (activeFilters.includes("pets")) {
          query = query.eq("pets_allowed", true);
        }
        if (activeFilters.includes("price")) {
          query = query.lte("rent_cold", 1500);
        }

        // Apply sorting
        if (sort === "newest") {
          query = query.order("created_at", { ascending: false });
        } else if (sort === "price_asc") {
          query = query.order("rent_cold", { ascending: true });
        } else if (sort === "size_desc") {
          query = query.order("size_sqm", { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        setListings(data || []);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [stadtParam, zimmerParam, preisParam, activeFilters, sort]);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Helper to map unique map positions based on property ID
  const getMapPosition = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const top = 15 + Math.abs((hash >> 8) % 65);
    const left = 15 + Math.abs((hash >> 16) % 65);
    return { top: `${top}%`, left: `${left}%` };
  };

  const getPrimaryPhoto = (l: any) => {
    if (l.property_photos && l.property_photos.length > 0) {
      const primary = l.property_photos.find((p: any) => p.is_primary);
      return primary ? primary.cdn_url : l.property_photos[0].cdn_url;
    }
    // High-quality fallback image
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuD_QulQvOFrVJRkkGsX2BrsSp14xkqlPqes9s9_Il_VRVqvAqO0_bCK4yxVerPirBDIW3TDbPLv5sE7M00UxeZ9xClyqhXSPIbY9FDe4h_7n5Z2XI6OTw2izd62YFf8NOSOHA26K2WlfkuKn8VWj3Jz8sfVyYSiEGkuLLDxNk_86vz9vPOvqxkUnsTOaydTEtWwactXRqb97FZN6qAVv0jTCBlvpzbPliTshl68mBbdX12Eji_WHSNNmt4OwSjNx-7P66bXjvllR5Qy";
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
            {listings.map((l) => {
              const pos = getMapPosition(l.id);
              return (
                <Link key={l.id} href={`/objekt/${l.id}`} className="absolute group cursor-pointer" style={{ top: pos.top, left: pos.left }}>
                  <div className="bg-primary text-white font-bold px-3 py-1 rounded-full shadow-lg group-hover:scale-110 transition-transform text-[14px]">
                    {l.rent_cold}€
                  </div>
                  <div className="w-3 h-3 bg-primary rounded-full mx-auto mt-[-4px] border-2 border-white shadow-sm" />
                </Link>
              );
            })}
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
                {stadtParam 
                  ? (language === "de" ? `Wohnungen in ${stadtParam}` : `Apartments in ${stadtParam}`) 
                  : (language === "de" ? "Alle Wohnungen" : "All Apartments")}
              </h1>
              <p className="text-body-md text-on-surface-variant">{listings.length} {t("resultsFound")}</p>
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

          {loading ? (
            <div className="flex justify-center items-center py-24 w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-24 text-on-surface-variant text-body-md w-full border-2 border-dashed border-outline-variant/40 rounded-2xl bg-white">
              {language === "de" ? "Keine Objekte gefunden." : "No listings found."}
            </div>
          ) : (
            <div className={`grid gap-[24px] ${view === "grid" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
              {listings.map((l) => (
                <article
                  key={l.id}
                  className="group bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <Link href={`/objekt/${l.id}`}>
                    <div className="relative h-56 overflow-hidden bg-surface-dim">
                      <img
                        src={getPrimaryPhoto(l)}
                        alt={l.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {l.status !== "active" && (
                        <div className="absolute top-4 left-4 bg-error text-on-error px-3 py-1 rounded text-[12px] font-semibold uppercase tracking-wider">
                          {l.status}
                        </div>
                      )}
                      <button
                        id={`fav-${l.id}`}
                        onClick={(e) => e.preventDefault()}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                          favorite
                        </span>
                      </button>
                    </div>
                    <div className="p-6">
                      <h3 className="text-headline-md text-primary leading-tight mb-1 line-clamp-1">
                        {l.title}
                      </h3>
                      <p className="text-body-md text-on-surface-variant mb-4 line-clamp-1">{l.street}, {l.zip} {l.city}</p>
                      <div className="flex items-center gap-6 mb-5">
                        {[
                          { label: t("rentWarm"), value: `${Math.round(parseFloat(l.rent_cold) + parseFloat(l.rent_utilities) + parseFloat(l.rent_heating))} €`, bold: true },
                          { label: t("area"), value: `${l.size_sqm} m²` },
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
                        {l.amenities && l.amenities.map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1 capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-12 flex justify-center items-center gap-4 pb-8">
            <button
              disabled
              className="p-2 border border-outline-variant rounded-full hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="flex gap-2">
              {[1].map((p) => (
                <button
                  key={p}
                  className={`w-10 h-10 rounded-full font-semibold transition-colors cursor-pointer bg-primary text-on-primary`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button disabled className="p-2 border border-outline-variant rounded-full hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-30">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          <Footer />
        </section>
      </div>
    </div>
  );
}

export default function SuchePage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    }>
      <SuchePageContent />
    </Suspense>
  );
}
