"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { PageLoadingScreen } from "./page-loading-screen";

const MIN_VISIBLE_MS = 260;
const SAFETY_TIMEOUT_MS = 6000;

type PendingTransition = { sourcePath: string; startedAt: number };
type RouteTransitionContextValue = { startTransition: () => void };

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

function isPublicPath(pathname: string) {
  return !pathname.startsWith("/admin");
}

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const pendingRef = useRef<PendingTransition | null>(null);
  const safetyTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(() => isPublicPath(pathname));

  const clearTimers = useCallback(() => {
    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearTimers();
    pendingRef.current = null;
    setVisible(false);
  }, [clearTimers]);

  const finish = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - pending.startedAt));
    hideTimerRef.current = window.setTimeout(hide, remaining);
  }, [hide]);

  const startTransition = useCallback(() => {
    if (!isPublicPath(window.location.pathname)) return;

    clearTimers();
    pendingRef.current = { sourcePath: pathnameRef.current, startedAt: performance.now() };
    setVisible(true);
    safetyTimerRef.current = window.setTimeout(hide, SAFETY_TIMEOUT_MS);
  }, [clearTimers, hide]);

  useEffect(() => {
    pathnameRef.current = pathname;

    if (!isPublicPath(pathname)) {
      clearTimers();
      pendingRef.current = null;
      return;
    }

    const pending = pendingRef.current;
    if (pending && pathname !== pending.sourcePath) {
      finish();
      return;
    }

  }, [clearTimers, finish, pathname]);

  useEffect(() => {
    if (!isPublicPath(window.location.pathname)) return;

    // The initial public document includes the loading screen in its HTML.
    // This effect only dismisses that first screen after hydration; route
    // transitions have their own pending state and are never dismissed here.
    const timer = window.setTimeout(() => {
      if (!pendingRef.current) setVisible(false);
    }, MIN_VISIBLE_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      if (isPublicPath(window.location.pathname)) startTransition();
      else hide();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
  }, [clearTimers, hide, startTransition]);

  const value = useMemo(() => ({ startTransition }), [startTransition]);

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
      {visible && isPublicPath(pathname) && <PageLoadingScreen />}
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);
  if (!context) throw new Error("PublicLink deve ser usado dentro de RouteTransitionProvider.");
  return context;
}
