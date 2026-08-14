import styles from "./loading.module.css";

export default function PortfolioAdminLoading() {
  return <div className={styles.shell} aria-label="Carregando portfólio"><div className={styles.title} /><div className={styles.filters} /><div className={styles.list}>{Array.from({ length: 4 }, (_, index) => <div className={styles.row} key={index}><span /><i /><i /><i /></div>)}</div></div>;
}

