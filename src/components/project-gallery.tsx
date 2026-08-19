"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { ProjectImage } from "@/components/project-image";

import styles from "./project-gallery.module.css";

type ProjectGalleryProps = {
  images: string[];
  projectName: string;
};

type Pan = {
  x: number;
  y: number;
};

type TouchMode = "swipe" | "pinch" | "pan" | null;

type TouchGesture = {
  mode: TouchMode;
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
  startDistance: number;
  startZoom: number;
};

const DESKTOP_PREVIEW_LIMIT = 6;
const MOBILE_PREVIEW_LIMIT = 4;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const SWIPE_THRESHOLD = 52;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type TouchPointList = {
  readonly length: number;
  readonly [index: number]: {
    readonly clientX: number;
    readonly clientY: number;
  };
};

function getTouchDistance(touches: TouchPointList) {
  if (touches.length < 2) return 0;

  const first = touches[0];
  const second = touches[1];

  return Math.hypot(
    second.clientX - first.clientX,
    second.clientY - first.clientY,
  );
}

export function ProjectGallery({
  images,
  projectName,
}: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [isMouseDragging, setIsMouseDragging] = useState(false);

  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const zoomViewport = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const touchGesture = useRef<TouchGesture>({
    mode: null,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    startDistance: 0,
    startZoom: MIN_ZOOM,
  });

  const mouseGesture = useRef({
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const clampPan = useCallback((nextPan: Pan, nextZoom: number): Pan => {
    if (nextZoom <= MIN_ZOOM) {
      return { x: 0, y: 0 };
    }

    const viewport = zoomViewport.current;

    if (!viewport) return nextPan;

    const maxX = (viewport.clientWidth * (nextZoom - 1)) / 2;
    const maxY = (viewport.clientHeight * (nextZoom - 1)) / 2;

    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    };
  }, []);

  const resetView = useCallback(() => {
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
    setIsInteracting(false);
    setIsMouseDragging(false);
  }, []);

  const showPrevious = useCallback(() => {
    if (images.length <= 1) return;

    resetView();
    setActiveIndex((current) =>
      current === null
        ? null
        : (current - 1 + images.length) % images.length,
    );
  }, [images.length, resetView]);

  const showNext = useCallback(() => {
    if (images.length <= 1) return;

    resetView();
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  }, [images.length, resetView]);

  const closeGallery = useCallback(() => {
    resetView();
    setActiveIndex(null);
  }, [resetView]);

  const isOpen = activeIndex !== null;

  useEffect(() => {
    if (!isOpen) {
      trigger.current?.focus();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGallery();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeGallery, isOpen, showNext, showPrevious]);

  if (!images.length) return null;

  const previewImages = images.slice(0, DESKTOP_PREVIEW_LIMIT);
  const desktopRemaining = Math.max(
    0,
    images.length - DESKTOP_PREVIEW_LIMIT,
  );
  const mobileRemaining = Math.max(
    0,
    images.length - MOBILE_PREVIEW_LIMIT,
  );

  const transition = reduceMotion
    ? { duration: 0 }
    : {
        duration: 0.22,
        ease: "easeOut" as const,
      };

  const openImage = (
    index: number,
    button: HTMLButtonElement,
  ) => {
    trigger.current = button;
    resetView();
    setActiveIndex(index);
  };

  const setZoomLevel = (nextZoom: number) => {
    const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

    setZoom(clampedZoom);
    setPan((current) => clampPan(current, clampedZoom));
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const direction = event.deltaY < 0 ? 1 : -1;
    const step = Math.abs(event.deltaY) > 45 ? 0.24 : 0.14;

    setZoomLevel(zoom + direction * step);
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length >= 2) {
      setIsInteracting(true);

      touchGesture.current = {
        mode: "pinch",
        startX: 0,
        startY: 0,
        startPanX: pan.x,
        startPanY: pan.y,
        startDistance: getTouchDistance(event.touches),
        startZoom: zoom,
      };

      return;
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const mode: TouchMode = zoom > MIN_ZOOM ? "pan" : "swipe";

      if (mode === "pan") {
        setIsInteracting(true);
      }

      touchGesture.current = {
        mode,
        startX: touch.clientX,
        startY: touch.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
        startDistance: 0,
        startZoom: zoom,
      };
    }
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    const gesture = touchGesture.current;

    if (gesture.mode === "pinch" && event.touches.length >= 2) {
      const currentDistance = getTouchDistance(event.touches);

      if (gesture.startDistance <= 0) return;

      const nextZoom = clamp(
        gesture.startZoom * (currentDistance / gesture.startDistance),
        MIN_ZOOM,
        MAX_ZOOM,
      );

      setZoom(nextZoom);
      setPan((current) => clampPan(current, nextZoom));
      return;
    }

    if (
      gesture.mode === "pan" &&
      event.touches.length === 1 &&
      zoom > MIN_ZOOM
    ) {
      const touch = event.touches[0];
      const nextPan = {
        x: gesture.startPanX + touch.clientX - gesture.startX,
        y: gesture.startPanY + touch.clientY - gesture.startY,
      };

      setPan(clampPan(nextPan, zoom));
    }
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const gesture = touchGesture.current;

    if (gesture.mode === "pinch" && event.touches.length === 1) {
      const touch = event.touches[0];

      touchGesture.current = {
        mode: zoom > MIN_ZOOM ? "pan" : "swipe",
        startX: touch.clientX,
        startY: touch.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
        startDistance: 0,
        startZoom: zoom,
      };

      return;
    }

    if (gesture.mode === "swipe" && event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - gesture.startX;
      const deltaY = touch.clientY - gesture.startY;

      if (
        Math.abs(deltaX) >= SWIPE_THRESHOLD &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.2
      ) {
        if (deltaX < 0) {
          showNext();
        } else {
          showPrevious();
        }
      }
    }

    touchGesture.current.mode = null;
    setIsInteracting(false);
  };

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || zoom <= MIN_ZOOM) return;

    event.preventDefault();

    mouseGesture.current = {
      startX: event.clientX,
      startY: event.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };

    setIsMouseDragging(true);
    setIsInteracting(true);
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!isMouseDragging || zoom <= MIN_ZOOM) return;

    event.preventDefault();

    const nextPan = {
      x:
        mouseGesture.current.startPanX +
        event.clientX -
        mouseGesture.current.startX,
      y:
        mouseGesture.current.startPanY +
        event.clientY -
        mouseGesture.current.startY,
    };

    setPan(clampPan(nextPan, zoom));
  };

  const stopMouseDrag = () => {
    setIsMouseDragging(false);
    setIsInteracting(false);
  };

  return (
    <section className={styles.gallery}>
      <div className={styles.sectionHeading}>
        <p className="eyebrow">GALERIA</p>
        <h2>Detalhes do projeto</h2>
        <p className={styles.galleryHint}>
          {images.length === 1
            ? "Clique na imagem para ampliar."
            : `${images.length} imagens · clique para visualizar em tela cheia.`}
        </p>
      </div>

      <div className={styles.grid}>
        {previewImages.map((image, index) => {
          const showDesktopMore =
            index === DESKTOP_PREVIEW_LIMIT - 1 &&
            desktopRemaining > 0;
          const showMobileMore =
            index === MOBILE_PREVIEW_LIMIT - 1 &&
            mobileRemaining > 0;

          return (
            <button
              className={`${styles.thumbnail} ${
                showMobileMore ? styles.mobileMoreThumbnail : ""
              }`}
              type="button"
              onClick={(event) =>
                openImage(index, event.currentTarget)
              }
              aria-label={`Abrir imagem ${index + 1} de ${images.length} do projeto ${projectName}`}
              key={`${image}-${index}`}
            >
              <ProjectImage
                src={image}
                alt={`${projectName}, imagem ${index + 1}`}
                sizes={
                  index === 0
                    ? "(max-width: 720px) 100vw, 66vw"
                    : "(max-width: 720px) 50vw, 33vw"
                }
                className={styles.galleryItem}
              />

              {showDesktopMore && (
                <span
                  className={`${styles.moreImages} ${styles.moreDesktop}`}
                  aria-hidden="true"
                >
                  <strong>+{desktopRemaining}</strong>
                  <small>imagens</small>
                </span>
              )}

              {showMobileMore && (
                <span
                  className={`${styles.moreImages} ${styles.moreMobile}`}
                  aria-hidden="true"
                >
                  <strong>+{mobileRemaining}</strong>
                  <small>imagens</small>
                </span>
              )}
            </button>
          );
        })}
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
              if (event.currentTarget === event.target) {
                closeGallery();
              }
            }}
          >
            <motion.div
              className={styles.dialog}
              role="dialog"
              aria-modal="true"
              aria-label={`Galeria do projeto ${projectName}`}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.98,
                      y: 8,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      scale: 0.98,
                      y: 8,
                    }
              }
              transition={transition}
            >
              <div
                ref={zoomViewport}
                className={`${styles.zoomViewport} ${
                  zoom > MIN_ZOOM ? styles.zoomed : ""
                } ${isMouseDragging ? styles.dragging : ""}`}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={stopMouseDrag}
                onMouseLeave={stopMouseDrag}
                onDoubleClick={() => {
                  if (zoom > MIN_ZOOM) {
                    resetView();
                  } else {
                    setZoomLevel(2);
                  }
                }}
              >
                <div
                  className={`${styles.zoomContent} ${
                    isInteracting ? styles.interacting : ""
                  }`}
                  style={{
                    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                  }}
                >
                  <ProjectImage
                    src={images[activeIndex]}
                    alt={`${projectName}, imagem ampliada ${activeIndex + 1}`}
                    sizes="100vw"
                    className={styles.modalImage}
                  />
                </div>
              </div>

              <button
                ref={closeButton}
                className={styles.close}
                type="button"
                onClick={closeGallery}
                aria-label="Fechar galeria"
              >
                <X size={22} />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    className={`${styles.arrow} ${styles.previous}`}
                    type="button"
                    onClick={showPrevious}
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft size={26} />
                  </button>

                  <button
                    className={`${styles.arrow} ${styles.next}`}
                    type="button"
                    onClick={showNext}
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight size={26} />
                  </button>
                </>
              )}

              <span className={styles.counter}>
                {activeIndex + 1} / {images.length}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
