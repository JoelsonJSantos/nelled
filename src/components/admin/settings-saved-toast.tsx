"use client";

import { useEffect, useState } from "react";

import { AdminToast } from "@/components/admin/admin-toast";

type SettingsSavedToastProps = {
  show: boolean;
  title?: string;
  message?: string;
  type?: "success" | "error";
};

export function SettingsSavedToast({
  show,
  title = "Configurações salvas",
  message = "As alterações foram salvas com sucesso.",
  type = "success",
}: SettingsSavedToastProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    url.searchParams.delete("status");
    url.searchParams.delete("message");

    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );

    /*
     * O reset acontece em callback assíncrono para evitar atualização
     * síncrona de estado dentro do effect (regra do React 19/ESLint).
     */
    const startTimer = window.setTimeout(() => {
      setVisible(true);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
    };
  }, [show]);

  if (!visible) return null;

  return <AdminToast title={title} message={message} type={type} />;
}
