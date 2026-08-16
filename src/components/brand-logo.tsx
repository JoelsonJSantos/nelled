"use client";

import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({
  compact = false,
}: BrandLogoProps) {
  return (
    <div
      className={`brand-logo${
        compact ? " brand-logo-compact" : ""
      }`}
      aria-label="Nelled Studio"
    >
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