import type { Metadata } from "next";
import Link from "next/link";
import { Contact, FileText, Home, Info, PanelBottom } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import styles from "@/components/admin/admin-ui.module.css";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Páginas",
  description: "Gerenciamento das páginas institucionais da Nelled Studio.",
};

const pages = [
  { name: "Home", description: "Conteúdo da página inicial", icon: Home, key: "home" },
  { name: "Sobre", description: "Apresentação institucional", icon: Info, key: "sobre" },
  { name: "Contato", description: "Textos e informações de contato", icon: Contact, key: "contato" },
  { name: "Footer", description: "Conteúdo global do rodapé", icon: PanelBottom, key: "footer" },
] as const;

export default async function PagesAdmin() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader eyebrow="Sistema" title="Páginas" description="Acesse os blocos editáveis das páginas institucionais." />
      <div className={styles.cardsGrid}>
        {pages.map(({ name, description, icon: Icon, key }) => (
          <article className={styles.pageCard} key={key}>
            <div className={styles.cardTitle}><Icon size={21} /><div><h2>{name}</h2><p>{description}</p></div></div>
            <Link className={styles.secondaryAction} href={`/admin/paginas?editar=${key}`}><FileText size={15} />Editar</Link>
          </article>
        ))}
      </div>
    </>
  );
}
