import type { EmailAdapter } from "./adapter";
import { ConsoleEmailAdapter } from "./console";

let instance: EmailAdapter | null = null;

async function createAdapter(): Promise<EmailAdapter> {
  const adapterType = process.env.EMAIL_ADAPTER || "console";

  switch (adapterType) {
    case "smtp": {
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || "587", 10);
      const user = process.env.SMTP_USER || "";
      const pass = process.env.SMTP_PASS || "";
      const from = process.env.EMAIL_FROM || "Typeset <noreply@typeset.app>";
      if (!host) throw new Error("SMTP_HOST is required for smtp adapter");
      const { SmtpEmailAdapter } = await import("./smtp");
      return new SmtpEmailAdapter({ host, port, user, pass, from });
    }

    case "resend": {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM || "Typeset <noreply@typeset.app>";
      if (!apiKey) throw new Error("RESEND_API_KEY is required for resend adapter");
      const { ResendEmailAdapter } = await import("./resend");
      return new ResendEmailAdapter(apiKey, from);
    }

    case "console":
    default:
      return new ConsoleEmailAdapter();
  }
}

export async function getEmail(): Promise<EmailAdapter> {
  if (!instance) {
    instance = await createAdapter();
  }
  return instance;
}

export type { EmailAdapter, EmailOptions } from "./adapter";
