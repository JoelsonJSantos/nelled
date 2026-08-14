import "server-only";

import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { MEDIA_CONTEXTS, type MediaContext } from "@/lib/media";

const cloudinaryResponseSchema = z.object({
  public_id: z.string().min(1).max(500),
  secure_url: z.string().url().max(1000),
  resource_type: z.literal("image"),
  format: z.enum(["jpg", "jpeg", "png", "webp", "avif"]),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive(),
  original_filename: z.string().max(255).optional(),
  version: z.number().int().positive(),
  signature: z.string().regex(/^[a-f0-9]+$/i),
});

export type CloudinaryUploadResponse = z.infer<typeof cloudinaryResponseSchema>;

function configuration() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary não configurado.");
  return { cloudName, apiKey, apiSecret };
}

function signature(parameters: Record<string, string | number>, secret: string) {
  const serialized = Object.entries(parameters)
    .toSorted(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${serialized}${secret}`).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function sanitizeMediaName(originalName: string) {
  const withoutExtension = originalName.replace(/\.[^.]+$/, "");
  return withoutExtension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "imagem";
}

export function createSignedUpload(context: MediaContext, originalName: string) {
  if (!MEDIA_CONTEXTS.includes(context)) throw new Error("Contexto de mídia inválido.");
  const { cloudName, apiKey, apiSecret } = configuration();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `nelled-studio/${context}`;
  const publicId = `${sanitizeMediaName(originalName)}-${randomUUID().slice(0, 8)}`;
  const allowedFormats = "jpg,png,webp,avif";
  const parameters = {
    allowed_formats: allowedFormats,
    folder,
    public_id: publicId,
    timestamp,
  };

  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    publicId,
    allowedFormats,
    signature: signature(parameters, apiSecret),
  };
}

export function verifyCloudinaryUpload(input: unknown) {
  const response = cloudinaryResponseSchema.parse(input);
  const { apiSecret } = configuration();
  const expected = signature({ public_id: response.public_id, version: response.version }, apiSecret);
  if (!safeEqual(response.signature, expected)) throw new Error("Resposta do Cloudinary inválida.");

  const url = new URL(response.secure_url);
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") {
    throw new Error("URL de mídia inválida.");
  }
  if (!response.public_id.startsWith("nelled-studio/")) {
    throw new Error("Pasta de mídia inválida.");
  }
  return response;
}

export function cloudinaryMimeType(format: CloudinaryUploadResponse["format"]) {
  return format === "jpg" ? "image/jpeg" : `image/${format}`;
}

export async function destroyCloudinaryAsset(publicId: string) {
  const { cloudName, apiKey, apiSecret } = configuration();
  const timestamp = Math.floor(Date.now() / 1000);
  const parameters = { invalidate: "true", public_id: publicId, timestamp };
  const body = new FormData();
  body.set("public_id", publicId);
  body.set("timestamp", String(timestamp));
  body.set("invalidate", "true");
  body.set("api_key", apiKey);
  body.set("signature", signature(parameters, apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Não foi possível excluir a mídia no Cloudinary.");
  const result: unknown = await response.json();
  const parsed = z.object({ result: z.enum(["ok", "not found"]) }).safeParse(result);
  if (!parsed.success) throw new Error("Resposta de exclusão inválida.");
  return parsed.data.result;
}
