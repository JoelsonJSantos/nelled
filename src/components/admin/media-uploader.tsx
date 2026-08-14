"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, LoaderCircle, UploadCloud, XCircle } from "lucide-react";
import { z } from "zod";
import {
  MEDIA_ACCEPT,
  MEDIA_MAX_BYTES,
  formatMediaBytes,
  isAllowedMediaFile,
  mediaItemSchema,
  type MediaContext,
  type MediaItem,
} from "@/lib/media";
import styles from "./media-uploader.module.css";

type QueueItem = {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "queued" | "uploading" | "success" | "error";
  message?: string;
};

type MediaUploaderProps = {
  context: MediaContext;
  multiple?: boolean;
  compact?: boolean;
  onUploaded: (media: MediaItem[]) => void;
};

const signatureSchema = z.object({
  upload: z.object({
    cloudName: z.string().min(1),
    apiKey: z.string().min(1),
    timestamp: z.number().int().positive(),
    folder: z.string().min(1),
    publicId: z.string().min(1),
    allowedFormats: z.string().min(1),
    signature: z.string().min(1),
  }),
});

const registrationSchema = z.object({ media: mediaItemSchema });

async function responseError(response: Response, fallback: string) {
  const result: unknown = await response.json().catch(() => null);
  if (result && typeof result === "object") {
    const message = Reflect.get(result, "error");
    if (typeof message === "string") return message;
  }
  return fallback;
}

async function createSignature(file: File, context: MediaContext) {
  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "sign", context, originalName: file.name, mimeType: file.type, bytes: file.size }),
  });
  if (!response.ok) throw new Error(await responseError(response, "Não foi possível preparar o upload."));
  return signatureSchema.parse(await response.json()).upload;
}

function sendToCloudinary(file: File, upload: z.infer<typeof signatureSchema>["upload"], onProgress: (progress: number) => void) {
  return new Promise<unknown>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `https://api.cloudinary.com/v1_1/${upload.cloudName}/image/upload`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.min(90, Math.round((event.loaded / event.total) * 90)));
    };
    request.onerror = () => reject(new Error("Falha de conexão durante o upload."));
    request.onload = () => {
      let result: unknown;
      try {
        result = JSON.parse(request.responseText);
      } catch {
        reject(new Error("O Cloudinary retornou uma resposta inválida."));
        return;
      }
      if (request.status < 200 || request.status >= 300) {
        const error = result && typeof result === "object" ? Reflect.get(result, "error") : null;
        const message = error && typeof error === "object" ? Reflect.get(error, "message") : null;
        reject(new Error(typeof message === "string" ? message : "O Cloudinary recusou a imagem."));
        return;
      }
      resolve(result);
    };

    const body = new FormData();
    body.set("file", file);
    body.set("api_key", upload.apiKey);
    body.set("timestamp", String(upload.timestamp));
    body.set("signature", upload.signature);
    body.set("folder", upload.folder);
    body.set("public_id", upload.publicId);
    body.set("allowed_formats", upload.allowedFormats);
    request.send(body);
  });
}

async function registerUpload(upload: unknown) {
  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "register", upload }),
  });
  if (!response.ok) throw new Error(await responseError(response, "Não foi possível registrar a imagem."));
  return registrationSchema.parse(await response.json()).media;
}

export function MediaUploader({ context, multiple = false, compact = false, onUploaded }: MediaUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useRef(new Set<string>());
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => () => {
    for (const preview of previews.current) URL.revokeObjectURL(preview);
  }, []);

  function updateQueue(id: string, update: Partial<QueueItem>) {
    setQueue((current) => current.map((item) => item.id === id ? { ...item, ...update } : item));
  }

  async function uploadFiles(files: File[]) {
    const selected = multiple ? files : files.slice(0, 1);
    const items = selected.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return {
        id: crypto.randomUUID(),
        file,
        preview,
        progress: 0,
        status: "queued" as const,
        message: isAllowedMediaFile(file)
          ? undefined
          : file.size > MEDIA_MAX_BYTES
            ? "A imagem deve ter no máximo 10 MB."
            : "Use JPG, PNG, WebP ou AVIF.",
      };
    });
    setQueue((current) => [...items, ...current].slice(0, 20));

    const uploaded: MediaItem[] = [];
    for (const item of items) {
      if (item.message) {
        updateQueue(item.id, { status: "error" });
        continue;
      }
      try {
        updateQueue(item.id, { status: "uploading", progress: 4, message: "Enviando…" });
        const signed = await createSignature(item.file, context);
        const cloudinary = await sendToCloudinary(item.file, signed, (progress) => updateQueue(item.id, { progress }));
        updateQueue(item.id, { progress: 94, message: "Registrando…" });
        const media = await registerUpload(cloudinary);
        uploaded.push(media);
        updateQueue(item.id, { status: "success", progress: 100, message: "Upload concluído." });
      } catch (error) {
        updateQueue(item.id, { status: "error", message: error instanceof Error ? error.message : "Não foi possível enviar a imagem." });
      }
    }
    if (uploaded.length) onUploaded(uploaded);
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    void uploadFiles(Array.from(fileList));
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropzone} ${compact ? styles.compact : ""} ${dragActive ? styles.dragActive : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }}
        onDrop={(event) => { event.preventDefault(); setDragActive(false); handleFiles(event.dataTransfer.files); }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={multiple ? "Selecionar imagens do dispositivo" : "Selecionar imagem do dispositivo"}
      >
        {compact ? <ImagePlus size={18} /> : <UploadCloud size={28} />}
        <div>
          <strong>{compact ? "Enviar do dispositivo" : "Arraste imagens ou selecione do dispositivo"}</strong>
          {!compact && <span>JPG, PNG, WebP ou AVIF · até 10 MB por arquivo</span>}
        </div>
        <input
          id={inputId}
          ref={inputRef}
          className={styles.fileInput}
          type="file"
          accept={MEDIA_ACCEPT}
          multiple={multiple}
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {queue.length > 0 && (
        <div className={`${styles.queue} ${compact ? styles.queueCompact : ""}`} aria-live="polite">
          {queue.map((item) => (
            <div className={styles.queueItem} key={item.id}>
              <Image src={item.preview} alt="Prévia da imagem selecionada" width={54} height={54} unoptimized />
              <div className={styles.queueInfo}>
                <strong>{item.file.name}</strong>
                <span>{item.message || formatMediaBytes(item.file.size)}</span>
                <div className={styles.progress}><i style={{ width: `${item.progress}%` }} /></div>
              </div>
              {item.status === "uploading" || item.status === "queued"
                ? <LoaderCircle className={styles.spinner} size={17} />
                : item.status === "success"
                  ? <CheckCircle2 className={styles.success} size={18} />
                  : <XCircle className={styles.failure} size={18} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
