"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./admin-toast.module.css";

type AdminToastProps = {
  message: string;
  type: "success" | "error";
};

export function AdminToast({ message, type }: AdminToastProps) {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), type === "error" ? 6000 : 4000);
    return () => window.clearTimeout(timer);
  }, [type]);

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`${styles.toast} ${type === "error" ? styles.error : styles.success}`}
          role={type === "error" ? "alert" : "status"}
          initial={reduceMotion ? false : { opacity: 0, y: -8, x: 8 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, x: 6 }}
          transition={transition}
        >
          {type === "error" ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message}</span>
          <button type="button" onClick={() => setVisible(false)} aria-label="Fechar notificação"><X size={15} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
