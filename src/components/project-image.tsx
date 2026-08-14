import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { isSupportedMediaUrl } from "@/lib/portfolio";
import styles from "./project-image.module.css";

export function ProjectImage({ src, alt, className = "", priority = false, sizes = "(max-width: 720px) 100vw, 50vw" }: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src || !isSupportedMediaUrl(src)) return <div className={`${styles.fallback} ${className}`}><ImageIcon size={28} /><span>Imagem do projeto</span></div>;
  return <div className={`${styles.image} ${className}`}><Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={src.startsWith("https://")} /></div>;
}

