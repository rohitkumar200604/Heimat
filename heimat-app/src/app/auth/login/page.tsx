"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { profile, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    if (profile) {
      if (!profile.role) {
        router.push("/auth/select-role");
      } else {
        const url = profile.role === "landlord" ? "/dashboard/landlord" : "/dashboard/tenant";
        router.push(url);
      }
    }
  }, [profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoadingSubmit(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Instantly fetch the user profile and redirect to the dashboard
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user?.id)
        .single();

      if (profileData) {
        if (!profileData.role) {
          router.push("/auth/select-role");
        } else {
          const url = profileData.role === "landlord" ? "/dashboard/landlord" : "/dashboard/tenant";
          router.push(url);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during Google sign-in");
    }
  };

  return (
    <>
      <div className="flex-grow flex items-center justify-center py-16 px-5 bg-gradient-to-br from-surface-container-low via-background to-surface-container">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-outline-variant p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-headline-lg text-primary font-bold mb-2">
              {t("loginTitle")}
            </h1>
            <p className="text-on-surface-variant text-body-md">
              {t("loginSubtitle")}
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
            <div className="space-y-2">
              <label className="block text-label-md text-on-surface font-semibold">
                {t("emailLabel")}
              </label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[16px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-label-md text-on-surface font-semibold">
                  {t("passwordLabel")}
                </label>
                <Link
                  href="#"
                  className="text-[12px] text-primary hover:underline font-semibold"
                >
                  {language === "de" ? "Passwort vergessen?" : "Forgot password?"}
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[16px]"
              />
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loadingSubmit}
              className="w-full h-12 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingSubmit && (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              {t("login")}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-8 pt-6 border-t border-outline-variant">
            <p className="text-center text-[12px] text-on-surface-variant font-semibold mb-4 uppercase tracking-wider">
              {language === "de" ? "Oder fortfahren mit" : "Or continue with"}
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 h-12 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer text-label-md font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.57 15.02 1 12 1 7.24 1 3.21 3.73 1.24 7.72l3.87 3a7.16 7.16 0 0 1 6.89-5.68z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46a5.5 5.5 0 0 1-2.4 3.6l3.73 2.9c2.18-2 3.7-5.07 3.7-8.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.11 14.78a7.12 7.12 0 0 1 0-4.56L1.24 7.22a11.96 11.96 0 0 0 0 9.56l3.87-3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.9l-3.73-2.9a7.12 7.12 0 0 1-10.9-4.42l-3.87 3A11.96 11.96 0 0 0 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="mt-8 text-center text-body-md">
            <Link
              href="/auth/register"
              className="text-primary font-bold hover:underline"
            >
              {t("dontHaveAccount")}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
