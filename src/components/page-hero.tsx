import styles from "./page-hero.module.css";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  narrow?: boolean;
};

export function PageHero({ eyebrow, title, description, narrow = false }: PageHeroProps) {
  return (
    <div className={`${styles.hero} ${narrow ? styles.narrow : ""}`}>
      <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
