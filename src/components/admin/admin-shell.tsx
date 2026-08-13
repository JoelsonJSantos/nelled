"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import styles from "./admin-shell.module.css";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setMenuOpen(false), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className={styles.shell}>
      <button
        className={`${styles.backdrop} ${menuOpen ? styles.backdropVisible : ""}`}
        type="button"
        aria-label="Fechar menu administrativo"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={styles.workspace}>
        <AdminHeader
          menuOpen={menuOpen}
          menuButtonRef={menuButtonRef}
          onMenuOpen={() => setMenuOpen(true)}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
