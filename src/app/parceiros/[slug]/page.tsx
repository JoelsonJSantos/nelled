import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contentMetadata } from "@/lib/metadata";
import { getPublishedPartner } from "@/lib/public-content";

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
        })
      : {};

  const targetUrl = data.affiliate_url || data.website_url;
  const hasAffiliateLink = Boolean(data.affiliate_url);

  return (
    <>
      <SiteHeader />

      <main className="inner-page">
        <p className="eyebrow">PARCEIRO NELLED STUDIO</p>
        <h1>{data.name}</h1>
        <p className="lede">{data.short_description}</p>

        <article className="article-content">
          <p>{content.body ?? ""}</p>

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

          {data.coupon && (
            <p>
              <strong>Cupom:</strong> {data.coupon}
            </p>
          )}

          {targetUrl && (
            <Link
              className="button primary"
              href={targetUrl}
              target="_blank"
              rel={hasAffiliateLink ? "sponsored noreferrer" : "noopener noreferrer"}
            >
              Conhecer parceiro
              <ArrowUpRight size={17} />
            </Link>
          )}
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
