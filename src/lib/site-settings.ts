import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type HomePageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroSecondary: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  servicesEyebrow: string;
  servicesTitle: string;
  portfolioEyebrow: string;
  portfolioTitle: string;
  portfolioLinkLabel: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonLabel: string;
};

export type AboutPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  bodyTitle: string;
  body: string;
};

export type ContactPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  directEyebrow: string;
  directTitle: string;
  directDescription: string;
};

export type FooterPageContent = {
  tagline: string;
  navigationTitle: string;
  ecosystemTitle: string;
  legalTitle: string;
  copyright: string;
};

export type LegalPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  html: string;
  seoTitle: string;
  seoDescription: string;
};

export type PrivacyBannerContent = {
  version: string;
  title: string;
  description: string;
  acceptLabel: string;
  rejectLabel: string;
  preferencesLabel: string;
  saveLabel: string;
  modalTitle: string;
  modalDescription: string;
};

export type PublicPageSettings = {
  home: HomePageContent;
  sobre: AboutPageContent;
  contato: ContactPageContent;
  footer: FooterPageContent;
  termosDeUso: LegalPageContent;
  politicaDePrivacidade: LegalPageContent;
  politicaDeCookies: LegalPageContent;
  privacyBanner: PrivacyBannerContent;
};

export type PublicSiteSettings = {
  companyName: string;
  email: string;
  phone: string;
  instagram: string;
  linkedin: string;
  domain: string;
  seoTitle: string;
  seoDescription: string;
  pages: PublicPageSettings;
};

const termsHtml = `
<h2>1. Sobre estes Termos</h2>
<p>Estes Termos de Uso disciplinam o acesso e a utilização do site da {company}. Ao navegar pelos canais públicos do site, o visitante declara estar ciente das condições descritas nesta página.</p>

<h2>2. Conteúdo e serviços</h2>
<p>A {company} apresenta informações institucionais, portfólio, artigos, parceiros, canais de contato e informações sobre serviços digitais. Propostas comerciais, escopos, prazos, valores e condições específicas somente produzem efeitos quando formalizados entre as partes.</p>

<h2>3. Uso adequado do site</h2>
<p>Não é permitido utilizar o site para praticar atos ilícitos, tentar acessar áreas restritas sem autorização, interferir na disponibilidade dos serviços, explorar vulnerabilidades ou enviar conteúdo malicioso.</p>

<h2>4. Propriedade intelectual</h2>
<p>Marcas, identidade visual, textos, interfaces, códigos, imagens e demais conteúdos próprios da {company} são protegidos pela legislação aplicável. Conteúdos de terceiros permanecem sujeitos aos direitos de seus respectivos titulares.</p>

<h2>5. Parceiros, links externos e afiliados</h2>
<p>O site pode apresentar ferramentas, empresas, serviços ou ofertas de parceiros. Alguns links podem ser de afiliados e gerar comissão para a {company} quando houver contratação ou compra realizada pelo visitante, sem necessariamente alterar o preço final. Ao sair do domínio da {company}, passam a valer também os termos e políticas do site de destino.</p>

<h2>6. Anúncios e campanhas</h2>
<p>O site poderá exibir campanhas institucionais, anúncios próprios ou materiais de parceiros. Quando uma tecnologia publicitária exigir armazenamento ou tratamento opcional no dispositivo do visitante, sua ativação observará as preferências de privacidade escolhidas no banner do site.</p>

<h2>7. Disponibilidade e alterações</h2>
<p>Recursos do site podem ser atualizados, interrompidos ou modificados para manutenção, segurança, evolução técnica ou adequação do conteúdo. A {company} poderá revisar estes Termos sempre que necessário.</p>

<h2>8. Contato</h2>
<p>Dúvidas sobre estes Termos podem ser encaminhadas pelo e-mail {email} ou pela página de contato do site.</p>
`;

