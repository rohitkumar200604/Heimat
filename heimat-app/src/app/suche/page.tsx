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

      const mockListings: any[] = [
        {
          id: "berlin-studio",
          title: language === "de" ? "Helles Studio-Apartment nahe Alexanderplatz" : "Bright Studio Apartment near Alexanderplatz",
          city: "Berlin",
          street: "Karl-Liebknecht-Str. 12",
          zip: "10178",
          rooms: 1,
          size_sqm: 38,
          rent_cold: 720,
          rent_utilities: 80,
          rent_heating: 70,
          pets_allowed: true,
          amenities: ["balcony", "kitchen"],
          status: "active",
          property_photos: [{ cdn_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", is_primary: true }]
        },
        {
          id: "munich-expat",
          title: language === "de" ? "Premium 3-Zimmer-Wohnung am Englischen Garten" : "Premium 3-Room Apartment at Englischen Garten",
          city: "München",
          street: "Königinstraße 44",
          zip: "80539",
          rooms: 3,
          size_sqm: 82,
          rent_cold: 1650,
          rent_utilities: 150,
          rent_heating: 110,
          pets_allowed: false,
          amenities: ["kitchen"],
          status: "active",
          property_photos: [{ cdn_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", is_primary: true }]
        },
        {
          id: "hamburg-loft",
          title: language === "de" ? "Stilvolles Loft in der Speicherstadt" : "Stylish Loft in Speicherstadt",
          city: "Hamburg",
          street: "Am Sandtorkai 10",
          zip: "20457",
          rooms: 2,
          size_sqm: 65,
          rent_cold: 1120,
          rent_utilities: 110,
          rent_heating: 90,
          pets_allowed: true,
          amenities: ["balcony", "kitchen"],
          status: "active",
          property_photos: [{ cdn_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", is_primary: true }]
        },
        {
          id: "berlin-wg",
          title: language === "de" ? "Gemütliches Zimmer in Studenten-WG" : "Cozy Room in Student Shared Apartment",
          city: "Berlin",
          street: "Königin-Luise-Str. 15",
          zip: "14195",
          rooms: 1,
          size_sqm: 20,
          rent_cold: 450,
          rent_utilities: 60,
          rent_heating: 40,
          pets_allowed: true,
          amenities: ["kitchen"],
          status: "active",
          property_photos: [{ cdn_url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", is_primary: true }]
        }
      ];

      const applyInMemoryFilters = () => {
        let filtered = [...mockListings];
        if (stadtParam) {
          filtered = filtered.filter(l => l.city.toLowerCase().includes(stadtParam.toLowerCase()));
        }
        if (zimmerParam !== "all") {
          if (zimmerParam === "house") {
            filtered = filtered.filter(l => l.property_type === "house" || l.id.toLowerCase().includes("house") || l.id.toLowerCase().includes("haus"));
          } else if (zimmerParam === "shared") {
            filtered = filtered.filter(l => l.property_type === "sharedRoom" || l.id.toLowerCase().includes("wg") || l.id.toLowerCase().includes("shared"));
          } else {
            filtered = filtered.filter(l => l.rooms >= parseFloat(zimmerParam));
          }
        }
        if (preisParam) {
          filtered = filtered.filter(l => l.rent_cold <= parseFloat(preisParam));
        }
        if (activeFilters.includes("balcony")) {
          filtered = filtered.filter(l => l.amenities.includes("balcony"));
        }
        if (activeFilters.includes("kitchen")) {
          filtered = filtered.filter(l => l.amenities.includes("kitchen"));
        }
        if (activeFilters.includes("pets")) {
          filtered = filtered.filter(l => l.pets_allowed === true);
        }
        if (activeFilters.includes("price")) {
          filtered = filtered.filter(l => l.rent_cold <= 1500);
        }
        if (sort === "price_asc") {
          filtered.sort((a, b) => a.rent_cold - b.rent_cold);
        } else if (sort === "size_desc") {
          filtered.sort((a, b) => b.size_sqm - a.size_sqm);
        }
        setListings(filtered);
      };

      try {
        const isConfigured =
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://mock-project.supabase.co" &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "mock-anon-key";

        if (!isConfigured) {
          applyInMemoryFilters();
          return;
        }

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
          if (zimmerParam === "house") {
            query = query.eq("property_type", "house");
          } else if (zimmerParam === "shared") {
            query = query.eq("property_type", "sharedRoom");
          } else {
            query = query.gte("rooms", parseFloat(zimmerParam));
          }
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
        if (data && data.length > 0) {
          setListings(data);
        } else {
          console.log("No active properties in database, falling back to mock listings.");
          applyInMemoryFilters();
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to mock data:", err);
        applyInMemoryFilters();
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [stadtParam, zimmerParam, preisParam, activeFilters, sort, language]);

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
    <div className="flex flex-col w-full h-[calc(100vh-65px)] overflow-hidden">
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
        <aside className={`${showMap ? "block" : "hidden"} md:block w-full md:w-[40%] relative bg-surface-dim flex-shrink-0 border-r border-outline-variant`}>
          <div className="absolute inset-0 w-full h-full">
            <iframe
              title="Google Maps"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                stadtParam ? `${stadtParam}, Germany` : "Germany"
              )}&t=&z=${stadtParam ? 12 : 9}&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full grayscale-[15%] contrast-[105%] opacity-90 transition-opacity duration-300"
            />
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
