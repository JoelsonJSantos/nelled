"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/admin";

export type DeleteMediaState = {
  status: "success" | "error";
  message: string;
  id?: string;
};

function containsReference(value: unknown, url: string, publicId: string) {
  if (value === null || value === undefined) return false;
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  return serialized.includes(url) || serialized.includes(publicId);
}

export async function deleteMedia(id: string): Promise<DeleteMediaState> {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { status: "error", message: "Mídia inválida." };

  const supabase = await requireAdmin();
  const { data: media, error: mediaError } = await supabase
    .from("media_library")
    .select("id,public_id,url")
    .eq("id", parsed.data)
    .maybeSingle();
  if (mediaError) return { status: "error", message: "Não foi possível consultar a mídia." };
  if (!media) return { status: "error", message: "Mídia não encontrada." };

  const sources = await Promise.all([
    supabase.from("projects").select("content,seo"),
    supabase.from("blog_posts").select("content,seo"),
    supabase.from("partners").select("content,seo"),
    supabase.from("ad_campaigns").select("image_url"),
    supabase.from("site_settings").select("settings"),
  ]);

  if (sources.some((source) => source.error)) {
    return { status: "error", message: "Não foi possível verificar se a mídia está em uso. A exclusão foi bloqueada." };
  }
  const inUse = sources.some((source) => (source.data ?? []).some((row) => containsReference(row, media.url, media.public_id)));
  if (inUse) return { status: "error", message: "Esta mídia está em uso e não pode ser excluída." };

  try {
    await destroyCloudinaryAsset(media.public_id);
  } catch {
    return { status: "error", message: "Não foi possível excluir a mídia no Cloudinary." };
  }

  const deletion = await supabase.from("media_library").delete().eq("id", media.id).select("id").maybeSingle();
  if (deletion.error || !deletion.data) {
    return { status: "error", message: "A mídia foi removida do Cloudinary, mas o registro não pôde ser excluído." };
  }

  revalidatePath("/admin/midias");
  return { status: "success", message: "Mídia excluída.", id: media.id };
}
