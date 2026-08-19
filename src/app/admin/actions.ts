"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import type { BlogActionState } from "@/lib/blog-action-state";
import { sanitizeRichTextHtml } from "@/lib/sanitize-rich-text";

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

const quickPostActionSchema = z.object({
  id: z.string().uuid(),
  operation: z.enum(["publish", "unpublish", "archive"]),
});

const blogCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da categoria.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  slug,
  description: z
    .string()
    .trim()
    .max(320, "A descrição deve ter no máximo 320 caracteres.")
    .optional(),
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
    .max(40_000, "A descrição completa está muito longa.")
    .optional(),

  seoTitle: z.string().trim().max(180).optional(),

  seoDescription: z.string().trim().max(320).optional(),

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

const siteSettingsSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Informe o nome da empresa.")
    .max(120),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional(),

  instagram: z
    .string()
    .trim()
    .url("Informe uma URL válida para o Instagram.")
    .optional()
    .or(z.literal("")),

  linkedin: z
    .string()
    .trim()
    .url("Informe uma URL válida para o LinkedIn.")
    .optional()
    .or(z.literal("")),

  domain: z
    .string()
    .trim()
    .url("Informe uma URL válida para o domínio.")
    .optional()
    .or(z.literal("")),

  seoTitle: z
    .string()
    .trim()
    .max(
      180,
      "O título SEO deve ter no máximo 180 caracteres.",
    )
    .optional(),

  seoDescription: z
    .string()
    .trim()
    .max(
      320,
      "A descrição SEO deve ter no máximo 320 caracteres.",
    )
    .optional(),
});


const pageKeySchema = z.enum([
  "home",
  "sobre",
  "contato",
  "footer",
  "termos-de-uso",
  "politica-de-privacidade",
  "politica-de-cookies",
  "privacy-banner",
]);

const pageText = z
  .string()
  .trim()
  .min(1, "Preencha todos os campos obrigatórios.")
  .max(500);

const pageLongText = z
  .string()
  .trim()
  .min(1, "Preencha todos os campos obrigatórios.")
  .max(5000);

const homePageSchema = z.object({
  heroEyebrow: pageText,
  heroTitle: pageText,
  heroAccent: pageText,
  heroDescription: pageText,
  heroSecondary: pageText,
  primaryCtaLabel: pageText,
  secondaryCtaLabel: pageText,
  servicesEyebrow: pageText,
  servicesTitle: pageText,
  portfolioEyebrow: pageText,
  portfolioTitle: pageText,
  portfolioLinkLabel: pageText,
  ctaEyebrow: pageText,
  ctaTitle: pageText,
  ctaDescription: pageText,
  ctaButtonLabel: pageText,
});

const aboutPageSchema = z.object({
  eyebrow: pageText,
  title: pageText,
  description: pageText,
  bodyTitle: pageText,
  body: pageLongText,
});

const contactPageSchema = z.object({
  eyebrow: pageText,
  title: pageText,
  description: pageText,
  directEyebrow: pageText,
  directTitle: z.string().trim().max(180).optional(),
  directDescription: pageText,
});

const footerPageSchema = z.object({
  tagline: pageText,
  navigationTitle: pageText,
  ecosystemTitle: pageText,
  legalTitle: pageText,
  copyright: pageText,
});

const legalPageSchema = z.object({
  eyebrow: pageText,
  title: pageText,
  description: pageText,
  html: z
    .string()
    .trim()
    .min(10, "Escreva o conteúdo da página.")
    .max(120000, "O conteúdo da página está muito grande."),
  seoTitle: z
    .string()
    .trim()
    .min(2, "Informe o título SEO.")
    .max(180),
  seoDescription: z
    .string()
    .trim()
    .min(10, "Informe a descrição SEO.")
    .max(320),
});

const privacyBannerSchema = z.object({
  version: z
    .string()
    .trim()
    .min(1, "Informe a versão do consentimento.")
    .max(30),
  title: pageText,
  description: pageText,
  acceptLabel: pageText,
  rejectLabel: pageText,
  preferencesLabel: pageText,
  saveLabel: pageText,
  modalTitle: pageText,
  modalDescription: pageText,
});

function objectRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

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
  return formData.get(key) === "on";
}

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Não foi possível salvar.";
}

