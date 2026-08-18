import "server-only";

import { cache } from "react";
import { normalizeProjectRecord } from "@/lib/portfolio";
import { createClient } from "@/lib/supabase/server";

export type BlogCategorySummary = {
  name: string;
  slug: string;
  description: string | null;
};

export type PublishedBlogPost = {
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: string | null;
  featured: boolean;
  content: unknown;
  category: BlogCategorySummary | null;
};

function property(value: unknown, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return Reflect.get(value, key);
}

function stringProperty(value: unknown, key: string) {
  const propertyValue = property(value, key);
  return typeof propertyValue === "string" ? propertyValue : "";
}

export function normalizeBlogCategory(
  value: unknown,
): BlogCategorySummary | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  const name = stringProperty(candidate, "name");
  const slug = stringProperty(candidate, "slug");
  const description = property(candidate, "description");

  if (!name || !slug) {
    return null;
  }

  return {
    name,
    slug,
    description: typeof description === "string" ? description : null,
  };
}

function normalizePublishedBlogPost(
  row: unknown,
): PublishedBlogPost {
  const summary = property(row, "summary");
  const publishedAt = property(row, "published_at");

  return {
    slug: stringProperty(row, "slug"),
    title: stringProperty(row, "title"),
    summary: typeof summary === "string" ? summary : null,
    publishedAt: typeof publishedAt === "string" ? publishedAt : null,
    featured: property(row, "featured") === true,
    content: property(row, "content"),
    category: normalizeBlogCategory(property(row, "category")),
  };
}

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
    .select("*, category:blog_categories(name,slug,description)")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar este artigo.");
  return data;
});

export const getPublishedBlogPosts = cache(
  async (categorySlug?: string) => {
    const supabase = await publicClient();
    const now = new Date().toISOString();
    const select = categorySlug
      ? "slug,title,summary,published_at,featured,content,category:blog_categories!inner(name,slug,description)"
      : "slug,title,summary,published_at,featured,content,category:blog_categories(name,slug,description)";

    let request = supabase
      .from("blog_posts")
      .select(select)
      .eq("status", "published")
      .lte("published_at", now)
      .order("published_at", { ascending: false });

    if (categorySlug) {
      request = request.eq("category.slug", categorySlug);
    }

    const { data, error } = await request;

    if (error) {
      throw new Error("Não foi possível carregar os artigos.");
    }

    return (data ?? []).map(normalizePublishedBlogPost);
  },
);

export const getPublicBlogCategories = cache(async () => {
  const supabase = await publicClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("name,slug,description")
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar as categorias do blog.");
  }

  return (data ?? [])
    .map(normalizeBlogCategory)
    .filter((category): category is BlogCategorySummary => category !== null);
});

export const getPublicBlogCategory = cache(async (slug: string) => {
  const supabase = await publicClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("name,slug,description")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar esta categoria.");
  }

  return normalizeBlogCategory(data);
});

export const getPublishedPartner = cache(async (slug: string) => {
  const supabase = await publicClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .is("archived_at", null)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar este parceiro.");
  return data;
});
