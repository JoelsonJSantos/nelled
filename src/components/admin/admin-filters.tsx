import { Search } from "lucide-react";
import styles from "./admin-ui.module.css";

export function AdminFilters({
  query,
  status,
  statuses,
  placeholder,
  allStatusesLabel = "Todos os status",
}: {
  query?: string;
  status?: string;
  statuses: Array<{ value: string; label: string }>;
  placeholder: string;
  allStatusesLabel?: string;
}) {
  return (
    <form className={styles.filters}>
      <div className={styles.inputWrap}>
        <Search size={16} />
        <input name="q" defaultValue={query} placeholder={placeholder} aria-label={placeholder} />
      </div>
      <select name="status" defaultValue={status ?? ""} aria-label="Filtrar por status">
        <option value="">{allStatusesLabel}</option>
        {statuses.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
      </select>
      <button className={styles.filterButton} type="submit">Filtrar</button>
    </form>
  );
}
