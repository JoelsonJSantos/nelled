"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./admin-toast.module.css";

type AdminToastProps = {
  message: string;
  type: "success" | "error";
  title?: string;
};

export function AdminToast({ message, type, title }: AdminToastProps) {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();
  const normalizedMessage = message.trim();
  const normalizedTitle = title?.trim() || (type === "error" ? "Não foi possível concluir" : "Alterações salvas");

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), type === "error" ? 6000 : 4000);
    return () => window.clearTimeout(timer);
  }, [type]);

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  return (
    <AnimatePresence>
      {visible && normalizedMessage && (
        <div className={styles.overlay} aria-live={type === "error" ? "assertive" : "polite"} aria-atomic="true">
          <motion.div
            className={`${styles.toast} ${type === "error" ? styles.error : styles.success}`}
            role={type === "error" ? "alert" : "status"}
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={transition}
          >
            <span className={styles.icon}>
              {type === "error" ? <XCircle size={21} /> : <CheckCircle2 size={21} />}
            </span>
            <span className={styles.content}>
              <strong>{normalizedTitle}</strong>
              <span>{normalizedMessage}</span>
            </span>
            <button type="button" onClick={() => setVisible(false)} aria-label="Fechar notificação"><X size={16} /></button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
