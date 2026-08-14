"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import {
  submitContact,
  type ContactFormState,
} from "@/app/contact-actions";

const initialState: ContactFormState = {
  status: "idle",
};

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) return "";

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  /*
   * Números com até 10 dígitos:
   * (79) 3333-4444
   */
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  /*
   * Celular com 11 dígitos:
   * (79) 99999-9999
   */
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function ContactForm() {
  const [state, action, pending] = useActionState(
    submitContact,
    initialState,
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  const errorFor = (field: string) =>
    state.errors?.[field]?.[0];

  return (
    <form
      ref={formRef}
      action={action}
      className="contact-card"
      noValidate
    >
      <label>
        Nome
        <input
          name="name"
          autoComplete="name"
          placeholder="Como podemos chamar você?"
          required
          aria-invalid={Boolean(errorFor("name"))}
        />

        {errorFor("name") && (
          <span className="field-error">
            {errorFor("name")}
          </span>
        )}
      </label>

      <label>
        Empresa{" "}
        <span className="optional-label">
          (opcional)
        </span>

        <input
          name="company"
          autoComplete="organization"
          placeholder="Nome da sua empresa"
          aria-invalid={Boolean(errorFor("company"))}
        />

        {errorFor("company") && (
          <span className="field-error">
            {errorFor("company")}
          </span>
        )}
      </label>

      <label>
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          required
          aria-invalid={Boolean(errorFor("email"))}
        />

        {errorFor("email") && (
          <span className="field-error">
            {errorFor("email")}
          </span>
        )}
      </label>

      <label>
        WhatsApp
        <input
          name="whatsapp"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(79) 99999-9999"
          maxLength={15}
          required
          aria-invalid={Boolean(errorFor("whatsapp"))}
          onInput={(event) => {
            const input = event.currentTarget;

            input.value = formatWhatsApp(
              input.value,
            );
          }}
        />

        {errorFor("whatsapp") && (
          <span className="field-error">
            {errorFor("whatsapp")}
          </span>
        )}
      </label>

      <label>
        Tipo de projeto
        <select
          name="projectType"
          defaultValue=""
          required
          aria-invalid={Boolean(
            errorFor("projectType"),
          )}
        >
          <option value="" disabled>
            Selecione uma opção
          </option>

          <option value="site">
            Site institucional
          </option>

          <option value="sistema">
            Sistema personalizado
          </option>

          <option value="saas">
            Plataforma SaaS
          </option>

          <option value="aplicacao">
            Aplicação personalizada
          </option>

          <option value="outro">
            Outro
          </option>
        </select>

        {errorFor("projectType") && (
          <span className="field-error">
            {errorFor("projectType")}
          </span>
        )}
      </label>

      <label>
        Investimento previsto{" "}
        <span className="optional-label">(opcional)</span>

        <select name="budgetRange" defaultValue="">
          <option value="">
            Prefiro conversar primeiro
          </option>

          <option value="Até R$ 10 mil">
            Até R$ 10 mil
          </option>

          <option value="R$ 10 mil a R$ 25 mil">
            R$ 10 mil a R$ 25 mil
          </option>

          <option value="R$ 25 mil a R$ 50 mil">
            R$ 25 mil a R$ 50 mil
          </option>

          <option value="R$ 50 mil a R$ 100 mil">
            R$ 50 mil a R$ 100 mil
          </option>

          <option value="Acima de R$ 100 mil">
            Acima de R$ 100 mil
          </option>
        </select>
      </label>

      <label className="contact-field-full">
        Mensagem
        <textarea
          name="message"
          placeholder="Conte-nos sobre o desafio."
          rows={5}
          required
          aria-invalid={Boolean(
            errorFor("message"),
          )}
        />

        {errorFor("message") && (
          <span className="field-error">
            {errorFor("message")}
          </span>
        )}
      </label>

      <div
        className="contact-honeypot"
        aria-hidden="true"
      >
        <label>
          Website
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {state.message && (
        <p
          className={`contact-feedback ${state.status}`}
          role={
            state.status === "error"
              ? "alert"
              : "status"
          }
        >
          {state.message}
        </p>
      )}

      <button
        className="button primary contact-submit"
        type="submit"
        disabled={pending}
      >
        {pending ? (
          "Enviando..."
        ) : (
          <>
            Enviar solicitação
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}