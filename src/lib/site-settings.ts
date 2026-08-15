import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type PublicSiteSettings = {
  companyName: string;
  email: string;
  phone: string;
  instagram: string;
  linkedin: string;
  domain: string;
  seoTitle: string;
  seoDescription: string;
};

const defaults: PublicSiteSettings = {
  companyName: "Nelled Studio",
  email: "",
  phone: "",
  instagram: "",
  linkedin: "",
  domain: "https://nelled.vercel.app",
  seoTitle: "Nelled Studio — Criando soluções digitais",
  seoDescription:
    "Desenvolvimento de produtos digitais, plataformas e sistemas personalizados.",
};

type SettingsRecord = Record<string, unknown>;

function text(record: SettingsRecord, key: string) {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDomain(value: string) {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return defaults.domain;
  }
}

export const getSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  try {
    const supabase = await createClient();

    if (!supabase) return defaults;

    const { data, error } = await supabase
      .from("site_settings")
      .select("company_name,settings")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return defaults;

    const settings =
      data.settings &&
      typeof data.settings === "object" &&
      !Array.isArray(data.settings)
        ? (data.settings as SettingsRecord)
        : {};

    const companyName = data.company_name?.trim() || defaults.companyName;
    const domain = text(settings, "domain");

    return {
      companyName,
      email: text(settings, "email"),
      phone: text(settings, "phone"),
      instagram: text(settings, "instagram"),
      linkedin: text(settings, "linkedin"),
      domain: normalizeDomain(domain || defaults.domain),
      seoTitle: text(settings, "seo_title") || defaults.seoTitle,
      seoDescription:
        text(settings, "seo_description") || defaults.seoDescription,
    };
  } catch {
    return defaults;
  }
});

export function phoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "";
}
