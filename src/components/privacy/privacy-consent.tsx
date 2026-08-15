"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Cookie,
  Gauge,
  Megaphone,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  PRIVACY_PREFERENCES_OPEN_EVENT,
  emptyPrivacyPreferences,
  readPrivacyConsent,
  readPrivacyConsentSnapshot,
  savePrivacyConsent,
  subscribePrivacyConsent,
  type PrivacyPreferences,
} from "@/lib/privacy-consent";
import type { PrivacyBannerContent } from "@/lib/site-settings";

import styles from "./privacy-consent.module.css";

type CategoryKey = keyof PrivacyPreferences;

const categories: Array<{
  key: CategoryKey;
  title: string;
  description: string;
  icon: typeof BarChart3;
}> = [
  {
    key: "analytics",
    title: "Analytics",
    description:
      "Permite carregar o Vercel Web Analytics para estatísticas agregadas de acesso ao site.",
    icon: BarChart3,
  },
  {
    key: "performance",
    title: "Performance",
    description:
      "Permite carregar o Vercel Speed Insights para acompanhar Core Web Vitals e desempenho técnico.",
    icon: Gauge,
  },
  {
    key: "advertising",
    title: "Publicidade",
    description:
      "Reserva sua preferência para campanhas e tecnologias publicitárias opcionais que possam ser integradas futuramente.",
    icon: Megaphone,
  },
];

function subscribeHydration() {
  return () => undefined;
}

export function PrivacyConsent({
  content,
}: {
  content: PrivacyBannerContent;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  /*
   * Evita diferença de renderização entre servidor e navegador sem precisar
   * de setState dentro de useEffect.
   */
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );

  const getConsentSnapshot = useCallback(
    () => readPrivacyConsentSnapshot(content.version),
    [content.version],
  );

  const consentSnapshot = useSyncExternalStore(
    subscribePrivacyConsent,
    getConsentSnapshot,
    () => "",
  );

  const storedConsent = useMemo(() => {
    if (!consentSnapshot) return null;
    return readPrivacyConsent(content.version);
  }, [consentSnapshot, content.version]);

  const [modalOpen, setModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<PrivacyPreferences>(
    emptyPrivacyPreferences,
  );

  const hasStoredChoice = Boolean(storedConsent);
  const showBanner = hydrated && !storedConsent && !modalOpen && !isAdmin;

  useEffect(() => {
    function openPreferences() {
      if (isAdmin) return;

      const stored = readPrivacyConsent(content.version);

      setPreferences(
        stored?.preferences ?? emptyPrivacyPreferences,
      );
      setModalOpen(true);
    }

    window.addEventListener(
      PRIVACY_PREFERENCES_OPEN_EVENT,
      openPreferences,
    );

    return () => {
      window.removeEventListener(
        PRIVACY_PREFERENCES_OPEN_EVENT,
        openPreferences,
      );
    };
  }, [content.version, isAdmin]);

  useEffect(() => {
    if (!modalOpen || isAdmin) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModalOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modalOpen, isAdmin]);

  if (!hydrated || isAdmin) {
    return null;
  }

  function persist(next: PrivacyPreferences) {
    const previous = storedConsent?.preferences;

    savePrivacyConsent(content.version, next);
    setPreferences(next);
    setModalOpen(false);

    const disabledPreviouslyActiveResource = Boolean(
      previous &&
        ((previous.analytics && !next.analytics) ||
          (previous.performance && !next.performance) ||
          (previous.advertising && !next.advertising)),
    );

    if (disabledPreviouslyActiveResource) {
      window.setTimeout(() => {
        window.location.reload();
      }, 0);
    }
  }

  function acceptAll() {
    persist({
      analytics: true,
      performance: true,
      advertising: true,
    });
  }

  function rejectOptional() {
    persist(emptyPrivacyPreferences);
  }

  function openBannerPreferences() {
    setPreferences(emptyPrivacyPreferences);
    setModalOpen(true);
  }

  function saveCurrentPreferences() {
    persist(preferences);
  }

  return (
    <>
      {showBanner && (
        <aside
          className={styles.banner}
          aria-label="Preferências de privacidade"
        >
          <div className={styles.bannerIcon} aria-hidden="true">
            <ShieldCheck size={22} />
          </div>

          <div className={styles.bannerCopy}>
            <strong>{content.title}</strong>
            <p>{content.description}</p>

            <nav className={styles.legalLinks} aria-label="Documentos legais">
              <Link href="/politica-de-privacidade">Privacidade</Link>
              <Link href="/termos-de-uso">Termos de Uso</Link>
              <Link href="/politica-de-cookies">Cookies</Link>
            </nav>
          </div>

          <div className={styles.bannerActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={rejectOptional}
            >
              {content.rejectLabel}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={openBannerPreferences}
            >
              {content.preferencesLabel}
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={acceptAll}
            >
              {content.acceptLabel}
            </button>
          </div>
        </aside>
      )}

      {modalOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>PRIVACIDADE</p>
                <h2 id="privacy-modal-title">{content.modalTitle}</h2>
                <p>{content.modalDescription}</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                aria-label="Fechar preferências"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.categoryList}>
              <article className={styles.categoryCard}>
                <div className={styles.categoryIcon}>
                  <Cookie size={18} />
                </div>

                <div className={styles.categoryCopy}>
                  <div className={styles.categoryTitleRow}>
                    <strong>Necessários</strong>
                    <span className={styles.alwaysActive}>Sempre ativos</span>
                  </div>

                  <p>
                    Mantêm funções solicitadas pelo visitante, como preferência de
                    tema e registro local das escolhas de privacidade.
                  </p>
                </div>
              </article>

              {categories.map(({ key, title, description, icon: Icon }) => (
                <article className={styles.categoryCard} key={key}>
                  <div className={styles.categoryIcon}>
                    <Icon size={18} />
                  </div>

                  <div className={styles.categoryCopy}>
                    <div className={styles.categoryTitleRow}>
                      <strong>{title}</strong>

                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={preferences[key]}
                          onChange={(event) => {
                            setPreferences((current) => ({
                              ...current,
                              [key]: event.target.checked,
                            }));
                          }}
                        />

                        <span aria-hidden="true" />

                        <span className={styles.srOnly}>
                          {preferences[key] ? "Ativado" : "Desativado"}
                        </span>
                      </label>
                    </div>

                    <p>{description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.modalLegalLinks}>
              <Link href="/politica-de-privacidade">
                Política de Privacidade
              </Link>
              <Link href="/politica-de-cookies">Política de Cookies</Link>
              <Link href="/termos-de-uso">Termos de Uso</Link>
            </div>

            <footer className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={rejectOptional}
              >
                {content.rejectLabel}
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={saveCurrentPreferences}
              >
                {content.saveLabel}
              </button>
            </footer>

            {!hasStoredChoice && (
              <p className={styles.firstChoiceNote}>
                Nenhum recurso opcional será ativado antes de você registrar uma
                escolha.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
