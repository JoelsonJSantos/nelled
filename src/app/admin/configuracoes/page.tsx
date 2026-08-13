import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import styles from "@/components/admin/admin-ui.module.css";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Configurações institucionais e de SEO da Nelled Studio.",
};

type SettingsData = Record<string, unknown>;
function setting(data: SettingsData, key: string) { return typeof data[key] === "string" ? data[key] : ""; }

export default async function SettingsAdmin() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("site_settings").select("company_name,settings").eq("id", 1).maybeSingle();
  const settings = data?.settings && typeof data.settings === "object" && !Array.isArray(data.settings) ? data.settings as SettingsData : {};

  return (
    <>
      <AdminPageHeader eyebrow="Sistema" title="Configurações" description="Centralize as informações institucionais e padrões do site." />
      {error && <p className={styles.queryError}>Não foi possível carregar as configurações salvas.</p>}
      <div className={styles.settingsGrid}>
        <section className={styles.settingsCard}><div><h2>Empresa</h2><p>Identidade institucional</p></div><label className={styles.settingsField}>Nome da empresa<input readOnly value={data?.company_name ?? "Nelled Studio"} /></label></section>
        <section className={styles.settingsCard}><div><h2>Contato</h2><p>Canais principais</p></div><label className={styles.settingsField}>E-mail<input readOnly value={setting(settings, "email")} placeholder="Não configurado" /></label><label className={styles.settingsField}>Telefone<input readOnly value={setting(settings, "phone")} placeholder="Não configurado" /></label></section>
        <section className={styles.settingsCard}><div><h2>Redes sociais</h2><p>Perfis oficiais</p></div><label className={styles.settingsField}>Instagram<input readOnly value={setting(settings, "instagram")} placeholder="Não configurado" /></label><label className={styles.settingsField}>LinkedIn<input readOnly value={setting(settings, "linkedin")} placeholder="Não configurado" /></label></section>
        <section className={styles.settingsCard}><div><h2>Domínio</h2><p>Endereço público do site</p></div><label className={styles.settingsField}>URL principal<input readOnly value={setting(settings, "domain")} placeholder="Não configurado" /></label></section>
        <section className={styles.settingsCard}><div><h2>SEO</h2><p>Padrões para mecanismos de busca</p></div><label className={styles.settingsField}>Título padrão<input readOnly value={setting(settings, "seo_title")} placeholder="Não configurado" /></label><label className={styles.settingsField}>Descrição padrão<textarea readOnly rows={3} value={setting(settings, "seo_description")} placeholder="Não configurado" /></label></section>
      </div>
    </>
  );
}