const privacyHtml = `
<h2>1. Compromisso com a privacidade</h2>
<p>A {company} busca tratar dados pessoais com transparência, segurança e de forma compatível com as finalidades informadas ao visitante. Esta política explica, em linhas gerais, quais dados podem ser tratados durante o uso do site.</p>

<h2>2. Dados enviados pelo visitante</h2>
<p>Quando o formulário de contato é utilizado, podem ser informados nome, empresa, e-mail, WhatsApp, tipo de projeto, faixa de investimento e mensagem. Esses dados são utilizados para receber, registrar, analisar e responder solicitações comerciais ou de atendimento.</p>

<h2>3. Armazenamento e envio das solicitações</h2>
<p>As solicitações do formulário podem ser registradas na infraestrutura de banco de dados utilizada pelo site e encaminhadas por e-mail para a equipe responsável. Os dados são mantidos pelo período necessário para atender a solicitação, manter histórico comercial legítimo, proteger direitos e cumprir obrigações aplicáveis.</p>

<h2>4. Métricas de acesso e desempenho</h2>
<p>Quando autorizadas nas preferências de privacidade, poderão ser ativados recursos de métricas de acesso e desempenho, incluindo Vercel Web Analytics e Vercel Speed Insights. Esses recursos são utilizados para compreender o uso agregado do site, identificar páginas acessadas e acompanhar indicadores técnicos de desempenho.</p>

<h2>5. Parceiros, links de afiliados e sites externos</h2>
<p>O site pode apresentar links para parceiros e serviços externos, inclusive links de afiliados. A navegação em sites de terceiros está sujeita às respectivas políticas de privacidade e práticas de tratamento de dados desses terceiros.</p>

<h2>6. Publicidade</h2>
<p>Recursos publicitários que dependam de tecnologias opcionais de rastreamento ou medição somente deverão ser ativados quando a preferência correspondente estiver autorizada pelo visitante. Campanhas meramente visuais e sem rastreamento podem ser exibidas sem esse tipo de tecnologia.</p>

<h2>7. Segurança</h2>
<p>São adotadas medidas técnicas e administrativas compatíveis com a operação do site para reduzir riscos de acesso não autorizado, perda, alteração ou divulgação indevida de dados. Nenhum ambiente eletrônico, contudo, pode ser considerado absolutamente imune a incidentes.</p>

<h2>8. Direitos e solicitações</h2>
<p>O titular pode solicitar informações e exercer direitos previstos na legislação aplicável por meio do e-mail {email} ou da página de contato. A solicitação poderá exigir confirmação de identidade quando necessário para proteção do próprio titular.</p>

<h2>9. Atualizações desta Política</h2>
<p>Esta Política poderá ser atualizada para refletir mudanças no site, nas ferramentas utilizadas, em parceiros ou em requisitos legais. Alterações relevantes poderão resultar em nova solicitação de preferências de privacidade.</p>
`;

const cookiesHtml = `
<h2>1. Cookies e tecnologias semelhantes</h2>
<p>Cookies e mecanismos de armazenamento local podem ser usados para manter preferências, viabilizar funcionalidades e registrar escolhas de privacidade. Esta página também descreve tecnologias de métricas e publicidade relacionadas ao funcionamento do site.</p>

<h2>2. Recursos necessários</h2>
<p>Recursos estritamente necessários permanecem ativos porque viabilizam funções solicitadas pelo próprio visitante, como a preferência de tema e o registro local das escolhas feitas no painel de privacidade.</p>

<h2>3. Analytics</h2>
<p>Quando autorizado, o site pode carregar o Vercel Web Analytics para gerar estatísticas agregadas de acesso. A categoria pode ser ativada ou desativada a qualquer momento no painel de preferências.</p>

<h2>4. Performance</h2>
<p>Quando autorizado, o Vercel Speed Insights pode coletar métricas técnicas de desempenho, como Core Web Vitals, tipo de dispositivo, navegador, rota acessada e condições de rede, com a finalidade de avaliar e melhorar a experiência do site.</p>

<h2>5. Publicidade</h2>
<p>A categoria Publicidade fica preparada para integrações futuras que utilizem identificadores, cookies ou tecnologias semelhantes para medição de campanhas ou personalização. Recursos dessa natureza somente serão carregados quando houver autorização correspondente.</p>

<h2>6. Parceiros e links externos</h2>
<p>Clicar em links de parceiros ou afiliados pode direcionar o visitante para outro domínio. O site de destino poderá utilizar seus próprios cookies e tecnologias, sujeitos à política daquele terceiro.</p>

<h2>7. Como alterar sua escolha</h2>
<p>O visitante pode reabrir o painel de preferências pelo rodapé do site e modificar as categorias opcionais a qualquer momento. A alteração passa a valer para carregamentos posteriores dos recursos controlados pelo painel.</p>
`;

