import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/site-settings";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const baseUrl = settings.domain.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projetos`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/servicos`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contato`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/parceiros`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/termos-de-uso`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-de-privacidade`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-de-cookies`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const supabase = await createClient();
    if (!supabase) return staticRoutes;

    const now = new Date().toISOString();

    const [projectsResult, postsResult, partnersResult, categoriesResult] = await Promise.all([
      supabase
        .from("projects")
        .select("slug,updated_at")
        .eq("status", "published"),
      supabase
        .from("blog_posts")
        .select("slug,updated_at")
        .eq("status", "published")
        .lte("published_at", now),
      supabase
        .from("partners")
        .select("slug,updated_at")
        .eq("active", true)
        .is("archived_at", null)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`),
      supabase
        .from("blog_categories")
        .select("slug"),
    ]);

    const projects: MetadataRoute.Sitemap = (projectsResult.data ?? []).map(
      (project) => ({
        url: `${baseUrl}/projetos/${project.slug}`,
        lastModified: project.updated_at
          ? new Date(project.updated_at)
          : undefined,
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    );

    const posts: MetadataRoute.Sitemap = (postsResult.data ?? []).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const categories: MetadataRoute.Sitemap = (categoriesResult.data ?? []).map((category) => ({
      url: `${baseUrl}/blog/categoria/${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const partners: MetadataRoute.Sitemap = (partnersResult.data ?? []).map(
      (partner) => ({
        url: `${baseUrl}/parceiros/${partner.slug}`,
        lastModified: partner.updated_at
          ? new Date(partner.updated_at)
          : undefined,
        changeFrequency: "monthly",
        priority: 0.5,
      }),
    );

    return [...staticRoutes, ...projects, ...posts, ...categories, ...partners];
  } catch {
    return staticRoutes;
  }
}
