import type { EmailAdapter, EmailOptions } from "./adapter";

export class SmtpEmailAdapter implements EmailAdapter {
  private host: string;
  private port: number;
  private user: string;
  private pass: string;
  private from: string;

  constructor(config: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  }) {
    this.host = config.host;
    this.port = config.port;
    this.user = config.user;
    this.pass = config.pass;
    this.from = config.from;
  }

  async send(options: EmailOptions): Promise<boolean> {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.default.createTransport({
      host: this.host,
      port: this.port,
      secure: this.port === 465,
      auth: { user: this.user, pass: this.pass },
    });

    await transport.sendMail({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return true;
  }
}