export const defaultPageSettings: PublicPageSettings = {
  home: {
    heroEyebrow: "DESENVOLVIMENTO · DESIGN · TECNOLOGIA",
    heroTitle: "Criando soluções",
    heroAccent: "digitais.",
    heroDescription:
      "Websites, sistemas, plataformas e produtos digitais que impulsionam negócios e transformam ideias em resultados.",
    heroSecondary:
      "Da estratégia à entrega, desenvolvemos experiências digitais completas com tecnologia, design inteligente e foco em performance.",
    primaryCtaLabel: "Conheça nosso trabalho",
    secondaryCtaLabel: "Fale conosco",
    servicesEyebrow: "O QUE CONSTRUÍMOS",
    servicesTitle: "Nossos serviços",
    portfolioEyebrow: "PROJETOS SELECIONADOS",
    portfolioTitle: "Portfólio em destaque",
    portfolioLinkLabel: "Ver todos os projetos",
    ctaEyebrow: "VAMOS CONVERSAR",
    ctaTitle: "Vamos tirar seu projeto do papel?",
    ctaDescription:
      "Conte com a Nelled Studio para transformar sua ideia em uma solução digital moderna, escalável e preparada para crescer.",
    ctaButtonLabel: "Fale com a Nelled Studio",
  },
  sobre: {
    eyebrow: "NOSSA ESSÊNCIA",
    title: "Tecnologia que avança com clareza.",
    description:
      "Somos um estúdio digital dedicado a transformar desafios de negócio em produtos digitais úteis, sofisticados e sustentáveis.",
    bodyTitle: "Construímos produtos com propósito.",
    body:
      "Unimos estratégia, design e tecnologia para transformar necessidades reais em experiências digitais claras, eficientes e preparadas para evoluir.\n\nCada projeto é pensado com atenção ao contexto do negócio, à experiência de quem usa e à qualidade técnica necessária para sustentar o crescimento.",
  },
  contato: {
    eyebrow: "NOVOS PROJETOS",
    title: "Vamos criar algo juntos?",
    description:
      "Conte um pouco sobre a sua ideia. Nossa equipe retornará pelo canal informado.",
    directEyebrow: "CONTATO DIRETO",
    directTitle: "",
    directDescription:
      "Prefere conversar por outro canal? Use um dos contatos oficiais abaixo.",
  },
  footer: {
    tagline: "Produtos digitais pensados para criar movimento.",
    navigationTitle: "Navegação",
    ecosystemTitle: "Ecossistema",
    legalTitle: "Legal",
    copyright: "© {year} {company}. Todos os direitos reservados.",
  },
  termosDeUso: {
    eyebrow: "LEGAL",
    title: "Termos de Uso",
    description:
      "Regras e condições aplicáveis ao uso dos canais digitais da Nelled Studio.",
    html: termsHtml,
    seoTitle: "Termos de Uso",
    seoDescription:
      "Consulte os termos e condições de uso do site e dos serviços digitais da Nelled Studio.",
  },
  politicaDePrivacidade: {
    eyebrow: "PRIVACIDADE",
    title: "Política de Privacidade",
    description:
      "Transparência sobre o tratamento e a proteção de dados pessoais.",
    html: privacyHtml,
    seoTitle: "Política de Privacidade",
    seoDescription:
      "Entenda como a Nelled Studio trata dados pessoais enviados pelo site e utiliza recursos de métricas, parceiros e publicidade.",
  },
  politicaDeCookies: {
    eyebrow: "COOKIES",
    title: "Política de Cookies",
    description:
      "Informações sobre preferências, métricas, desempenho e tecnologias utilizadas no site.",
    html: cookiesHtml,
    seoTitle: "Política de Cookies",
    seoDescription:
      "Saiba como a Nelled Studio utiliza cookies, armazenamento local, métricas de acesso, desempenho e preferências de publicidade.",
  },
  privacyBanner: {
    version: "1",
    title: "Privacidade e preferências",
    description:
      "Usamos recursos necessários para o funcionamento do site. Com sua autorização, também podemos ativar métricas de acesso, desempenho e recursos publicitários opcionais.",
    acceptLabel: "Aceitar opcionais",
    rejectLabel: "Rejeitar opcionais",
    preferencesLabel: "Preferências",
    saveLabel: "Salvar preferências",
    modalTitle: "Preferências de privacidade",
    modalDescription:
      "Escolha quais recursos opcionais podem ser ativados. Você poderá alterar essa decisão a qualquer momento pelo rodapé.",
  },
};

