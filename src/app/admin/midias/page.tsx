import type { Metadata } from "next";
import { Upload } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaLibrary } from "@/components/admin/media-library";
import { requireAdmin } from "@/lib/admin";
import { normalizeMediaItem } from "@/lib/media";

export const metadata: Metadata = {
  title: "Mídias",
  description: "Biblioteca de mídia administrativa da Nelled Studio.",
};

export default async function MediaAdmin() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("media_library")
    .select("id,public_id,url,alt_text,mime_type,bytes,created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        eyebrow="Sistema"
        title="Mídias"
        description="Envie, encontre e reutilize imagens gerenciadas pela Nelled Studio."
        action={{ label: "Enviar mídia", href: "/admin/midias#envio", icon: Upload }}
      />
      <MediaLibrary
        initialMedia={(data ?? []).map(normalizeMediaItem)}
        loadError={error ? "Não foi possível carregar a biblioteca de mídia." : undefined}
      />
    </>
  );
}
