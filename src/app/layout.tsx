import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nelled Studio — Criando soluções digitais",
    template: "%s | Nelled Studio",
  },
  description:
    "Software house para produtos digitais, sistemas, plataformas e experiências web.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const savedTheme =
    cookieStore.get("theme")?.value;

  const theme =
    savedTheme === "light"
      ? "light"
      : "dark";

  return (
    <html
      lang="pt-BR"
      className={
        theme === "light"
          ? "light"
          : undefined
      }
      style={{
        colorScheme: theme,
      }}
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