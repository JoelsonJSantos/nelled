import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { CampaignPlacement } from "@/components/campaign-placement";
import { SiteFooter } from "@/components/site-footer";
import { PublicLink } from "@/components/navigation/public-link";
import { SiteHeader } from "@/components/site-header";
import { contentMetadata } from "@/lib/metadata";
import { getPublishedPartner } from "@/lib/public-content";
import {
  legacyTextOrHtmlToEditorHtml,
  sanitizeRichTextHtml,
} from "@/lib/sanitize-rich-text";

import styles from "./page.module.css";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const partner = await getPublishedPartner(slug);

  if (!partner) {
    return {
      title: "Parceiro não encontrado",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return contentMetadata(
    partner.seo,
    partner.name,
    partner.short_description ||
      `Conheça ${partner.name}, parceiro do ecossistema Nelled Studio.`,
  );
}

export default async function Partner({ params }: Props) {
  const { slug } = await params;
  const data = await getPublishedPartner(slug);

  if (!data) {
    notFound();
  }

  const content =
    typeof data.content === "object" && data.content
      ? (data.content as {
          body?: string;
          html?: string;
        })
      : {};

  const richHtml = sanitizeRichTextHtml(
    legacyTextOrHtmlToEditorHtml(content.html ?? content.body ?? ""),
  );

  const targetUrl = data.affiliate_url || data.website_url;
  const hasAffiliateLink = Boolean(data.affiliate_url);

  return (
    <>
      <SiteHeader />

      <main className="inner-page">
        <p className="eyebrow">PARCEIRO NELLED STUDIO</p>
        <h1>{data.name}</h1>
        <p className="lede">{data.short_description}</p>

        <div className={styles.contentLayout}>
          <article className={`${styles.article} article-content`}>
            {richHtml && (
              <div
                className={styles.richText}
                dangerouslySetInnerHTML={{ __html: richHtml }}
              />
            )}

            {hasAffiliateLink && (
              <p>
                <small>
                  Transparência: este conteúdo pode utilizar link de afiliado. A
                  Nelled Studio poderá receber uma comissão caso uma contratação ou
                  compra seja realizada por esse link, sem custo adicional por esse
                  motivo.
                </small>
              </p>
            )}

            {(data.coupon || targetUrl) && (
              <section className={styles.commercial} aria-label="Informações comerciais">
                {data.coupon && (
                  <div className={styles.coupon}>
                    <span>Cupom</span>
                    <strong>{data.coupon}</strong>
                  </div>
                )}

                {targetUrl && (
                  <PublicLink
                    className="button primary"
                    href={targetUrl}
                    target="_blank"
                    rel={hasAffiliateLink ? "sponsored noreferrer" : "noopener noreferrer"}
                  >
                    Conhecer parceiro
                    <ArrowUpRight size={17} />
                  </PublicLink>
                )}
              </section>
            )}
          </article>

          <div className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <CampaignPlacement placement="partner-detail" />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
