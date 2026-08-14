import { z } from "zod";

export const projectStatuses = ["draft", "published", "archived"] as const;

export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isWebUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSupportedMediaUrl(value: string) {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

const optionalWebUrl = z.string().trim().max(500).refine(isWebUrl, "Informe uma URL válida.");
const optionalMediaUrl = z.string().trim().max(700).refine(
  isSupportedMediaUrl,
  "Use uma mídia local (/arquivo) ou uma URL HTTPS do Cloudinary.",
);

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do projeto.").max(120),
  slug: z.string().trim().min(2, "Informe o slug.").max(100).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use letras minúsculas, números e hífens.",
  ),
  category: z.string().trim().max(80),
  clientName: z.string().trim().max(120),
  year: z.coerce.number().int().min(1990, "Informe um ano válido.").max(new Date().getFullYear() + 1, "Informe um ano válido."),
  excerpt: z.string().trim().max(240, "A descrição curta deve ter no máximo 240 caracteres."),
  description: z.string().trim().max(12000),
  problem: z.string().trim().max(8000),
  solution: z.string().trim().max(8000),
  process: z.string().trim().max(8000),
  results: z.string().trim().max(8000),
  technologies: z.array(z.string().trim().min(1).max(80)).max(30),
  externalUrl: optionalWebUrl,
  githubUrl: optionalWebUrl,
  coverImage: optionalMediaUrl,
  gallery: z.array(optionalMediaUrl).max(20),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  status: z.enum(projectStatuses),
  seoTitle: z.string().trim().max(70, "O título SEO deve ter no máximo 70 caracteres."),
  seoDescription: z.string().trim().max(180, "A descrição SEO deve ter no máximo 180 caracteres."),
  ogImage: optionalMediaUrl,
}).superRefine((project, context) => {
  if (project.status !== "published") return;

  const required: Array<[keyof typeof project, string]> = [
    ["category", "Informe a categoria antes de publicar."],
    ["excerpt", "Informe a descrição curta antes de publicar."],
    ["description", "Informe a descrição completa antes de publicar."],
    ["problem", "Informe o problema antes de publicar."],
    ["solution", "Informe a solução antes de publicar."],
    ["coverImage", "Informe a imagem de capa antes de publicar."],
  ];

  for (const [field, message] of required) {
    if (!project[field]) context.addIssue({ code: "custom", path: [field], message });
  }
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export type ProjectRecord = ProjectFormValues & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

function property(input: unknown, key: string) {
  if (!input || typeof input !== "object") return undefined;
  return Reflect.get(input, key);
}

function stringProperty(input: unknown, key: string) {
  const value = property(input, key);
  return typeof value === "string" ? value : "";
}

function stringArrayProperty(input: unknown, key: string) {
  const value = property(input, key);
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLocaleLowerCase("pt-BR");
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeProjectRecord(row: unknown): ProjectRecord {
  const content = property(row, "content");
  const seo = property(row, "seo");
  const technologies = property(row, "technologies");
  const status = stringProperty(row, "status");
  const year = property(row, "year");
  const sortOrder = property(row, "sort_order");

  return {
    id: stringProperty(row, "id"),
    name: stringProperty(row, "name"),
    slug: stringProperty(row, "slug"),
    category: stringProperty(row, "category"),
    clientName: stringProperty(row, "client_name"),
    year: typeof year === "number" ? year : new Date().getFullYear(),
    excerpt: stringProperty(row, "excerpt"),
    description: stringProperty(content, "description") || stringProperty(content, "body"),
    problem: stringProperty(content, "problem"),
    solution: stringProperty(content, "solution"),
    process: stringProperty(content, "process"),
    results: stringProperty(content, "results"),
    technologies: Array.isArray(technologies)
      ? technologies.filter((item): item is string => typeof item === "string")
      : [],
    externalUrl: stringProperty(content, "external_url"),
    githubUrl: stringProperty(content, "github_url"),
    coverImage: stringProperty(content, "cover_image"),
    gallery: stringArrayProperty(content, "gallery"),
    featured: property(row, "featured") === true,
    sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    status: projectStatuses.includes(status as (typeof projectStatuses)[number])
      ? status as (typeof projectStatuses)[number]
      : "draft",
    seoTitle: stringProperty(seo, "title"),
    seoDescription: stringProperty(seo, "description"),
    ogImage: stringProperty(seo, "og_image"),
    createdAt: stringProperty(row, "created_at"),
    updatedAt: stringProperty(row, "updated_at"),
  };
}

