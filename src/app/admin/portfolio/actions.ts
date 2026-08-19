"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import {
  normalizeProjectRecord,
  normalizeSlug,
  projectSchema,
  uniqueStrings,
} from "@/lib/portfolio";
import type { ProjectActionState } from "@/lib/project-action-state";

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function list(value: string) {
  return uniqueStrings(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean));
}

function revalidateProject(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projetos");
  revalidatePath("/admin/portfolio");
  if (slug) revalidatePath(`/projetos/${slug}`);
}

export async function saveProject(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const parsed = projectSchema.safeParse({
    name: read(formData, "name"),
    slug: normalizeSlug(read(formData, "slug")),
    category: read(formData, "category"),
    clientName: read(formData, "clientName"),
    year: read(formData, "year"),
    excerpt: read(formData, "excerpt"),
    description: read(formData, "description"),
    problem: read(formData, "problem"),
    solution: read(formData, "solution"),
    process: read(formData, "process"),
    results: read(formData, "results"),
    technologies: list(read(formData, "technologies")),
    externalUrl: read(formData, "externalUrl"),
    githubUrl: read(formData, "githubUrl"),
    coverImage: read(formData, "coverImage"),
    gallery: list(read(formData, "gallery")),
    featured: formData.get("featured") === "on",
    sortOrder: read(formData, "sortOrder") || "0",
    status: read(formData, "status"),
    seoTitle: read(formData, "seoTitle"),
    seoDescription: read(formData, "seoDescription"),
    ogImage: read(formData, "ogImage"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados antes de salvar.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await requireAdmin();
  const id = read(formData, "id");
  let slugQuery = supabase.from("projects").select("id").eq("slug", parsed.data.slug);
  if (id) slugQuery = slugQuery.neq("id", id);
  const { data: existingSlug, error: slugError } = await slugQuery.maybeSingle();

  if (slugError) return { status: "error", message: "Não foi possível verificar o slug." };
  if (existingSlug) {
    return { status: "error", message: "Este slug já está em uso.", fieldErrors: { slug: ["Escolha outro slug."] } };
  }

  const value = parsed.data;
  const payload = {
    name: value.name,
    slug: value.slug,
    category: value.category || null,
    client_name: value.clientName || null,
    year: value.year,
    excerpt: value.excerpt || null,
    content: {
      description: value.description,
      problem: value.problem,
      solution: value.solution,
      process: value.process,
      results: value.results,
      external_url: value.externalUrl || null,
      github_url: value.githubUrl || null,
      cover_image: value.coverImage || null,
      gallery: value.gallery,
    },
    technologies: value.technologies,
    featured: value.featured,
    sort_order: value.sortOrder,
    status: value.status,
    seo: {
      title: value.seoTitle || null,
      description: value.seoDescription || null,
      og_image: value.ogImage || null,
    },
    updated_at: new Date().toISOString(),
  };

  const result = id
    ? await supabase.from("projects").update(payload).eq("id", id).select("id").maybeSingle()
    : await supabase.from("projects").insert(payload).select("id").single();

  if (result.error) {
    const message = result.error.code === "23505" ? "Este slug já está em uso." : "Não foi possível salvar o projeto.";
    return { status: "error", message };
  }
  if (!result.data) return { status: "error", message: "O projeto não foi encontrado ou não pôde ser atualizado." };

  revalidateProject(value.slug);
  return {
    status: "success",
    message: value.status === "published" ? "Projeto publicado com sucesso." : "Projeto salvo com sucesso.",
    projectId: result.data.id,
  };
}

const quickActionSchema = z.object({
  id: z.string().uuid(),
  operation: z.enum(["publish", "unpublish", "archive", "delete"]),
});

export async function quickProjectAction(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const parsed = quickActionSchema.safeParse({ id: read(formData, "id"), operation: read(formData, "operation") });
  if (!parsed.success) return { status: "error", message: "Operação inválida." };

  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("projects").select("*").eq("id", parsed.data.id).maybeSingle();
  if (error) return { status: "error", message: "Não foi possível carregar o projeto." };
  if (!data) return { status: "error", message: "Projeto não encontrado." };

  const project = normalizeProjectRecord(data);
  if (parsed.data.operation === "publish") {
    const publication = projectSchema.safeParse({ ...project, status: "published" });
    if (!publication.success) {
      return { status: "error", message: publication.error.issues[0]?.message ?? "Complete o projeto antes de publicar." };
    }
  }

  if (parsed.data.operation === "delete") {
    const deletion = await supabase.from("projects").delete().eq("id", parsed.data.id).select("id").maybeSingle();
    if (deletion.error) return { status: "error", message: "Não foi possível excluir o projeto." };
    if (!deletion.data) return { status: "error", message: "O projeto não foi encontrado ou não pôde ser excluído." };
    revalidateProject(project.slug);
    return { status: "success", message: "Projeto excluído." };
  }

  const status = parsed.data.operation === "publish"
    ? "published"
    : parsed.data.operation === "archive"
      ? "archived"
      : "draft";
  const update = await supabase.from("projects").update({ status, updated_at: new Date().toISOString() }).eq("id", parsed.data.id).select("id").maybeSingle();
  if (update.error) return { status: "error", message: "Não foi possível alterar o status." };
  if (!update.data) return { status: "error", message: "O projeto não foi encontrado ou não pôde ser atualizado." };

  revalidateProject(project.slug);
  return {
    status: "success",
    message: status === "published" ? "Projeto publicado." : status === "archived" ? "Projeto arquivado." : "Publicação retirada.",
  };
}
