import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import styles from "./admin-ui.module.css";

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
  compact?: boolean;
}) {
  return (
    <div className={`${styles.emptyState} ${compact ? styles.emptyStateCompact : ""}`}>
      <div>
        <span className={styles.emptyIcon}><Icon size={20} /></span>
        <h2>{title}</h2>
        <p>{description}</p>
        {action && <Link className={styles.secondaryAction} href={action.href}>{action.label}</Link>}
      </div>
    </div>
  );
}
