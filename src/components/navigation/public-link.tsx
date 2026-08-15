"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { useRouteTransition } from "./route-transition-loader";

type PublicLinkProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

function shouldStartTransition(event: MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const anchor = event.currentTarget;
  if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return false;

  const destination = new URL(anchor.href, window.location.href);
  if (destination.origin !== window.location.origin || destination.pathname.startsWith("/admin")) return false;

  return `${window.location.pathname}${window.location.search}` !== `${destination.pathname}${destination.search}`;
}

export function PublicLink({ onClick, ...props }: PublicLinkProps) {
  const { startTransition } = useRouteTransition();

  return <Link {...props} onClick={(event) => { onClick?.(event); if (shouldStartTransition(event)) startTransition(); }} />;
}
