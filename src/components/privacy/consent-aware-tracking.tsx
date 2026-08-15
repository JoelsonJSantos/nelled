"use client";

import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useCallback, useMemo, useSyncExternalStore } from "react";

import {
  emptyPrivacyPreferences,
  readPrivacyConsent,
  readPrivacyConsentSnapshot,
  subscribePrivacyConsent,
} from "@/lib/privacy-consent";

export function ConsentAwareTracking({
  version,
}: {
  version: string;
}) {
  const pathname = usePathname();

  const getSnapshot = useCallback(
    () => readPrivacyConsentSnapshot(version),
    [version],
  );

  const snapshot = useSyncExternalStore(
    subscribePrivacyConsent,
    getSnapshot,
    () => "",
  );

  const preferences = useMemo(() => {
    if (!snapshot) {
      return emptyPrivacyPreferences;
    }

    return (
      readPrivacyConsent(version)?.preferences ??
      emptyPrivacyPreferences
    );
  }, [snapshot, version]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {preferences.analytics && <Analytics />}
      {preferences.performance && <SpeedInsights />}
    </>
  );
}
