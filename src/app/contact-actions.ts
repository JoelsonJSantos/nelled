"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<
    string,
    string[] | undefined
  >;
};

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" &&
      value.trim() === ""
        ? undefined
        : value,

    z
      .string()
      .trim()
      .max(
        max,
        `Use no máximo ${max} caracteres.`,
      )
      .optional(),
  );

/*
 * Normaliza telefone brasileiro.
 *
 * 79999999999
 * ->
 * (79) 99999-9999
 *
 * Também aceita telefone fixo:
 * 7933334444
 * ->
 * (79) 3333-4444
 */
function normalizeWhatsApp(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const digits = value
    .replace(/\D/g, "")
    .slice(0, 11);

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value.trim();
}

const whatsappSchema = z.preprocess(
  normalizeWhatsApp,

  z
    .string({
      error: "Informe seu WhatsApp.",
    })
    .trim()
    .min(1, "Informe seu WhatsApp.")
    .regex(
      /^\(\d{2}\)\s(?:\d{4}|\d{5})-\d{4}$/,
      "Informe um WhatsApp válido. Ex.: (79) 99999-9999.",
    ),
);

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(
      120,
      "Use no máximo 120 caracteres.",
    ),

  company: optionalText(120),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .max(
      254,
      "Use no máximo 254 caracteres.",
    ),

  /*
   * Agora é obrigatório e normalizado.
   */
  whatsapp: whatsappSchema,

  projectType: z.enum(
    [
      "site",
      "sistema",
      "saas",
      "aplicacao",
      "outro",
    ],
    {
      error:
        "Selecione o tipo de projeto.",
    },
  ),

  budgetRange: optionalText(60),

  message: z
    .string()
    .trim()
    .min(
      10,
      "Conte um pouco mais sobre o projeto.",
    )
    .max(
      5000,
      "Use no máximo 5.000 caracteres.",
    ),

  website: optionalText(200),
});

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        } as Record<string, string>
      )[character] ?? character,
  );
}

export async function submitContact(
  _: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    projectType:
      formData.get("projectType"),
    budgetRange:
      formData.get("budgetRange"),
    message: formData.get("message"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "Revise os campos indicados e tente novamente.",
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  /*
   * Honeypot.
   *
   * Bots geralmente preenchem esse campo
   * escondido, enquanto usuários reais não.
   */
  if (parsed.data.website) {
    return {
      status: "success",
      message:
        "Solicitação enviada. Em breve entraremos em contato.",
    };
  }

  const contact = {
    name: parsed.data.name,
    company:
      parsed.data.company ?? null,

    email: parsed.data.email,

    /*
     * WhatsApp agora sempre existe.
     */
    whatsapp: parsed.data.whatsapp,

    project_type:
      parsed.data.projectType,

    budget_range:
      parsed.data.budgetRange ?? null,

    message: parsed.data.message,
  };

  const supabase =
    await createClient();

  let stored = false;

  if (supabase) {
    const { error } = await supabase
      .from("contact_requests")
      .insert(contact);

    if (error) {
      console.error(
        "Falha ao registrar contato no Supabase.",
        {
          code: error.code,
          message: error.message,
        },
      );
    } else {
      stored = true;
    }
  }

  const resendKey =
    process.env.RESEND_API_KEY;

  const recipient =
    process.env.CONTACT_TO_EMAIL;

  let emailed = false;

  if (resendKey && recipient) {
    const resend =
      new Resend(resendKey);

    const from =
      process.env.RESEND_FROM_EMAIL ??
      "Nelled Studio <onboarding@resend.dev>";

    const safe = Object.fromEntries(
      Object.entries(contact).map(
        ([key, value]) => [
          key,
          escapeHtml(
            value ?? "Não informado",
          ),
        ],
      ),
    );

    const safeName = contact.name
      .replace(/[\r\n]+/g, " ")
      .slice(0, 80);

    const { error: emailError } =
      await resend.emails.send({
        from,
        to: recipient,
        replyTo: contact.email,

        subject: `Nova solicitação de ${safeName}`,

        html: `
          <h1>Nova solicitação pelo site</h1>

          <p>
            <strong>Nome:</strong>
            ${safe.name}
          </p>

          <p>
            <strong>Empresa:</strong>
            ${safe.company}
          </p>

          <p>
            <strong>E-mail:</strong>
            ${safe.email}
          </p>

          <p>
            <strong>WhatsApp:</strong>
            ${safe.whatsapp}
          </p>

          <p>
            <strong>Tipo de projeto:</strong>
            ${safe.project_type}
          </p>

          <p>
            <strong>Orçamento:</strong>
            ${safe.budget_range}
          </p>

          <p>
            <strong>Mensagem:</strong>
            <br />
            ${safe.message}
          </p>
        `,

        text: [
          "Nova solicitação pelo site",
          `Nome: ${contact.name}`,
          `Empresa: ${
            contact.company ??
            "Não informado"
          }`,
          `E-mail: ${contact.email}`,
          `WhatsApp: ${contact.whatsapp}`,
          `Tipo de projeto: ${contact.project_type}`,
          `Orçamento: ${
            contact.budget_range ??
            "Não informado"
          }`,
          `Mensagem: ${contact.message}`,
        ].join("\n"),
      });

    if (emailError) {
      console.error(
        "O aviso de contato por e-mail falhou.",
        {
          message:
            emailError.message,
        },
      );
    } else {
      emailed = true;
    }
  }

  /*
   * Consideramos sucesso se pelo menos
   * uma das duas entregas funcionar.
   */
  if (!stored && !emailed) {
    return {
      status: "error",
      message:
        "Não foi possível enviar agora. Tente novamente em instantes.",
    };
  }

  if (stored) {
    revalidatePath("/admin");
    revalidatePath(
      "/admin/contatos",
    );
  }

  return {
    status: "success",
    message:
      "Solicitação enviada. Em breve entraremos em contato.",
  };
}