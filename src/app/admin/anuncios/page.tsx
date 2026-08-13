import type { Metadata } from "next";
import { Megaphone, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import styles from "@/components/admin/admin-ui.module.css";
import { formatAdminDate } from "@/lib/admin-format";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Anúncios",
  description: "Gerenciamento de campanhas e anúncios da Nelled Studio.",
};

export default async function AdsAdmin() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("ad_campaigns")
    .select("id,name,title,active,placements,starts_at,ends_at,created_at")
    .order("created_at", { ascending: false });
  const campaigns = data ?? [];

  return (
    <>
      <AdminPageHeader eyebrow="Comercial" title="Anúncios" description="Organize campanhas, posicionamentos e períodos de exibição." action={{ label: "Nova campanha", href: "/admin/anuncios/novo", icon: Plus }} />
      {error && <p className={styles.queryError}>Não foi possível carregar as campanhas. Tente novamente.</p>}
      {!error && campaigns.length ? (
        <div className={`${styles.panel} ${styles.dataList}`}>
          {campaigns.map((campaign) => (
            <div className={`${styles.dataRow} ${styles.dataRowFive}`} key={campaign.id}>
              <span className={styles.rowMain}><strong>{campaign.name}</strong><span>{campaign.title}</span></span>
              <span className={styles.rowMeta}>{campaign.placements.join(", ") || "Sem posicionamento"}</span>
              <AdminStatusBadge status={campaign.active ? "active" : "inactive"} />
              <span className={styles.rowMeta}>{formatAdminDate(campaign.starts_at ?? campaign.created_at)}</span>
              <span className={styles.rowMeta}>{campaign.ends_at ? formatAdminDate(campaign.ends_at) : "Contínua"}</span>
            </div>
          ))}
        </div>
      ) : !error && <AdminEmptyState icon={Megaphone} title="Nenhuma campanha criada" description="As campanhas publicitárias aparecerão aqui quando forem cadastradas." action={{ label: "Criar campanha", href: "/admin/anuncios/novo" }} />}
    </>
  );
}
