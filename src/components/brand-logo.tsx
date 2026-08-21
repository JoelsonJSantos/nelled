"use client";

import Image from "next/image";

import { PublicLink } from "@/components/navigation/public-link";

import styles from "./brand-logo.module.css";

type BrandLogoProps = {
  compact?: boolean;
  mobileHref?: string;
  onMobileClick?: () => void;
};

export function BrandLogo({
  compact = false,
  mobileHref,
  onMobileClick,
}: BrandLogoProps) {
  return (
    <div
      className={`brand-logo${
        compact ? " brand-logo-compact" : ""
      }`}
      aria-label="Nelled Studio"
    >
      {mobileHref && (
        <PublicLink
          href={mobileHref}
          className={styles.mobileHomeLink}
          aria-label="Ir para a página inicial"
          onClick={onMobileClick}
        />
      )}

      <Image
        className="brand-logo-dark"
        src="/nelled-studio-logo-dark.png"
        alt="Nelled Studio"
        width={1045}
        height={686}
        sizes={compact ? "96px" : "104px"}
        quality={100}
        priority
      />

      <Image
        className="brand-logo-light"
        src="/nelled-studio-logo-light.png"
        alt=""
        aria-hidden="true"
        width={1045}
        height={686}
        sizes={compact ? "96px" : "104px"}
        quality={100}
        priority
      />
    </div>
  );
}