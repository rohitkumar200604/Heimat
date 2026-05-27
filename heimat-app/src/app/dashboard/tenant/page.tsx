"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase/client";
import Footer from "@/components/layout/Footer";

export default function TenantDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  
  const [docs, setDocs] = useState<any[]>([]);
  const [activeBooking, setActiveBooking] = useState<any | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
    if (!loading && profile && profile.role !== "tenant") {
      router.push("/dashboard/landlord");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchTenantData = async () => {
      try {
        // 1. Fetch documents
        const { data: docData, error: docErr } = await supabase
          .from("verification_documents")
          .select("*")
          .eq("user_id", user.id);
        if (docErr) throw docErr;
        setDocs(docData || []);

        // 2. Fetch active booking (the latest non-cancelled one)
        const { data: bookingData, error: bookingErr } = await supabase
          .from("bookings")
          .select(`
            id,
            status,
            move_in_date,
            property_id,
            properties (
              id,
              title,
              street,
              city,
              zip
            )
          `)
          .eq("tenant_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (bookingErr) throw bookingErr;
        if (bookingData && bookingData.length > 0) {
          setActiveBooking(bookingData[0]);
        }
      } catch (err) {
        console.error("Error loading tenant dashboard data:", err);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchTenantData();
  }, [user]);

  if (loading || loadingDashboard) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const documentTypesList = [
    { key: "passport", labelDe: "Personalausweis / Reisepass", labelEn: "Passport / ID Card" },
    { key: "enrollment", labelDe: "Immatrikulationsbescheinigung", labelEn: "Enrollment Certificate" },
    { key: "income", labelDe: "Einkommensnachweis", labelEn: "Proof of Income" },
    { key: "visa", labelDe: "Visum / Aufenthaltstitel", labelEn: "Visa / Residence Permit" },
  ];

  const getDocStatus = (type: string) => {
    const d = docs.find((x) => x.doc_type === type);
    return d ? d.status : "missing"; // missing, pending, approved, rejected
  };

  const getCountdown = (dateStr: string) => {
    const moveIn = new Date(dateStr);
    const today = new Date();
    const diffTime = moveIn.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getPipelineSteps = (status: string) => {
    const docReviewActive = ["docs_review", "approved", "deposit_paid", "confirmed"].includes(status);
    const approvedActive = ["approved", "deposit_paid", "confirmed"].includes(status);
    const depositActive = ["deposit_paid", "confirmed"].includes(status);
    const confirmedActive = status === "confirmed";

    return [
      { labelDe: "Suche", labelEn: "Discovery", active: true },
      { labelDe: "Bewerbung", labelEn: "Intent", active: true },
      { labelDe: "Unterlagen", labelEn: "Documents", active: docReviewActive },
      { labelDe: "Prüfung", labelEn: "AI Match", active: approvedActive },
      { labelDe: "Genehmigung", labelEn: "Approval", active: approvedActive },
      { labelDe: "Kaution", labelEn: "Deposit", active: depositActive },
      { labelDe: "Einzug", labelEn: "Move-In", active: confirmedActive },
    ];
  };

  const pipeline = activeBooking ? getPipelineSteps(activeBooking.status) : [];
  const activeCount = pipeline.filter(p => p.active).length;
  const progressPct = pipeline.length > 0 ? ((activeCount - 1) / (pipeline.length - 1)) * 100 : 0;

  const property = activeBooking?.properties as any;

  return (
    <>
      <div className="flex-grow py-12 px-5 max-w-[1280px] mx-auto w-full">
        {/* Welcome Header */}
        <div className="mb-10">
          <span className="text-[14px] text-secondary font-bold uppercase tracking-wider block mb-1">
            {t("tenantDashTitle")}
          </span>
          <h1 className="text-display-lg-mobile md:text-headline-lg font-bold text-primary">
            {t("welcome")} {profile?.full_name || "User"}!
          </h1>
        </div>

        {/* Dashboard Content */}
        {!activeBooking ? (
          <div className="bg-white border border-outline-variant p-8 rounded-2xl shadow-sm text-center space-y-4">
            <span className="material-symbols-outlined text-[64px] text-primary">home</span>
            <h3 className="text-headline-md font-bold text-primary">
              {language === "de" ? "Finden Sie Ihre Traumwohnung" : "Find Your Dream Apartment"}
            </h3>
            <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
              {language === "de" 
                ? "Sie haben momentan keine laufenden Buchungsanfragen. Durchstöbern Sie unsere Premium-Objekte in Berlin, München und Hamburg."
                : "You don't have any active booking requests at the moment. Browse our premium properties in Berlin, Munich, and Hamburg."}
            </p>
            <button 
              onClick={() => router.push("/suche")}
              className="bg-primary text-on-primary px-6 py-3 rounded-lg text-label-md font-bold hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              {t("searchBtn")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
            {/* Visual Status Pipeline - 8 Cols */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
                <h2 className="text-headline-md font-bold text-primary mb-6">
                  {t("applicationStatus")}
                </h2>

                <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto my-10">
                  {/* Track */}
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant -z-10 -translate-y-1/2" />
                  {/* Progress */}
                  <div 
                    className="absolute top-1/2 left-0 h-[2px] bg-primary -z-10 -translate-y-1/2 transition-all duration-500" 
                    style={{ width: `${progressPct}%` }}
                  />

                  {pipeline.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[12px] font-bold shadow transition-all ${
                          step.active ? "bg-primary text-on-primary" : "bg-outline-variant text-on-surface-variant"
                        }`}
                      >
                        {step.active ? <span className="material-symbols-outlined text-[14px]">check</span> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-bold ${step.active ? "text-primary" : "text-on-surface-variant"}`}>
                        {language === "de" ? step.labelDe : step.labelEn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Bookings Countdown card */}
              <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div>
                  <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    {language === "de" ? "Wohnung" : "Property"}
                  </p>
                  <h3 className="text-headline-md font-bold text-primary mt-1">
                    {property?.title || property?.street || "Unterkunft"}
                  </h3>
                  <p className="text-body-md text-on-surface-variant">
                    {property?.zip} {property?.city}
                  </p>
                </div>

                <div className="text-center bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                  <span className="material-symbols-outlined text-primary text-[28px] mb-1">
                    calendar_today
                  </span>
                  <p className="text-[12px] text-on-surface-variant font-semibold uppercase">{t("moveInDate")}</p>
                  <p className="text-body-md font-bold text-primary mt-0.5">
                    {new Date(activeBooking.move_in_date).toLocaleDateString(language === "de" ? "de-DE" : "en-US")}
                  </p>
                </div>

                <div className="text-center bg-primary-fixed/20 p-4 rounded-xl border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-[28px] mb-1">
                    hourglass_empty
                  </span>
                  <p className="text-[12px] text-primary font-bold uppercase">{t("countdownToMoveIn")}</p>
                  <p className="text-[28px] font-bold text-primary leading-none mt-1">
                    {getCountdown(activeBooking.move_in_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification documents - 4 Cols */}
            <div className="lg:col-span-4 bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-headline-md font-bold text-primary">
                {t("verificationStatus")}
              </h2>
              <div className="space-y-4">
                {documentTypesList.map((docType) => {
                  const status = getDocStatus(docType.key);
                  return (
                    <div key={docType.key} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/50">
                      <div>
                        <p className="text-label-md font-bold text-primary">
                          {language === "de" ? docType.labelDe : docType.labelEn}
                        </p>
                        <p className="text-[11px] text-on-surface-variant uppercase">{status}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {status === "approved" && (
                          <span className="bg-primary text-on-primary px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                            OK
                          </span>
                        )}
                        {status === "pending" && (
                          <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                            {language === "de" ? "Prüfung" : "Review"}
                          </span>
                        )}
                        {status === "rejected" && (
                          <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                            {language === "de" ? "Fehler" : "Error"}
                          </span>
                        )}
                        {status === "missing" && (
                          <span className="bg-outline-variant text-on-surface-variant px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                            {language === "de" ? "Fehlt" : "Missing"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={() => router.push(`/buchen/${activeBooking.id}`)}
                className="w-full bg-primary text-on-primary py-3 rounded-xl text-label-md font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer text-center"
              >
                {language === "de" ? "Dokumente verwalten" : "Manage Documents"}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
