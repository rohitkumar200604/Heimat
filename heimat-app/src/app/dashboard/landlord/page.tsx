"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase/client";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

function LandlordDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, refreshProfile, isPremium, subscription } = useAuth();
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

  // Read active tab from URL query params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "overview" ||
      tabParam === "profile" ||
      tabParam === "bookings" ||
      tabParam === "properties"
    ) {
      setActiveTab(tabParam as any);
    } else {
      setActiveTab("overview");
    }
  }, [searchParams]);

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
            ),
            subscriptions (
              status,
              plan
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

      // Sort bookings: Premium tenant applications at the top
      const sortedBookings = (bookingsData || []).sort((a, b) => {
        const aTenant = (Array.isArray(a.tenant) ? a.tenant[0] : a.tenant) as any;
        const bTenant = (Array.isArray(b.tenant) ? b.tenant[0] : b.tenant) as any;
        const aIsPremium = aTenant?.subscriptions?.some((s: any) => s.status === 'active') || false;
        const bIsPremium = bTenant?.subscriptions?.some((s: any) => s.status === 'active') || false;
        if (aIsPremium && !bIsPremium) return -1;
        if (!aIsPremium && bIsPremium) return 1;
        return 0;
      });

      setBookingRequests(sortedBookings);

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



  const toggleSubscription = async () => {
    if (!user || !landlordProfile) return;
    const isPro = landlordProfile.subscription_tier === "pro";
    const nextVal = isPro ? "free" : "pro";
    try {
      // 1. Update landlord_profiles tier
      const { error } = await supabase
        .from("landlord_profiles")
        .update({ 
          subscription_tier: nextVal,
          // Disable whatsapp if downgrading
          ...(isPro ? { whatsapp_enabled: false } : {})
        })
        .eq("user_id", user.id);
      if (error) throw error;

      // 2. If cancelling premium: clear localStorage cache + mark DB subscription canceled
      if (isPro) {
        // Clear the localStorage entry so AuthContext stops treating user as premium
        localStorage.removeItem(`heimat_sub_${user.id}`);

        // Mark any active subscriptions as canceled in the DB (enum: 'canceled')
        await supabase
          .from("subscriptions")
          .update({ status: "canceled", cancel_at_period_end: true })
          .eq("user_id", user.id)
          .eq("status", "active");
      }

      // 3. Update local landlordProfile state
      setLandlordProfile({ 
        ...landlordProfile, 
        subscription_tier: nextVal,
        ...(isPro ? { whatsapp_enabled: false } : {})
      });

      // 4. Refresh AuthContext so isPremium & subscription are recomputed
      await refreshProfile();

      // 5. Show custom success popup if we just cancelled the premium plan
      if (isPro) {
        alert(
          language === "de"
            ? "Ihr Premium-Abonnement wurde erfolgreich gekündigt."
            : "Your premium subscription has been successfully cancelled."
        );
      }
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

  const isProTier = landlordProfile?.subscription_tier === "pro" || isPremium;

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

            {/* Divider */}
            <div className="border-t border-outline-variant/60 my-3" />
            
            {/* Membership Panel */}
            <div className="p-3 bg-surface-container-low/40 rounded-xl border border-outline-variant/50 space-y-3">
              <h4 className="text-[12px] font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#f07d00] text-[18px]">card_membership</span>
                <span>{language === "de" ? "Mitgliedschaft" : "Membership"}</span>
              </h4>
              
              {!isProTier ? (
                <div className="space-y-2">
                  <div className="text-[11px] text-on-surface-variant leading-tight">
                    {language === "de" ? "Kostenloser Tarif" : "Free Basic Plan"}
                  </div>
                  <Link
                    href="/preise?plan=3months"
                    className="w-full bg-[#f07d00] text-white py-2 rounded-lg font-bold text-[11px] hover:opacity-90 active:scale-95 transition-all text-center block"
                  >
                    {language === "de" ? "Jetzt upgraden" : "Upgrade Now"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[12px] font-black text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#f07d00] text-[16px]">workspace_premium</span>
                    <span>Premium ({subscription?.plan === "1month" ? "1M" : subscription?.plan === "3months" ? "3M" : subscription?.plan === "12months" ? "12M" : "Pro"})</span>
                  </div>
                  
                  {subscription ? (
                    (() => {
                      const sub = subscription;
                      const start = new Date(sub.startDate).getTime();
                      const end = new Date(sub.endDate).getTime();
                      const total = end - start;
                      const elapsed = Date.now() - start;
                      const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));
                      const daysRemaining = Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
                      
                      return (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[9px] text-on-surface-variant font-bold">
                            <span>{language === "de" ? "Gültigkeit" : "Validity"}</span>
                            <span>{daysRemaining}d left</span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#f07d00] rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-on-surface-variant/80 font-medium italic">
                            {language === "de" ? "Bis:" : "Exp:"} {new Date(sub.endDate).toLocaleDateString(language === "de" ? "de-DE" : "en-US")}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-[10px] text-on-surface-variant/80 font-medium italic pt-1">
                      {language === "de" ? "Lebenslanger Pro-Zugang" : "Lifetime Pro Access"}
                    </div>
                  )}
                </div>
              )}
            </div>
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
                          const tenant = (Array.isArray(b.tenant) ? b.tenant[0] : b.tenant) as any;
                          const score = b.ai_tenant_scores && b.ai_tenant_scores[0];
                          const tenantIsPremium = tenant?.subscriptions?.some((s: any) => s.status === 'active') || false;
                          return (
                            <div key={b.id} className="p-4 border border-outline-variant rounded-xl flex justify-between items-center gap-4 flex-wrap sm:flex-nowrap hover:shadow-sm transition-all bg-surface-container-low">
                              <div>
                                <h4 className="text-label-md font-bold text-primary flex items-center gap-1.5">
                                  {tenant?.full_name || "Mieter"}
                                  {tenantIsPremium && (
                                    <span className="material-symbols-outlined text-[#f07d00] text-[18px] select-none" title="Premium Bewerber">
                                      star
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[12px] text-on-surface-variant mt-0.5">
                                  {language === "de" ? "Objekt: " : "Property: "} <strong className="text-primary">{b.properties?.title}</strong>
                                </p>
                              </div>
                              <div className="flex items-center gap-3 ml-auto sm:ml-0">
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
                    <h3 className="text-headline-md font-bold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#f07d00]">card_membership</span>
                      {language === "de" ? "Mitgliedschaft" : "Membership Plan"}
                    </h3>
                    
                    {!isProTier ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/60">
                          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">Plan</span>
                          <span className="text-[18px] font-black text-primary block mt-1">{language === "de" ? "Kostenlose Basis" : "Free Basic"}</span>
                          <p className="text-[12px] text-on-surface-variant mt-2 leading-relaxed">
                            {language === "de" 
                              ? "Upgrade auf Premium, um verifizierte Bewerber-Portfolios einzusehen."
                              : "Upgrade to Premium to view validated applicant portfolios."}
                          </p>
                        </div>
                        <Link
                          href="/preise?plan=3months"
                          className="w-full bg-[#f07d00] text-white py-3 rounded-xl font-bold text-label-md hover:opacity-90 active:scale-98 transition-all shadow-md shadow-[#f07d00]/20 text-center block cursor-pointer"
                        >
                          {language === "de" ? "Jetzt upgraden" : "Upgrade Now"}
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-br from-[#f07d00]/5 to-transparent rounded-xl border-2 border-[#f07d00] relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-[#f07d00] text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl">
                            Active
                          </div>
                          <span className="text-[10px] text-[#f07d00] uppercase font-bold tracking-wider block">Plan</span>
                          <span className="text-[18px] font-black text-primary flex items-center gap-1.5 mt-1">
                            <span className="material-symbols-outlined text-[#f07d00] text-[20px]">workspace_premium</span>
                            Heimat Premium
                          </span>
                          
                          {/* Progress/Validity Bar */}
                          {(() => {
                            const sub = subscription;
                            if (!sub) return null;
                            const start = new Date(sub.startDate).getTime();
                            const end = new Date(sub.endDate).getTime();
                            const total = end - start;
                            const elapsed = Date.now() - start;
                            const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));
                            const daysRemaining = Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
                            
                            return (
                              <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-[11px] text-on-surface-variant font-semibold">
                                  <span>{language === "de" ? "Gültigkeit" : "Validity"}</span>
                                  <span>{daysRemaining} {language === "de" ? "Tage verbleibend" : "days left"}</span>
                                </div>
                                <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#f07d00] rounded-full transition-all duration-500" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="text-[11px] text-on-surface-variant/80 font-medium italic mt-1 text-right">
                                  {language === "de" ? "Ablaufdatum:" : "Expires on:"} {new Date(sub.endDate).toLocaleDateString(language === "de" ? "de-DE" : "en-US")}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        <button
                          onClick={toggleSubscription}
                          className="w-full border border-outline-variant text-on-surface-variant py-2.5 rounded-xl text-[12px] font-bold hover:bg-surface-container-low active:scale-98 transition-all text-center block cursor-pointer"
                        >
                          {language === "de" ? "Abonnement beenden / downgraden" : "Cancel / Downgrade Subscription"}
                        </button>
                      </div>
                    )}


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
                      ? "Verwalten Sie eingehende Anfragen von Studenten. Prüfen Sie die verifizierten Unterlagen."
                      : "Manage incoming requests from applicants. Check verification parameters and documents."}
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
                      const tenantProfile = (Array.isArray(b.tenant) ? b.tenant[0] : b.tenant) as any;
                      const tenantDetails = Array.isArray(tenantProfile?.tenant_profiles)
                        ? tenantProfile.tenant_profiles[0]
                        : tenantProfile?.tenant_profiles;
                      const propertyDetails = b.properties;
                      const aiScoreObj = b.ai_tenant_scores && b.ai_tenant_scores[0];
                      const tenantIsPremium = tenantProfile?.subscriptions?.some((s: any) => s.status === 'active') || false;

                      return (
                        <div
                          key={b.id}
                          className="p-5 border border-outline-variant rounded-2xl hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-surface-container-low"
                        >
                          <div>
                            <h4 className="text-headline-md font-bold text-primary flex items-center gap-1.5">
                              {tenantProfile?.full_name || "Bewerber"}
                              {tenantIsPremium && (
                                <span className="material-symbols-outlined text-[#f07d00] text-[20px] select-none" title="Premium Bewerber">
                                  star
                                </span>
                              )}
                            </h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                              {language === "de" ? "Wohnung: " : "Property: "} <strong className="text-primary">{propertyDetails?.title || "Property"}</strong>
                            </p>
                            <p className="text-[12px] text-on-surface-variant font-medium mt-1">
                              {language === "de" ? "Einkommen: " : "Monthly Income: "} {tenantDetails?.monthly_income ? `${tenantDetails.monthly_income} €` : "N/A"}
                            </p>
                          </div>

                          <div className="flex gap-4 items-center flex-wrap ml-auto md:ml-0">
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
                        ? "Hier finden Sie alle Objekte, die Sie auf Heimstadt inseriert haben."
                        : "Browse and manage the properties you have currently listed on the Heimstadt marketplace."}
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

export default function LandlordDashboard() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[600px] bg-surface-dim">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    }>
      <LandlordDashboardContent />
    </Suspense>
  );
}
