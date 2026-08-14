import "server-only";

import { cache } from "react";
import { normalizeProjectRecord } from "@/lib/portfolio";
import { createClient } from "@/lib/supabase/server";

async function publicClient() {
  const supabase = await createClient();
  if (!supabase) throw new Error("A conexão com o conteúdo não está disponível.");
  return supabase;
}

export const getPublishedProjects = cache(async () => {
  const supabase = await publicClient();
  const { data, error } = await supabase.from("projects").select("*").eq("status", "published").order("sort_order", { ascending: true }).order("year", { ascending: false });
  if (error) throw new Error("Não foi possível carregar o portfólio.");
  return (data ?? []).map(normalizeProjectRecord);
});
export const getFeaturedProjects = cache(async () => {
  const supabase = await publicClient();
  const { data, error } = await supabase.from("projects").select("*").eq("status", "published").eq("featured", true).order("sort_order", { ascending: true }).limit(3);
  if (error) throw new Error("Não foi possível carregar os projetos em destaque.");
  return (data ?? []).map(normalizeProjectRecord);
});

export const getPublishedProject = cache(async (slug: string) => {
  const supabase = await publicClient();
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw new Error("Não foi possível carregar este projeto.");
  return data ? normalizeProjectRecord(data) : null;
});

export const getProjectNavigation = cache(async (slug: string) => {
  const projects = await getPublishedProjects();
  const index = projects.findIndex((project) => project.slug === slug);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: index > 0 ? projects[index - 1] : null,
    next: index < projects.length - 1 ? projects[index + 1] : null,
  };
});

export const getPublishedPost = cache(async (slug: string) => {
  const supabase = await publicClient();
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
  const supabase = await publicClient();
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
