"use client";

import Image from "next/image";

import styles from "./route-transition-loader.module.css";

export function PageLoadingScreen() {
  return (
    <div className={styles.screen} role="status" aria-live="polite" aria-label="Carregando página">
      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <Image src="/nelled-studio-hero-dark.png" alt="Nelled Studio" width={1045} height={686} priority className={`${styles.logo} ${styles.logoDark}`} />
          <Image src="/nelled-studio-hero-light.png" alt="" aria-hidden="true" width={1045} height={686} priority className={`${styles.logo} ${styles.logoLight}`} />
        </div>
        <div className={styles.progress} aria-hidden="true"><span /></div>
        <span className={styles.srOnly}>Carregando página...</span>
      </div>
    </div>
  );
}
