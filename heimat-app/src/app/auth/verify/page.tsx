"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/layout/Footer";

export default function VerifyPage() {
  const { t, language } = useLanguage();
  const [uploads, setUploads] = useState<Record<string, string>>({});

  const handleUpload = (docType: string) => {
    setUploads((prev) => ({
      ...prev,
      [docType]: "document_mock_file.pdf",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      language === "de"
        ? "Ihre Dokumente wurden erfolgreich zur Prüfung eingereicht!"
        : "Your documents have been successfully submitted for review!"
    );
  };

  const docTypes = [
    { id: "passport", label: t("docPassport"), icon: "badge" },
    { id: "visa", label: t("docVisa"), icon: "assignment_ind" },
    { id: "enrollment", label: t("docEnrollment"), icon: "school" },
    { id: "income", label: t("docIncome"), icon: "receipt_long" },
  ];

  return (
    <>
      <div className="flex-grow py-16 px-5 bg-gradient-to-br from-surface-container-low via-background to-surface-container">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md border border-outline-variant p-8 md:p-12 rounded-2xl shadow-xl">
          <div className="text-center mb-12">
            <h1 className="text-display-lg-mobile md:text-headline-lg text-primary font-bold mb-3">
              {t("verifyTitle")}
            </h1>
            <p className="text-on-surface-variant text-body-md max-w-xl mx-auto">
              {t("verifySubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {docTypes.map(({ id, label, icon }) => {
                const uploaded = uploads[id];
                return (
                  <div
                    key={id}
                    className={`border-2 border-dashed rounded-2xl p-6 transition-all relative ${
                      uploaded
                        ? "border-primary bg-primary-fixed/20"
                        : "border-outline-variant hover:border-primary bg-surface-container-low"
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-outline-variant flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-[28px]">
                          {icon}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-label-md font-bold text-primary">{label}</h3>
                        <p className="text-[12px] text-on-surface-variant leading-relaxed">
                          {uploaded ? uploaded : (language === "de" ? "PDF, JPG oder PNG bis 10MB." : "PDF, JPG or PNG up to 10MB.")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      {uploaded ? (
                        <div className="flex items-center gap-1 text-primary text-[12px] font-bold">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          {t("uploadSuccess")}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpload(id)}
                          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow"
                        >
                          {language === "de" ? "Datei hochladen" : "Upload File"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-outline-variant flex justify-end">
              <button
                id="btn-verify-submit"
                type="submit"
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer text-label-md"
              >
                {t("verifySubmitBtn")}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
