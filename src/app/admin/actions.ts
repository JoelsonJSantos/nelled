"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";

const slug = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use letras minúsculas, números e hífens.",
  );

const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Informe o título do artigo.")
    .max(180),

  slug,

  status: z.enum([
    "draft",
    "scheduled",
    "published",
    "archived",
  ]),

  summary: z
    .string()
    .trim()
    .max(
      320,
      "O resumo deve ter no máximo 320 caracteres.",
    )
    .optional(),

  categoryId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),

  contentHtml: z
    .string()
    .trim()
    .min(
      1,
      "Escreva o conteúdo do artigo.",
    ),

  contentJson: z
    .string()
    .min(1),

  coverImage: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  coverAlt: z
    .string()
    .trim()
    .max(300)
    .optional(),

  featured: z.boolean(),

  publishedAt: z
    .string()
    .optional(),

  seoTitle: z
    .string()
    .trim()
    .max(180)
    .optional(),

  seoDescription: z
    .string()
    .trim()
    .max(320)
    .optional(),

  seoImage: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
});

const partnerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2),

  slug,

  shortDescription: z
    .string()
    .trim()
    .optional(),

  content: z
    .string()
    .trim()
    .optional(),

  websiteUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("")),

  affiliateUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("")),

  coupon: z
    .string()
    .trim()
    .optional(),

  active: z.boolean(),

  featured: z.boolean(),

  sortOrder: z.coerce
    .number()
    .int()
    .min(0),
});

function read(
  formData: FormData,
  key: string,
) {
  return String(
    formData.get(key) ?? "",
  );
}

function checked(
  formData: FormData,
  key: string,
) {
  return (
    formData.get(key) === "on"
  );
}

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Não foi possível salvar.";
}

export async function savePost(
  formData: FormData,
) {
  const parsed =
    postSchema.safeParse({
      title: read(
        formData,
        "title",
      ),

      slug: read(
        formData,
        "slug",
      ),

      status: read(
        formData,
        "status",
      ),

      summary: read(
        formData,
        "summary",
      ),

      categoryId: read(
        formData,
        "categoryId",
      ),

      contentHtml: read(
        formData,
        "contentHtml",
      ),

      contentJson: read(
        formData,
        "contentJson",
      ),

      coverImage: read(
        formData,
        "coverImage",
      ),

      coverAlt: read(
        formData,
        "coverAlt",
      ),

      featured: checked(
        formData,
        "featured",
      ),

      publishedAt: read(
        formData,
        "publishedAt",
      ),

      seoTitle: read(
        formData,
        "seoTitle",
      ),

      seoDescription: read(
        formData,
        "seoDescription",
      ),

      seoImage: read(
        formData,
        "seoImage",
      ),
    });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]
        ?.message ??
        "Dados inválidos.",
    );
  }

  let editorJson:
    | Record<
        string,
        unknown
      >
    | null = null;

  try {
    const json =
      JSON.parse(
        parsed.data.contentJson,
      );

    if (
      !json ||
      typeof json !== "object"
    ) {
      throw new Error();
    }

    editorJson =
      json as Record<
        string,
        unknown
      >;
  } catch {
    throw new Error(
      "O conteúdo estruturado do artigo é inválido.",
    );
  }

  let publishedAt:
    | string
    | null = null;

  if (
    parsed.data.publishedAt
  ) {
    const date =
      new Date(
        parsed.data.publishedAt,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      throw new Error(
        "Data de publicação inválida.",
      );
    }

    publishedAt =
      date.toISOString();
  } else if (
    parsed.data.status ===
    "published"
  ) {
    publishedAt =
      new Date().toISOString();
  }

  if (
    parsed.data.status ===
      "scheduled" &&
    !publishedAt
  ) {
    throw new Error(
      "Informe uma data para agendar o artigo.",
    );
  }

  const supabase =
    await requireAdmin();

  const id = read(
    formData,
    "id",
  );

  const data = {
    title:
      parsed.data.title,

    slug:
      parsed.data.slug,

    summary:
      parsed.data.summary ||
      null,

    category_id:
      parsed.data.categoryId ||
      null,

    status:
      parsed.data.status,

    featured:
      parsed.data.featured,

    published_at:
      publishedAt,

    content: {
      html:
        parsed.data
          .contentHtml,

      json:
        editorJson,

      coverImage:
        parsed.data
          .coverImage ||
        null,

      coverAlt:
        parsed.data
          .coverAlt ||
        null,
    },

    seo: {
      title:
        parsed.data
          .seoTitle ||
        null,

      description:
        parsed.data
          .seoDescription ||
        null,

      image:
        parsed.data
          .seoImage ||
        null,
    },

    updated_at:
      new Date().toISOString(),
  };

  const result = id
    ? await supabase
        .from("blog_posts")
        .update(data)
        .eq("id", id)
    : await supabase
        .from("blog_posts")
        .insert(data);

  if (result.error) {
    throw new Error(
      result.error.code ===
        "23505"
        ? "Este slug já está em uso."
        : errorMessage(
            result.error,
          ),
    );
  }

  revalidatePath("/");
  revalidatePath("/blog");

  revalidatePath(
    `/blog/${parsed.data.slug}`,
  );

  redirect("/admin/blog");
}

