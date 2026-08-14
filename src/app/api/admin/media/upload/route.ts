import { z } from "zod";
import {
  cloudinaryMimeType,
  createSignedUpload,
  destroyCloudinaryAsset,
  sanitizeMediaName,
  verifyCloudinaryUpload,
} from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/admin";
import {
  MEDIA_CONTEXTS,
  MEDIA_MAX_BYTES,
  MEDIA_MIME_TYPES,
  normalizeMediaItem,
} from "@/lib/media";

export const runtime = "nodejs";

const signatureRequestSchema = z.object({
  action: z.literal("sign"),
  context: z.enum(MEDIA_CONTEXTS),
  originalName: z.string().trim().min(1).max(255),
  mimeType: z.enum(MEDIA_MIME_TYPES),
  bytes: z.number().int().positive().max(MEDIA_MAX_BYTES),
});

const registerRequestSchema = z.object({
  action: z.literal("register"),
  upload: z.unknown(),
});

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Origem inválida." }, { status: 403 });
  const supabase = await requireAdmin();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const signatureRequest = signatureRequestSchema.safeParse(body);
  if (signatureRequest.success) {
    try {
      return Response.json({ upload: createSignedUpload(signatureRequest.data.context, signatureRequest.data.originalName) });
    } catch {
      return Response.json({ error: "Não foi possível preparar o upload." }, { status: 500 });
    }
  }

  const registerRequest = registerRequestSchema.safeParse(body);
  if (!registerRequest.success) return Response.json({ error: "Dados de upload inválidos." }, { status: 400 });

  let upload;
  try {
    upload = verifyCloudinaryUpload(registerRequest.data.upload);
  } catch {
    return Response.json({ error: "O Cloudinary retornou uma mídia inválida." }, { status: 400 });
  }

  if (upload.bytes > MEDIA_MAX_BYTES) {
    await destroyCloudinaryAsset(upload.public_id).catch(() => undefined);
    return Response.json({ error: "A imagem excede o limite de 10 MB." }, { status: 400 });
  }

  const altText = sanitizeMediaName(upload.original_filename || upload.public_id.split("/").at(-1) || "imagem").replaceAll("-", " ");
  const { data, error } = await supabase.from("media_library").insert({
    public_id: upload.public_id,
    url: upload.secure_url,
    alt_text: altText,
    mime_type: cloudinaryMimeType(upload.format),
    bytes: upload.bytes,
  }).select("id,public_id,url,alt_text,mime_type,bytes,created_at").single();

  if (error || !data) {
    await destroyCloudinaryAsset(upload.public_id).catch(() => undefined);
    return Response.json({ error: "A imagem foi enviada, mas não pôde ser registrada." }, { status: 500 });
  }

  return Response.json({ media: normalizeMediaItem(data) });
}
