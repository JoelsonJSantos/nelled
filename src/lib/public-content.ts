import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getPublishedProject = cache(async (slug: string) => {
  const supabase = await createClient();
  if (!supabase) throw new Error("A conexão com o conteúdo não está disponível.");
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw new Error("Não foi possível carregar este projeto.");
  return data;
});

export const getPublishedPost = cache(async (slug: string) => {
  const supabase = await createClient();
  if (!supabase) throw new Error("A conexão com o conteúdo não está disponível.");
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar este artigo.");
  return data;
});

export const getPublishedPartner = cache(async (slug: string) => {
  const supabase = await createClient();
  if (!supabase) throw new Error("A conexão com o conteúdo não está disponível.");
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar este parceiro.");
  return data;
});
