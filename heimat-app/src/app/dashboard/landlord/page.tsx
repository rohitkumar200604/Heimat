"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase/client";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function LandlordDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  
  const [landlordProfile, setLandlordProfile] = useState<any>(null);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
    if (!loading && profile && profile.role !== "landlord") {
      router.push("/dashboard/tenant");
    }
  }, [user, profile, loading, router]);

  const fetchLandlordData = async () => {
    if (!user) return;
    try {
      // 1. Fetch landlord profile details
      const { data: lpData, error: lpErr } = await supabase
        .from("landlord_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (lpErr) throw lpErr;
      setLandlordProfile(lpData);

      // 2. Fetch booking requests for properties owned by landlord
      const { data: bookingsData, error: bookingsErr } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          move_in_date,
          rent_total,
          tenant_id,
          tenant:profiles!tenant_id (
            id,
            full_name,
            email,
            tenant_profiles (
              monthly_income
            )
          ),
          properties (
            id,
            title
          ),
          ai_tenant_scores (
            overall_score
          )
        `)
        .eq("landlord_id", user.id);
      
      if (bookingsErr) throw bookingsErr;
      setBookingRequests(bookingsData || []);
    } catch (err) {
      console.error("Error loading landlord dashboard:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchLandlordData();
  }, [user]);

  const toggleWhatsApp = async () => {
    if (!user || !landlordProfile || landlordProfile.subscription_tier !== "pro") return;
    const nextVal = !landlordProfile.whatsapp_enabled;
    try {
      const { error } = await supabase
        .from("landlord_profiles")
        .update({ whatsapp_enabled: nextVal })
        .eq("user_id", user.id);
      if (error) throw error;
      setLandlordProfile({ ...landlordProfile, whatsapp_enabled: nextVal });
    } catch (err) {
      console.error("Error toggling WhatsApp:", err);
    }
  };

  const toggleSubscription = async () => {
    if (!user || !landlordProfile) return;
    const isPro = landlordProfile.subscription_tier === "pro";
    const nextVal = isPro ? "free" : "pro";
    try {
      const { error } = await supabase
        .from("landlord_profiles")
        .update({ 
          subscription_tier: nextVal,
          // Disable whatsapp if downgrading
          ...(isPro ? { whatsapp_enabled: false } : {})
        })
        .eq("user_id", user.id);
      if (error) throw error;
      setLandlordProfile({ 
        ...landlordProfile, 
        subscription_tier: nextVal,
        ...(isPro ? { whatsapp_enabled: false } : {})
      });
    } catch (err) {
      console.error("Error updating subscription tier:", err);
    }
  };

  if (loading || loadingDashboard) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isProTier = landlordProfile?.subscription_tier === "pro";
  const whatsAppActive = isProTier && landlordProfile?.whatsapp_enabled;

  return (
    <>
      <div className="flex-grow py-12 px-5 max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <div>
            <span className="text-[14px] text-secondary font-bold uppercase tracking-wider block mb-1">
              {t("landlordDashTitle")}
            </span>
            <h1 className="text-display-lg-mobile md:text-headline-lg font-bold text-primary">
              {t("welcome")} {profile?.full_name || "User"}!
            </h1>
          </div>
          <Link
            href="/inserieren"
            className="bg-primary text-on-primary px-6 py-3.5 rounded-xl text-label-md font-bold hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer"
          >
            {t("addNewProperty")}
          </Link>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Main area - 8 Cols */}
          <div className="lg:col-span-8 space-y-8">
            {/* Booking Requests */}
            <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
              <h2 className="text-headline-md font-bold text-primary mb-6">
                {t("bookingRequests")}
              </h2>
              {bookingRequests.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant text-body-md">
                  {language === "de" 
                    ? "Sie haben momentan keine ausstehenden Buchungsanfragen." 
                    : "You do not have any pending booking requests at the moment."}
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingRequests.map((b) => {
                    const tenantProfile = b.tenant;
                    const tenantDetails = tenantProfile?.tenant_profiles;
                    const propertyDetails = b.properties;
                    const aiScoreObj = b.ai_tenant_scores && b.ai_tenant_scores[0];

                    return (
                      <div
                        key={b.id}
                        className="p-5 border border-outline-variant rounded-2xl hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                      >
                        <div>
                          <h4 className="text-headline-md font-bold text-primary">{tenantProfile?.full_name || "Applicant"}</h4>
                          <p className="text-body-md text-on-surface-variant mt-1">
                            {language === "de" ? "Bewerbung für:" : "Applied for:"} <span className="font-semibold">{propertyDetails?.title || "Property"}</span>
                          </p>
                          <p className="text-[12px] text-on-surface-variant font-medium mt-1">
                            {language === "de" ? "Monatliches Einkommen:" : "Monthly income:"} {tenantDetails?.monthly_income ? `${tenantDetails.monthly_income} €` : "N/A"}
                          </p>
                        </div>

                        {/* AI Score Indicators */}
                        <div className="flex gap-4 items-center flex-wrap ml-auto md:ml-0">
                          <div className="bg-primary-fixed/20 px-4 py-2.5 rounded-xl border border-primary/20 text-center">
                            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                              {t("tenantMatchScore")}
                            </p>
                            <p className="text-[22px] font-bold text-primary leading-tight mt-0.5">
                              {aiScoreObj ? `${aiScoreObj.overall_score}%` : "TBD"}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <Link
                              href={`/buchen/${b.id}`}
                              className="bg-surface-container-high text-primary px-4 py-2.5 rounded-xl text-[12px] font-bold hover:bg-primary hover:text-on-primary transition-all cursor-pointer text-center"
                            >
                              {language === "de" ? "Prüfen" : "Review"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area - 4 Cols */}
          <div className="lg:col-span-4 space-y-6">
            {/* Subscription Settings */}
            <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-headline-md font-bold text-primary">
                {language === "de" ? "Abonnement & Tiers" : "Subscription & Tiers"}
              </h3>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">
                    {language === "de" ? "Aktueller Tarif" : "Current Plan"}
                  </p>
                  <p className="text-[18px] font-bold text-primary mt-0.5">
                    {isProTier ? "Pro Plan" : "Free Plan"}
                  </p>
                </div>
                <button
                  onClick={toggleSubscription}
                  className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[12px] font-bold hover:opacity-90 transition-all cursor-pointer font-sans"
                >
                  {isProTier ? (language === "de" ? "Downgrade" : "Downgrade") : (language === "de" ? "Upgrade" : "Upgrade")}
                </button>
              </div>

              {/* WhatsApp Toggle with Pro Tier Requirement */}
              <div className="pt-4 border-t border-outline-variant flex justify-between items-center">
                <div>
                  <h4 className="text-label-md font-bold text-primary">{t("whatsAppNotifications")}</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {isProTier ? (language === "de" ? "WhatsApp Updates aktiv" : "WhatsApp updates active") : `*${t("proTierOnly")}`}
                  </p>
                </div>
                <button
                  disabled={!isProTier}
                  onClick={toggleWhatsApp}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center p-0.5 cursor-pointer ${
                    !isProTier ? "opacity-30 cursor-not-allowed" : ""
                  } ${whatsAppActive ? "bg-primary" : "bg-outline-variant"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-all transform ${
                      whatsAppActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
