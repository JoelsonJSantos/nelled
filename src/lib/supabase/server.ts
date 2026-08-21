import "server-only";

import { createServerClient } from "@supabase/ssr";
import {
  createClient as createSupabaseClient,
} from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getSupabaseConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return null;
  }

  return {
    url,
    key,
  };
}

/**
 * Cliente público/anônimo.
 *
 * Usado para:
 * - conteúdo público;
 * - projetos;
 * - blog;
 * - parceiros;
 * - configurações públicas;
 * - campanhas;
 * - formulário de contato;
 * - eventos públicos permitidos por RLS.
 *
 * IMPORTANTE:
 * Este cliente NÃO lê cookies,
 * NÃO mantém sessão,
 * NÃO tenta renovar tokens
 * e NÃO deve ser utilizado para autenticação.
 */
export async function createClient() {
  const config =
    getSupabaseConfig();

  if (!config) {
    return null;
  }

  return createSupabaseClient(
    config.url,
    config.key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
}

/**
 * Cliente autenticado do servidor.
 *
 * Usado exclusivamente quando precisamos
 * da sessão do usuário, principalmente:
 *
 * - login;
 * - logout;
 * - validação do Admin;
 * - operações administrativas.
 *
 * Este cliente lê a sessão armazenada
 * nos cookies e pode atualizar os cookies
 * quando executado em contextos que
 * permitem escrita.
 */
export async function createAuthenticatedClient() {
  const config =
    getSupabaseConfig();

  if (!config) {
    return null;
  }

  const store =
    await cookies();

  return createServerClient(
    config.url,
    config.key,
    {
      cookies: {
        getAll: () =>
          store.getAll(),

        setAll: (
          cookiesToSet,
        ) => {
          try {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                store.set(
                  name,
                  value,
                  options,
                );
              },
            );
          } catch {
            /*
             * Server Components não podem
             * escrever cookies.
             *
             * Server Actions e Route Handlers
             * podem.
             */
          }
        },
      },
    },
  );
}