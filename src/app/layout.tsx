import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { SerwistProvider } from "@serwist/turbopack/react";

import { RouteTransitionProvider } from "@/components/navigation/route-transition-loader";
import { ConsentAwareTracking } from "@/components/privacy/consent-aware-tracking";
import { PrivacyConsent } from "@/components/privacy/privacy-consent";
import { getSiteSettings } from "@/lib/site-settings";

import "./globals.css";
import "./brand-polish.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(settings.domain),

    applicationName: "Nelled Studio",
    manifest: "/site.webmanifest",

    title: {
      default: settings.seoTitle,
      template: `%s | ${settings.companyName}`,
    },

    description: settings.seoDescription,

    appleWebApp: {
      capable: true,
      title: "Nelled Studio",
      statusBarStyle: "black-translucent",
    },

    openGraph: {
      type: "website",
      siteName: settings.companyName,
      title: settings.seoTitle,
      description: settings.seoDescription,
      url: settings.domain,
    },

    verification: {
      google: "BqOLZqFnMIWWYkmZd2wr5SZAeMhWecWw9c1EGf7BM7s",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#f5f8fa",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#050b14",
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cookieStore, settings] = await Promise.all([
    cookies(),
    getSiteSettings(),
  ]);

  const savedTheme = cookieStore.get("theme")?.value;
  const theme = savedTheme === "light" ? "light" : "dark";
  const privacy = settings.pages.privacyBanner;

  return (
    <html
      lang="pt-BR"
      className={theme === "light" ? "light" : undefined}
      style={{ colorScheme: theme }}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <SerwistProvider swUrl="/serwist/sw.js">
          <RouteTransitionProvider>
            {children}

            <PrivacyConsent content={privacy} />

            <ConsentAwareTracking version={privacy.version} />
          </RouteTransitionProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}