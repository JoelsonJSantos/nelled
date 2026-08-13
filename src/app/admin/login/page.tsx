import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminClient } from "@/lib/admin";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Login",
  description: "Acesso ao painel administrativo da Nelled Studio.",
  robots: { index: false, follow: false },
};

export default async function AdminLogin() {
  if (await getAdminClient()) redirect("/admin");

  return <main className={styles.screen}><section className={styles.shell}>
    <aside className={styles.brandPanel} aria-label="Nelled Studio"><div className={styles.seal}><Image src="/nelled-studio-logo.png" alt="" width={96} height={96} priority /></div><div className={styles.brandCopy}><p className={styles.kicker}>NELLED STUDIO</p><h1>Gestão com<br/>clareza.</h1><p>Administre o ecossistema digital da Nelled Studio em um único lugar.</p></div><p className={styles.caption}>Criando soluções digitais.</p></aside>
    <div className={styles.formPanel}><p className={styles.kicker}>ÁREA ADMINISTRATIVA</p><h2>Acesse o painel</h2><p>Use suas credenciais administrativas para continuar.</p><AdminLoginForm /><Link href="/" className={styles.back}>← Voltar ao site</Link></div>
  </section></main>;
}
