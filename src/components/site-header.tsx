"use client";

import Link from "next/link";
import { Menu, Sun, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { BrandLogo } from "@/components/brand-logo";
import styles from "./site-header.module.css";

const nav = [
  ["Início", "/"],
  ["Sobre", "/sobre"],
  ["Portfólio", "/portfolio"],
  ["Blog", "/blog"],
  ["Contato", "/contato"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  const closeButton = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", open);

    if (!open) {
      return () => {
        document.body.classList.remove("mobile-nav-open");
      };
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    closeButton.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("mobile-nav-open");
    };
  }, [open]);

  const toggleTheme = () => {
  const root = document.documentElement;
  const isLight = !root.classList.contains("light");

  root.classList.toggle("light", isLight);

  const theme = isLight ? "light" : "dark";

  localStorage.setItem("theme", theme);
  root.style.colorScheme = theme;
};

  const transition = reduceMotion
    ? { duration: 0 }
    : {
        duration: 0.22,
        ease: "easeOut" as const,
      };

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <header>
      <nav className="nav" aria-label="Navegação principal">
        <BrandLogo compact />

        <div className="nav-links">
          {nav.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            <Sun size={18} />
          </button>

          <Link
            className="quote-link"
            href="/contato"
          >
            Solicitar orçamento
          </Link>

          <button
            type="button"
            className="menu"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label="Abrir menu"
          >
            <Menu />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            <motion.button
              type="button"
              className={styles.backdrop}
              aria-label="Fechar menu"
              onClick={closeMenu}
            />

            <motion.section
              id="mobile-navigation"
              className={styles.panel}
              role="dialog"
              aria-modal="true"
              aria-label="Menu principal"
              initial={
                reduceMotion
                  ? false
                  : {
                      x: 24,
                      opacity: 0,
                    }
              }
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      x: 24,
                      opacity: 0,
                    }
              }
              transition={transition}
            >
              <div className={styles.top}>
                <BrandLogo compact />

                <div className={styles.actions}>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={toggleTheme}
                    aria-label="Alternar tema"
                  >
                    <Sun size={18} />
                  </button>

                  <button
                    ref={closeButton}
                    type="button"
                    className="icon-button"
                    onClick={closeMenu}
                    aria-label="Fechar menu"
                  >
                    <X />
                  </button>
                </div>
              </div>

              <nav
                className={styles.links}
                aria-label="Navegação mobile"
              >
                {nav.map(
                  ([label, href], index) => (
                    <motion.div
                      key={href}
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              y: 8,
                            }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              delay: 0.04 * index,
                              duration: 0.18,
                            }
                      }
                    >
                      <Link
                        href={href}
                        onClick={closeMenu}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  )
                )}
              </nav>

              <Link
                className={styles.cta}
                href="/contato"
                onClick={closeMenu}
              >
                Solicitar orçamento
              </Link>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}