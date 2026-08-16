"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import type { ContactActionState } from "@/lib/contact-action-state";
import { contactStatusSchema } from "@/lib/contacts";

const statusSchema = z.object({
  id: z.string().uuid(),
  status: contactStatusSchema,
});

const noteSchema = z.object({
  id: z.string().uuid(),
  body: z.string().trim().min(2, "Escreva uma nota com pelo menos 2 caracteres.").max(4_000, "A nota deve ter no máximo 4.000 caracteres."),
});

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateContact(id: string) {
  revalidatePath("/admin/contatos");
  revalidatePath(`/admin/contatos/${id}`);
}

async function adminAuthorId() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.auth.getClaims();
  const authorId = data?.claims?.sub;
  return { supabase, authorId: !error && typeof authorId === "string" ? authorId : null };
}

export async function updateContactStatus(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const parsed = statusSchema.safeParse({ id: value(formData, "id"), status: value(formData, "status") });
  if (!parsed.success) return { status: "error", message: "Status inválido." };

  const { supabase } = await adminAuthorId();
  const { data: contact, error: contactError } = await supabase
    .from("contact_requests")
    .select("id,status")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (contactError) return { status: "error", message: "Não foi possível carregar o contato." };
  if (!contact) return { status: "error", message: "Contato não encontrado." };
  if (contact.status === parsed.data.status) return { status: "success", message: "O contato já possui este status." };

  const { data, error } = await supabase
    .from("contact_requests")
    .update({ status: parsed.data.status })
    .eq("id", contact.id)
    .select("id")
    .maybeSingle();

  if (error || !data) return { status: "error", message: "Não foi possível atualizar o status." };

  revalidateContact(contact.id);
  return { status: "success", message: "Status atualizado." };
}

export async function addContactNote(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const parsed = noteSchema.safeParse({ id: value(formData, "id"), body: value(formData, "body") });
  if (!parsed.success) {
    return { status: "error", message: "Revise a nota antes de salvar.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, authorId } = await adminAuthorId();
  if (!authorId) return { status: "error", message: "Não foi possível identificar o administrador." };

  const { data: contact, error: contactError } = await supabase
    .from("contact_requests")
    .select("id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (contactError) return { status: "error", message: "Não foi possível carregar o contato." };
  if (!contact) return { status: "error", message: "Contato não encontrado." };

  const { error } = await supabase.from("contact_notes").insert({
    contact_id: contact.id,
    author_id: authorId,
    body: parsed.data.body,
  });

  if (error) return { status: "error", message: "Não foi possível adicionar a nota." };

  revalidateContact(contact.id);
  return { status: "success", message: "Nota interna adicionada." };
}
