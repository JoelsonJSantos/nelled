import type {
  Metadata,
  Viewport,
} from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { SerwistProvider } from "@serwist/turbopack/react";

import { RouteTransitionProvider } from "@/components/navigation/route-transition-loader";
import { ConsentAwareTracking } from "@/components/privacy/consent-aware-tracking";
import { PrivacyConsent } from "@/components/privacy/privacy-consent";
import { getSiteSettings } from "@/lib/site-settings";

import "./globals.css";
import "./brand-polish.css";

type ThemePreference =
  | "system"
  | "light"
  | "dark";

const themeBootstrapScript = `
(() => {
  const root = document.documentElement;
  const storageKey = "nelled:theme-preference";
  const systemQuery = "(prefers-color-scheme: light)";

  const validPreference = (value) =>
    value === "system" ||
    value === "light" ||
    value === "dark";

  let preference =
    root.dataset.themePreference || "system";

  try {
    const stored =
      window.localStorage.getItem(
        storageKey
      );

    if (validPreference(stored)) {
      preference = stored;
    } else {
      preference =
        validPreference(preference)
          ? preference
          : "system";

      window.localStorage.setItem(
        storageKey,
        preference
      );
    }
  } catch {
    preference =
      validPreference(preference)
        ? preference
        : "system";
  }

  const theme =
    preference === "light"
      ? "light"
      : preference === "dark"
        ? "dark"
        : window.matchMedia(systemQuery).matches
          ? "light"
          : "dark";

  root.classList.toggle(
    "light",
    theme === "light"
  );

  root.style.colorScheme = theme;

  root.dataset.themePreference =
    preference;
})();
`;

function normalizeThemePreference(
  value: string | undefined,
): ThemePreference {
  if (
    value === "light" ||
    value === "dark" ||
    value === "system"
  ) {
    return value;
  }

  return "system";
}

export async function generateMetadata(): Promise<Metadata> {
  const settings =
    await getSiteSettings();

  return {
    metadataBase: new URL(
      settings.domain,
    ),

    applicationName:
      "Nelled Studio",

    manifest:
      "/site.webmanifest",

    title: {
      default:
        settings.seoTitle,
      template:
        `%s | ${settings.companyName}`,
    },

    description:
      settings.seoDescription,

    appleWebApp: {
      capable: true,
      title: "Nelled Studio",
      statusBarStyle:
        "black-translucent",
    },

    openGraph: {
      type: "website",
      siteName:
        settings.companyName,
      title:
        settings.seoTitle,
      description:
        settings.seoDescription,
      url: settings.domain,
    },

    verification: {
      google:
        "BqOLZqFnMIWWYkmZd2wr5SZAeMhWecWw9c1EGf7BM7s",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    {
      media:
        "(prefers-color-scheme: light)",
      color: "#f5f8fa",
    },
    {
      media:
        "(prefers-color-scheme: dark)",
      color: "#050b14",
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    cookieStore,
    settings,
  ] = await Promise.all([
    cookies(),
    getSiteSettings(),
  ]);

  const themePreference =
    normalizeThemePreference(
      cookieStore.get(
        "theme_preference",
      )?.value,
    );

  /*
   * O servidor não conhece o tema
   * configurado no sistema operacional.
   *
   * No modo system usamos dark como
   * fallback inicial e o script
   * beforeInteractive resolve o tema
   * correto antes da aplicação hidratar.
   */
  const initialTheme =
    themePreference === "light"
      ? "light"
      : "dark";

  const privacy =
    settings.pages.privacyBanner;

  return (
    <html
      lang="pt-BR"
      className={
        initialTheme === "light"
          ? "light"
          : undefined
      }
      style={{
        colorScheme:
          initialTheme,
      }}
      data-theme-preference={
        themePreference
      }
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <Script
          id="nelled-theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              themeBootstrapScript,
          }}
        />

        <SerwistProvider
          swUrl="/serwist/sw.js"
        >
          <RouteTransitionProvider>
            {children}

            <PrivacyConsent
              content={privacy}
            />

            <ConsentAwareTracking
              version={
                privacy.version
              }
            />
          </RouteTransitionProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}