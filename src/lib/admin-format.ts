const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
  archived: "Arquivado",
  active: "Ativo",
  inactive: "Inativo",
  new: "Novo",
  contacted: "Em contato",
  proposal_sent: "Proposta enviada",
  won: "Convertido",
  lost: "Perdido",
};

export function formatAdminDate(value: string | null | undefined) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function adminStatusLabel(status: string) {
  return statusLabels[status] ?? status;
}

export function adminStatusClass(status: string) {
  if (["published", "active", "new"].includes(status)) return "positive";
  if (["draft", "scheduled"].includes(status)) return "warning";
  return "neutral";
}
