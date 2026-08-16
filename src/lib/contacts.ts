import { z } from "zod";

export const contactStatuses = [
  { value: "new", label: "Novo", summary: "Novos" },
  { value: "contacted", label: "Em atendimento", summary: "Em atendimento" },
  { value: "proposal_sent", label: "Aguardando retorno", summary: "Aguardando retorno" },
  { value: "won", label: "Concluído", summary: "Concluídos" },
  { value: "lost", label: "Encerrado", summary: "Encerrados" },
  { value: "archived", label: "Arquivado", summary: "Arquivados" },
] as const;

export const contactStatusValues = contactStatuses.map((status) => status.value) as [
  (typeof contactStatuses)[number]["value"],
  ...(typeof contactStatuses)[number]["value"][],
];

export const contactStatusSchema = z.enum(contactStatusValues);

export type ContactStatus = z.infer<typeof contactStatusSchema>;

export const contactArchivedStatus: ContactStatus = "archived";

export const contactSummaryStatuses = contactStatuses.filter((status) =>
  ["new", "contacted", "proposal_sent", "won"].includes(status.value),
);

export function contactStatusLabel(value: string) {
  return contactStatuses.find((status) => status.value === value)?.label ?? value;
}

export function normalizeContactStatus(value: unknown): ContactStatus {
  return contactStatusSchema.safeParse(value).data ?? "new";
}
