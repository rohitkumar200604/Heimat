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
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "bookings" | "properties">("overview");

  // Database Data States
  const [landlordProfile, setLandlordProfile] = useState<any>(null);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Form State
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    stripe_account_id: "",
    iban_last4: "",
  });

  // Action feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

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
      
      if (!lpErr && lpData) {
        setLandlordProfile(lpData);
        setProfileForm({
          full_name: profile?.full_name || "",
          phone: profile?.phone || "",
          stripe_account_id: lpData.stripe_account_id || "",
          iban_last4: lpData.iban_last4 || "",
        });
      } else {
        setProfileForm(prev => ({
          ...prev,
          full_name: profile?.full_name || "",
          phone: profile?.phone || "",
        }));
      }

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

      // 3. Fetch properties owned by landlord
      if (lpData) {
        const { data: propData, error: propErr } = await supabase
          .from("properties")
          .select("*")
          .eq("landlord_id", lpData.id);
        
        if (!propErr) {
          setPropertiesList(propData || []);
        }
      }
    } catch (err) {
      console.error("Error loading landlord dashboard:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchLandlordData();
  }, [user, profile]);

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

  // Landlord Profile save handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSavingProfile(true);

    try {
      if (!user) throw new Error("No authenticated user");

      // 1. Update profiles
      const { error: pErr } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
        })
        .eq("id", user.id);
      if (pErr) throw pErr;

      // 2. Update landlord_profiles (upsert)
      const { data: updatedLp, error: lErr } = await supabase
        .from("landlord_profiles")
        .upsert({
          user_id: user.id,
          stripe_account_id: profileForm.stripe_account_id || null,
          iban_last4: profileForm.iban_last4 || null,
        }, { onConflict: "user_id" })
        .select()
        .single();
      if (lErr) throw lErr;

      setLandlordProfile(updatedLp);
      setSuccessMsg(
        language === "de"
          ? "Vermieter-Details erfolgreich gespeichert!"
          : "Landlord details successfully saved!"
      );
      
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
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
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-10">
          <div>
            <span className="text-[14px] text-secondary font-bold uppercase tracking-wider block mb-1">
              {t("landlordDashTitle")}
            </span>
            <h1 className="text-display-lg-mobile md:text-headline-lg font-bold text-primary">
              {t("welcome")}, {profile?.full_name || "Vermieter"}!
            </h1>
          </div>
          
          <Link
            href="/inserieren"
            className="bg-primary text-on-primary px-6 py-3.5 rounded-xl text-label-md font-bold hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer self-start sm:self-auto flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add_home</span>
            {t("addNewProperty")}
          </Link>
        </div>

        {/* Tabbed Layout - Sidebar Left, Main Right */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ── Sidebar Navigation ─────────────────────────── */}
          <aside className="w-full lg:w-64 bg-white/90 backdrop-blur-md border border-outline-variant rounded-2xl p-4 shadow-sm flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left text-label-md font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">space_dashboard</span>
              <span>{language === "de" ? "Übersicht" : "Overview"}</span>
            </button>
            
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left text-label-md font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
              <span>{language === "de" ? "Profil & Finanzen" : "Profile & Finance"}</span>
            </button>
            
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left text-label-md font-bold transition-all ${
                activeTab === "bookings"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">book_online</span>
              <span>{language === "de" ? "Buchungsanfragen" : "Booking Requests"}</span>
            </button>
            
            <button
              onClick={() => setActiveTab("properties")}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left text-label-md font-bold transition-all ${
                activeTab === "properties"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">home_work</span>
              <span>{language === "de" ? "Meine Immobilien" : "My Properties"}</span>
            </button>
          </aside>

          {/* ── Main Tab Contents ─────────────────────────── */}
          <main className="flex-grow w-full space-y-6">
            
            {/* 1. Tab: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Stats Columns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-white border border-outline-variant p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-[24px]">real_estate_agent</span>
                    </div>
                    <div>
                      <p className="text-[12px] text-on-surface-variant font-bold uppercase leading-none">
                        {language === "de" ? "Immobilien" : "Properties"}
                      </p>
                      <p className="text-[18px] font-bold text-primary mt-1">
                        {propertiesList.length} Listings
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-outline-variant p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-[24px]">pending_actions</span>
                    </div>
                    <div>
                      <p className="text-[12px] text-on-surface-variant font-bold uppercase leading-none">
                        {language === "de" ? "Anfragen" : "Pending Requests"}
                      </p>
                      <p className="text-[18px] font-bold text-primary mt-1">
                        {bookingRequests.filter(b => b.status === "pending").length} Pending
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-outline-variant p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-[24px]">card_membership</span>
                    </div>
                    <div>
                      <p className="text-[12px] text-on-surface-variant font-bold uppercase leading-none">
                        {language === "de" ? "Mitgliedschaft" : "Membership Plan"}
                      </p>
                      <p className="text-[18px] font-bold text-primary mt-1 capitalize">
                        {landlordProfile?.subscription_tier ? `${landlordProfile.subscription_tier} Tier` : "Free Tier"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Quick requests list - 8 Cols */}
                  <div className="lg:col-span-8 bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-headline-md font-bold text-primary">
                      {language === "de" ? "Letzte Buchungsanfragen" : "Recent Booking Requests"}
                    </h3>
                    
                    {bookingRequests.length === 0 ? (
                      <div className="text-center py-8 text-on-surface-variant text-body-md">
                        {language === "de" 
                          ? "Sie haben momentan keine ausstehenden Buchungsanfragen." 
                          : "You do not have any pending booking requests at the moment."}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookingRequests.slice(0, 3).map((b) => {
                          const tenant = b.tenant;
                          const score = b.ai_tenant_scores && b.ai_tenant_scores[0];
                          return (
                            <div key={b.id} className="p-4 border border-outline-variant rounded-xl flex justify-between items-center gap-4 flex-wrap sm:flex-nowrap hover:shadow-sm transition-all bg-surface-container-low">
                              <div>
                                <h4 className="text-label-md font-bold text-primary">{tenant?.full_name || "Mieter"}</h4>
                                <p className="text-[12px] text-on-surface-variant mt-0.5">
                                  {language === "de" ? "Objekt: " : "Property: "} <strong className="text-primary">{b.properties?.title}</strong>
                                </p>
                              </div>
                              <div className="flex items-center gap-3 ml-auto sm:ml-0">
                                <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[11px] font-bold">
                                  AI Match: {score ? `${score.overall_score}%` : "TBD"}
                                </span>
                                <Link 
                                  href={`/buchen/${b.id}`} 
                                  className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                                >
                                  {language === "de" ? "Prüfen" : "Review"}
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Subscription settings quick panel - 4 Cols */}
                  <div className="lg:col-span-4 bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6">
                    <h3 className="text-headline-md font-bold text-primary">
                      {language === "de" ? "Tarif-Verwaltung" : "Plan Settings"}
                    </h3>
                    
                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Plan</p>
                        <p className="text-[16px] font-bold text-primary capitalize">{landlordProfile?.subscription_tier || "Free"}</p>
                      </div>
                      <button
                        onClick={toggleSubscription}
                        className="bg-primary text-on-primary px-3.5 py-1.5 rounded-lg text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer"
                      >
                        {isProTier ? (language === "de" ? "Downgrade" : "Downgrade") : (language === "de" ? "Upgrade" : "Upgrade")}
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
                      <div>
                        <h4 className="text-label-sm font-bold text-primary">{t("whatsAppNotifications")}</h4>
                        <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">
                          {isProTier ? (language === "de" ? "WhatsApp Updates aktiv" : "WhatsApp updates active") : `*${t("proTierOnly")}`}
                        </p>
                      </div>
                      <button
                        disabled={!isProTier}
                        onClick={toggleWhatsApp}
                        className={`w-11 h-5.5 rounded-full transition-all relative flex items-center p-0.5 cursor-pointer ${
                          !isProTier ? "opacity-35 cursor-not-allowed" : ""
                        } ${whatsAppActive ? "bg-primary" : "bg-outline-variant"}`}
                      >
                        <div
                          className={`w-4.5 h-4.5 bg-white rounded-full shadow transition-all transform ${
                            whatsAppActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. Tab: Landlord Profile Settings */}
            {activeTab === "profile" && (
              <div className="bg-white border border-outline-variant p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h2 className="text-headline-md font-bold text-primary">
                    {language === "de" ? "Vermieter-Profil & Einstellungen" : "Landlord Profile & Settings"}
                  </h2>
                  <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">
                    {language === "de"
                      ? "Verwalten Sie Ihre Kontaktdaten, Ihre IBAN für den Mieteingang und Ihre Stripe-Integration für sichere Direktzahlungen."
                      : "Manage your contact credentials, Stripe Connect accounts, and IBAN details for secure directly deposited tenant rentals."}
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-4 text-[14px] text-error bg-error-container/30 border border-error/20 rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-4 text-[14px] text-primary bg-primary-fixed/30 border border-primary/20 rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Identity Category */}
                  <div className="space-y-4">
                    <h3 className="text-label-md font-bold text-primary uppercase border-b border-outline-variant pb-1.5">
                      {language === "de" ? "Persönliche Daten" : "Personal Details"}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-label-sm text-on-surface font-semibold">
                          {language === "de" ? "Vollständiger Name" : "Full Name"}
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                          className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[15px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-label-sm text-on-surface font-semibold">
                          {language === "de" ? "Telefonnummer" : "Phone Number"}
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+49 176 123456"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[15px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stripe and Finance Details */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-label-md font-bold text-primary uppercase border-b border-outline-variant pb-1.5">
                      {language === "de" ? "Finanzen & Auszahlungen" : "Payouts & Stripe Connect"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-label-sm text-on-surface font-semibold">
                          Stripe Account ID
                        </label>
                        <input
                          type="text"
                          placeholder="acct_12345..."
                          value={profileForm.stripe_account_id}
                          onChange={(e) => setProfileForm({ ...profileForm, stripe_account_id: e.target.value })}
                          className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[15px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-label-sm text-on-surface font-semibold">
                          {language === "de" ? "Letzte 4 Ziffern der IBAN" : "Last 4 Digits of IBAN"}
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="1234"
                          value={profileForm.iban_last4}
                          onChange={(e) => setProfileForm({ ...profileForm, iban_last4: e.target.value })}
                          className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-[15px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-outline-variant flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-primary text-on-primary px-8 h-12 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile && (
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      )}
                      {language === "de" ? "Details speichern" : "Save Details"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. Tab: Booking Requests */}
            {activeTab === "bookings" && (
              <div className="bg-white border border-outline-variant p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h2 className="text-headline-md font-bold text-primary">
                    {language === "de" ? "Aktive Buchungsanfragen" : "Pending Booking Requests"}
                  </h2>
                  <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">
                    {language === "de"
                      ? "Verwalten Sie eingehende Anfragen von Studenten. Prüfen Sie die per KI berechneten Übereinstimmungswerte und verifizierten Unterlagen."
                      : "Manage incoming requests from applicants. Check verification parameters, documents, and secure AI matching scores."}
                  </p>
                </div>

                {bookingRequests.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant text-body-md border-2 border-dashed border-outline-variant rounded-2xl">
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
                          className="p-5 border border-outline-variant rounded-2xl hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-surface-container-low"
                        >
                          <div>
                            <h4 className="text-headline-md font-bold text-primary">{tenantProfile?.full_name || "Bewerber"}</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                              {language === "de" ? "Wohnung: " : "Property: "} <strong className="text-primary">{propertyDetails?.title || "Property"}</strong>
                            </p>
                            <p className="text-[12px] text-on-surface-variant font-medium mt-1">
                              {language === "de" ? "Einkommen: " : "Monthly Income: "} {tenantDetails?.monthly_income ? `${tenantDetails.monthly_income} €` : "N/A"}
                            </p>
                          </div>

                          <div className="flex gap-4 items-center flex-wrap ml-auto md:ml-0">
                            <div className="bg-primary-fixed/20 px-4 py-2.5 rounded-xl border border-primary/20 text-center">
                              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                                {t("tenantMatchScore")}
                              </p>
                              <p className="text-[20px] font-bold text-primary leading-tight mt-0.5">
                                {aiScoreObj ? `${aiScoreObj.overall_score}%` : "TBD"}
                              </p>
                            </div>

                            <Link
                              href={`/buchen/${b.id}`}
                              className="bg-primary text-on-primary px-5 py-3 rounded-xl text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer text-center"
                            >
                              {language === "de" ? "Details prüfen" : "Review Profile"}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. Tab: Landlord Properties List */}
            {activeTab === "properties" && (
              <div className="bg-white border border-outline-variant p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-outline-variant/60 pb-5 flex-wrap gap-4">
                  <div>
                    <h2 className="text-headline-md font-bold text-primary">
                      {language === "de" ? "Inserierte Immobilien" : "My Listed Properties"}
                    </h2>
                    <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">
                      {language === "de"
                        ? "Hier finden Sie alle Objekte, die Sie auf Heimat inseriert haben."
                        : "Browse and manage the properties you have currently listed on the Heimat marketplace."}
                    </p>
                  </div>
                  <Link
                    href="/inserieren"
                    className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    {language === "de" ? "Neues Inserat" : "Add Property"}
                  </Link>
                </div>

                {propertiesList.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant text-body-md border-2 border-dashed border-outline-variant rounded-2xl">
                    {language === "de" 
                      ? "Sie haben momentan noch keine Immobilien inseriert." 
                      : "You have not listed any properties yet."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {propertiesList.map((p) => (
                      <div key={p.id} className="border border-outline-variant p-5 rounded-2xl bg-surface-container-low flex flex-col justify-between hover:shadow-md transition-all gap-5">
                        <div>
                          <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                            {p.property_type || "Apartment"}
                          </span>
                          <h4 className="text-headline-md font-bold text-primary mt-3 truncate">{p.title}</h4>
                          <p className="text-[12px] text-on-surface-variant mt-0.5">{p.street}, {p.city}</p>
                          
                          <div className="mt-4 flex gap-4 text-[13px] text-on-surface font-semibold">
                            <span>{p.size_sqm} m²</span>
                            <span>•</span>
                            <span>{p.rooms} {language === "de" ? "Zimmer" : "Rooms"}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-outline-variant/60 pt-4 mt-auto">
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider leading-none">Kaltmiete</p>
                            <p className="text-body-md font-extrabold text-primary mt-1">€ {p.rent_cold}</p>
                          </div>
                          <Link
                            href={`/objekt/${p.id}`}
                            className="text-primary text-[12px] font-bold hover:underline flex items-center gap-1"
                          >
                            {language === "de" ? "Ansehen" : "View"}
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
