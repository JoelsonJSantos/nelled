import type { Metadata } from "next";
import Image from "next/image";
import { Images, Upload } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import styles from "@/components/admin/admin-ui.module.css";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Mídias",
  description: "Biblioteca de mídia administrativa da Nelled Studio.",
};

export default async function MediaAdmin() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("media_library").select("id,url,alt_text,public_id").order("created_at", { ascending: false });
  const media = data ?? [];

  return (
    <>
      <AdminPageHeader eyebrow="Sistema" title="Mídias" description="Consulte os arquivos cadastrados na biblioteca de mídia." action={{ label: "Enviar mídia", href: "/admin/midias#biblioteca", icon: Upload }} />
      {error && <p className={styles.queryError}>Não foi possível carregar a biblioteca de mídia.</p>}
      {!error && media.length ? (
        <div id="biblioteca" className={styles.mediaGrid}>
          {media.map((item) => (
            <div className={styles.mediaCard} key={item.id} title={item.public_id}>
              <Image src={item.url} alt={item.alt_text || "Mídia da Nelled Studio"} width={320} height={320} unoptimized />
            </div>
          ))}
        </div>
      ) : !error && <AdminEmptyState icon={Images} title="Biblioteca vazia" description="Os arquivos enviados para a biblioteca aparecerão neste grid." />}
    </>
  );
}
