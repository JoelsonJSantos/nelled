"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import styles from "@/components/admin/admin-ui.module.css";

export function SettingsSavedToast({
  show,
}: {
  show: boolean;
}) {
  const [visible, setVisible] =
    useState(show);

  const [leaving, setLeaving] =
    useState(false);

  useEffect(() => {
    if (!show) return;

    /*
     * Remove ?saved=1 da URL sem recarregar.
     * Assim o aviso não volta ao apertar F5.
     */
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );

    const leaveTimer =
      window.setTimeout(() => {
        setLeaving(true);
      }, 3000);

    const removeTimer =
      window.setTimeout(() => {
        setVisible(false);
      }, 3400);

    return () => {
      window.clearTimeout(
        leaveTimer,
      );

      window.clearTimeout(
        removeTimer,
      );
    };
  }, [show]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={
        styles.settingsToastOverlay
      }
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`${styles.settingsToast} ${
          leaving
            ? styles.settingsToastLeaving
            : ""
        }`}
        role="status"
      >
        <span
          className={
            styles.settingsToastIcon
          }
        >
          <CheckCircle2
            size={21}
          />
        </span>

        <div>
          <strong>
            Configurações salvas
          </strong>

          <span>
            As alterações foram
            salvas com sucesso.
          </span>
        </div>
      </div>
    </div>
  );
}