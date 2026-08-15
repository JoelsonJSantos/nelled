import type { Metadata } from "next";
import Link from "next/link";
import {
  Contact,
  Cookie,
  FileText,
  Home,
  Info,
  PanelBottom,
  Save,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { savePageContent } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LegalPageForm } from "@/components/admin/legal-page-form";
import { SettingsSavedToast } from "@/components/admin/settings-saved-toast";
import styles from "@/components/admin/admin-ui.module.css";
import { requireAdmin } from "@/lib/admin";
import { normalizeMediaItem } from "@/lib/media";
import {
  getPageSettingsFromRecord,
  type LegalPageContent,
} from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Páginas",
  description: "Gerenciamento das páginas institucionais da Nelled Studio.",
};

const pages = [
  {
    name: "Home",
    description: "Conteúdo da página inicial",
    icon: Home,
    key: "home",
  },
  {
    name: "Sobre",
    description: "Apresentação institucional",
    icon: Info,
    key: "sobre",
  },
  {
    name: "Contato",
    description: "Textos e informações de contato",
    icon: Contact,
    key: "contato",
  },
  {
    name: "Footer",
    description: "Conteúdo global do rodapé",
    icon: PanelBottom,
    key: "footer",
  },
  {
    name: "Termos de Uso",
    description: "Condições de utilização do site",
    icon: Scale,
    key: "termos-de-uso",
  },
  {
    name: "Política de Privacidade",
    description: "Tratamento e proteção de dados pessoais",
    icon: ShieldCheck,
    key: "politica-de-privacidade",
  },
  {
    name: "Política de Cookies",
    description: "Cookies, métricas e tecnologias semelhantes",
    icon: Cookie,
    key: "politica-de-cookies",
  },
  {
    name: "Banner de Privacidade",
    description: "Consentimento e preferências do visitante",
    icon: SlidersHorizontal,
    key: "privacy-banner",
  },
] as const;

type PageKey = (typeof pages)[number]["key"];
type LegalPageKey = Extract<
  PageKey,
  "termos-de-uso" | "politica-de-privacidade" | "politica-de-cookies"
>;

type SearchParams = Promise<{
  editar?: string | string[];
  saved?: string | string[];
}>;

function isPageKey(value: string): value is PageKey {
  return pages.some((page) => page.key === value);
}

function isLegalPageKey(value: PageKey): value is LegalPageKey {
  return [
    "termos-de-uso",
    "politica-de-privacidade",
    "politica-de-cookies",
  ].includes(value);
}

