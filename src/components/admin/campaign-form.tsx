"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminToast } from "@/components/admin/admin-toast";
import { MediaPicker } from "@/components/admin/media-picker";
import { campaignCreativeFormatDetails, campaignCreativeFormats, campaignPlacementFormatLabel, campaignPlacements, formatDateTimeLocal, placementsForCampaignCreativeFormat, requiredCampaignCreativeFormats, type CampaignPlacement, type CampaignRecord } from "@/lib/campaigns";
import { initialCampaignActionState, type CampaignActionState } from "@/lib/campaign-action-state";
import { mergeMedia, type MediaItem } from "@/lib/media";

import styles from "./campaign-form.module.css";

type Partner = { id: string; name: string };

type CampaignFormProps = {
  record?: CampaignRecord;
  partners: Partner[];
  media: MediaItem[];
  initialMessage?: string;
  action: (state: CampaignActionState, formData: FormData) => Promise<CampaignActionState>;
};

function fieldError(state: CampaignActionState, name: string) {
  return state.fieldErrors?.[name]?.[0];
}

export function CampaignForm({ record, partners, media, initialMessage, action }: CampaignFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialCampaignActionState);
  const [availableMedia, setAvailableMedia] = useState(media);
  const [horizontalCreativeUrl, setHorizontalCreativeUrl] = useState(record?.creatives.horizontal?.imageUrl ?? "");
  const [verticalCreativeUrl, setVerticalCreativeUrl] = useState(record?.creatives.vertical?.imageUrl ?? "");
  const [selectedPlacements, setSelectedPlacements] = useState<CampaignPlacement[]>(record?.placements ?? []);
  const [submissionId, setSubmissionId] = useState(0);
  const isNew = !record?.id;
  const requiredFormats = requiredCampaignCreativeFormats(selectedPlacements);

  useEffect(() => {
    if (state.status !== "success") return;

    if (isNew && state.campaignId) {
      router.replace(`/admin/anuncios/${state.campaignId}?created=1`);
      return;
    }

    router.refresh();
  }, [isNew, router, state.campaignId, state.status]);

  return (
    <>
      {!pending && (state.message || initialMessage) && (
        <AdminToast
          key={`${submissionId}-${state.status}-${state.message || initialMessage}`}
          message={state.message || initialMessage || ""}
          type={state.status === "error" ? "error" : "success"}
        />
      )}

      <form action={formAction} className={styles.form} noValidate onSubmit={() => setSubmissionId((value) => value + 1)}>
        <input type="hidden" name="id" value={record?.id ?? ""} />

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><span>01</span><h2>Campanha</h2></div>
            <p>Defina a mensagem e o destino da ação.</p>
          </div>

          <div className={styles.grid}>
            <label>
              Nome interno
              <input name="name" required defaultValue={record?.name ?? ""} aria-invalid={Boolean(fieldError(state, "name"))} />
              {fieldError(state, "name") && <small className={styles.error}>{fieldError(state, "name")}</small>}
            </label>
            <label>
              <span className={styles.labelRow}><span>Parceiro</span><span className={styles.optional}>opcional</span></span>
              <select name="partnerId" defaultValue={record?.partnerId ?? ""}>
                <option value="">Sem parceiro vinculado</option>
                {partners.map((partner) => <option value={partner.id} key={partner.id}>{partner.name}</option>)}
              </select>
            </label>
            <label className={styles.full}>
              Título da campanha
              <input name="title" required maxLength={180} defaultValue={record?.title ?? ""} aria-invalid={Boolean(fieldError(state, "title"))} />
              {fieldError(state, "title") && <small className={styles.error}>{fieldError(state, "title")}</small>}
            </label>
            <label className={styles.full}>
              <span className={styles.labelRow}><span>Descrição</span><span className={styles.optional}>opcional</span></span>
              <textarea name="description" rows={4} maxLength={1200} defaultValue={record?.description ?? ""} aria-invalid={Boolean(fieldError(state, "description"))} />
              {fieldError(state, "description") && <small className={styles.error}>{fieldError(state, "description")}</small>}
            </label>
            <label>
              <span className={styles.labelRow}><span>Texto do CTA</span><span className={styles.optional}>opcional</span></span>
              <input name="ctaLabel" maxLength={80} defaultValue={record?.ctaLabel ?? ""} placeholder="Conheça a solução" />
            </label>
            <label>
              URL de destino
              <input name="targetUrl" type="url" required placeholder="https://" defaultValue={record?.targetUrl ?? ""} aria-invalid={Boolean(fieldError(state, "targetUrl"))} />
              {fieldError(state, "targetUrl") && <small className={styles.error}>{fieldError(state, "targetUrl")}</small>}
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><span>02</span><h2>Criativos</h2></div>
            <p>Envie uma arte por formato. Ela será reutilizada pelos placements compatíveis.</p>
          </div>
          <div className={styles.creatives}>
            {campaignCreativeFormats.map((format) => {
              const details = campaignCreativeFormatDetails[format];
              const usedBy = placementsForCampaignCreativeFormat(format);
              const required = requiredFormats.includes(format);
              const value = format === "horizontal" ? horizontalCreativeUrl : verticalCreativeUrl;
              const onChange = format === "horizontal" ? setHorizontalCreativeUrl : setVerticalCreativeUrl;

              return (
                <div className={`${styles.creative} ${required ? styles.creativeRequired : ""}`} key={format}>
                  <div className={styles.creativeHeading}>
                    <div><span>{details.label}</span>{required && <strong>Necessário</strong>}</div>
                    <p>Formato recomendado: {details.aspectRatio} · {details.recommendedDimensions}</p>
                    <small>Utilizado por: {usedBy.map((placement) => placement.label).join(" · ")}</small>
                  </div>
                  <MediaPicker
                    name={`${format}CreativeUrl`}
                    label={`Criativo ${details.label.toLocaleLowerCase("pt-BR")}`}
                    media={availableMedia}
                    context="campaigns"
                    value={value}
                    onChange={(nextValue) => onChange(typeof nextValue === "string" ? nextValue : nextValue[0] ?? "")}
                    onMediaUploaded={(items) => setAvailableMedia((current) => mergeMedia(current, items))}
                    error={fieldError(state, `${format}CreativeUrl`)}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><span>03</span><h2>Veiculação</h2></div>
            <p>Selecione onde esta campanha poderá ser exibida no site.</p>
          </div>

          <fieldset className={styles.placements} aria-describedby="placements-help">
            <legend>Placements</legend>
            <p id="placements-help">Selecione onde esta campanha poderá ser elegível para exibição.</p>
            <div>
              {campaignPlacements.map((placement) => (
                <label key={placement.value} className={styles.placement}>
                  <input name="placements" type="checkbox" value={placement.value} checked={selectedPlacements.includes(placement.value)} onChange={(event) => setSelectedPlacements((current) => event.target.checked ? [...current, placement.value] : current.filter((value) => value !== placement.value))} />
                  <span><strong>{placement.label}</strong><small>{placement.description} Formato recomendado: {campaignPlacementFormatLabel(placement.value)}.</small></span>
                </label>
              ))}
            </div>
            {fieldError(state, "placements") && <small className={styles.error}>{fieldError(state, "placements")}</small>}
          </fieldset>

          <div className={styles.grid}>
            <label>
              Prioridade
              <input name="priority" type="number" min="0" max="10000" defaultValue={record?.priority ?? 0} aria-invalid={Boolean(fieldError(state, "priority"))} />
              {fieldError(state, "priority") && <small className={styles.error}>{fieldError(state, "priority")}</small>}
            </label>
            <label className={styles.check}>
              <input name="active" type="checkbox" defaultChecked={record?.active ?? true} />
              <span>Campanha ativa</span>
            </label>
            <label>
              <span className={styles.labelRow}><span>Início</span><span className={styles.optional}>opcional</span></span>
              <input name="startsAt" type="datetime-local" defaultValue={formatDateTimeLocal(record?.startsAt ?? "")} aria-invalid={Boolean(fieldError(state, "startsAt"))} />
              {fieldError(state, "startsAt") && <small className={styles.error}>{fieldError(state, "startsAt")}</small>}
            </label>
            <label>
              <span className={styles.labelRow}><span>Encerramento</span><span className={styles.optional}>opcional</span></span>
              <input name="endsAt" type="datetime-local" defaultValue={formatDateTimeLocal(record?.endsAt ?? "")} aria-invalid={Boolean(fieldError(state, "endsAt"))} />
              {fieldError(state, "endsAt") && <small className={styles.error}>{fieldError(state, "endsAt")}</small>}
            </label>
          </div>
        </section>

        <div className={styles.footer}>
          <Link href="/admin/anuncios" className={styles.cancel}>Cancelar</Link>
          <button className={styles.submit} type="submit" disabled={pending}>
            {pending ? <><LoaderCircle className={styles.spinner} size={17} />Salvando…</> : "Salvar campanha"}
          </button>
        </div>
      </form>
    </>
  );
}
