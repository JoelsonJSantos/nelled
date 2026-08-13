import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import styles from "./admin-ui.module.css";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: { label: string; href: string; icon?: LucideIcon };
}) {
  const Icon = action?.icon;
  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderCopy}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      {action && (
        <Link className={styles.primaryAction} href={action.href}>
          {Icon && <Icon size={17} />}{action.label}
        </Link>
      )}
    </div>
  );
}
