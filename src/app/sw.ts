/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,

  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    // Nunca servir páginas administrativas pelo cache.
    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin &&
        (url.pathname === "/admin" ||
          url.pathname.startsWith("/admin/")),
      handler: new NetworkOnly(),
    },

    // Nunca servir respostas da API interna pelo cache.
    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin &&
        (url.pathname === "/api" ||
          url.pathname.startsWith("/api/")),
      handler: new NetworkOnly(),
    },

    // Estratégias padrão recomendadas pelo Serwist para Next.js.
    ...defaultCache,
  ],

  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();