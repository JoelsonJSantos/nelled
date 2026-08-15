"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import styles from "@/components/admin/admin-ui.module.css";

type SettingsSavedToastProps = {
  show: boolean;
  title?: string;
  message?: string;
};

export function SettingsSavedToast({
  show,
  title = "Configurações salvas",
  message = "As alterações foram salvas com sucesso.",
}: SettingsSavedToastProps) {
  const [visible, setVisible] = useState(show);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!show) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("saved");

    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );

    /*
     * O reset acontece em callback assíncrono para evitar atualização
     * síncrona de estado dentro do effect (regra do React 19/ESLint).
     */
    const startTimer = window.setTimeout(() => {
      setVisible(true);
      setLeaving(false);
    }, 0);

    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 3000);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 3400);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className={styles.settingsToastOverlay}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`${styles.settingsToast} ${
          leaving ? styles.settingsToastLeaving : ""
        }`}
        role="status"
      >
        <span className={styles.settingsToastIcon}>
          <CheckCircle2 size={21} />
        </span>

        <div>
          <strong>{title}</strong>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
