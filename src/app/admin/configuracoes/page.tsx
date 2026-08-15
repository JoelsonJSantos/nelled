import type { Metadata } from "next";

import {
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Gauge,
  Save,
} from "lucide-react";

import {
  saveSiteSettings,
} from "@/app/admin/actions";

import {
  AdminPageHeader,
} from "@/components/admin/admin-page-header";

import { SettingsSavedToast } from "@/components/admin/settings-saved-toast";

import styles from "@/components/admin/admin-ui.module.css";

import {
  requireAdmin,
} from "@/lib/admin";

export const metadata: Metadata = {
  title: "Configurações",
  description:
    "Configurações institucionais e de SEO da Nelled Studio.",
};

type SettingsData = Record<
  string,
  unknown
>;

type SearchParams = Promise<{
  saved?: string | string[];
}>;

function setting(
  data: SettingsData,
  key: string,
) {
  return typeof data[key] === "string"
    ? data[key]
    : "";
}

export default async function SettingsAdmin({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params =
    await searchParams;

  const saved =
    params.saved === "1";

  const environment =
    process.env.VERCEL_ENV ===
    "production"
      ? "Produção"
      : process.env.VERCEL_ENV ===
          "preview"
        ? "Preview"
        : "Local";

  const supabase =
    await requireAdmin();

  const { data, error } =
    await supabase
      .from("site_settings")
      .select(
        "company_name,settings",
      )
      .eq("id", 1)
      .maybeSingle();

  const settings =
    data?.settings &&
    typeof data.settings ===
      "object" &&
    !Array.isArray(data.settings)
      ? (data.settings as SettingsData)
      : {};

  return (
    <>
      <AdminPageHeader
        eyebrow="Sistema"
        title="Configurações"
        description="Centralize as informações institucionais e padrões do site."
      />

      {error && (
        <p
          className={
            styles.queryError
          }
        >
          Não foi possível carregar as
          configurações salvas.
        </p>
      )}

      <SettingsSavedToast
        show={saved}
      />

      <form
        action={saveSiteSettings}
        className={
          styles.settingsForm
        }
      >
        <div
          className={
            styles.settingsGrid
          }
        >
          <section
            className={
              styles.settingsCard
            }
          >
            <div>
              <h2>Empresa</h2>

              <p>
                Identidade institucional
              </p>
            </div>

            <label
              className={
                styles.settingsField
              }
            >
              Nome da empresa

              <input
                name="companyName"
                required
                defaultValue={
                  data?.company_name ??
                  "Nelled Studio"
                }
              />
            </label>
          </section>

          <section
            className={
              styles.settingsCard
            }
          >
            <div>
              <h2>Contato</h2>

              <p>
                Canais principais
              </p>
            </div>

            <label
              className={
                styles.settingsField
              }
            >
              E-mail

              <input
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={setting(
                  settings,
                  "email",
                )}
                placeholder="contato@nelled.com.br"
              />
            </label>

            <label
              className={
                styles.settingsField
              }
            >
              Telefone

              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={setting(
                  settings,
                  "phone",
                )}
                placeholder="(82) 99999-9999"
              />
            </label>
          </section>

          <section
            className={
              styles.settingsCard
            }
          >
            <div>
              <h2>
                Redes sociais
              </h2>

              <p>
                Perfis oficiais
              </p>
            </div>

            <label
              className={
                styles.settingsField
              }
            >
              Instagram

              <input
                name="instagram"
                type="url"
                defaultValue={setting(
                  settings,
                  "instagram",
                )}
                placeholder="https://instagram.com/nelledstudio"
              />
            </label>

            <label
              className={
                styles.settingsField
              }
            >
              LinkedIn

              <input
                name="linkedin"
                type="url"
                defaultValue={setting(
                  settings,
                  "linkedin",
                )}
                placeholder="https://linkedin.com/company/nelledstudio"
              />
            </label>
          </section>

          <section
            className={
              styles.settingsCard
            }
          >
            <div>
              <h2>Domínio</h2>

              <p>
                Endereço público do site
              </p>
            </div>

            <label
              className={
                styles.settingsField
              }
            >
              URL principal

              <input
                name="domain"
                type="url"
                defaultValue={setting(
                  settings,
                  "domain",
                )}
                placeholder="https://nelled.vercel.app"
              />
            </label>
          </section>

          <section
            className={
              styles.settingsCard
            }
          >
            <div>
              <h2>SEO</h2>

              <p>
                Padrões para mecanismos
                de busca
              </p>
            </div>

            <label
              className={
                styles.settingsField
              }
            >
              Título padrão

              <input
                name="seoTitle"
                maxLength={180}
                defaultValue={setting(
                  settings,
                  "seo_title",
                )}
                placeholder="Nelled Studio — Criando soluções digitais"
              />
            </label>

            <label
              className={
                styles.settingsField
              }
            >
              Descrição padrão

              <textarea
                name="seoDescription"
                rows={4}
                maxLength={320}
                defaultValue={setting(
                  settings,
                  "seo_description",
                )}
                placeholder="Desenvolvimento de produtos digitais, plataformas e sistemas personalizados."
              />
            </label>
          </section>

          <section
            className={
              styles.settingsCard
            }
          >
            <div>
              <h2>Analytics</h2>

              <p>
                Monitoramento de acessos
                do site
              </p>
            </div>

            <div
              className={
                styles.analyticsStatus
              }
            >
              <span
                className={
                  styles.analyticsIcon
                }
              >
                <BarChart3
                  size={18}
                />
              </span>

              <div>
                <strong>
                  Vercel Web Analytics
                </strong>

                <span>
                  Monitoramento global
                  do site
                </span>
              </div>
            </div>

            <div
              className={
                styles.analyticsState
              }
            >
              <CheckCircle2
                size={16}
              />

              <span>Ativo</span>
            </div>

            <div
              className={
                styles.analyticsDetails
              }
            >
              <div>
                <span>
                  Integração
                </span>

                <strong>
                  @vercel/analytics
                </strong>
              </div>

              <div>
                <span>
                  Escopo
                </span>

                <strong>
                  Site público
                </strong>
              </div>

              <div>
                <span>
                  Ambiente
                </span>

                <strong>
                  {environment}
                </strong>
              </div>
            </div>

            <a
              className={
                styles.settingsExternalLink
              }
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir Analytics na Vercel

              <ExternalLink
                size={15}
              />
            </a>
          </section>

          <section
            className={
              styles.settingsCard
            }
          >
            <div>
              <h2>Performance</h2>

              <p>
                Métricas de velocidade
                e experiência
              </p>
            </div>

            <div
              className={
                styles.analyticsStatus
              }
            >
              <span
                className={
                  styles.analyticsIcon
                }
              >
                <Gauge
                  size={18}
                />
              </span>

              <div>
                <strong>
                  Vercel Speed Insights
                </strong>

                <span>
                  Monitoramento de Core
                  Web Vitals
                </span>
              </div>
            </div>

            <div
              className={
                styles.analyticsState
              }
            >
              <CheckCircle2
                size={16}
              />

              <span>Ativo</span>
            </div>

            <div
              className={
                styles.analyticsDetails
              }
            >
              <div>
                <span>
                  Integração
                </span>

                <strong>
                  @vercel/speed-insights
                </strong>
              </div>

              <div>
                <span>
                  Métricas
                </span>

                <strong>
                  Core Web Vitals
                </strong>
              </div>

              <div>
                <span>
                  Ambiente
                </span>

                <strong>
                  {environment}
                </strong>
              </div>
            </div>

            <a
              className={
                styles.settingsExternalLink
              }
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir Speed Insights na
              Vercel

              <ExternalLink
                size={15}
              />
            </a>
          </section>
        </div>

        <div
          className={
            styles.settingsSaveBar
          }
        >
          <div>
            <strong>
              Configurações do site
            </strong>

            <span>
              Salve para aplicar as
              alterações no site.
            </span>
          </div>

          <button
            type="submit"
            className={
              styles.settingsSaveButton
            }
          >
            <Save size={16} />

            Salvar configurações
          </button>
        </div>
      </form>
    </>
  );
}