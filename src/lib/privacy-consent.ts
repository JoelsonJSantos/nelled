export const PRIVACY_CONSENT_STORAGE_KEY = "nelled_privacy_consent";
export const PRIVACY_CONSENT_EVENT = "nelled:privacy-consent";
export const PRIVACY_PREFERENCES_OPEN_EVENT = "nelled:open-privacy-preferences";

export type PrivacyPreferences = {
  analytics: boolean;
  performance: boolean;
  advertising: boolean;
};

export type StoredPrivacyConsent = {
  version: string;
  updatedAt: string;
  preferences: PrivacyPreferences;
};

export const emptyPrivacyPreferences: PrivacyPreferences = {
  analytics: false,
  performance: false,
  advertising: false,
};

function parsePrivacyConsent(
  raw: string,
  version: string,
): StoredPrivacyConsent | null {
  try {
    const parsed = JSON.parse(raw) as Partial<StoredPrivacyConsent>;

    if (
      parsed.version !== version ||
      !parsed.preferences ||
      typeof parsed.preferences !== "object"
    ) {
      return null;
    }

    return {
      version,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
      preferences: {
        analytics: parsed.preferences.analytics === true,
        performance: parsed.preferences.performance === true,
        advertising: parsed.preferences.advertising === true,
      },
    };
  } catch {
    return null;
  }
}

export function readPrivacyConsent(
  version: string,
): StoredPrivacyConsent | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(PRIVACY_CONSENT_STORAGE_KEY);
  if (!raw) return null;

  return parsePrivacyConsent(raw, version);
}

/**
 * Snapshot estável para useSyncExternalStore.
 * Retorna a própria string salva no localStorage quando ela pertence
 * à versão atual do consentimento. Caso contrário, retorna string vazia.
 */
export function readPrivacyConsentSnapshot(version: string) {
  if (typeof window === "undefined") return "";

  const raw = window.localStorage.getItem(PRIVACY_CONSENT_STORAGE_KEY);
  if (!raw) return "";

  return parsePrivacyConsent(raw, version) ? raw : "";
}

/**
 * Mantém componentes sincronizados quando o consentimento muda nesta aba
 * ou em outra aba do navegador.
 */
export function subscribePrivacyConsent(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onConsent = () => {
    listener();
  };

  const onStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === PRIVACY_CONSENT_STORAGE_KEY
    ) {
      listener();
    }
  };

  window.addEventListener(PRIVACY_CONSENT_EVENT, onConsent);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(PRIVACY_CONSENT_EVENT, onConsent);
    window.removeEventListener("storage", onStorage);
  };
}

export function savePrivacyConsent(
  version: string,
  preferences: PrivacyPreferences,
) {
  if (typeof window === "undefined") return;

  const consent: StoredPrivacyConsent = {
    version,
    updatedAt: new Date().toISOString(),
    preferences,
  };

  window.localStorage.setItem(
    PRIVACY_CONSENT_STORAGE_KEY,
    JSON.stringify(consent),
  );

  window.dispatchEvent(
    new CustomEvent<StoredPrivacyConsent>(PRIVACY_CONSENT_EVENT, {
      detail: consent,
    }),
  );
}

export function openPrivacyPreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PRIVACY_PREFERENCES_OPEN_EVENT));
}
