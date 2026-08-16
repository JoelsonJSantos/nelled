"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Menu, Moon, Sun } from "lucide-react";
import { logout } from "@/app/admin/login/actions";
import styles from "./admin-header.module.css";

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/portfolio": "Portfólio",
  "/admin/blog": "Blog",
  "/admin/parceiros": "Parceiros",
  "/admin/anuncios": "Anúncios",
  "/admin/contatos": "Contatos",
  "/admin/midias": "Mídias",
  "/admin/paginas": "Páginas",
  "/admin/configuracoes": "Configurações",
};

function pageTitle(pathname: string) {
  if (pathname === "/admin/blog/categorias") return "Categorias do Blog";
  const base = Object.keys(titles).find((path) => path !== "/admin" && pathname.startsWith(path));
  if (pathname.endsWith("/novo")) return `Novo · ${base ? titles[base] : "Conteúdo"}`;
  if (base && pathname !== base) return `Editar · ${titles[base]}`;
  return titles[pathname] ?? "Administração";
}

export function AdminHeader({
  menuOpen,
  menuButtonRef,
  onMenuOpen,
}: {
  menuOpen: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  onMenuOpen: () => void;
}) {
  const pathname = usePathname();

  const toggleTheme = () => {
    const root = document.documentElement;
    const isLight = !root.classList.contains("light");

    root.classList.toggle("light", isLight);

    const theme = isLight ? "light" : "dark";

    localStorage.setItem("theme", theme);
    root.style.colorScheme = theme;
  };

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <button
          ref={menuButtonRef}
          className={styles.menuButton}
          type="button"
          aria-label="Abrir menu administrativo"
          aria-expanded={menuOpen}
          aria-controls="admin-navigation"
          onClick={onMenuOpen}
        >
          <Menu size={21} />
        </button>
        <div>
          <span>Painel administrativo</span>
          <strong>{pageTitle(pathname)}</strong>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.themeButton} type="button" onClick={toggleTheme} aria-label="Alternar tema">
          <Sun className={styles.sunIcon} size={17} />
          <Moon className={styles.moonIcon} size={17} />
        </button>
        <Link href="/" target="_blank" rel="noreferrer"><ExternalLink size={16} />Abrir site</Link>
        <form action={logout}>
          <button type="submit" aria-label="Sair do painel"><LogOut size={17} /><span>Sair</span></button>
        </form>
      </div>
    </header>
  );
}
