import type { EmailProvider } from "../ports/email-provider";

/**
 * Adapter de desenvolvimento: registra o e-mail no log em vez de enviá-lo.
 * Em produção, substituir por um adapter real (ex.: Resend/SendGrid) sem
 * alterar nenhum caso de uso — ver docs/INTEGRATIONS.md.
 */
export class ConsoleEmailProvider implements EmailProvider {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    console.info(`[email:verification] to=${to} token=${token}`);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    console.info(`[email:password-reset] to=${to} token=${token}`);
  }
}
