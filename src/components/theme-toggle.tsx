"use client";

import {
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { useSyncExternalStore } from "react";

type ThemePreference =
  | "system"
  | "light"
  | "dark";

const STORAGE_KEY =
  "nelled:theme-preference";

const COOKIE_NAME =
  "theme_preference";

const CHANGE_EVENT =
  "nelled:theme-preference-change";

const SYSTEM_THEME_QUERY =
  "(prefers-color-scheme: light)";

function isThemePreference(
  value: string | null | undefined,
): value is ThemePreference {
  return (
    value === "system" ||
    value === "light" ||
    value === "dark"
  );
}

function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const stored =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (isThemePreference(stored)) {
      return stored;
    }
  } catch {
    // Continua usando o valor presente no HTML.
  }

  const htmlPreference =
    document.documentElement.dataset
      .themePreference;

  if (
    isThemePreference(
      htmlPreference,
    )
  ) {
    return htmlPreference;
  }

  return "system";
}

function resolveTheme(
  preference: ThemePreference,
): "light" | "dark" {
  if (
    preference === "light" ||
    preference === "dark"
  ) {
    return preference;
  }

  return window.matchMedia(
    SYSTEM_THEME_QUERY,
  ).matches
    ? "light"
    : "dark";
}

function applyTheme(
  preference: ThemePreference,
) {
  if (typeof window === "undefined") {
    return;
  }

  const root =
    document.documentElement;

  const theme =
    resolveTheme(preference);

  root.classList.toggle(
    "light",
    theme === "light",
  );

  root.style.colorScheme = theme;

  root.dataset.themePreference =
    preference;
}

function saveThemePreference(
  preference: ThemePreference,
) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      preference,
    );

    /*
     * Remove a chave utilizada pelo
     * sistema antigo de tema.
     */
    window.localStorage.removeItem(
      "theme",
    );
  } catch {
    // O tema continua funcionando
    // mesmo sem localStorage.
  }

  document.cookie =
    `${COOKIE_NAME}=${preference}; ` +
    "Path=/; Max-Age=31536000; SameSite=Lax";

  /*
   * Remove o cookie utilizado pelo
   * sistema antigo.
   */
  document.cookie =
    "theme=; Path=/; Max-Age=0; SameSite=Lax";
}

function subscribeTheme(
  onStoreChange: () => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQuery =
    window.matchMedia(
      SYSTEM_THEME_QUERY,
    );

  /*
   * Garante que o DOM esteja
   * sincronizado quando o componente
   * for montado.
   */
  applyTheme(
    readThemePreference(),
  );

  const handleSystemThemeChange =
    () => {
      const preference =
        readThemePreference();

      if (
        preference === "system"
      ) {
        applyTheme(
          preference,
        );
      }

      onStoreChange();
    };

  const handleStorage = (
    event: StorageEvent,
  ) => {
    if (
      event.key !== STORAGE_KEY
    ) {
      return;
    }

    applyTheme(
      readThemePreference(),
    );

    onStoreChange();
  };

  const handleThemeChange =
    () => {
      applyTheme(
        readThemePreference(),
      );

      onStoreChange();
    };

  mediaQuery.addEventListener(
    "change",
    handleSystemThemeChange,
  );

  window.addEventListener(
    "storage",
    handleStorage,
  );

  window.addEventListener(
    CHANGE_EVENT,
    handleThemeChange,
  );

  return () => {
    mediaQuery.removeEventListener(
      "change",
      handleSystemThemeChange,
    );

    window.removeEventListener(
      "storage",
      handleStorage,
    );

    window.removeEventListener(
      CHANGE_EVENT,
      handleThemeChange,
    );
  };
}

function getThemeSnapshot(): ThemePreference {
  return readThemePreference();
}

function getServerThemeSnapshot(): ThemePreference {
  return "system";
}

export function ThemeToggle() {
  const preference =
    useSyncExternalStore(
      subscribeTheme,
      getThemeSnapshot,
      getServerThemeSnapshot,
    );

  const toggleTheme = () => {
    const currentPreference =
      readThemePreference();

    const currentlyLight =
      document.documentElement.classList.contains(
        "light",
      );

    let nextPreference:
      ThemePreference;

    if (
      currentPreference === "system"
    ) {
      /*
       * Ao sair do automático,
       * escolhemos o tema oposto
       * ao que está visível.
       */
      nextPreference =
        currentlyLight
          ? "dark"
          : "light";
    } else if (
      currentPreference === "light"
    ) {
      nextPreference = "dark";
    } else {
      /*
       * Depois do escuro,
       * voltamos ao automático.
       */
      nextPreference = "system";
    }

    saveThemePreference(
      nextPreference,
    );

    applyTheme(
      nextPreference,
    );

    window.dispatchEvent(
      new Event(
        CHANGE_EVENT,
      ),
    );
  };

  const Icon =
    preference === "system"
      ? Monitor
      : preference === "light"
        ? Sun
        : Moon;

  const label =
    preference === "system"
      ? "Tema automático. Clique para alterar o tema."
      : preference === "light"
        ? "Tema claro. Clique para usar o tema escuro."
        : "Tema escuro. Clique para voltar ao tema automático.";

  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <Icon size={18} />
    </button>
  );
}