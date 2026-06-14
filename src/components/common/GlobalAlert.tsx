"use client";

import { useEffect, useState } from "react";

interface AlertState {
  isOpen: boolean;
  message: string;
  onClose?: () => void;
}

export default function GlobalAlert() {
  const [state, setState] = useState<AlertState>({ isOpen: false, message: "" });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalAlert = window.alert;

    // Override the native browser alert (support an optional callback function)
    window.alert = (message: string, onClose?: () => void) => {
      setState({ isOpen: true, message: String(message), onClose });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Close helper
  const handleClose = () => {
    setState((prev) => {
      if (prev.onClose) {
        prev.onClose();
      }
      return { isOpen: false, message: "", onClose: undefined };
    });
  };

  // Keyboard shortcut listener to close on Enter or Escape keys
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.isOpen]);

  if (!state.isOpen) return null;

  // Auto-detect message type for dynamic styling
  const msgLower = state.message.toLowerCase();
  const isError =
    msgLower.includes("error") ||
    msgLower.includes("fehler") ||
    msgLower.includes("failed") ||
    msgLower.includes("fehlgeschlagen") ||
    msgLower.includes("incorrect") ||
    msgLower.includes("nur mieter") ||
    msgLower.includes("please log in") ||
    msgLower.includes("bitte melde") ||
    msgLower.includes("bitte logge");

  const isSuccess =
    msgLower.includes("success") ||
    msgLower.includes("erfolgreich") ||
    msgLower.includes("aktiviert") ||
    msgLower.includes("eingereicht") ||
    msgLower.includes("gespeichert") ||
    msgLower.includes("gelöscht") ||
    msgLower.includes("updates aktiv") ||
    msgLower.includes("updates updated") ||
    msgLower.includes("gesendet");

  let theme = {
    color: "#f07d00", // Heimstadt Orange
    bgLight: "bg-[#f07d00]/5",
    border: "border-[#f07d00]",
    icon: "info",
    title: "Popup",
  };

  if (isError) {
    theme = {
      color: "#dc2626", // Red
      bgLight: "bg-red-50",
      border: "border-red-500",
      icon: "error",
      title: "Popup",
    };
  } else if (isSuccess) {
    theme = {
      color: "#16a34a", // Green
      bgLight: "bg-green-50",
      border: "border-green-600",
      icon: "check_circle",
      title: "Popup",
    };
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border-2 ${theme.border} text-center space-y-5 transform animate-[slideDown_0.25s_ease-out]`}
        onClick={(e) => e.stopPropagation()} // Prevent click-out close when clicking card itself
      >
        {/* Dynamic Status Icon */}
        <div 
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ backgroundColor: `${theme.color}15` }}
        >
          <span 
            className="material-symbols-outlined text-[36px]"
            style={{ color: theme.color }}
          >
            {theme.icon}
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-[20px] font-black text-primary">
            {theme.title}
          </h3>
          <p className="text-on-surface-variant text-[14px] leading-relaxed whitespace-pre-wrap">
            {state.message}
          </p>
        </div>

        {/* OK Close button */}
        <button
          onClick={handleClose}
          className="w-full text-white py-3.5 rounded-full font-bold text-label-md hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-md flex items-center justify-center"
          style={{ 
            backgroundColor: theme.color
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