export async function savePartner(
  formData: FormData,
) {
  const parsed =
    partnerSchema.safeParse({
      name: read(
        formData,
        "name",
      ),

      slug: read(
        formData,
        "slug",
      ),

      shortDescription:
        read(
          formData,
          "shortDescription",
        ),

      content: read(
        formData,
        "content",
      ),

      websiteUrl: read(
        formData,
        "websiteUrl",
      ),

      affiliateUrl: read(
        formData,
        "affiliateUrl",
      ),

      coupon: read(
        formData,
        "coupon",
      ),

      active: checked(
        formData,
        "active",
      ),

      featured: checked(
        formData,
        "featured",
      ),

      sortOrder:
        read(
          formData,
          "sortOrder",
        ) || "0",
    });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]
        ?.message ??
        "Dados inválidos.",
    );
  }

  const supabase =
    await requireAdmin();

  const id = read(
    formData,
    "id",
  );

  const data = {
    name:
      parsed.data.name,

    slug:
      parsed.data.slug,

    short_description:
      parsed.data
        .shortDescription ||
      null,

    content: {
      body:
        parsed.data
          .content,
    },

    website_url:
      parsed.data
        .websiteUrl ||
      null,

    affiliate_url:
      parsed.data
        .affiliateUrl ||
      null,

    coupon:
      parsed.data.coupon ||
      null,

    active:
      parsed.data.active,

    featured:
      parsed.data.featured,

    sort_order:
      parsed.data.sortOrder,

    updated_at:
      new Date().toISOString(),
  };

  const result = id
    ? await supabase
        .from("partners")
        .update(data)
        .eq("id", id)
    : await supabase
        .from("partners")
        .insert(data);

  if (result.error) {
    throw new Error(
      result.error.code ===
        "23505"
        ? "Este slug já está em uso."
        : errorMessage(
            result.error,
          ),
    );
  }

  revalidatePath("/");
  revalidatePath(
    "/parceiros",
  );

  redirect(
    "/admin/parceiros",
  );
}

export async function deleteRecord(
  formData: FormData,
) {
  const table = read(
    formData,
    "table",
  );

  const id = read(
    formData,
    "id",
  );

  if (
    ![
      "projects",
      "blog_posts",
      "partners",
    ].includes(table) ||
    !id
  ) {
    throw new Error(
      "Operação inválida.",
    );
  }

  const supabase =
    await requireAdmin();

  const { error } =
    await supabase
      .from(table)
      .delete()
      .eq("id", id);

  if (error) {
    throw new Error(
      error.message,
    );
  }

  revalidatePath("/");

  revalidatePath(
    `/${
      table === "projects"
        ? "portfolio"
        : table ===
            "blog_posts"
          ? "blog"
          : "parceiros"
    }`,
  );

  redirect(
    `/admin/${
      table === "projects"
        ? "portfolio"
        : table ===
            "blog_posts"
          ? "blog"
          : "parceiros"
    }`,
  );
}