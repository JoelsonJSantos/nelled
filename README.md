# Nelled Studio

Plataforma web oficial da **Nelled Studio**, reunindo site institucional e um CMS administrativo próprio para gerenciar conteúdo, portfólio, blog, parceiros, mídia, contatos e configurações globais.

Construído com **Next.js App Router, React e TypeScript**, com Supabase para autenticação e dados, Cloudinary para mídia e Resend para notificações de contato.

> Ambiente público padrão: `https://nelled.vercel.app`

## Funcionalidades

### Site público
- Home, Sobre, Portfólio, Blog, Parceiros e Contato.
- Páginas individuais de projetos, artigos e parceiros.
- Termos de Uso, Política de Privacidade e Política de Cookies.
- Tema claro/escuro persistido por cookie.
- Loader próprio para transições de navegação.
- Metadata dinâmica, Open Graph, sitemap e robots.
- Banner e preferências de privacidade.
- Vercel Analytics e Speed Insights condicionados ao consentimento.
- Formulário de contato com Zod, honeypot, Supabase e Resend.

### CMS / Admin
- Login com Supabase Auth e validação server-side de `profiles.role = admin`.
- Dashboard e navegação administrativa.
- CRUD de projetos com status, destaque, SEO, tecnologias e galeria.
- CRUD de posts com TipTap, SEO, publicação e agendamento.
- CRUD de parceiros.
- Biblioteca de mídia com upload assinado para Cloudinary.
- Configurações globais da marca e do site.
- Edição da Home, Sobre, Contato, Footer e páginas legais.
- Configuração do banner de privacidade.
- Acompanhamento de contatos com status, notas internas e histórico básico.
- Gestão completa de campanhas/anúncios, com CRUD administrativo, múltiplos criativos horizontal/vertical, placements responsivos, período, prioridade e rotação.
- Exibição pública de campanhas com tracking de impressão e clique mediante consentimento de publicidade, além de analytics e métricas administrativas por campanha, placement e período.

### Implantação de campanhas
Os recursos de campanhas dependem das migrations versionadas em `supabase/migrations/`, incluindo tracking público, agregações analíticas e criativos. Elas são criadas e versionadas neste repositório, mas precisam ser aplicadas separadamente no ambiente Supabase antes de usar o módulo em produção.

## Stack
- **Next.js 16.3.0**
- **React / React DOM 19.2.8**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Supabase + PostgreSQL + Supabase Auth**
- **Zod 4**
- **TipTap 3**
- **React Hook Form**
- **Cloudinary**
- **Resend**
- **Lucide React**
- **Motion**
- **Vercel Analytics**
- **Vercel Speed Insights**

## Arquitetura
A aplicação utiliza o **App Router** do Next.js e prioriza acesso a dados no servidor.

- Server Components para leitura de dados quando aplicável.
- Server Actions para mutações e formulários administrativos.
- Supabase SSR para autenticação e banco.
- Validação de entrada com Zod.
- Row Level Security como camada adicional de autorização.
- Função `is_admin()` no banco para políticas administrativas.
- Conteúdo estruturado em JSONB onde é útil para o CMS.
- Configurações públicas centralizadas em `site_settings`.
- Upload de mídia assinado no servidor.
- Analytics e métricas de performance condicionados ao consentimento.

## Pré-requisitos
- Node.js compatível com Next.js 16.
- npm.
- Projeto Supabase configurado.
- Conta Cloudinary para recursos de mídia.
- Conta Resend para notificações de contato, quando o envio por e-mail for utilizado.

## Configuração local
```bash
git clone https://github.com/JoelsonJSantos/nelled.git
cd nelled
npm install
```

Crie `.env.local` na raiz do projeto e configure as variáveis necessárias. Depois execute:

```bash
npm run dev
```

A aplicação estará disponível, por padrão, em `http://localhost:3000`.

## Variáveis de ambiente
Variáveis referenciadas pelo código atual:

```dotenv
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret

# Resend / contato
RESEND_API_KEY=sua-resend-api-key
RESEND_FROM_EMAIL=Nelled Studio <contato@seudominio.com>
CONTACT_TO_EMAIL=contato@seudominio.com

# Vercel
VERCEL_ENV=development
```

