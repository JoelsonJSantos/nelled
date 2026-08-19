import { BrandLogo } from "@/components/brand-logo";
import { PublicLink } from "@/components/navigation/public-link";
import { PrivacyPreferencesButton } from "@/components/privacy/privacy-preferences-button";
import { InstagramIcon, LinkedInIcon } from "@/components/social-icons";
import { getSiteSettings } from "@/lib/site-settings";

import styles from "./site-footer.module.css";

function footerCopyright(template: string, companyName: string) {
  return template
    .replaceAll("{year}", String(new Date().getFullYear()))
    .replaceAll("{company}", companyName);
}

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const footer = settings.pages.footer;
  const instagram = settings.instagram || "https://instagram.com/nelledstudio";
  const linkedin = settings.linkedin || "https://linkedin.com/company/nelledstudio";

  return (
    <footer>
      <div className={`footer-grid ${styles.footerGrid}`}>
        <div>
          <BrandLogo compact />
          <p>{footer.tagline}</p>

          {(instagram || linkedin) && (
            <div className={styles.socialLinks} aria-label="Redes sociais">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram da Nelled Studio"
                  title="Instagram"
                >
                  <InstagramIcon size={17} />
                </a>
              )}

              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn da Nelled Studio"
                  title="LinkedIn"
                >
                  <LinkedInIcon size={17} />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h4>{footer.navigationTitle}</h4>
          <PublicLink href="/">Home</PublicLink>
          <PublicLink href="/sobre">Sobre</PublicLink>
          <PublicLink href="/projetos">Projetos</PublicLink>
          <PublicLink href="/blog">News</PublicLink>
        </div>

        <div>
          <h4>{footer.ecosystemTitle}</h4>
          <PublicLink href="/parceiros">Parceiros</PublicLink>
          <PublicLink href="/servicos">Serviços</PublicLink>
          <PublicLink href="/contato">Contato</PublicLink>
        </div>

        <div>
          <h4>{footer.legalTitle}</h4>
          <PublicLink href="/termos-de-uso">Termos de uso</PublicLink>
          <PublicLink href="/politica-de-privacidade">Privacidade</PublicLink>
          <PublicLink href="/politica-de-cookies">Cookies</PublicLink>
          <PrivacyPreferencesButton />
        </div>
      </div>

      <div className={`footer-bottom ${styles.footerBottom}`}>
        {footerCopyright(footer.copyright, settings.companyName)}
      </div>
    </footer>
  );
}
