"use client";

import styles from "./offline.module.css";

export default function OfflinePage() {
  function handleRetry() {
    window.location.reload();
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.mark} aria-hidden="true">
          N
        </div>

        <p className={styles.brand}>Nelled Studio</p>

        <h1>Você está offline</h1>

        <p className={styles.description}>
          Não foi possível conectar à internet. Verifique sua conexão e tente
          novamente.
        </p>

        <button className={styles.button} type="button" onClick={handleRetry}>
          Tentar novamente
        </button>
      </section>
    </main>
  );
}