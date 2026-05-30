"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [stadt, setStadt] = useState("");
  const [zimmer, setZimmer] = useState("all");
  const [preis, setPreis] = useState("");

  // Self-healing: Detect Google OAuth hash redirect landing on root domain and route to Auth Callback
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      if (window.location.hash.includes("access_token")) {
        router.replace(`/auth/callback${window.location.hash}`);
      }
    }
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (stadt) q.set("stadt", stadt);
    if (zimmer !== "all") q.set("zimmer", zimmer);
    if (preis) q.set("preis", preis);
    router.push(`/suche?${q.toString()}`);
  };

  const stars = Array(5).fill(0);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative h-[870px] min-h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuABTolN5_IeVJ1WaiQvEhznNlcs_9oBV7Rsq4O0Jxuuysb_uISU75iXIVooBMD4mTzXXlj8BJwKC-gHk09iBf3X2fewWD0-faquG-NpTswnTEWH4p5fwHnxyJPOa4ktx4ZknI6atPYvgiXr6YRq8QMdVic-kChr617Dcc5gI4CBKACWL4fB_x_v9AouGx3fKkHp2jqyRtyMzC55Lb_xOiePtmZWvjpkaybc1kanVI9qA9ixolosFhxKGmXLkf5MKuQi8pgdAucwPLCF"
          alt="Moderne Architektur in Deutschland"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 w-full max-w-[1280px] px-5 md:px-[48px] text-center">
          <h1 className="text-display-lg-mobile md:text-display-lg text-white mb-12 drop-shadow-lg">
            {t("heroTitle")}
          </h1>

          {/* Search Card */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="text-left">
                <label className="block text-label-sm text-on-surface-variant mb-2 ml-1">
                  {t("searchCityLabel")}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
                    location_on
                  </span>
                  <input
                    value={stadt}
                    onChange={(e) => setStadt(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[16px]"
                    placeholder="Berlin, München..."
                    type="text"
                    id="search-city"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-label-sm text-on-surface-variant mb-2 ml-1">
                  {t("searchRoomsLabel")}
                </label>
                <select
                  value={zimmer}
                  onChange={(e) => setZimmer(e.target.value)}
                  id="search-rooms"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[16px]"
                >
                  <option value="all">{t("all")}</option>
                  <option value="1">1 Room Apartment</option> 
                  <option value="2">2 Room Apartment</option>
                  <option value="3">3 Room Apartment</option>
                  <option value="4">4 Room Apartment</option>
                  <option value="5">5 Room Apartment</option>
                  <option value="house">House</option>
                  <option value="shared">Shared Accomodation</option>
                </select>
              </div>

              <div className="text-left">
                <label className="block text-label-sm text-on-surface-variant mb-2 ml-1">
                  {t("searchPriceLabel")}
                </label>
                <input
                  value={preis}
                  onChange={(e) => setPreis(e.target.value)}
                  id="search-price"
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[16px]"
                  placeholder="€ max"
                  type="number"
                />
              </div>

              <button
                type="submit"
                id="btn-search"
                className="h-[50px] bg-primary text-white rounded-lg text-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg w-full font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">search</span>
                {t("searchBtn")}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Top-Städte ────────────────────────────────────── */}
      <section className="py-24 max-w-[1280px] mx-auto px-5 md:px-[48px] w-full">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <div>
            <h2 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">
              {t("topCitiesTitle")}
            </h2>
            <p className="text-body-md text-on-surface-variant">
              {t("topCitiesSubtitle")}
            </p>
          </div>
          <Link
            href="/suche"
            className="text-primary text-label-md border-b border-primary pb-1 hover:opacity-70 transition-opacity"
          >
            {t("viewAllCities")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {[
            {
              city: "Berlin",
              count: "2.450",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0xOO1BWx-JREJERdBI9VwxHm8XPtsZ5k9-1nSaoMx3hn7YXkbAlyh66ay75MKHprJfukBSJrEIy259MQ50aohcMB0NhJNowBoSg_1C4fm_1Z1iswQ0S7W0zDIASbT2KNi9z3to7BGjTApKGQn56PZybUYS6ugG8Jy59nBwoJsSSASYJ-Vx94NotwaAAH7PaqvBl3524uMSUzgTkA3KN_HANqpd1opMGI1iDEvHImFBJVFBggj-7W1jcG7bzbuV0hj-bjvEUYF1VP0",
            },
            {
              city: "München",
              count: "1.820",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrXUvAxyb5tWS2xwNgtZEfEQEOpbbTA7TZnIgL2u61lgzyoOIKTAJN-VR_ClYROSuGNMFkNYxcbtMv8QV-jVMqavpwkpJrK3eTHn1jSOTsqWhYeIjZljdUIooLtLRz6APHf7KYRjjqwSTvF_QRDqXZvf4AVXUFKx3R5dDdvZoi3mJYw_bhfcVQHdT838AJVqQRy0P-VaTEj22XSOaztVljp3tZUqboOnMOrtnjXlC7FnyethuAkyAtyMyLfQpuQxzr_j-RGyeDcklk",
            },
            {
              city: "Hamburg",
              count: "1.560",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgsoMb4eOMOR0YOqg-v4JXcOvu3VGP78Tvsu-yF-TjkCRoBKx0z1HMOo8qUQrtI142HxOKLztAVc1DitBxlJTsQl0vQwp0Kc7rKphG3krnjnIIQPA52HjuSsRDANemiW2Z4LACcfM6AYyLuSuoKfMsipS7C0aLYaRUrhRz3hHsid99cnVWVpuWPKKzeu1GvfPcuRYm0DsQdWPvImkSoRAvgOf350T1XPfXXnJzBLyUgt_UOPAXs7DflXDFFVwx9DukvIJN9czlwOit",
            },
          ].map(({ city, count, img }) => (
            <button
              key={city}
              id={`city-${city.toLowerCase()}`}
              onClick={() => router.push(`/suche?stadt=${city}`)}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all text-left"
            >
              <img
                src={img}
                alt={`${city} Stadtbild`}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-headline-md">{city}</h3>
                <p className="text-label-md opacity-90">{count} {t("objectsAvailable")}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Für Vermieter ─────────────────────────────────── */}
      <section className="bg-surface-container-low py-24">
        <div className="max-w-[1280px] mx-auto px-5 md:px-[48px] grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary-container rounded-full mix-blend-multiply filter blur-2xl opacity-30" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsW-EjV3OdMvuKKApSV3Qth5BegXRwnsJ42LJCAlJkw25dj5OBvJXUfCfg7fltArp9nj4gpVHMaWmhsERp0urrs_LTa9KB8DGxhVR7w57xQkF3K70bMKMRCBpxfMLsjt9QGhkxkMtBZ3fciiYDb4r57W7Pe4ukUc4yO4M3OeXAVj4g1aMLmL1Zvh54V9eGamqvC-h__WJrdA_pEfnSZ_Lr59YZ9wOzslE3P9zCOf0_WL7sd_qDAP1bAbbDnLD4H2PBbcLVmu3HRkbG"
              alt="Immobilienmakler übergibt Schlüssel"
              className="rounded-xl shadow-2xl relative z-10 w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl z-20 hidden md:block">
              <p className="text-primary font-bold text-[24px] leading-8">98%</p>
              <p className="text-on-surface-variant text-[12px] font-semibold">{t("satisfiedLandlords")}</p>
            </div>
          </div>

          {/* Text side */}
          <div>
            <span className="text-secondary text-label-md tracking-wider uppercase mb-4 block">
              {t("forLandlords")}
            </span>
            <h2 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-6">
              {t("landlordTitle")}
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-10 leading-relaxed">
              {t("landlordDesc")}
            </p>

            <div className="space-y-6 mb-10">
              {[
                { icon: "verified", title: t("verifiedTenants"), desc: t("verifiedTenantsDesc") },
                { icon: "speed", title: t("fastMarketing"), desc: t("fastMarketingDesc") },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4 items-start">
                  <div className="bg-primary-fixed p-2 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-primary text-[24px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-label-md text-primary font-bold">{title}</h4>
                    <p className="text-on-surface-variant text-[14px] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              id="btn-inserieren-hero"
              onClick={() => router.push(user ? "/inserieren" : "/auth/login?redirect=/inserieren")}
              className="bg-primary text-on-primary px-8 py-4 rounded-lg text-label-md hover:opacity-90 transition-all shadow-lg active:scale-95 font-semibold cursor-pointer"
            >
              {t("listPropertyBtn")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-24 max-w-[1280px] mx-auto px-5 md:px-[48px] w-full">
        <h2 className="text-headline-lg-mobile md:text-headline-lg text-primary text-center mb-16">
          {t("testimonialsTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: language === "de"
                ? "Der Suchprozess war unglaublich einfach. Innerhalb einer Woche hatte ich meine Traumwohnung in Berlin gefunden."
                : "The search process was incredibly easy. Within a week, I found my dream apartment in Berlin.",
              name: "Maximilian K.",
              role: `${t("testimonialRoleTenant")} Berlin`,
              initials: "MK",
            },
            {
              quote: language === "de"
                ? "Als Vermieter schätze ich besonders die Vorauswahl der Interessenten. Das spart mir extrem viel Zeit und Nerven."
                : "As a landlord, I particularly appreciate the pre-selection of applicants. This saves me a lot of time and hassle.",
              name: "Sabine H.",
              role: `${t("testimonialRoleLandlord")} München`,
              initials: "SH",
            },
            {
              quote: language === "de"
                ? "Kompetent, zuverlässig und sehr modern. Die Besichtigung per 3D-Rundgang war für mich als Pendler ideal."
                : "Competent, reliable, and very modern. The 3D virtual tour viewing was ideal for me as a commuter.",
              name: "Thomas L.",
              role: `${t("testimonialRoleTenant")} Hamburg`,
              initials: "TL",
            },
          ].map(({ quote, name, role, initials }) => (
            <div
              key={name}
              className="bg-white p-8 rounded-xl shadow-md border border-outline-variant hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-0.5 mb-4">
                {stars.map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-secondary-fixed-dim text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-body-md text-on-surface italic mb-8">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary text-[14px] flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-label-md text-primary font-bold">{name}</p>
                  <p className="text-on-surface-variant text-[12px]">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      {/* Mobile FAB */}
      <button
        id="fab-search"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform cursor-pointer"
        aria-label="Suchen"
      >
        <span className="material-symbols-outlined text-[24px]">search</span>
      </button>
    </>
  );
}
