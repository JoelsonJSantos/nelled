import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { PrivacyPreferencesButton } from "@/components/privacy/privacy-preferences-button";
import { InstagramIcon, LinkedInIcon } from "@/components/social-icons";
import { getSiteSettings, phoneHref } from "@/lib/site-settings";

import styles from "./site-footer.module.css";

function footerCopyright(template: string, companyName: string) {
  return template
    .replaceAll("{year}", String(new Date().getFullYear()))
    .replaceAll("{company}", companyName);
}

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const telephone = phoneHref(settings.phone);
  const footer = settings.pages.footer;

  return (
    <footer>
      <div className={`footer-grid ${styles.footerGrid}`}>
        <div>
          <BrandLogo compact />
          <p>{footer.tagline}</p>

          {(settings.email || settings.phone) && (
            <div className={styles.contactLinks}>
              {settings.email && (
                <a href={`mailto:${settings.email}`}>
                  <Mail size={14} />
                  <span>{settings.email}</span>
                </a>
              )}

              {settings.phone && telephone && (
                <a href={telephone}>
                  <Phone size={14} />
                  <span>{settings.phone}</span>
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h4>{footer.navigationTitle}</h4>
          <Link href="/">Início</Link>
          <Link href="/sobre">Sobre</Link>
          <Link href="/portfolio">Portfólio</Link>
          <Link href="/blog">Blog</Link>
        </div>

        <div>
          <h4>{footer.ecosystemTitle}</h4>
          <Link href="/parceiros">Parceiros</Link>
          <Link href="/contato">Contato</Link>

          {settings.instagram && (
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
              <InstagramIcon size={14} />
              <span>Instagram</span>
            </a>
          )}

          {settings.linkedin && (
            <a href={settings.linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedInIcon size={14} />
              <span>LinkedIn</span>
            </a>
          )}
        </div>

        <div>
          <h4>{footer.legalTitle}</h4>
          <Link href="/termos-de-uso">Termos de uso</Link>
          <Link href="/politica-de-privacidade">Privacidade</Link>
          <Link href="/politica-de-cookies">Cookies</Link>
          <PrivacyPreferencesButton />
        </div>
      </div>

      <div className={`footer-bottom ${styles.footerBottom}`}>
        {footerCopyright(footer.copyright, settings.companyName)}
      </div>
    </footer>
  );
}
