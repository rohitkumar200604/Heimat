"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase/client";
import Footer from "@/components/layout/Footer";

const GALLERY_FALLBACK = [
  {
    src: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
    alt: "Wohnzimmer",
  },
  {
    src: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    alt: "Küche",
  },
  {
    src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    alt: "Schlafzimmer",
  },
  {
    src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80",
    alt: "Badezimmer",
  },
];

export default function ObjektDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  
  const [property, setProperty] = useState<any>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", tel: "", message: "" });
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searched = localStorage.getItem("heimat_has_searched") === "true";
      setHasSearched(searched);
    }
  }, []);

  // Pre-fill form when user session is loaded
  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        name: profile.full_name || "",
        email: profile.email || "",
        tel: profile.phone || "",
      }));
    }
  }, [profile]);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoadingProperty(true);

      const mocks: Record<string, any> = {
        "berlin-studio": {
          id: "berlin-studio",
          title: language === "de" ? "Helles Studio-Apartment nahe Alexanderplatz" : "Bright Studio Apartment near Alexanderplatz",
          city: "Berlin",
          street: "Karl-Liebknecht-Str. 12",
          zip: "10178",
          rooms: 1,
          size_sqm: 38,
          floor: 2,
          rent_cold: 720.00,
          rent_utilities: 80.00,
          rent_heating: 70.00,
          deposit_months: 3,
          available_from: new Date().toISOString().split("T")[0],
          description: language === "de"
            ? "Ein modernes, voll ausgestattetes Apartment mit perfekter Anbindung. Ideal für Studierende oder Expats."
            : "A modern, fully equipped apartment with perfect transport links. Ideal for students or expats.",
          amenities: ["balcony", "kitchen"],
          landlord_profiles: {
            user_id: "mock-landlord-id",
            profiles: {
              full_name: "Markus Weber",
              avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            }
          },
          property_photos: [{ cdn_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", is_primary: true }]
        },
        "munich-expat": {
          id: "munich-expat",
          title: language === "de" ? "Premium 3-Zimmer-Wohnung am Englischen Garten" : "Premium 3-Room Apartment at Englischen Garten",
          city: "München",
          street: "Königinstraße 44",
          zip: "80539",
          rooms: 3,
          size_sqm: 82,
          floor: 3,
          rent_cold: 1650.00,
          rent_utilities: 150.00,
          rent_heating: 110.00,
          deposit_months: 3,
          available_from: new Date().toISOString().split("T")[0],
          description: language === "de"
            ? "Lichtdurchflutete, großzügige 3-Zimmer-Wohnung in bester Lage direkt am Englischen Garten."
            : "Bright, spacious 3-room apartment in a prime location directly on the English Garden.",
          amenities: ["kitchen", "elevator"],
          landlord_profiles: {
            user_id: "mock-landlord-id",
            profiles: {
              full_name: "Sabine Meyer",
              avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
            }
          },
          property_photos: [{ cdn_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", is_primary: true }]
        },
        "hamburg-loft": {
          id: "hamburg-loft",
          title: language === "de" ? "Stilvolles Loft in der Speicherstadt" : "Stylish Loft in Speicherstadt",
          city: "Hamburg",
          street: "Am Sandtorkai 10",
          zip: "20457",
          rooms: 2,
          size_sqm: 65,
          floor: 4,
          rent_cold: 1120.00,
          rent_utilities: 110.00,
          rent_heating: 90.00,
          deposit_months: 3,
          available_from: new Date().toISOString().split("T")[0],
          description: language === "de"
            ? "Exklusives Design-Loft mit hohen Decken und Backsteinwänden in historischer Speicherstadt."
            : "Exclusive design loft with high ceilings and brick walls in the historic Speicherstadt.",
          amenities: ["balcony", "kitchen"],
          landlord_profiles: {
            user_id: "mock-landlord-id",
            profiles: {
              full_name: "Jan Hansen",
              avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
            }
          },
          property_photos: [{ cdn_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", is_primary: true }]
        },
        "berlin-wg": {
          id: "berlin-wg",
          title: language === "de" ? "Gemütliches Zimmer in Studenten-WG" : "Cozy Room in Student Shared Apartment",
          city: "Berlin",
          street: "Königin-Luise-Str. 15",
          zip: "14195",
          rooms: 1,
          size_sqm: 20,
          floor: 1,
          rent_cold: 450.00,
          rent_utilities: 60.00,
          rent_heating: 40.00,
          deposit_months: 2,
          available_from: new Date().toISOString().split("T")[0],
          description: language === "de"
            ? "Gemütliches, voll möbliertes WG-Zimmer in Dahlem, ideal für Studierende der FU Berlin."
            : "Cozy, fully furnished room in a shared apartment in Dahlem, ideal for students at FU Berlin.",
          amenities: ["kitchen"],
          landlord_profiles: {
            user_id: "mock-landlord-id",
            profiles: {
              full_name: "Lukas Becker",
              avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
            }
          },
          property_photos: [{ cdn_url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", is_primary: true }]
        }
      };

      const defaultMock = {
        id: "mock-apply-87a",
        title: language === "de" ? "Lichtdurchflutete 3-Zimmer-Wohnung am Tiergarten" : "Bright 3-room apartment near Tiergarten",
        street: "Torstraße 142",
        city: "Berlin",
        zip: "10119",
        size_sqm: 94,
        rooms: 3.0,
        floor: 3,
        rent_cold: 1850.00,
        rent_utilities: 240.00,
        rent_heating: 110.00,
        deposit_months: 3,
        available_from: new Date().toISOString().split("T")[0],
        description: language === "de"
          ? "Diese exklusive 3-Zimmer-Wohnung befindet sich in einem hochwertig sanierten Altbau direkt im Herzen von Berlin-Mitte..."
          : "This exclusive 3-room apartment is located in a beautifully renovated historic building...",
        amenities: ["balcony", "kitchen", "elevator", "parking"],
        landlord_profiles: {
          user_id: "mock-landlord-id",
          profiles: {
            full_name: "Markus Weber",
            avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDseZjk82kjQbnLSXbDkHWEWulM4KfFgYBDXycQaSmuqqisRGTl07u31j4oOwXkm3q5WoqT6IO6LZofXIgPbzAayc83Lr7T8iXBp2tOVoBLgekS6R8V2qGgbvQlLprRbdTGED2d7rGiUUVJ2RrQFkFDPJGemX3lLUHYRhfJRoF7vsrrg61HdCLCj5FB3L9IX4kXwG7s-zgEBuZIBROZWg2f81RudBpvhoqL9Yq43cRjmRiaY5FjnWsDwmUR5U4LUqQ2n3lh8S4UeiyL"
          }
        }
      };

      try {
        const isConfigured =
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://mock-project.supabase.co" &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "mock-anon-key";

        if (!isConfigured) {
          // No real Supabase — immediately load mock data
          setProperty(mocks[slug] || defaultMock);
          return;
        }

        const { data, error } = await supabase
          .from("properties")
          .select(`
            *,
            landlord_profiles (
              id,
              user_id,
              profiles (
                full_name,
                avatar_url
              )
            ),
            property_photos (
              cdn_url,
              is_primary
            )
          `)
          .eq("id", slug)
          .single();

        if (error) throw error;
        setProperty(data || mocks[slug] || defaultMock);
      } catch (err) {
        console.warn("Could not find property in Supabase, using mock fallback:", err);
        setProperty(mocks[slug] || defaultMock);
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchPropertyDetails();
  }, [slug, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auth Guard
    if (!user) {
      alert(language === "de" ? "Bitte melde dich zuerst an!" : "Please log in first!");
      router.push(`/auth/login?redirect=/objekt/${slug}`);
      return;
    }

    if (profile?.role !== "tenant") {
      alert(language === "de" ? "Nur Mieter können Buchungen anfragen!" : "Only tenants can request bookings!");
      return;
    }

    setSubmittingBooking(true);
    try {
      const coldRent = parseFloat(property.rent_cold);
      const utilities = parseFloat(property.rent_utilities || 0);
      const heating = parseFloat(property.rent_heating || 0);
      const totalRent = coldRent + utilities + heating;

      // Calculate default dates
      const moveInDate = new Date();
      moveInDate.setMonth(moveInDate.getMonth() + 1);
      moveInDate.setDate(1);
      
      const moveOutDate = new Date();
      moveOutDate.setFullYear(moveOutDate.getFullYear() + 1);
      moveOutDate.setMonth(moveInDate.getMonth());
      moveOutDate.setDate(1);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create new booking request in DB
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          property_id: property.id === "mock-apply-87a" ? "00000000-0000-0000-0000-000000000000" : property.id,
          tenant_id: user.id,
          landlord_id: property.landlord_profiles?.user_id,
          status: "pending",
          move_in_date: moveInDate.toISOString().split("T")[0],
          move_out_date: moveOutDate.toISOString().split("T")[0],
          rent_total: totalRent,
          expires_at: expiresAt.toISOString(),
          tenant_note: form.message
        })
        .select()
        .single();

      if (error) throw error;

      alert(language === "de" ? "Ihre Anfrage wurde gesendet!" : "Your request has been sent!");
      router.push(`/buchen/${data.id}`);
    } catch (err: any) {
      console.error("Error creating booking:", err);
      // Fallback mock redirect in dev mode if tables fail
      alert(language === "de" ? "Buchungsanfrage initiiert (Mock Mode)" : "Booking request initiated (Mock Mode)");
      router.push(`/buchen/mock-apply-87a`);
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loadingProperty) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <main className="max-w-[1280px] mx-auto px-5 md:px-[48px] py-16 flex flex-col items-center justify-center min-h-[600px] text-center gap-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse text-primary shadow-inner">
          <span className="material-symbols-outlined text-[48px]">lock</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-headline-lg font-bold text-primary mb-3">
            {language === "de" ? "Zugriff eingeschränkt" : "Access Restricted"}
          </h1>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            {language === "de"
              ? "Um die Details dieses Objekts anzuzeigen und den Vermieter zu kontaktieren, müssen Sie zuerst eine Suche nach einer Stadt durchführen."
              : "To view this property's details and contact the landlord, you must first perform a search for a city."}
          </p>
        </div>
        <button
          onClick={() => router.push("/suche")}
          className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-label-md hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-primary/25 font-sans"
        >
          <span className="material-symbols-outlined">search</span>
          {language === "de" ? "Jetzt Suche starten" : "Start Search Now"}
        </button>
      </main>
    );
  }

  const photos = property.property_photos && property.property_photos.length > 0
    ? property.property_photos.map((p: any) => p.cdn_url)
    : GALLERY_FALLBACK.map(g => g.src);

  const amenitiesList = property.amenities || [];

  const costRows = [
    { label: t("coldRent"), value: `${parseFloat(property.rent_cold).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`, bold: false, highlight: false },
    { label: t("utilities"), value: `${parseFloat(property.rent_utilities || 0).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`, bold: false, highlight: false },
    { label: t("heatingCosts"), value: `${parseFloat(property.rent_heating || 0).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`, bold: false, highlight: false },
    { label: t("warmRent"), value: `${(parseFloat(property.rent_cold) + parseFloat(property.rent_utilities || 0) + parseFloat(property.rent_heating || 0)).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`, bold: true, highlight: true },
    { label: t("deposit"), value: `${(parseFloat(property.rent_cold) * parseFloat(property.deposit_months || 3)).toLocaleString("de-DE", { minimumFractionDigits: 2 })} € (${property.deposit_months || 3} ${language === "de" ? "Kaltmieten" : "Months Rent"})`, bold: false, highlight: false, small: true },
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
          <span className="text-on-surface font-medium">{property.city}</span>
        </nav>

        {/* Gallery */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 h-[280px] md:h-[500px]">
          {/* Main image */}
          <div className="md:col-span-2 relative overflow-hidden rounded-xl group cursor-pointer bg-surface-dim">
            <img
              src={photos[0]}
              alt="Wohnzimmer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-4 left-4 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span className="text-[12px] font-semibold">{photos.length} {language === "de" ? "Bilder" : "Images"}</span>
            </div>
          </div>

          {/* Side column 1 */}
          <div className="hidden md:flex flex-col gap-4 md:col-span-1">
            {photos.slice(1, 3).map((img: string, i: number) => (
              <div key={i} className="h-1/2 rounded-xl overflow-hidden group cursor-pointer bg-surface-dim">
                <img
                  src={img}
                  alt={`Detailbild ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Side column 2 — "All photos" overlay */}
          <div className="hidden md:block md:col-span-1 rounded-xl overflow-hidden group cursor-pointer relative bg-surface-dim">
            <img
              src={photos[3] || photos[0]}
              alt="Badezimmer"
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
                {property.title}
              </h1>
              <p className="text-on-surface-variant flex items-center gap-1 text-[16px]">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {property.street}, {property.zip} {property.city}
              </p>
            </div>

            {/* Key facts bento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: "square_foot", label: t("livingArea"), value: `${property.size_sqm} m²` },
                { icon: "bed", label: t("rooms"), value: property.rooms },
                { icon: "layers", label: t("floor"), value: property.floor ? `${property.floor}. OG` : "EG" },
                { icon: "calendar_today", label: t("availableFrom"), value: new Date(property.available_from).toLocaleDateString(language === "de" ? "de" : "en") },
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
                <p>{property.description}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-12">
              <h2 className="text-headline-md text-on-surface mb-6">{t("amenitiesTitle")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenitiesList.map((tag: string) => (
                  <div
                    key={tag}
                    className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low capitalize font-semibold"
                  >
                    <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                    <span className="text-body-md">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar (4 cols) ──────────────────────────── */}
          <aside className="lg:col-span-4">
            <div className="sticky top-[80px] space-y-6">
              {/* Contact form */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-lg shadow-primary/5">
                <h3 className="text-headline-md text-on-surface mb-6">{t("contactSidebarTitle")}</h3>
                {!user ? (
                  <div className="text-center py-6 px-2 space-y-5">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <span className="material-symbols-outlined text-[32px]">lock</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[18px] font-bold text-primary">
                        {language === "de" ? "Anmelden erforderlich" : "Login Required"}
                      </h4>
                      <p className="text-[13px] text-on-surface-variant leading-relaxed">
                        {language === "de"
                          ? "Um dieses Haus zu buchen oder den Vermieter zu kontaktieren, müssen Sie eingeloggt sein."
                          : "To request a booking or message the provider, you must be logged in."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/auth/login?redirect=/objekt/${slug}`)}
                      className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold hover:opacity-90 active:scale-98 transition-all shadow cursor-pointer text-label-md text-center"
                    >
                      {language === "de" ? "Jetzt anmelden" : "Log In Now"}
                    </button>
                    <p className="text-[12px] text-on-surface-variant">
                      {language === "de" ? "Noch kein Konto? " : "New to Heimstadt? "}
                      <Link href="/auth/register" className="text-primary font-bold hover:underline">
                        {language === "de" ? "Hier registrieren" : "Register here"}
                      </Link>
                    </p>
                  </div>
                ) : (
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
                      disabled={submittingBooking}
                      className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submittingBooking && (
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      )}
                      {t("submitRequestBtn")}
                    </button>
                    <p className="text-center text-[12px] text-on-surface-variant">
                      {t("formDisclaimer")}
                    </p>
                  </form>
                )}
              </div>

              {/* Landlord card */}
              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 flex items-center gap-4">
                <img
                  src={property.landlord_profiles?.profiles?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-surface flex-shrink-0 bg-surface-variant"
                />
                <div>
                  <p className="text-label-md text-on-surface-variant">{t("provider")}</p>
                  <p className="font-bold text-on-surface">{property.landlord_profiles?.profiles?.full_name || "Markus Weber"}</p>
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