- `CLOUDINARY_*` é usado no servidor para assinar e validar operações de mídia.
- `CONTACT_TO_EMAIL` define o destinatário; sem ele, o código pode usar o e-mail configurado no CMS.
- `RESEND_FROM_EMAIL` define o remetente e é opcional no código atual.
- `VERCEL_ENV` identifica o ambiente exibido no Admin.
- Nunca versione `.env.local`, tokens ou segredos. Os arquivos `.env*` já estão ignorados pelo Git.

## Supabase
O schema está versionado em `supabase/migrations/`.

```text
20260813000000_nelled_studio.sql
20260813010000_public_contact_submissions.sql
```

Principais tabelas:

```text
profiles               site_settings
projects               blog_categories
blog_posts             partner_categories
partners               ad_campaigns
ad_campaign_creatives  ad_events
contact_requests       contact_notes
media_library
```

As migrations também configuram tipos, permissões e políticas de **Row Level Security**. Em um novo ambiente, aplique-as em ordem cronológica usando o fluxo adotado no projeto Supabase. O repositório não possui configuração suficiente para documentar com segurança um comando CLI específico.

### Acesso administrativo
O Admin exige um usuário no Supabase Auth cujo mesmo `id` exista em `public.profiles` com `role = 'admin'`. Essa condição é validada no servidor antes de liberar as rotas administrativas.

## Mídia e contato
A biblioteca de mídia usa upload Cloudinary assinado. O servidor gera a assinatura e valida a resposta antes de registrar a mídia. São aceitos **JPEG, PNG, WebP e AVIF**, com limite atual de **10 MB** por arquivo.

O formulário público utiliza validação Zod, normalização de WhatsApp, honeypot, persistência em `contact_requests` e envio opcional de notificação pelo Resend.

## Scripts
| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript com `tsc --noEmit` |

## Validação
Antes de integrar alterações importantes:

```bash
npm run typecheck
npm run lint
npm run build
```

Essas verificações são o baseline atual de qualidade. Ainda não existe uma suíte automatizada de testes versionada no projeto.

## Estrutura do projeto
```text
nelled/
├── public/                  # Logos, favicons e assets públicos
├── src/
│   ├── app/
│   │   ├── admin/           # CMS e autenticação
│   │   ├── api/             # Rotas de API
│   │   ├── blog/            # Blog público
│   │   ├── parceiros/       # Parceiros públicos
│   │   ├── portfolio/       # Portfólio público
│   │   └── [...slug]/       # Páginas institucionais/legais
│   ├── components/          # UI pública e administrativa
│   │   ├── admin/
│   │   ├── navigation/
│   │   └── privacy/
│   └── lib/                 # Supabase, CMS, mídia e utilitários
├── supabase/
│   └── migrations/          # Schema e RLS
├── AGENTS.md
├── CLAUDE.md
├── next.config.ts
└── package.json
```

## Segurança
A base atual inclui autenticação administrativa via Supabase Auth, verificação server-side do papel `admin`, RLS, validação Zod, segredos mantidos no servidor, upload Cloudinary assinado, honeypot no formulário e `.env*` ignorado pelo Git.

Melhorias recomendadas: rate limiting, sanitização HTML mais robusta para múltiplos editores, tipos Supabase gerados/versionados e testes automatizados.

## Deploy
A aplicação está preparada para deploy na **Vercel**. Antes de publicar um novo ambiente:

1. configure as variáveis de ambiente na Vercel;
2. configure o Supabase e aplique as migrations;
3. configure Cloudinary e Resend quando utilizados;
4. execute `npm run typecheck`, `npm run lint` e `npm run build`.

O domínio público é obtido das configurações do CMS, com `https://nelled.vercel.app` como valor padrão no código atual.

## Status e roadmap
1. evoluir o CRM de contatos com respostas manuais e organização comercial posterior;
2. adicionar gestão dedicada de categorias de Blog e Parceiros;
3. adicionar rate limiting ao formulário;
4. gerar e versionar tipos do Supabase;
5. criar testes automatizados para fluxos críticos;
6. adicionar experiências dedicadas de erro e páginas não encontradas.

## Licença
Não há arquivo `LICENSE` versionado atualmente. O uso, distribuição e licenciamento do código devem ser definidos pelo proprietário do repositório antes de qualquer redistribuição.

## Autor
**Joelson J. Santos**
GitHub: [@JoelsonJSantos](https://github.com/JoelsonJSantos)

---

**Nelled Studio** — Desenvolvimento, design e tecnologia para produtos digitais.
