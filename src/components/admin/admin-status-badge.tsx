import { adminStatusClass, adminStatusLabel } from "@/lib/admin-format";
import styles from "./admin-ui.module.css";

export function AdminStatusBadge({ status }: { status: string }) {
  const tone = adminStatusClass(status);
  const toneClass = tone === "positive"
    ? styles.badgePublished
    : tone === "warning"
      ? styles.badgeDraft
      : "";

  return <span className={`${styles.badge} ${toneClass}`}>{adminStatusLabel(status)}</span>;
}
