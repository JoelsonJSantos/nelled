"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ProjectImage } from "@/components/project-image";
import styles from "./project-gallery.module.css";

type ProjectGalleryProps = {
  images: string[];
  projectName: string;
};

export function ProjectGallery({ images, projectName }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (activeIndex === null) {
      trigger.current?.focus();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft" && images.length > 1) {
        setActiveIndex((current) => current === null ? null : (current - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight" && images.length > 1) {
        setActiveIndex((current) => current === null ? null : (current + 1) % images.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, images.length]);

  if (!images.length) return null;

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" as const };

  return (
    <section className={styles.gallery}>
      <div className={styles.sectionHeading}>
        <p className="eyebrow">GALERIA</p>
        <h2>Detalhes do projeto</h2>
      </div>
      <div className={styles.grid}>
        {images.map((image, index) => (
          <button
            className={styles.thumbnail}
            type="button"
            onClick={(event) => {
              trigger.current = event.currentTarget;
              setActiveIndex(index);
            }}
            aria-label={`Ampliar imagem ${index + 1} de ${projectName}`}
            key={`${image}-${index}`}
          >
            <ProjectImage
              src={image}
              alt={`${projectName}, imagem ${index + 1}`}
              sizes="(max-width: 720px) 100vw, 50vw"
              className={styles.galleryItem}
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) setActiveIndex(null);
            }}
          >
            <motion.div
              className={styles.dialog}
              role="dialog"
              aria-modal="true"
              aria-label={`Galeria do projeto ${projectName}`}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
              transition={transition}
            >
              <button ref={closeButton} className={styles.close} type="button" onClick={() => setActiveIndex(null)} aria-label="Fechar galeria">
                <X size={22} />
              </button>
              <ProjectImage
                src={images[activeIndex]}
                alt={`${projectName}, imagem ampliada ${activeIndex + 1}`}
                sizes="100vw"
                className={styles.modalImage}
              />
              {images.length > 1 && (
                <>
                  <button className={`${styles.arrow} ${styles.previous}`} type="button" onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)} aria-label="Imagem anterior"><ChevronLeft size={26} /></button>
                  <button className={`${styles.arrow} ${styles.next}`} type="button" onClick={() => setActiveIndex((activeIndex + 1) % images.length)} aria-label="Próxima imagem"><ChevronRight size={26} /></button>
                </>
              )}
              <span className={styles.counter}>{activeIndex + 1} / {images.length}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
