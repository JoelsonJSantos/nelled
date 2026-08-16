import { z } from "zod";

export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const MEDIA_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
export const MEDIA_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MEDIA_CONTEXTS = ["portfolio", "blog", "partners", "campaigns", "site", "seo"] as const;

export type MediaContext = (typeof MEDIA_CONTEXTS)[number];
export type MediaMimeType = (typeof MEDIA_MIME_TYPES)[number];

export const mediaItemSchema = z.object({
  id: z.string().uuid(),
  publicId: z.string().min(1),
  url: z.string().url(),
  altText: z.string(),
  mimeType: z.string(),
  bytes: z.number().nonnegative(),
  createdAt: z.string(),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

function property(input: unknown, key: string) {
  if (!input || typeof input !== "object") return undefined;
  return Reflect.get(input, key);
}

function stringProperty(input: unknown, key: string) {
  const value = property(input, key);
  return typeof value === "string" ? value : "";
}

export function normalizeMediaItem(row: unknown): MediaItem {
  const bytes = property(row, "bytes");
  return {
    id: stringProperty(row, "id"),
    publicId: stringProperty(row, "public_id"),
    url: stringProperty(row, "url"),
    altText: stringProperty(row, "alt_text"),
    mimeType: stringProperty(row, "mime_type"),
    bytes: typeof bytes === "number" ? bytes : Number(bytes) || 0,
    createdAt: stringProperty(row, "created_at"),
  };
}

export function mediaName(media: MediaItem) {
  return media.altText || media.publicId.split("/").at(-1) || "Imagem";
}

export function formatMediaBytes(bytes: number) {
  if (!bytes) return "Tamanho indisponível";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isAllowedMediaFile(file: File) {
  return MEDIA_MIME_TYPES.includes(file.type as MediaMimeType) && file.size > 0 && file.size <= MEDIA_MAX_BYTES;
}

export function mergeMedia(current: MediaItem[], incoming: MediaItem[]) {
  const items = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) items.set(item.id, item);
  return [...items.values()].toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
}
