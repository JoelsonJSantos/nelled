import { contactStatusLabel, contactStatusValues } from "@/lib/contacts";

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
  archived: "Arquivado",
  active: "Ativo",
  inactive: "Inativo",
  ended: "Encerrada",
};

export function formatAdminDate(value: string | null | undefined) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function formatAdminDateTime(value: string | null | undefined) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function adminStatusLabel(status: string) {
  return contactStatusValues.includes(status as (typeof contactStatusValues)[number])
    ? contactStatusLabel(status)
    : statusLabels[status] ?? status;
}

export function adminStatusClass(status: string) {
  if (["published", "active", "new", "contacted", "won"].includes(status)) return "positive";
  if (["draft", "scheduled", "proposal_sent"].includes(status)) return "warning";
  return "neutral";
}
