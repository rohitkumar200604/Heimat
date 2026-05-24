"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`font-sans text-[14px] font-medium leading-5 transition-colors duration-200 pb-1 ${
          active
            ? "text-primary font-bold border-b-2 border-primary"
            : "text-on-surface-variant hover:text-primary"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header
      id="navbar"
      className={`w-full top-0 sticky bg-surface border-b border-outline-variant z-50 transition-shadow duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <nav className="flex justify-between items-center w-full px-5 md:px-[48px] py-4 max-w-[1280px] mx-auto">
        {/* Logo + Links */}
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="text-[32px] md:text-[48px] font-bold text-primary leading-none tracking-tight hover:opacity-90 transition-opacity"
          >
            {t("logo")}
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLink("/suche", t("search"))}
            {navLink("/inserieren", t("rent"))}
          </div>
        </div>

        {/* Right Nav */}
        <div className="hidden md:flex items-center gap-6">
          {/* Language Switcher */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant">
            <button
              onClick={() => setLanguage("de")}
              className={`px-2.5 py-1 text-[12px] font-bold rounded transition-all ${
                language === "de"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              DE
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 text-[12px] font-bold rounded transition-all ${
                language === "en"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              EN
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              id="btn-anmelden"
              className="px-5 py-2 rounded-lg text-[14px] font-semibold text-primary hover:bg-surface-container-low transition-all active:scale-95 text-center"
            >
              {t("login")}
            </Link>
            <Link
              href="/auth/register"
              id="btn-registrieren"
              className="px-5 py-2 rounded-lg text-[14px] font-semibold bg-primary text-on-primary hover:opacity-90 transition-all active:scale-95 text-center"
            >
              {t("register")}
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Language Switcher */}
          <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant">
            <button
              onClick={() => setLanguage("de")}
              className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                language === "de"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant"
              }`}
            >
              DE
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                language === "en"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant"
              }`}
            >
              EN
            </button>
          </div>

          <button
            id="mobile-menu-btn"
            className="p-2 text-primary hover:bg-surface-container-low rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menü öffnen"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface px-5 py-6 space-y-3">
          <Link
            href="/suche"
            className={`block px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
              pathname === "/suche"
                ? "text-primary bg-surface-container-low font-bold"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {t("search")}
          </Link>
          <Link
            href="/inserieren"
            className={`block px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
              pathname === "/inserieren"
                ? "text-primary bg-surface-container-low font-bold"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {t("rent")}
          </Link>
          <div className="pt-3 border-t border-outline-variant/50 flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="w-full py-3 rounded-xl text-[14px] font-semibold text-primary border border-outline-variant hover:bg-surface-container-low transition-all text-center"
            >
              {t("login")}
            </Link>
            <Link
              href="/auth/register"
              className="w-full py-3 rounded-xl text-[14px] font-semibold bg-primary text-on-primary hover:opacity-90 transition-all text-center"
            >
              {t("register")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
