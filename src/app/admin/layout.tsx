import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminClient } from "@/lib/admin";

export const metadata: Metadata = {
  title: {
    default: "Dashboard | Nelled Studio Admin",
    template: "%s | Nelled Studio Admin",
  },
  description: "Painel administrativo da Nelled Studio.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminClient = await getAdminClient();

  // Login and access-denied are intentionally rendered without the panel shell.
  // Every private page also calls requireAdmin() at the leaf route.
  if (!adminClient) return children;

  return <AdminShell>{children}</AdminShell>;
}
