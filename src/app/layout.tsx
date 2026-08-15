import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

import { getSiteSettings } from "@/lib/site-settings";

import "./globals.css";

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
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get("theme")?.value;
  const theme = savedTheme === "light" ? "light" : "dark";

  return (
    <html
      lang="pt-BR"
      className={theme === "light" ? "light" : undefined}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
