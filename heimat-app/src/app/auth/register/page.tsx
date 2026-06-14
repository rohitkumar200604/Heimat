"use client";

import { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { t, language } = useLanguage();
  
  const [form, setForm] = useState({ name: "", email: "", tel: "", password: "" });
  
  // Self-healing: Detect Google OAuth hash redirect landing on register page and route to Auth Callback
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      if (window.location.hash.includes("access_token")) {
        router.replace(`/auth/callback${window.location.hash}`);
      }
    }
  }, [router]);

  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoadingSubmit(true);

    try {
      // 1. Sign up the user via Supabase Auth with registration metadata
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            phone: form.tel,
            role: null, // role is null initially so they can choose it on select-role!
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;
      
      // If user enumeration protection is enabled or user is missing, fail safely
      if (!data.user) {
        throw new Error(
          language === "de"
            ? "Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Angaben."
            : "Registration failed. Please check your credentials."
        );
      }

      const successAlertMsg = language === "de"
        ? "Registrierung erfolgreich abgeschlossen! Bitte prüfen Sie Ihre E-Mails und klicken Sie auf den Bestätigungslink."
        : "Registration successfully completed! Please check your email and click on the confirmation link.";

      alert(successAlertMsg);
      setSuccessMsg(successAlertMsg);
      setIsRegistered(true);

    } catch (err: any) {
      const errMsg = err.message || "";
      const isAlreadyRegistered = 
        errMsg.toLowerCase().includes("already registered") || 
        errMsg.toLowerCase().includes("already exists") ||
        errMsg.toLowerCase().includes("email_taken") ||
        errMsg.toLowerCase().includes("email taken");

      if (isAlreadyRegistered) {
        const successAlertMsg = language === "de"
          ? "Registrierung erfolgreich abgeschlossen! Bitte prüfen Sie Ihre E-Mails und klicken Sie auf den Bestätigungslink."
          : "Registration successfully completed! Please check your email and click on the confirmation link.";

        alert(successAlertMsg);
        setSuccessMsg(successAlertMsg);
        setIsRegistered(true);
        return;
      }

      if (errMsg.toLowerCase().includes("rate limit") || errMsg.toLowerCase().includes("once every 60 seconds")) {
        setErrorMsg(
          language === "de"
            ? "E-Mail-Limit überschritten. Da der kostenlose Standard-E-Mail-Server verwendet wird, wurde das Limit für diese Stunde erreicht. Bitte versuchen Sie es in einer Stunde erneut oder melden Sie sich bequem über Google an!"
            : "Email rate limit exceeded. Because the default free email provider is being used, the hourly limit has been reached. Please try again in an hour, or sign in instantly with Google!"
        );
      } else {
        setErrorMsg(err.message || "An error occurred");
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const loginLink = redirectUrl 
    ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
    : "/auth/login";

  if (isRegistered) {
    return (
      <>
        <div className="flex-grow flex items-center justify-center py-16 px-5 bg-gradient-to-br from-surface-container-low via-background to-surface-container">
          <div className="w-full max-w-lg bg-white/90 backdrop-blur-md border border-outline-variant p-10 rounded-2xl shadow-xl text-center">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                mail
              </span>
            </div>
            
            <h1 className="text-headline-lg text-primary font-bold mb-4">
              {language === "de" ? "E-Mail bestätigen" : "Verify your Email"}
            </h1>
            
            <p className="text-on-surface text-body-lg mb-6 leading-relaxed">
              {language === "de" 
                ? "Wir haben eine Bestätigungs-E-Mail an "
                : "We have sent a verification email to "}
              <strong className="text-primary">{form.email}</strong>
              {language === "de"
                ? " gesendet. Bitte klicken Sie auf den Link in der E-Mail, um Ihre Registrierung zu bestätigen."
                : " as confirmation. Please click the link inside the email to verify your registration."}
            </p>
            
            <div className="p-5 mb-8 text-[14px] text-on-surface-variant bg-surface-container-low border border-outline-variant rounded-xl flex items-start gap-3 text-left">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
              <div>
                <p className="font-semibold text-primary mb-1">
                  {language === "de" ? "Was passiert als Nächstes?" : "What happens next?"}
                </p>
                <p className="leading-relaxed text-[13px]">
                  {language === "de"
                    ? "Sobald Sie Ihre E-Mail verifiziert haben, können Sie sich direkt in Ihr Dashboard einloggen und Ihr Profil vervollständigen!"
                    : "Once you have verified your email, you will be able to log in directly to your dashboard and complete your profile!"}
                </p>
              </div>
            </div>
            
            <Link
              href={loginLink}
              className="inline-flex items-center justify-center w-full h-12 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md gap-2"
            >
              <span>{language === "de" ? "Zur Anmeldung" : "Go to Login"}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
              href={loginLink}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[600px] bg-[#f8f9ff]">
        {/* Premium Navy Blue & Light Blue Dual-Ring Spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#002046]/15 border-t-[#002046] animate-spin" />
          <div className="absolute w-10 h-10 rounded-full border-[3px] border-[#aec7f7]/20 border-b-[#aec7f7] animate-spin [animation-direction:reverse] [animation-duration:1s]" />
          <div className="absolute w-12 h-12 bg-[#002046]/5 rounded-full blur-md animate-pulse" />
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
