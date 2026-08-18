"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Moon,
  Settings,
  Sun,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/app/admin/login/actions";
import { BrandLogo } from "@/components/brand-logo";
import styles from "./admin-sidebar.module.css";

const groups = [
  {
    label: "Visão geral",
    links: [[LayoutDashboard, "Dashboard", "/admin"]],
  },
  {
    label: "Conteúdo",
    links: [
      [BriefcaseBusiness, "Portfólio", "/admin/portfolio"],
      [BookOpen, "Blog", "/admin/blog"],
      [Users, "Parceiros", "/admin/parceiros"],
    ],
  },
  {
    label: "Comercial",
    links: [
      [Megaphone, "Anúncios", "/admin/anuncios"],
      [Mail, "Contatos", "/admin/contatos"],
    ],
  },
  {
    label: "Sistema",
    links: [
      [Images, "Mídias", "/admin/midias"],
      [FileText, "Páginas", "/admin/paginas"],
      [Settings, "Configurações", "/admin/configuracoes"],
    ],
  },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname.startsWith(href);
}

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const toggleTheme = () => {
    const root = document.documentElement;

    const nextIsLight = !root.classList.contains("light");

    root.classList.toggle("light", nextIsLight);

    const theme = nextIsLight ? "light" : "dark";

    localStorage.setItem("theme", theme);
    root.style.colorScheme = theme;
  };

  return (
    <aside
      id="admin-navigation"
      className={`${styles.sidebar} ${open ? styles.open : ""}`}
      aria-label="Navegação administrativa"
    >
      <div className={styles.brandRow}>
        <Link
          href="/admin"
          className={styles.brand}
          onClick={onClose}
          aria-label="Dashboard Nelled Studio"
        >
          <BrandLogo />
        </Link>

        <button
          className={styles.closeButton}
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <p className={styles.management}>Gerenciamento</p>

      <nav className={styles.navigation}>
        {groups.map((group) => (
          <div className={styles.group} key={group.label}>
            <p>{group.label}</p>

            {group.links.map(([Icon, label, href]) => {
              const active = isActive(pathname, href);

              return (
                <Link
                  href={href}
                  key={href}
                  className={active ? styles.active : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={onClose}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Alternar entre tema claro e escuro"
        >
          <Sun
            className={styles.darkTheme}
            size={17}
            aria-hidden="true"
          />

          <Moon
            className={styles.lightTheme}
            size={17}
            aria-hidden="true"
          />

          <span className={styles.darkTheme}>
            Tema Claro
          </span>

          <span className={styles.lightTheme}>
            Tema Escuro
          </span>
        </button>

        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          onClick={onClose}
        >
          <ExternalLink size={17} aria-hidden="true" />
          <span>Ver site</span>
        </Link>

        <form action={logout}>
          <button type="submit">
            <LogOut size={17} aria-hidden="true" />
            <span>Sair</span>
          </button>
        </form>
      </div>
    </aside>
  );
}