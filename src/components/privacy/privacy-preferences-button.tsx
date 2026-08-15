"use client";

import { SlidersHorizontal } from "lucide-react";

import { openPrivacyPreferences } from "@/lib/privacy-consent";

import styles from "./privacy-consent.module.css";

export function PrivacyPreferencesButton({
  variant = "footer",
  label = "Preferências de privacidade",
}: {
  variant?: "footer" | "inline";
  label?: string;
}) {
  return (
    <button
      type="button"
      className={
        variant === "inline"
          ? styles.inlinePreferencesButton
          : styles.footerPreferencesButton
      }
      onClick={openPrivacyPreferences}
    >
      <SlidersHorizontal size={14} />
      {label}
    </button>
  );
}
