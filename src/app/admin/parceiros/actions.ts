"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import type { PartnerActionState } from "@/lib/partner-action-state";

const quickPartnerActionSchema = z.object({
  id: z.string().uuid(),
  operation: z.enum(["activate", "deactivate", "archive", "restore", "delete"]),
});

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidatePartner(slug: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/parceiros");
  revalidatePath("/parceiros");
  revalidatePath(`/parceiros/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function quickPartnerAction(
  _previousState: PartnerActionState,
  formData: FormData,
): Promise<PartnerActionState> {
  const parsed = quickPartnerActionSchema.safeParse({
    id: read(formData, "id"),
    operation: read(formData, "operation"),
  });

  if (!parsed.success) return { status: "error", message: "Operação inválida." };

  const supabase = await requireAdmin();
  const { data: partner, error } = await supabase
    .from("partners")
    .select("id,slug,archived_at")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (error) return { status: "error", message: "Não foi possível carregar o parceiro." };
  if (!partner) return { status: "error", message: "Parceiro não encontrado." };

  if (parsed.data.operation === "delete") {
    const deletion = await supabase
      .from("partners")
      .delete()
      .eq("id", partner.id)
      .select("id")
      .maybeSingle();

    if (deletion.error || !deletion.data) {
      return { status: "error", message: "Não foi possível excluir o parceiro." };
    }

    revalidatePartner(partner.slug);
    return { status: "success", message: "Parceiro excluído." };
  }

  if ((parsed.data.operation === "activate" || parsed.data.operation === "deactivate") && partner.archived_at) {
    return { status: "error", message: "Restaure o parceiro antes de alterar sua ativação." };
  }

  const updatedAt = new Date().toISOString();
  const payload = parsed.data.operation === "archive"
    ? { archived_at: updatedAt, updated_at: updatedAt }
    : parsed.data.operation === "restore"
      ? { archived_at: null, updated_at: updatedAt }
      : { active: parsed.data.operation === "activate", updated_at: updatedAt };

  const update = await supabase
    .from("partners")
    .update(payload)
    .eq("id", partner.id)
    .select("id")
    .maybeSingle();

  if (update.error || !update.data) {
    return { status: "error", message: "Não foi possível atualizar o parceiro." };
  }

  revalidatePartner(partner.slug);
  const messages = {
    activate: "Parceiro ativado.",
    deactivate: "Parceiro desativado.",
    archive: "Parceiro arquivado.",
    restore: "Parceiro restaurado.",
  } as const;

  return { status: "success", message: messages[parsed.data.operation] };
}
