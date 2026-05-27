"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  
  const [role, setRole] = useState<"tenant" | "landlord">("tenant");
  const [form, setForm] = useState({ name: "", email: "", tel: "", password: "" });
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoadingSubmit(true);

    try {
      // 1. Sign up the user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;
      if (!data.user) {
        throw new Error(
          language === "de"
            ? "Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Angaben."
            : "Registration failed. Please check your credentials."
        );
      }

      const userId = data.user.id;

      // 2. Insert into profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: form.email,
          full_name: form.name,
          phone: form.tel,
          role: role,
        });

      if (profileError) throw profileError;

      // 3. Insert into role-specific profiles
      if (role === "landlord") {
        const { error: lpError } = await supabase
          .from("landlord_profiles")
          .insert({
            user_id: userId,
          });
        if (lpError) throw lpError;
      } else {
        const { error: tpError } = await supabase
          .from("tenant_profiles")
          .insert({
            user_id: userId,
          });
        if (tpError) throw tpError;
      }

      setSuccessMsg(
        language === "de"
          ? "Konto erfolgreich erstellt! Sie werden weitergeleitet..."
          : "Account successfully created! Redirecting..."
      );

      // Redirect role specifically after a short pause
      setTimeout(() => {
        if (role === "tenant") {
          router.push("/auth/verify");
        } else {
          router.push("/dashboard/landlord");
        }
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      <div className="flex-grow flex items-center justify-center py-16 px-5 bg-gradient-to-br from-surface-container-low via-background to-surface-container">
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-md border border-outline-variant p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-headline-lg text-primary font-bold mb-2">
              {t("registerTitle")}
            </h1>
            <p className="text-on-surface-variant text-body-md">
              {t("registerSubtitle")}
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 mb-6 text-[14px] text-error bg-error-container/30 border border-error/20 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 mb-6 text-[14px] text-primary bg-primary-fixed/30 border border-primary/20 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Picker pills */}
            <div className="space-y-2">
              <label className="block text-label-md text-on-surface font-semibold">
                {t("roleLabel")}
              </label>
              <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant">
                <button
                  type="button"
                  onClick={() => setRole("tenant")}
                  className={`py-3 text-label-md rounded-lg font-bold transition-all cursor-pointer ${
                    role === "tenant"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {language === "de" ? "Mieter" : "Tenant"}
                </button>
                <button
                  type="button"
                  onClick={() => setRole("landlord")}
                  className={`py-3 text-label-md rounded-lg font-bold transition-all cursor-pointer ${
                    role === "landlord"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {language === "de" ? "Vermieter" : "Landlord"}
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-label-md text-on-surface font-semibold">
                  {t("fullNameLabel")}
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Max Mustermann"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[16px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-label-md text-on-surface font-semibold">
                  {t("emailLabel")}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="max@mustermann.de"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[16px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-label-md text-on-surface font-semibold">
                  {t("phoneLabel")}
                </label>
                <input
                  id="reg-tel"
                  type="tel"
                  required
                  placeholder="+49 176 1234567"
                  value={form.tel}
                  onChange={(e) => setForm({ ...form, tel: e.target.value })}
                  className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[16px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-label-md text-on-surface font-semibold">
                  {t("passwordLabel")}
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[16px]"
                />
              </div>
            </div>

            <button
              id="btn-register-submit"
              type="submit"
              disabled={loadingSubmit}
              className="w-full h-12 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md mt-6 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingSubmit && (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              {t("register")}
            </button>
          </form>

          <div className="mt-8 text-center text-body-md">
            <Link
              href="/auth/login"
              className="text-primary font-bold hover:underline"
            >
              {t("alreadyHaveAccount")}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
