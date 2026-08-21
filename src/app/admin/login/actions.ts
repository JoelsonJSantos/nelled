"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createAuthenticatedClient,
} from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

const loginSchema =
  z.object({
    email: z
      .string()
      .trim()
      .email(
        "Informe um e-mail válido.",
      ),

    password: z
      .string()
      .min(
        1,
        "Informe sua senha.",
      ),
  });

export async function login(
  _: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed =
    loginSchema.safeParse({
      email:
        formData.get("email"),

      password:
        formData.get(
          "password",
        ),
    });

  if (!parsed.success) {
    return {
      error:
        parsed.error
          .issues[0]
          ?.message ??
        "Dados inválidos.",
    };
  }

  const supabase =
    await createAuthenticatedClient();

  if (!supabase) {
    return {
      error:
        "A conexão de autenticação não está disponível.",
    };
  }

  const {
    data,
    error,
  } =
    await supabase.auth
      .signInWithPassword(
        parsed.data,
      );

  if (
    error ||
    !data.user
  ) {
    return {
      error:
        "E-mail ou senha inválidos.",
    };
  }

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq(
      "id",
      data.user.id,
    )
    .maybeSingle();

  if (
    profile?.role !==
    "admin"
  ) {
    await supabase.auth
      .signOut();

    return {
      error:
        "Acesso negado. Esta conta não possui permissão administrativa.",
    };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase =
    await createAuthenticatedClient();

  if (supabase) {
    await supabase.auth
      .signOut();
  }

  redirect("/admin/login");
}