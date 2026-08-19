"use client";

import { useState } from "react";

type ArticleShareButtonProps = {
  title: string;
  className?: string;
};

export function ArticleShareButton({
  title,
  className,
}: ArticleShareButtonProps) {
  const [copied, setCopied] =
    useState(false);

  async function handleShare() {
    const url =
      window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url,
        });

        return;
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(
        url,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      return;
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleShare}
      aria-label={`Compartilhar artigo: ${title}`}
    >
      {copied
        ? "Link copiado ✓"
        : "Compartilhar ↗"}
    </button>
  );
}