import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import styles from "./admin-ui.module.css";

export function AdminStatCard({ label, value, href, icon: Icon }: { label: string; value: number; href: string; icon: LucideIcon }) {
  return (
    <Link href={href} className={styles.statCard}>
      <span className={styles.statIcon}><Icon size={18} /></span>
      <strong className={styles.statValue}>{value}</strong>
      <p className={styles.statLabel}>{label}</p>
    </Link>
  );
}