const defaults: PublicSiteSettings = {
  companyName: "Nelled Studio",
  email: "",
  phone: "",
  instagram: "",
  linkedin: "",
  domain: "https://nelled.vercel.app",
  seoTitle: "Nelled Studio — Criando soluções digitais",
  seoDescription:
    "Desenvolvimento de produtos digitais, plataformas e sistemas personalizados.",
  pages: defaultPageSettings,
};

type SettingsRecord = Record<string, unknown>;

function text(recordValue: SettingsRecord, key: string) {
  const value = recordValue[key];
  return typeof value === "string" ? value.trim() : "";
}

function record(recordValue: SettingsRecord, key: string): SettingsRecord {
  const value = recordValue[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as SettingsRecord)
    : {};
}

function textOr(recordValue: SettingsRecord, key: string, fallback: string) {
  return text(recordValue, key) || fallback;
}

function normalizeDomain(value: string) {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return defaults.domain;
  }
}

function legalPage(
  recordValue: SettingsRecord,
  fallback: LegalPageContent,
): LegalPageContent {
  return {
    eyebrow: textOr(recordValue, "eyebrow", fallback.eyebrow),
    title: textOr(recordValue, "title", fallback.title),
    description: textOr(recordValue, "description", fallback.description),
    html: textOr(recordValue, "html", fallback.html),
    seoTitle: textOr(recordValue, "seoTitle", fallback.seoTitle),
    seoDescription: textOr(
      recordValue,
      "seoDescription",
      fallback.seoDescription,
    ),
  };
}