export default async function PagesAdmin({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const editParam = typeof params.editar === "string" ? params.editar : "";
  const selectedKey = isPageKey(editParam) ? editParam : null;
  const saved = params.saved === "1";

  const supabase = await requireAdmin();

  const [settingsResult, mediaResult] = await Promise.all([
    supabase
      .from("site_settings")
      .select("settings")
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("media_library")
      .select("id,public_id,url,alt_text,mime_type,bytes,created_at")
      .order("created_at", { ascending: false }),
  ]);

  const settingsRecord =
    settingsResult.data?.settings &&
    typeof settingsResult.data.settings === "object" &&
    !Array.isArray(settingsResult.data.settings)
      ? (settingsResult.data.settings as Record<string, unknown>)
      : {};

  const pageSettings = getPageSettingsFromRecord(settingsRecord);
  const media = (mediaResult.data ?? []).map(normalizeMediaItem);

  const selectedPage = selectedKey
    ? pages.find((page) => page.key === selectedKey)
    : null;

  const legalContent: Partial<Record<LegalPageKey, LegalPageContent>> = {
    "termos-de-uso": pageSettings.termosDeUso,
    "politica-de-privacidade": pageSettings.politicaDePrivacidade,
    "politica-de-cookies": pageSettings.politicaDeCookies,
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Sistema"
        title="Páginas"
        description="Edite os textos institucionais, documentos legais e preferências de privacidade do site."
      />

      {settingsResult.error && (
        <p className={styles.queryError}>
          Não foi possível carregar o conteúdo salvo das páginas.
        </p>
      )}

      {mediaResult.error && selectedKey && isLegalPageKey(selectedKey) && (
        <p className={styles.queryError}>
          A biblioteca de mídia não pôde ser carregada. O editor continua disponível
          para textos.
        </p>
      )}

      <SettingsSavedToast
        show={saved}
        title="Página salva"
        message="O conteúdo foi atualizado com sucesso."
      />

      <div className={styles.cardsGrid}>
        {pages.map(({ name, description, icon: Icon, key }) => (
          <article
            className={`${styles.pageCard} ${
              selectedKey === key ? styles.pageCardActive : ""
            }`}
            key={key}
          >
            <div className={styles.cardTitle}>
              <Icon size={21} />
              <div>
                <h2>{name}</h2>
                <p>{description}</p>
              </div>
            </div>

            <Link
              className={styles.secondaryAction}
              href={`/admin/paginas?editar=${key}`}
            >
              <FileText size={15} />
              Editar
            </Link>
          </article>
        ))}
      </div>

      {selectedKey && selectedPage && (
        <section className={styles.pageEditor}>
          <div className={styles.pageEditorHeader}>
            <div>
              <p className={styles.eyebrow}>EDITANDO PÁGINA</p>
              <h2>{selectedPage.name}</h2>
              <p>{selectedPage.description}</p>
            </div>

            <Link className={styles.secondaryAction} href="/admin/paginas">
              <X size={15} />
              Fechar editor
            </Link>
          </div>

          {isLegalPageKey(selectedKey) ? (
            <LegalPageForm
              pageKey={selectedKey}
              content={legalContent[selectedKey] as LegalPageContent}
              initialMedia={media}
              action={savePageContent}
            />
          ) : (
            <form action={savePageContent} className={styles.settingsForm}>
              <input type="hidden" name="pageKey" value={selectedKey} />

              {selectedKey === "home" && (
                <div className={styles.settingsGrid}>
                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Hero</h2>
                      <p>Primeira mensagem exibida na página inicial</p>
                    </div>

                    <label className={styles.settingsField}>
                      Eyebrow
                      <input
                        name="heroEyebrow"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.home.heroEyebrow}
                      />
                      <small>Use “·” para separar os termos do destaque.</small>
                    </label>

                    <label className={styles.settingsField}>
                      Título principal
                      <input
                        name="heroTitle"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.home.heroTitle}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Palavra em destaque
                      <input
                        name="heroAccent"
                        required
                        maxLength={100}
                        defaultValue={pageSettings.home.heroAccent}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Descrição principal
                      <textarea
                        name="heroDescription"
                        required
                        rows={4}
                        maxLength={500}
                        defaultValue={pageSettings.home.heroDescription}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Texto complementar
                      <textarea
                        name="heroSecondary"
                        required
                        rows={4}
                        maxLength={500}
                        defaultValue={pageSettings.home.heroSecondary}
                      />
                    </label>
                  </section>

                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Botões do Hero</h2>
                      <p>Chamadas principais da página inicial</p>
                    </div>

                    <label className={styles.settingsField}>
                      Botão principal
                      <input
                        name="primaryCtaLabel"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.home.primaryCtaLabel}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Botão secundário
                      <input
                        name="secondaryCtaLabel"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.home.secondaryCtaLabel}
                      />
                    </label>
                  </section>

                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Serviços</h2>
                      <p>Título da seção de serviços</p>
                    </div>

                    <label className={styles.settingsField}>
                      Eyebrow
                      <input
                        name="servicesEyebrow"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.home.servicesEyebrow}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Título
                      <input
                        name="servicesTitle"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.home.servicesTitle}
                      />
                    </label>
                  </section>

                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Portfólio em destaque</h2>
                      <p>Textos acima dos projetos selecionados</p>
                    </div>

                    <label className={styles.settingsField}>
                      Eyebrow
                      <input
                        name="portfolioEyebrow"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.home.portfolioEyebrow}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Título
                      <input
                        name="portfolioTitle"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.home.portfolioTitle}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Texto do link
                      <input
                        name="portfolioLinkLabel"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.home.portfolioLinkLabel}
                      />
                    </label>
                  </section>

                  <section className={styles.settingsCard}>
                    <div>
                      <h2>CTA final</h2>
                      <p>Chamada para contato no final da Home</p>
                    </div>

                    <label className={styles.settingsField}>
                      Eyebrow
                      <input
                        name="ctaEyebrow"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.home.ctaEyebrow}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Título
                      <input
                        name="ctaTitle"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.home.ctaTitle}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Descrição
                      <textarea
                        name="ctaDescription"
                        required
                        rows={4}
                        maxLength={500}
                        defaultValue={pageSettings.home.ctaDescription}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Texto do botão
                      <input
                        name="ctaButtonLabel"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.home.ctaButtonLabel}
                      />
                    </label>
                  </section>
                </div>
              )}

              {selectedKey === "sobre" && (
                <div className={styles.settingsGrid}>
                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Apresentação</h2>
                      <p>Hero da página Sobre</p>
                    </div>

                    <label className={styles.settingsField}>
                      Eyebrow
                      <input
                        name="eyebrow"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.sobre.eyebrow}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Título
                      <input
                        name="title"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.sobre.title}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Descrição
                      <textarea
                        name="description"
                        required
                        rows={4}
                        maxLength={500}
                        defaultValue={pageSettings.sobre.description}
                      />
                    </label>
                  </section>

                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Conteúdo institucional</h2>
                      <p>Texto principal exibido abaixo da apresentação</p>
                    </div>

                    <label className={styles.settingsField}>
                      Título do conteúdo
                      <input
                        name="bodyTitle"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.sobre.bodyTitle}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Texto
                      <textarea
                        name="body"
                        required
                        rows={10}
                        maxLength={5000}
                        defaultValue={pageSettings.sobre.body}
                      />
                      <small>Separe parágrafos usando uma linha em branco.</small>
                    </label>
                  </section>
                </div>
              )}

              {selectedKey === "contato" && (
                <div className={styles.settingsGrid}>
                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Apresentação</h2>
                      <p>Hero da página Contato</p>
                    </div>

                    <label className={styles.settingsField}>
                      Eyebrow
                      <input
                        name="eyebrow"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.contato.eyebrow}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Título
                      <input
                        name="title"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.contato.title}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Descrição
                      <textarea
                        name="description"
                        required
                        rows={4}
                        maxLength={500}
                        defaultValue={pageSettings.contato.description}
                      />
                    </label>
                  </section>

                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Contato direto</h2>
                      <p>Textos do card exibido ao lado do formulário</p>
                    </div>

                    <label className={styles.settingsField}>
                      Eyebrow
                      <input
                        name="directEyebrow"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.contato.directEyebrow}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Título
                      <input
                        name="directTitle"
                        maxLength={180}
                        defaultValue={pageSettings.contato.directTitle}
                        placeholder="Deixe vazio para usar o nome da empresa"
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Descrição
                      <textarea
                        name="directDescription"
                        required
                        rows={4}
                        maxLength={500}
                        defaultValue={pageSettings.contato.directDescription}
                      />
                    </label>
                  </section>
                </div>
              )}

              {selectedKey === "footer" && (
                <div className={styles.settingsGrid}>
                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Identidade do rodapé</h2>
                      <p>Texto exibido junto à marca</p>
                    </div>

                    <label className={styles.settingsField}>
                      Slogan
                      <textarea
                        name="tagline"
                        required
                        rows={3}
                        maxLength={500}
                        defaultValue={pageSettings.footer.tagline}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Copyright
                      <input
                        name="copyright"
                        required
                        maxLength={500}
                        defaultValue={pageSettings.footer.copyright}
                      />
                      <small>
                        Use {"{year}"} para o ano atual e {"{company}"} para o nome
                        da empresa.
                      </small>
                    </label>
                  </section>

                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Colunas</h2>
                      <p>Títulos das áreas de navegação do rodapé</p>
                    </div>

                    <label className={styles.settingsField}>
                      Navegação
                      <input
                        name="navigationTitle"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.footer.navigationTitle}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Ecossistema
                      <input
                        name="ecosystemTitle"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.footer.ecosystemTitle}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Legal
                      <input
                        name="legalTitle"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.footer.legalTitle}
                      />
                    </label>
                  </section>
                </div>
              )}

              {selectedKey === "privacy-banner" && (
                <div className={styles.settingsGrid}>
                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Banner</h2>
                      <p>Mensagem exibida na primeira visita</p>
                    </div>

                    <label className={styles.settingsField}>
                      Versão do consentimento
                      <input
                        name="version"
                        required
                        maxLength={30}
                        defaultValue={pageSettings.privacyBanner.version}
                      />
                      <small>
                        Altere a versão apenas quando quiser solicitar uma nova escolha
                        aos visitantes que já responderam.
                      </small>
                    </label>

                    <label className={styles.settingsField}>
                      Título
                      <input
                        name="title"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.privacyBanner.title}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Descrição
                      <textarea
                        name="description"
                        required
                        rows={5}
                        maxLength={500}
                        defaultValue={pageSettings.privacyBanner.description}
                      />
                    </label>
                  </section>

                  <section className={styles.settingsCard}>
                    <div>
                      <h2>Botões</h2>
                      <p>Textos das ações de consentimento</p>
                    </div>

                    <label className={styles.settingsField}>
                      Aceitar opcionais
                      <input
                        name="acceptLabel"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.privacyBanner.acceptLabel}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Rejeitar opcionais
                      <input
                        name="rejectLabel"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.privacyBanner.rejectLabel}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Preferências
                      <input
                        name="preferencesLabel"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.privacyBanner.preferencesLabel}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Salvar preferências
                      <input
                        name="saveLabel"
                        required
                        maxLength={120}
                        defaultValue={pageSettings.privacyBanner.saveLabel}
                      />
                    </label>
                  </section>

                  <section className={`${styles.settingsCard} ${styles.settingsCardFull}`}>
                    <div>
                      <h2>Modal de preferências</h2>
                      <p>Introdução exibida antes das categorias</p>
                    </div>

                    <label className={styles.settingsField}>
                      Título do modal
                      <input
                        name="modalTitle"
                        required
                        maxLength={180}
                        defaultValue={pageSettings.privacyBanner.modalTitle}
                      />
                    </label>

                    <label className={styles.settingsField}>
                      Descrição do modal
                      <textarea
                        name="modalDescription"
                        required
                        rows={4}
                        maxLength={500}
                        defaultValue={pageSettings.privacyBanner.modalDescription}
                      />
                    </label>
                  </section>
                </div>
              )}

              <div className={styles.settingsSaveBar}>
                <div>
                  <strong>Conteúdo da página</strong>
                  <span>As alterações serão aplicadas ao site público.</span>
                </div>

                <button type="submit" className={styles.settingsSaveButton}>
                  <Save size={16} />
                  Salvar página
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </>
  );
}
