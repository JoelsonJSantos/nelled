import styles from "./loading.module.css";
export default function PortfolioLoading() { return <main className={`inner-page ${styles.page}`} aria-label="Carregando projetos"><div className={styles.heading} /><div className={styles.grid}>{Array.from({ length: 4 }, (_, index) => <div className={styles.card} key={index}><span /><i /><i /></div>)}</div></main>; }

