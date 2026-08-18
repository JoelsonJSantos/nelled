import type { Metadata } from "next";
import { cookies } from "next/headers";

import { ConsentAwareTracking } from "@/components/privacy/consent-aware-tracking";
import { RouteTransitionProvider } from "@/components/navigation/route-transition-loader";
import { PrivacyConsent } from "@/components/privacy/privacy-consent";
import { getSiteSettings } from "@/lib/site-settings";

import "./globals.css";
import "./brand-polish.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(settings.domain),
    title: {
      default: settings.seoTitle,
      template: `%s | ${settings.companyName}`,
    },
    description: settings.seoDescription,
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
        <RouteTransitionProvider>
          {children}
          <PrivacyConsent content={privacy} />
          <ConsentAwareTracking version={privacy.version} />
        </RouteTransitionProvider>
      </body>
    </html>
  );
}