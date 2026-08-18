"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { AdminToast } from "@/components/admin/admin-toast";
import { MediaPicker } from "@/components/admin/media-picker";
import { mergeMedia, type MediaItem } from "@/lib/media";
import { normalizeSlug, type ProjectRecord } from "@/lib/portfolio";
import { initialProjectActionState, type ProjectActionState } from "@/lib/project-action-state";
import styles from "./project-form.module.css";

type ProjectFormProps = {
  record?: ProjectRecord;
  media: MediaItem[];
  initialMessage?: string;
  action: (state: ProjectActionState, formData: FormData) => Promise<ProjectActionState>;
};

function fieldError(state: ProjectActionState, name: string) {
  return state.fieldErrors?.[name]?.[0];
}

export function ProjectForm({ record, media, initialMessage, action }: ProjectFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialProjectActionState);
  const [slug, setSlug] = useState(record?.slug ?? "");
  const [coverImage, setCoverImage] = useState(record?.coverImage ?? "");
  const [gallery, setGallery] = useState<string[]>(record?.gallery ?? []);
  const [ogImage, setOgImage] = useState(record?.ogImage ?? "");
  const [availableMedia, setAvailableMedia] = useState(media);
  const [submissionId, setSubmissionId] = useState(0);
  const slugEdited = useRef(Boolean(record?.slug));
  const isNew = !record?.id;

  useEffect(() => {
    if (state.status !== "success") return;
    if (isNew && state.projectId) {
      router.replace(`/admin/portfolio/${state.projectId}?created=1`);
      return;
    }
    router.refresh();
  }, [isNew, router, state.projectId, state.status]);

  return (
    <>
      {!pending && (state.message || initialMessage) && <AdminToast key={`${submissionId}-${state.status}-${state.message || initialMessage}`} message={state.message || initialMessage || ""} type={state.status === "error" ? "error" : "success"} />}

      <form action={formAction} className={styles.form} noValidate onSubmit={() => setSubmissionId((current) => current + 1)}>
        <input type="hidden" name="id" value={record?.id ?? ""} />

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><span>01</span><h2>Identificação</h2></div>
            <p>Dados principais usados na listagem e no case.</p>
          </div>
          <div className={styles.grid}>
            <label>
              Nome
              <input
                name="name"
                required
                defaultValue={record?.name ?? ""}
                aria-invalid={Boolean(fieldError(state, "name"))}
                onChange={(event) => {
                  if (!slugEdited.current) setSlug(normalizeSlug(event.target.value));
                }}
              />
              {fieldError(state, "name") && <small className={styles.error}>{fieldError(state, "name")}</small>}
            </label>
            <label>
              Slug
              <input
                name="slug"
                required
                value={slug}
                aria-invalid={Boolean(fieldError(state, "slug"))}
                onChange={(event) => {
                  slugEdited.current = true;
                  setSlug(normalizeSlug(event.target.value));
                }}
              />
              {fieldError(state, "slug") && <small className={styles.error}>{fieldError(state, "slug")}</small>}
            </label>
            <label>
              Categoria
              <input name="category" defaultValue={record?.category ?? ""} aria-invalid={Boolean(fieldError(state, "category"))} />
              {fieldError(state, "category") && <small className={styles.error}>{fieldError(state, "category")}</small>}
            </label>
            <label>
              Cliente <span className={styles.optional}>opcional</span>
              <input name="clientName" defaultValue={record?.clientName ?? ""} />
            </label>
            <label>
              Ano
              <input name="year" type="number" min="1990" max={new Date().getFullYear() + 1} required defaultValue={record?.year ?? new Date().getFullYear()} aria-invalid={Boolean(fieldError(state, "year"))} />
              {fieldError(state, "year") && <small className={styles.error}>{fieldError(state, "year")}</small>}
            </label>
            <label>
              Ordem
              <input name="sortOrder" type="number" min="0" defaultValue={record?.sortOrder ?? 0} />
            </label>
            <label className={styles.full}>
              Descrição curta <span className={styles.counter}>até 240 caracteres</span>
              <textarea name="excerpt" rows={3} maxLength={240} defaultValue={record?.excerpt ?? ""} aria-invalid={Boolean(fieldError(state, "excerpt"))} />
              {fieldError(state, "excerpt") && <small className={styles.error}>{fieldError(state, "excerpt")}</small>}
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><span>02</span><h2>Case completo</h2></div>
            <p>Conte a história do projeto com contexto e resultados.</p>
          </div>
          <div className={styles.grid}>
            <label className={styles.full}>Descrição completa<textarea name="description" rows={8} defaultValue={record?.description ?? ""} aria-invalid={Boolean(fieldError(state, "description"))} />{fieldError(state, "description") && <small className={styles.error}>{fieldError(state, "description")}</small>}</label>
            <label className={styles.full}>Problema<textarea name="problem" rows={6} defaultValue={record?.problem ?? ""} aria-invalid={Boolean(fieldError(state, "problem"))} />{fieldError(state, "problem") && <small className={styles.error}>{fieldError(state, "problem")}</small>}</label>
            <label className={styles.full}>Solução<textarea name="solution" rows={6} defaultValue={record?.solution ?? ""} aria-invalid={Boolean(fieldError(state, "solution"))} />{fieldError(state, "solution") && <small className={styles.error}>{fieldError(state, "solution")}</small>}</label>
            <label className={styles.full}>Processo<textarea name="process" rows={6} defaultValue={record?.process ?? ""} /></label>
            <label className={styles.full}>Resultados<textarea name="results" rows={6} defaultValue={record?.results ?? ""} /></label>
            <label className={styles.full}>Tecnologias <span className={styles.optional}>uma por linha ou separadas por vírgula</span><textarea name="technologies" rows={4} defaultValue={record?.technologies.join("\n") ?? ""} /></label>
            <label>URL externa <span className={styles.optional}>opcional</span><input name="externalUrl" type="url" placeholder="https://" defaultValue={record?.externalUrl ?? ""} aria-invalid={Boolean(fieldError(state, "externalUrl"))} />{fieldError(state, "externalUrl") && <small className={styles.error}>{fieldError(state, "externalUrl")}</small>}</label>
            <label>GitHub <span className={styles.optional}>opcional</span><input name="githubUrl" type="url" placeholder="https://github.com/" defaultValue={record?.githubUrl ?? ""} aria-invalid={Boolean(fieldError(state, "githubUrl"))} />{fieldError(state, "githubUrl") && <small className={styles.error}>{fieldError(state, "githubUrl")}</small>}</label>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><span>03</span><h2>Mídia</h2></div>
            <p>Selecione imagens da biblioteca ou envie direto do dispositivo.</p>
          </div>
          <div className={styles.grid}>
            <MediaPicker name="coverImage" label="Imagem de capa" media={availableMedia} context="portfolio" value={coverImage} onChange={(value) => setCoverImage(typeof value === "string" ? value : value[0] ?? "")} onMediaUploaded={(items) => setAvailableMedia((current) => mergeMedia(current, items))} error={fieldError(state, "coverImage")} />
            <MediaPicker name="gallery" label="Galeria" media={availableMedia} context="portfolio" multiple value={gallery} onChange={(value) => setGallery(Array.isArray(value) ? value : value ? [value] : [])} onMediaUploaded={(items) => setAvailableMedia((current) => mergeMedia(current, items))} error={fieldError(state, "gallery")} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><span>04</span><h2>Publicação e SEO</h2></div>
            <p>Controle a visibilidade pública e os metadados.</p>
          </div>
          <div className={styles.grid}>
            <label className={styles.statusField}>
              Status
              <select name="status" defaultValue={record?.status ?? "draft"}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </label>

            <label className={styles.check}>
              <input
                name="featured"
                type="checkbox"
                defaultChecked={record?.featured}
              />
              <span>Destacar na Home</span>
            </label>
            <label>SEO title<input name="seoTitle" maxLength={70} defaultValue={record?.seoTitle ?? ""} aria-invalid={Boolean(fieldError(state, "seoTitle"))} />{fieldError(state, "seoTitle") && <small className={styles.error}>{fieldError(state, "seoTitle")}</small>}</label>
            <MediaPicker name="ogImage" label="OG image" media={availableMedia} context="seo" value={ogImage} onChange={(value) => setOgImage(typeof value === "string" ? value : value[0] ?? "")} onMediaUploaded={(items) => setAvailableMedia((current) => mergeMedia(current, items))} error={fieldError(state, "ogImage")} />
            <label className={styles.full}>SEO description<textarea name="seoDescription" rows={3} maxLength={180} defaultValue={record?.seoDescription ?? ""} aria-invalid={Boolean(fieldError(state, "seoDescription"))} />{fieldError(state, "seoDescription") && <small className={styles.error}>{fieldError(state, "seoDescription")}</small>}</label>
          </div>
        </section>

        <div className={styles.footer}>
          <Link href="/admin/portfolio" className={styles.cancel}>Cancelar</Link>
          <button className={styles.submit} type="submit" disabled={pending}>
            {pending ? <><LoaderCircle className={styles.spinner} size={17} />Salvando…</> : "Salvar projeto"}
          </button>
        </div>
      </form>
    </>
  );
}
