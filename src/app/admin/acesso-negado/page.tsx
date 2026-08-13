import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Acesso negado",
  description: "Acesso não autorizado ao painel da Nelled Studio.",
  robots: { index: false, follow: false },
};

export default function AccessDenied() {
  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <BrandLogo />
        <ShieldAlert className={styles.icon} size={34} />
        <p className={styles.eyebrow}>ACESSO NEGADO</p>
        <h1>Sem permissão.</h1>
        <p className={styles.copy}>Sua conta está autenticada, mas não possui o papel administrativo necessário para acessar este painel.</p>
        <Link href="/" className={styles.back}>Voltar ao site</Link>
      </div>
    </main>
  );
}
