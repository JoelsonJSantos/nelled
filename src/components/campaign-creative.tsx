"use client";
/* eslint-disable @next/next/no-img-element -- <picture> with getImageProps is the documented Next.js pattern for responsive art direction. */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { getImageProps } from "next/image";
import { usePathname } from "next/navigation";

import {
  readPrivacyConsent,
  readPrivacyConsentSnapshot,
  subscribePrivacyConsent,
} from "@/lib/privacy-consent";
import {
  CAMPAIGN_ROTATION_INTERVAL_MS,
  campaignCreativeFormatForPlacement,
  campaignCreativeFormatsForPlacement,
  campaignPlacementVisualVariant,
  type CampaignPlacement,
  type CampaignEventType,
} from "@/lib/campaigns";
import type { PublicCampaign } from "@/lib/public-campaigns";

import styles from "./campaign-placement.module.css";

function isExternalUrl(value: string, siteOrigin: string) {
  try {
    return new URL(value).origin !== new URL(siteOrigin).origin;
  } catch {
    return false;
  }
}

function campaignIndex(clockSlot: number, length: number) {
  return ((clockSlot % length) + length) % length;
}

export function CampaignCreative({
  campaigns,
  placement,
  consentVersion,
  siteOrigin,
  initialClockSlot,
}: {
  campaigns: PublicCampaign[];
  placement: CampaignPlacement;
  consentVersion: string;
  siteOrigin: string;
  initialClockSlot: number;
}) {
  const pathname = usePathname();
  const creativeRef = useRef<HTMLElement>(null);
  const sentImpressions = useRef(new Set<string>());
  const [clockSlot, setClockSlot] = useState(initialClockSlot);
  const isVisible = useCampaignVisibility(creativeRef);
  const snapshot = useSyncExternalStore(
    subscribePrivacyConsent,
    () => readPrivacyConsentSnapshot(consentVersion),
    () => "",
  );
  const canTrack = useMemo(
    () => Boolean(snapshot && readPrivacyConsent(consentVersion)?.preferences.advertising),
    [consentVersion, snapshot],
  );
  const activeIndex = campaignIndex(clockSlot, campaigns.length);
  const activeCampaign = campaigns[activeIndex];
  const desktopFormat = campaignCreativeFormatForPlacement(placement);
  const [, mobileFormat = desktopFormat] = campaignCreativeFormatsForPlacement(placement);
  const visualVariant = campaignPlacementVisualVariant(placement);
  const mobileVisualVariant = campaignPlacementVisualVariant(placement, "mobile");

  const sendEvent = useCallback(
    (campaignId: string, eventType: CampaignEventType) => {
      if (!canTrack) return;

      const pagePath = pathname || "/";
      const storageKey = `nelled:campaign-event:${eventType}:${campaignId}:${placement}:${pagePath}`;

      try {
        if (window.sessionStorage.getItem(storageKey)) return;
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        // Sem sessionStorage, o Set local ainda evita duplicação no mesmo mount.
      }

      const body = JSON.stringify({ campaignId, eventType, placement, pagePath });

      if (navigator.sendBeacon) {
        const queued = navigator.sendBeacon(
          "/api/campaign-events",
          new Blob([body], { type: "application/json" }),
        );
        if (queued) return;
      }

      void fetch("/api/campaign-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        credentials: "same-origin",
      }).catch(() => undefined);
    },
    [canTrack, pathname, placement],
  );

  useEffect(() => {
    const synchronize = () => setClockSlot(Math.floor(Date.now() / CAMPAIGN_ROTATION_INTERVAL_MS));
    const remaining = CAMPAIGN_ROTATION_INTERVAL_MS - (Date.now() % CAMPAIGN_ROTATION_INTERVAL_MS);
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      synchronize();
      interval = window.setInterval(synchronize, CAMPAIGN_ROTATION_INTERVAL_MS);
    }, remaining);

    synchronize();
    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const pagePath = pathname || "/";
    const impressionKey = `${activeCampaign?.id ?? ""}:${placement}:${pagePath}`;
    if (!activeCampaign || !isVisible || !canTrack || sentImpressions.current.has(impressionKey)) return;
    sentImpressions.current.add(impressionKey);
    sendEvent(activeCampaign.id, "impression");
  }, [activeCampaign, canTrack, isVisible, pathname, placement, sendEvent]);

  return (
    <aside
      ref={creativeRef}
      className={styles.wrapper}
      data-variant={visualVariant}
      data-mobile-variant={mobileVisualVariant}
      aria-label="Banner patrocinado"
    >
      <div className={styles.carousel}>
        <span className={styles.label} aria-hidden="true">Ads</span>
        {campaigns.map((campaign, index) => {
          const active = index === activeIndex;
          const external = campaign.targetUrl && isExternalUrl(campaign.targetUrl, siteOrigin);
          const desktopCreative = campaign.creatives[desktopFormat];
          const mobileCreative = campaign.creatives[mobileFormat];
          if (!desktopCreative || !mobileCreative) return null;

          const image = (
            <ResponsiveCampaignImage
              desktopImageUrl={desktopCreative.imageUrl}
              mobileImageUrl={mobileCreative.imageUrl}
              alt={active ? campaign.title : ""}
              placement={placement}
            />
          );

          return (
            <div key={campaign.id} className={`${styles.banner} ${active ? styles.bannerActive : ""}`} aria-hidden={!active}>
              {campaign.targetUrl ? (
                <a
                  href={campaign.targetUrl}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  tabIndex={active ? undefined : -1}
                  onClick={() => sendEvent(campaign.id, "click")}
                >
                  {image}
                </a>
              ) : image}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function ResponsiveCampaignImage({
  desktopImageUrl,
  mobileImageUrl,
  alt,
  placement,
}: {
  desktopImageUrl: string;
  mobileImageUrl: string;
  alt: string;
  placement: CampaignPlacement;
}) {
  const [desktopFormat, mobileFormat = desktopFormat] = campaignCreativeFormatsForPlacement(placement);
  const desktopIsVertical = desktopFormat === "vertical";
  const mobileIsVertical = mobileFormat === "vertical";
  const desktopSizes = desktopIsVertical ? "300px" : "(max-width: 1200px) 100vw, 1120px";
  const shared = {
    alt,
    className: styles.bannerImage,
  };
  const { props: desktopProps } = getImageProps({
    ...shared,
    src: desktopImageUrl,
    width: desktopIsVertical ? 600 : 1600,
    height: desktopIsVertical ? 1000 : 500,
    sizes: desktopSizes,
    unoptimized: desktopImageUrl.startsWith("https://"),
  });
  const { props: mobileProps } = getImageProps({
    ...shared,
    src: mobileImageUrl,
    width: mobileIsVertical ? 600 : 1600,
    height: mobileIsVertical ? 1000 : 500,
    sizes: mobileIsVertical ? "260px" : "100vw",
    unoptimized: mobileImageUrl.startsWith("https://"),
  });
  if (desktopImageUrl === mobileImageUrl) return <img {...desktopProps} alt={alt} />;

  return (
    <picture>
      <source
        media="(max-width: 820px)"
        srcSet={mobileProps.srcSet ?? mobileProps.src}
        sizes={mobileProps.sizes}
      />
      <img {...desktopProps} alt={alt} />
    </picture>
  );
}

function useCampaignVisibility(ref: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting === true),
      { threshold: 0.35 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return visible;
}
