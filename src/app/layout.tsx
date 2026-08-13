import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nelled Studio - Criando soluções digitais",
    template: "%s | Nelled Studio",
  },
  description:
    "Software house para produtos digitais, sistemas, plataformas e experiências web.",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

const themeScript = `
(function () {
  try {
    const savedTheme = localStorage.getItem("theme");

    let theme = savedTheme;

    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }

    const root = document.documentElement;

    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>

      <body>{children}</body>
    </html>
  );
}