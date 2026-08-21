import { cache } from "react";
import { redirect } from "next/navigation";

import {
  createAuthenticatedClient,
} from "@/lib/supabase/server";

type AdminAuthResult =
  | {
      status: "admin";
      supabase: NonNullable<
        Awaited<
          ReturnType<
            typeof createAuthenticatedClient
          >
        >
      >;
    }
  | {
      status:
        | "unauthenticated"
        | "forbidden"
        | "unavailable";
    };

const verifyAdmin = cache(
  async (): Promise<AdminAuthResult> => {
    const supabase =
      await createAuthenticatedClient();

    if (!supabase) {
      return {
        status: "unavailable",
      };
    }

    const {
      data,
      error,
    } =
      await supabase.auth.getClaims();

    const userId =
      data?.claims?.sub;

    if (
      error ||
      !userId
    ) {
      return {
        status:
          "unauthenticated",
      };
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return {
        status: "unavailable",
      };
    }

    if (
      profile?.role !== "admin"
    ) {
      return {
        status: "forbidden",
      };
    }

    return {
      status: "admin",
      supabase,
    };
  },
);

export async function getAdminClient() {
  const result =
    await verifyAdmin();

  return result.status ===
    "admin"
    ? result.supabase
    : null;
}

export async function requireAdmin() {
  const result =
    await verifyAdmin();

  if (
    result.status ===
    "forbidden"
  ) {
    redirect(
      "/admin/acesso-negado",
    );
  }

  if (
    result.status !== "admin"
  ) {
    redirect(
      "/admin/login",
    );
  }

  return result.supabase;
}