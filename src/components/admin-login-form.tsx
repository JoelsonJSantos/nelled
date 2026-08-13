"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login, type LoginState } from "@/app/admin/login/actions";
import styles from "./admin-login-form.module.css";

const initialState: LoginState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  return <form action={action} className={`admin-login-form ${styles.form}`}>
    <label htmlFor="email">E-mail<input id="email" name="email" type="email" autoComplete="email" required /></label>
    <label htmlFor="password">Senha<input id="password" name="password" type="password" autoComplete="current-password" required /></label>
    {state.error && <p className={styles.error} role="alert">{state.error}</p>}
    <button className={styles.submit} type="submit" disabled={pending}>{pending ? "Entrando..." : <>Entrar <LogIn size={17}/></>}</button>
  </form>;
}