function categoryRedirect(
  status: "saved" | "deleted" | "error",
  message?: string,
): never {
  const searchParams = new URLSearchParams({ status });

  if (message) {
    searchParams.set("message", message);
  }

  redirect(`/admin/blog/categorias?${searchParams.toString()}`);
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
    | Record<string, unknown>
    | null = null;

  try {
    const json = JSON.parse(
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
    const date = new Date(
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

  redirect("/admin/blog?saved=1");
}

export async function quickPostAction(
  _previousState: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  const parsed = quickPostActionSchema.safeParse({
    id: read(formData, "id"),
    operation: read(formData, "operation"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Operação inválida." };
  }

  const supabase = await requireAdmin();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (error) return { status: "error", message: "Não foi possível carregar o artigo." };
  if (!post) return { status: "error", message: "Artigo não encontrado." };

  if (parsed.data.operation === "publish") {
    const content = objectRecord(post.content);
    const seo = objectRecord(post.seo);
    const publication = postSchema.safeParse({
      title: post.title,
      slug: post.slug,
      status: "published",
      summary: post.summary ?? "",
      categoryId: post.category_id ?? "",
      contentHtml: typeof content.html === "string" ? content.html : "",
      contentJson: JSON.stringify(content.json ?? { type: "doc", content: [] }),
      coverImage: typeof content.coverImage === "string" ? content.coverImage : "",
      coverAlt: typeof content.coverAlt === "string" ? content.coverAlt : "",
      featured: Boolean(post.featured),
      publishedAt: post.published_at ?? "",
      seoTitle: typeof seo.title === "string" ? seo.title : "",
      seoDescription: typeof seo.description === "string" ? seo.description : "",
      seoImage: typeof seo.image === "string" ? seo.image : "",
    });

    if (!publication.success) {
      return {
        status: "error",
        message: publication.error.issues[0]?.message ?? "Complete o artigo antes de publicar.",
      };
    }
  }

  const nextStatus = parsed.data.operation === "publish"
    ? "published"
    : parsed.data.operation === "archive"
      ? "archived"
      : "draft";
  const updatedAt = new Date().toISOString();
  const payload = parsed.data.operation === "publish"
    ? { status: nextStatus, published_at: updatedAt, updated_at: updatedAt }
    : { status: nextStatus, updated_at: updatedAt };
  const update = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", post.id)
    .select("id")
    .maybeSingle();

  if (update.error || !update.data) {
    return { status: "error", message: "Não foi possível alterar o status do artigo." };
  }

  revalidatePath("/");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/sitemap.xml");

  return {
    status: "success",
    message: nextStatus === "published"
      ? "Artigo publicado."
      : nextStatus === "archived"
        ? "Artigo arquivado."
        : "Publicação retirada.",
  };
}

export async function saveBlogCategory(
  formData: FormData,
) {
  const parsed = blogCategorySchema.safeParse({
    name: read(formData, "name"),
    slug: read(formData, "slug"),
    description: read(formData, "description"),
  });

  if (!parsed.success) {
    categoryRedirect(
      "error",
      parsed.error.issues[0]?.message ?? "Dados inválidos.",
    );
  }

  const idValue = read(formData, "id");
  const parsedId = idValue ? z.string().uuid().safeParse(idValue) : null;

  if (parsedId && !parsedId.success) {
    categoryRedirect("error", "Categoria inválida.");
  }

  const supabase = await requireAdmin();
  const categoryData = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
  };

  let previousSlug: string | null = null;

  if (parsedId?.success) {
    const { data: existing, error: existingError } = await supabase
      .from("blog_categories")
      .select("slug")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (existingError || !existing) {
      categoryRedirect("error", "Categoria não encontrada.");
    }

    previousSlug = existing.slug;
  }

  const result = parsedId?.success
    ? await supabase
        .from("blog_categories")
        .update(categoryData)
        .eq("id", parsedId.data)
        .select("id")
        .maybeSingle()
    : await supabase
        .from("blog_categories")
        .insert(categoryData)
        .select("id")
        .maybeSingle();

  if (result.error || !result.data) {
    categoryRedirect(
      "error",
      result.error?.code === "23505"
        ? "Este slug já está em uso."
        : errorMessage(result.error),
    );
  }

  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/categorias");
  revalidatePath("/blog");
  revalidatePath(`/blog/categoria/${parsed.data.slug}`);

  if (previousSlug && previousSlug !== parsed.data.slug) {
    revalidatePath(`/blog/categoria/${previousSlug}`);
  }

  revalidatePath("/sitemap.xml");
  categoryRedirect("saved");
}

export async function deleteBlogCategory(
  formData: FormData,
) {
  const parsedId = z.string().uuid().safeParse(read(formData, "id"));

  if (!parsedId.success) {
    categoryRedirect("error", "Categoria inválida.");
  }

  const supabase = await requireAdmin();
  const [{ data: category, error: categoryError }, postsResult] = await Promise.all([
    supabase
      .from("blog_categories")
      .select("slug")
      .eq("id", parsedId.data)
      .maybeSingle(),
    supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("category_id", parsedId.data),
  ]);

  if (categoryError || !category) {
    categoryRedirect("error", "Categoria não encontrada.");
  }

  if (postsResult.error) {
    categoryRedirect("error", "Não foi possível verificar os artigos associados.");
  }

  const postsCount = postsResult.count ?? 0;

  if (postsCount > 0) {
    categoryRedirect(
      "error",
      `Não é possível excluir esta categoria porque há ${postsCount} artigo${postsCount === 1 ? "" : "s"} associado${postsCount === 1 ? "" : "s"}.`,
    );
  }

  const { error } = await supabase
    .from("blog_categories")
    .delete()
    .eq("id", parsedId.data);

  if (error) {
    categoryRedirect("error", errorMessage(error));
  }

  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/categorias");
  revalidatePath("/blog");
  revalidatePath(`/blog/categoria/${category.slug}`);
  revalidatePath("/sitemap.xml");
  categoryRedirect("deleted");
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

      seoTitle: read(formData, "seoTitle"),

      seoDescription: read(formData, "seoDescription"),

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
      html: sanitizeRichTextHtml(parsed.data.content ?? ""),
    },

    seo: {
      title: parsed.data.seoTitle || null,
      description: parsed.data.seoDescription || null,
    },

    website_url:
      parsed.data.websiteUrl ||
      null,

    affiliate_url:
      parsed.data.affiliateUrl ||
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
  revalidatePath(`/parceiros/${parsed.data.slug}`);

  redirect(
    "/admin/parceiros?saved=1",
  );
}

export async function saveSiteSettings(
  formData: FormData,
) {
  const parsed =
    siteSettingsSchema.safeParse({
      companyName: read(
        formData,
        "companyName",
      ),

      email: read(
        formData,
        "email",
      ),

      phone: read(
        formData,
        "phone",
      ),

      instagram: read(
        formData,
        "instagram",
      ),

      linkedin: read(
        formData,
        "linkedin",
      ),

      domain: read(
        formData,
        "domain",
      ),

      seoTitle: read(
        formData,
        "seoTitle",
      ),

      seoDescription: read(
        formData,
        "seoDescription",
      ),
    });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]
        ?.message ??
        "Configurações inválidas.",
    );
  }

  const supabase =
    await requireAdmin();

  const {
    data: current,
    error: currentError,
  } = await supabase
    .from("site_settings")
    .select("settings")
    .eq("id", 1)
    .maybeSingle();

  if (currentError) {
    throw new Error(
      "Não foi possível carregar as configurações atuais.",
    );
  }

  const currentSettings =
    current?.settings &&
    typeof current.settings ===
      "object" &&
    !Array.isArray(
      current.settings,
    )
      ? (current.settings as Record<
          string,
          unknown
        >)
      : {};

  const settings = {
    ...currentSettings,

    email:
      parsed.data.email || "",

    phone:
      parsed.data.phone || "",

    instagram:
      parsed.data.instagram || "",

    linkedin:
      parsed.data.linkedin || "",

    domain:
      parsed.data.domain || "",

    seo_title:
      parsed.data.seoTitle || "",

    seo_description:
      parsed.data.seoDescription ||
      "",
  };

  const { error } =
    await supabase
      .from("site_settings")
      .upsert(
        {
          id: 1,

          company_name:
            parsed.data.companyName,

          settings,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      );

  if (error) {
    throw new Error(
      errorMessage(error),
    );
  }

  revalidatePath("/");
  revalidatePath("/sobre");
  revalidatePath("/contato");
  revalidatePath("/projetos");
  revalidatePath("/servicos");
  revalidatePath("/blog");
  revalidatePath("/parceiros");

  revalidatePath(
    "/admin/configuracoes",
  );

  redirect(
    "/admin/configuracoes?saved=1",
  );
}


export async function savePageContent(
  formData: FormData,
) {
  const pageKeyResult = pageKeySchema.safeParse(
    read(formData, "pageKey"),
  );

  if (!pageKeyResult.success) {
    throw new Error("Página inválida.");
  }

  const pageKey = pageKeyResult.data;
  let pageContent: Record<string, string>;

  if (pageKey === "home") {
    const parsed = homePageSchema.safeParse({
      heroEyebrow: read(formData, "heroEyebrow"),
      heroTitle: read(formData, "heroTitle"),
      heroAccent: read(formData, "heroAccent"),
      heroDescription: read(formData, "heroDescription"),
      heroSecondary: read(formData, "heroSecondary"),
      primaryCtaLabel: read(formData, "primaryCtaLabel"),
      secondaryCtaLabel: read(formData, "secondaryCtaLabel"),
      servicesEyebrow: read(formData, "servicesEyebrow"),
      servicesTitle: read(formData, "servicesTitle"),
      portfolioEyebrow: read(formData, "portfolioEyebrow"),
      portfolioTitle: read(formData, "portfolioTitle"),
      portfolioLinkLabel: read(formData, "portfolioLinkLabel"),
      ctaEyebrow: read(formData, "ctaEyebrow"),
      ctaTitle: read(formData, "ctaTitle"),
      ctaDescription: read(formData, "ctaDescription"),
      ctaButtonLabel: read(formData, "ctaButtonLabel"),
    });

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "Conteúdo inválido.",
      );
    }

    pageContent = parsed.data;
  } else if (pageKey === "sobre") {
    const parsed = aboutPageSchema.safeParse({
      eyebrow: read(formData, "eyebrow"),
      title: read(formData, "title"),
      description: read(formData, "description"),
      bodyTitle: read(formData, "bodyTitle"),
      body: read(formData, "body"),
    });

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "Conteúdo inválido.",
      );
    }

    pageContent = parsed.data;
  } else if (pageKey === "contato") {
    const parsed = contactPageSchema.safeParse({
      eyebrow: read(formData, "eyebrow"),
      title: read(formData, "title"),
      description: read(formData, "description"),
      directEyebrow: read(formData, "directEyebrow"),
      directTitle: read(formData, "directTitle"),
      directDescription: read(formData, "directDescription"),
    });

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "Conteúdo inválido.",
      );
    }

    pageContent = {
      ...parsed.data,
      directTitle: parsed.data.directTitle || "",
    };
  } else if (pageKey === "footer") {
    const parsed = footerPageSchema.safeParse({
      tagline: read(formData, "tagline"),
      navigationTitle: read(formData, "navigationTitle"),
      ecosystemTitle: read(formData, "ecosystemTitle"),
      legalTitle: read(formData, "legalTitle"),
      copyright: read(formData, "copyright"),
    });

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "Conteúdo inválido.",
      );
    }

    pageContent = parsed.data;
  } else if (pageKey === "privacy-banner") {
    const parsed = privacyBannerSchema.safeParse({
      version: read(formData, "version"),
      title: read(formData, "title"),
      description: read(formData, "description"),
      acceptLabel: read(formData, "acceptLabel"),
      rejectLabel: read(formData, "rejectLabel"),
      preferencesLabel: read(formData, "preferencesLabel"),
      saveLabel: read(formData, "saveLabel"),
      modalTitle: read(formData, "modalTitle"),
      modalDescription: read(formData, "modalDescription"),
    });

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "Conteúdo inválido.",
      );
    }

    pageContent = parsed.data;
  } else {
    const parsed = legalPageSchema.safeParse({
      eyebrow: read(formData, "eyebrow"),
      title: read(formData, "title"),
      description: read(formData, "description"),
      html: read(formData, "html"),
      seoTitle: read(formData, "seoTitle"),
      seoDescription: read(formData, "seoDescription"),
    });

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "Conteúdo inválido.",
      );
    }

    pageContent = parsed.data;
  }

  const supabase = await requireAdmin();

  const { data: current, error: currentError } = await supabase
    .from("site_settings")
    .select("company_name,settings")
    .eq("id", 1)
    .maybeSingle();

  if (currentError) {
    throw new Error(
      "Não foi possível carregar o conteúdo atual das páginas.",
    );
  }

  const currentSettings = objectRecord(current?.settings);
  const currentPages = objectRecord(currentSettings.pages);

  const settings = {
    ...currentSettings,
    pages: {
      ...currentPages,
      [pageKey]: pageContent,
    },
  };

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        id: 1,
        company_name: current?.company_name || "Nelled Studio",
        settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (error) {
    throw new Error(errorMessage(error));
  }

  const publicPaths: Record<typeof pageKey, string[]> = {
    home: ["/"],
    sobre: ["/sobre"],
    contato: ["/contato"],
    footer: [
      "/",
      "/sobre",
      "/contato",
      "/projetos",
      "/servicos",
      "/blog",
      "/parceiros",
      "/termos-de-uso",
      "/politica-de-privacidade",
      "/politica-de-cookies",
    ],
    "termos-de-uso": ["/termos-de-uso"],
    "politica-de-privacidade": ["/politica-de-privacidade"],
    "politica-de-cookies": ["/politica-de-cookies"],
    "privacy-banner": [
      "/",
      "/sobre",
      "/contato",
      "/projetos",
      "/servicos",
      "/blog",
      "/parceiros",
      "/termos-de-uso",
      "/politica-de-privacidade",
      "/politica-de-cookies",
    ],
  };

  for (const path of publicPaths[pageKey]) {
    revalidatePath(path);
  }

  revalidatePath("/admin/paginas");
  revalidatePath("/sitemap.xml");

  redirect(`/admin/paginas?editar=${pageKey}&saved=1`);
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
