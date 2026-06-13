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

const SUBCATEGORY_RATINGS: Record<string, Record<string, number>> = {
  "berlin-studio": { cleanliness: 4.8, accuracy: 4.9, communication: 5.0, location: 4.7, checkIn: 4.9, value: 4.8 },
  "munich-expat": { cleanliness: 4.9, accuracy: 4.8, communication: 4.7, location: 5.0, checkIn: 4.8, value: 4.6 },
  "hamburg-loft": { cleanliness: 5.0, accuracy: 4.9, communication: 4.9, location: 4.8, checkIn: 4.9, value: 4.7 },
  "berlin-wg": { cleanliness: 4.5, accuracy: 4.6, communication: 4.8, location: 4.9, checkIn: 4.7, value: 4.9 },
  "mock-apply-87a": { cleanliness: 4.8, accuracy: 4.8, communication: 4.9, location: 4.8, checkIn: 4.9, value: 4.7 }
};

const MOCK_REVIEWS: Record<string, Array<{
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: { de: string; en: string };
  text: { de: string; en: string };
  stayLength: { de: string; en: string };
}>> = {
  "berlin-studio": [
    {
      id: "3",
      author: "Sarah Lehmann",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      rating: 5,
      date: { de: "Mai 2026", en: "May 2026" },
      text: {
        de: "Die Wohnung ist super zentral und perfekt ausgestattet. Markus war ein toller Gastgeber, der Check-in lief absolut reibungslos. Kann ich nur empfehlen!",
        en: "The apartment is super central and perfectly equipped. Markus was a great host, check-in went absolutely smoothly. Highly recommended!"
      },
      stayLength: { de: "6 Monate gewohnt", en: "Stayed 6 months" }
    },
    {
      id: "2",
      author: "David Kovacs",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      rating: 4,
      date: { de: "Februar 2026", en: "February 2026" },
      text: {
        de: "Sehr schönes Studio, unschlagbare Lage direkt am Alexanderplatz. Manchmal war es nachts etwas lauter wegen der Straßenbahn, aber sonst perfekt.",
        en: "Very nice studio, unbeatable location right next to Alexanderplatz. Sometimes it was a bit loud at night because of the tram, but otherwise perfect."
      },
      stayLength: { de: "12 Monate gewohnt", en: "Stayed 12 months" }
    },
    {
      id: "1",
      author: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      rating: 5,
      date: { de: "November 2025", en: "November 2025" },
      text: {
        de: "Helle Wohnung mit moderner Einrichtung. Perfekt für Home Office geeignet, da das WLAN extrem schnell war. Komme gerne wieder!",
        en: "Bright apartment with modern furnishings. Perfectly suited for home office as the WiFi was extremely fast. Would love to come back!"
      },
      stayLength: { de: "3 Monate gewohnt", en: "Stayed 3 months" }
    }
  ],
  "munich-expat": [
    {
      id: "2",
      author: "Charlotte Dubois",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      rating: 5,
      date: { de: "April 2026", en: "April 2026" },
      text: {
        de: "Wunderschöne Wohnung in München. Der Englische Garten ist direkt vor der Tür. Sabine war immer erreichbar und sehr hilfsbereit.",
        en: "Beautiful apartment in Munich. The English Garden is right outside the door. Sabine was always reachable and very helpful."
      },
      stayLength: { de: "18 Monate gewohnt", en: "Stayed 18 months" }
    },
    {
      id: "1",
      author: "Thomas Miller",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      rating: 5,
      date: { de: "Januar 2026", en: "January 2026" },
      text: {
        de: "Sehr geräumig und elegant eingerichtet. Die Küche ist voll ausgestattet, ideal zum Kochen. Die Kaution wurde sofort zurückgezahlt.",
        en: "Very spacious and elegantly furnished. The kitchen is fully equipped, ideal for cooking. The deposit was returned immediately."
      },
      stayLength: { de: "12 Monate gewohnt", en: "Stayed 12 months" }
    }
  ],
  "hamburg-loft": [
    {
      id: "1",
      author: "Jan-Ole Petersen",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
      rating: 5,
      date: { de: "März 2026", en: "March 2026" },
      text: {
        de: "Ein Traum von einem Loft! Der Blick auf die Speicherstadt ist atemberaubend. Die Ausstattung lässt keine Wünsche offen.",
        en: "A dream of a loft! The view of the Speicherstadt is breathtaking. The equipment leaves nothing to be desired."
      },
      stayLength: { de: "8 Monate gewohnt", en: "Stayed 8 months" }
    }
  ],
  "berlin-wg": [
    {
      id: "1",
      author: "Maximilian Schulz",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
      rating: 4,
      date: { de: "April 2026", en: "April 2026" },
      text: {
        de: "Das Zimmer war sehr gemütlich. Nette Mitbewohner und super Lage zur Uni Dahlem. Perfekt für den Studienstart.",
        en: "The room was very cozy. Nice flatmates and great location to the Dahlem university. Perfect for starting university."
      },
      stayLength: { de: "12 Monate gewohnt", en: "Stayed 12 months" }
    }
  ],
  "mock-apply-87a": [
    {
      id: "1",
      author: "Sophie Reinhardt",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      rating: 5,
      date: { de: "Mai 2026", en: "May 2026" },
      text: {
        de: "Tolle Wohnung in Mitte. Sehr sauber, schön eingerichtet und der Park direkt vor der Tür. Perfekt für Pärchen.",
        en: "Great apartment in Mitte. Very clean, nicely decorated and the park right outside the door. Perfect for couples."
      },
      stayLength: { de: "9 Monate gewohnt", en: "Stayed 9 months" }
    }
  ]
};

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

  // Reviews States
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Load reviews when slug changes
  useEffect(() => {
    if (slug) {
      const initialReviews = MOCK_REVIEWS[slug as keyof typeof MOCK_REVIEWS] || MOCK_REVIEWS["mock-apply-87a"];
      setReviewsList(initialReviews);
    }
  }, [slug]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const authorName = newReviewAuthor.trim() || (profile?.full_name) || (user?.email?.split("@")[0]) || (language === "de" ? "Gast" : "Guest");
    
    const newRev = {
      id: Date.now().toString(),
      author: authorName,
      avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`,
      rating: newRating,
      date: {
        de: language === "de" ? "Juni 2026" : "June 2026",
        en: language === "de" ? "Juni 2026" : "June 2026"
      },
      text: {
        de: newReviewText,
        en: newReviewText
      },
      stayLength: {
        de: language === "de" ? "Kürzlicher Aufenthalt" : "Recent Stay",
        en: language === "de" ? "Kürzlicher Aufenthalt" : "Recent Stay"
      },
      isNew: true
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewText("");
    setNewRating(5);
    setNewReviewAuthor("");
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setReviewFormOpen(false);
    }, 2000);
  };

  const ratings = SUBCATEGORY_RATINGS[slug as keyof typeof SUBCATEGORY_RATINGS] || SUBCATEGORY_RATINGS["mock-apply-87a"];

  const averageRating = reviewsList.length > 0 
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1) 
    : ((ratings.cleanliness + ratings.accuracy + ratings.communication + ratings.location + ratings.checkIn + ratings.value) / 6).toFixed(1);

  const filteredAndSortedReviews = reviewsList
    .filter((rev) => {
      const textDe = rev.text.de.toLowerCase();
      const textEn = rev.text.en.toLowerCase();
      const author = rev.author.toLowerCase();
      const query = searchQuery.toLowerCase();
      return textDe.includes(query) || textEn.includes(query) || author.includes(query);
    })
    .sort((a, b) => {
      if (sortBy === "highest") {
        return b.rating - a.rating;
      } else if (sortBy === "lowest") {
        return a.rating - b.rating;
      } else {
        return Number(b.id) - Number(a.id);
      }
    });

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

            {/* Reviews Card */}
            <div className="mb-12 border border-outline-variant/40 rounded-2xl p-6 md:p-8 bg-surface-container-lowest shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-headline-md text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[28px]">rate_review</span>
                    {t("reviewsTitle")}
                  </h2>
                  <p className="text-on-surface-variant text-[14px] mt-1 font-medium">
                    {language === "de"
                      ? `${reviewsList.length} Bewertungen für diese Unterkunft`
                      : `${reviewsList.length} reviews for this property`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3.5 py-1.5 rounded-full font-bold">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-[16px]">{averageRating}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewFormOpen(!reviewFormOpen)}
                    className="bg-primary text-on-primary px-4 py-2.5 rounded-xl text-label-md font-bold hover:opacity-90 active:scale-98 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    {t("writeReview")}
                  </button>
                </div>
              </div>

              {/* Subcategories Ratings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-8 pb-8 border-b border-outline-variant">
                {[
                  { key: "cleanliness", label: t("cleanliness"), val: ratings.cleanliness },
                  { key: "accuracy", label: t("accuracy"), val: ratings.accuracy },
                  { key: "communication", label: t("communication"), val: ratings.communication },
                  { key: "location", label: t("location"), val: ratings.location },
                  { key: "checkIn", label: t("checkIn"), val: ratings.checkIn },
                  { key: "value", label: t("value"), val: ratings.value },
                ].map(({ key, label, val }) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <span className="text-body-md text-on-surface font-medium min-w-[120px]">{label}</span>
                    <div className="flex-grow flex items-center gap-3">
                      <div className="flex-grow h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(val / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-label-md text-on-surface font-bold min-w-[24px] text-right">
                        {val.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="relative w-full sm:flex-grow">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder={t("searchReviews")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-[14px] text-on-surface placeholder:text-on-surface-variant/60 transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                  <label htmlFor="reviews-sort" className="text-label-md text-on-surface-variant whitespace-nowrap">
                    {t("sortBy")}:
                  </label>
                  <select
                    id="reviews-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 text-[14px] font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                  >
                    <option value="newest">{t("newest")}</option>
                    <option value="highest">{t("highestRating")}</option>
                    <option value="lowest">{t("lowestRating")}</option>
                  </select>
                </div>
              </div>

              {/* Review Submission Form */}
              {reviewFormOpen && (
                <form
                  onSubmit={handleAddReview}
                  className="mb-8 p-6 rounded-xl border border-outline-variant bg-surface-container-low space-y-4 animate-in fade-in slide-in-from-top-4 duration-300"
                >
                  <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                    {t("writeReview")}
                  </h3>

                  {showSuccess ? (
                    <div className="bg-[#e6f4ea] border border-[#137333]/20 text-[#137333] p-4 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-[24px]">check_circle</span>
                      <p className="text-body-md font-semibold">{t("reviewSuccess")}</p>
                    </div>
                  ) : (
                    <>
                      {/* Guest name input if user is not logged in */}
                      {!user && (
                        <div>
                          <label className="block text-label-md text-on-surface-variant mb-1">
                            {language === "de" ? "Dein Name (optional)" : "Your Name (optional)"}
                          </label>
                          <input
                            type="text"
                            placeholder={language === "de" ? "z.B. Anna M." : "e.g., Anna M."}
                            value={newReviewAuthor}
                            onChange={(e) => setNewReviewAuthor(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary text-[14px]"
                          />
                        </div>
                      )}

                      {/* Star selection */}
                      <div>
                        <span className="block text-label-md text-on-surface-variant mb-1">
                          {t("reviewPlaceholderText")}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="text-primary hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                            >
                              <span
                                className="material-symbols-outlined text-[28px]"
                                style={{ fontVariationSettings: star <= newRating ? "'FILL' 1" : "'FILL' 0" }}
                              >
                                star
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review message text */}
                      <div>
                        <label htmlFor="new-review-text" className="block text-label-md text-on-surface-variant mb-1">
                          {t("ratingPlaceholder")}
                        </label>
                        <textarea
                          id="new-review-text"
                          rows={4}
                          placeholder={language === "de" ? "Teile uns deine Erfahrungen mit..." : "Share your experience with us..."}
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary text-[15px] resize-none"
                          required
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setReviewFormOpen(false)}
                          className="px-4 py-2 rounded-xl text-label-md font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                        >
                          {language === "de" ? "Abbrechen" : "Cancel"}
                        </button>
                        <button
                          type="submit"
                          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-label-md font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">send</span>
                          {t("submitReview")}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {/* Reviews List */}
              {filteredAndSortedReviews.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/40">
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-[48px] mb-2 block">
                    rate_review
                  </span>
                  <p className="text-body-md text-on-surface-variant font-medium">
                    {searchQuery
                      ? language === "de"
                        ? "Keine Bewertungen für diese Suchanfrage gefunden."
                        : "No reviews found matching your search query."
                      : t("noReviewsYet")}
                  </p>
                </div>
              ) : (
                <div className={filteredAndSortedReviews.length > 2 ? "max-h-[480px] overflow-y-auto pr-2 custom-scrollbar" : ""}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAndSortedReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className={`p-5 rounded-xl border border-outline-variant bg-surface-container-low transition-all duration-300 hover:shadow-md ${
                          rev.isNew ? "ring-2 ring-primary/30 bg-primary/5 border-primary/30" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={rev.avatar}
                              alt={rev.author}
                              className="w-11 h-11 rounded-full object-cover bg-surface-variant flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.author)}`;
                              }}
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-[15px] text-on-surface leading-tight">
                                  {rev.author}
                                </h4>
                                <span className="flex items-center gap-0.5 bg-[#e6f4ea] text-[#137333] border border-[#137333]/10 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                  {t("verifiedGuest")}
                                </span>
                              </div>
                              <p className="text-[12px] text-on-surface-variant/80 font-medium mt-0.5">
                                {language === "de" ? rev.stayLength.de : rev.stayLength.en} · {language === "de" ? rev.date.de : rev.date.en}
                              </p>
                            </div>
                          </div>

                          {/* Stars */}
                          <div className="flex items-center gap-0.5 text-primary">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className="material-symbols-outlined text-[16px]"
                                style={{ fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0" }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>

                        <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                          {language === "de" ? rev.text.de : rev.text.en}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
