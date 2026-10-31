import type { EmailAdapter, EmailOptions } from "./adapter";

export class ConsoleEmailAdapter implements EmailAdapter {
  async send(options: EmailOptions): Promise<boolean> {
    console.log("=== EMAIL (console adapter) ===");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text || options.html}`);
    console.log("=== END EMAIL ===");
    return true;
  }
}