export function getPageSettingsFromRecord(
  settings: SettingsRecord,
): PublicPageSettings {
  const pages = record(settings, "pages");
  const home = record(pages, "home");
  const sobre = record(pages, "sobre");
  const contato = record(pages, "contato");
  const footer = record(pages, "footer");
  const terms = record(pages, "termos-de-uso");
  const privacy = record(pages, "politica-de-privacidade");
  const cookies = record(pages, "politica-de-cookies");
  const privacyBanner = record(pages, "privacy-banner");

  return {
    home: {
      heroEyebrow: textOr(
        home,
        "heroEyebrow",
        defaultPageSettings.home.heroEyebrow,
      ),
      heroTitle: textOr(home, "heroTitle", defaultPageSettings.home.heroTitle),
      heroAccent: textOr(
        home,
        "heroAccent",
        defaultPageSettings.home.heroAccent,
      ),
      heroDescription: textOr(
        home,
        "heroDescription",
        defaultPageSettings.home.heroDescription,
      ),
      heroSecondary: textOr(
        home,
        "heroSecondary",
        defaultPageSettings.home.heroSecondary,
      ),
      primaryCtaLabel: textOr(
        home,
        "primaryCtaLabel",
        defaultPageSettings.home.primaryCtaLabel,
      ),
      secondaryCtaLabel: textOr(
        home,
        "secondaryCtaLabel",
        defaultPageSettings.home.secondaryCtaLabel,
      ),
      servicesEyebrow: textOr(
        home,
        "servicesEyebrow",
        defaultPageSettings.home.servicesEyebrow,
      ),
      servicesTitle: textOr(
        home,
        "servicesTitle",
        defaultPageSettings.home.servicesTitle,
      ),
      portfolioEyebrow: textOr(
        home,
        "portfolioEyebrow",
        defaultPageSettings.home.portfolioEyebrow,
      ),
      portfolioTitle: textOr(
        home,
        "portfolioTitle",
        defaultPageSettings.home.portfolioTitle,
      ),
      portfolioLinkLabel: textOr(
        home,
        "portfolioLinkLabel",
        defaultPageSettings.home.portfolioLinkLabel,
      ),
      ctaEyebrow: textOr(
        home,
        "ctaEyebrow",
        defaultPageSettings.home.ctaEyebrow,
      ),
      ctaTitle: textOr(home, "ctaTitle", defaultPageSettings.home.ctaTitle),
      ctaDescription: textOr(
        home,
        "ctaDescription",
        defaultPageSettings.home.ctaDescription,
      ),
      ctaButtonLabel: textOr(
        home,
        "ctaButtonLabel",
        defaultPageSettings.home.ctaButtonLabel,
      ),
    },
    sobre: {
      eyebrow: textOr(sobre, "eyebrow", defaultPageSettings.sobre.eyebrow),
      title: textOr(sobre, "title", defaultPageSettings.sobre.title),
      description: textOr(
        sobre,
        "description",
        defaultPageSettings.sobre.description,
      ),
      bodyTitle: textOr(
        sobre,
        "bodyTitle",
        defaultPageSettings.sobre.bodyTitle,
      ),
      body: textOr(sobre, "body", defaultPageSettings.sobre.body),
    },
    contato: {
      eyebrow: textOr(contato, "eyebrow", defaultPageSettings.contato.eyebrow),
      title: textOr(contato, "title", defaultPageSettings.contato.title),
      description: textOr(
        contato,
        "description",
        defaultPageSettings.contato.description,
      ),
      directEyebrow: textOr(
        contato,
        "directEyebrow",
        defaultPageSettings.contato.directEyebrow,
      ),
      directTitle: text(contato, "directTitle"),
      directDescription: textOr(
        contato,
        "directDescription",
        defaultPageSettings.contato.directDescription,
      ),
    },
    footer: {
      tagline: textOr(footer, "tagline", defaultPageSettings.footer.tagline),
      navigationTitle: textOr(
        footer,
        "navigationTitle",
        defaultPageSettings.footer.navigationTitle,
      ),
      ecosystemTitle: textOr(
        footer,
        "ecosystemTitle",
        defaultPageSettings.footer.ecosystemTitle,
      ),
      legalTitle: textOr(
        footer,
        "legalTitle",
        defaultPageSettings.footer.legalTitle,
      ),
      copyright: textOr(
        footer,
        "copyright",
        defaultPageSettings.footer.copyright,
      ),
    },
    termosDeUso: legalPage(terms, defaultPageSettings.termosDeUso),
    politicaDePrivacidade: legalPage(
      privacy,
      defaultPageSettings.politicaDePrivacidade,
    ),
    politicaDeCookies: legalPage(
      cookies,
      defaultPageSettings.politicaDeCookies,
    ),
    privacyBanner: {
      version: textOr(
        privacyBanner,
        "version",
        defaultPageSettings.privacyBanner.version,
      ),
      title: textOr(
        privacyBanner,
        "title",
        defaultPageSettings.privacyBanner.title,
      ),
      description: textOr(
        privacyBanner,
        "description",
        defaultPageSettings.privacyBanner.description,
      ),
      acceptLabel: textOr(
        privacyBanner,
        "acceptLabel",
        defaultPageSettings.privacyBanner.acceptLabel,
      ),
      rejectLabel: textOr(
        privacyBanner,
        "rejectLabel",
        defaultPageSettings.privacyBanner.rejectLabel,
      ),
      preferencesLabel: textOr(
        privacyBanner,
        "preferencesLabel",
        defaultPageSettings.privacyBanner.preferencesLabel,
      ),
      saveLabel: textOr(
        privacyBanner,
        "saveLabel",
        defaultPageSettings.privacyBanner.saveLabel,
      ),
      modalTitle: textOr(
        privacyBanner,
        "modalTitle",
        defaultPageSettings.privacyBanner.modalTitle,
      ),
      modalDescription: textOr(
        privacyBanner,
        "modalDescription",
        defaultPageSettings.privacyBanner.modalDescription,
      ),
    },
  };
}

export const getSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  try {
    const supabase = await createClient();

    if (!supabase) return defaults;

    const { data, error } = await supabase
      .from("site_settings")
      .select("company_name,settings")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return defaults;

    const settings =
      data.settings &&
      typeof data.settings === "object" &&
      !Array.isArray(data.settings)
        ? (data.settings as SettingsRecord)
        : {};

    const companyName = data.company_name?.trim() || defaults.companyName;
    const domain = text(settings, "domain");

    return {
      companyName,
      email: text(settings, "email"),
      phone: text(settings, "phone"),
      instagram: text(settings, "instagram"),
      linkedin: text(settings, "linkedin"),
      domain: normalizeDomain(domain || defaults.domain),
      seoTitle: text(settings, "seo_title") || defaults.seoTitle,
      seoDescription:
        text(settings, "seo_description") || defaults.seoDescription,
      pages: getPageSettingsFromRecord(settings),
    };
  } catch {
    return defaults;
  }
});

export function replaceSiteTokens(
  value: string,
  settings: Pick<PublicSiteSettings, "companyName" | "email" | "domain">,
) {
  return value
    .replaceAll("{company}", settings.companyName)
    .replaceAll("{email}", settings.email || "informado na página de contato")
    .replaceAll("{domain}", settings.domain);
}

export function phoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "";
}
