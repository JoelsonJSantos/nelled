/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import type {
  PrecacheEntry,
  SerwistGlobalConfig,
} from "serwist";
import {
  NetworkOnly,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope
    extends SerwistGlobalConfig {
    __SW_MANIFEST:
      | (PrecacheEntry | string)[]
      | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const networkOnly =
  new NetworkOnly();

/*
 * Versões anteriores da Nelled
 * utilizavam os caches padrão
 * de páginas e React Server
 * Components do Serwist.
 *
 * Ao ativar esta versão,
 * removemos esses caches antigos
 * para evitar reaproveitamento
 * de HTML/RSC de deployments
 * anteriores.
 */
const staleDynamicCacheMarkers = [
  "-pages-rsc-prefetch-",
  "-pages-rsc-",
  "-pages-",
];

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((cacheName) =>
                staleDynamicCacheMarkers.some(
                  (marker) =>
                    cacheName.includes(
                      marker,
                    ),
                ),
              )
              .map((cacheName) =>
                caches.delete(
                  cacheName,
                ),
              ),
          ),
        ),
    );
  },
);

const serwist = new Serwist({
  precacheEntries:
    self.__SW_MANIFEST,

  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    /*
     * Nunca servir páginas
     * administrativas pelo cache.
     */
    {
      matcher: ({
        url,
        sameOrigin,
      }) =>
        sameOrigin &&
        (url.pathname ===
          "/admin" ||
          url.pathname.startsWith(
            "/admin/",
          )),
      handler: networkOnly,
    },

    /*
     * Nunca servir respostas
     * da API interna pelo cache.
     */
    {
      matcher: ({
        url,
        sameOrigin,
      }) =>
        sameOrigin &&
        (url.pathname === "/api" ||
          url.pathname.startsWith(
            "/api/",
          )),
      handler: networkOnly,
    },

    /*
     * Navegação pública sempre
     * utiliza a versão atual
     * entregue pelo servidor.
     *
     * Isso impede que HTML de
     * deployments anteriores seja
     * misturado com código novo.
     */
    {
      matcher: ({
        request,
        sameOrigin,
      }) =>
        sameOrigin &&
        request.mode ===
          "navigate",
      handler: networkOnly,
    },

    /*
     * React Server Components
     * também devem acompanhar
     * exatamente o deployment
     * atual.
     *
     * Next.js utiliza RSC e
     * parâmetros como _rsc nas
     * navegações do App Router.
     */
    {
      matcher: ({
        request,
        url,
        sameOrigin,
      }) =>
        sameOrigin &&
        (
          request.headers.get(
            "RSC",
          ) === "1" ||
          request.headers.has(
            "Next-Router-State-Tree",
          ) ||
          request.headers.has(
            "Next-Router-Prefetch",
          ) ||
          url.searchParams.has(
            "_rsc",
          )
        ),
      handler: networkOnly,
    },

    /*
     * Mantemos as estratégias
     * recomendadas pelo Serwist
     * para recursos estáticos,
     * imagens, fontes, CSS, JS etc.
     *
     * Como as regras acima aparecem
     * primeiro, documentos e RSC não
     * chegam aos caches de páginas
     * do defaultCache.
     */
    ...defaultCache,
  ],

  fallbacks: {
    entries: [
      {
        url: "/~offline",

        matcher({ request }) {
          return (
            request.destination ===
            "document"
          );
        },
      },
    ],
  },
});

serwist.addEventListeners();