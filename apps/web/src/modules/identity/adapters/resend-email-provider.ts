import type { EmailProvider } from "../ports/email-provider";

/**
 * Envia e-mails de verdade via API REST do Resend (https://resend.com).
 * Sem SDK — só `fetch` contra o endpoint documentado — para não prender o
 * projeto a uma dependência inteira só por uma chamada HTTP. Usado em
 * produção quando `EMAIL_PROVIDER_API_KEY` está configurado; ver ADR-023
 * e `ConsoleEmailProvider` para o fallback usado em desenvolvimento.
 */
export class ResendEmailProvider implements EmailProvider {
  constructor(
    private readonly apiKey: string,
    private readonly fromAddress: string,
    private readonly appUrl: string,
  ) {}

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${this.appUrl}/verificar-email?token=${encodeURIComponent(token)}`;
    await this.send(
      to,
      "Confirme seu e-mail no Fechô",
      `<p>Falta pouco! Clique no link abaixo para confirmar sua conta no Fechô:</p>
       <p><a href="${verifyUrl}">${verifyUrl}</a></p>
       <p>Se você não criou uma conta, pode ignorar este e-mail.</p>`,
    );
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.appUrl}/redefinir-senha?token=${encodeURIComponent(token)}`;
    await this.send(
      to,
      "Redefinir sua senha no Fechô",
      `<p>Recebemos um pedido para redefinir sua senha. Clique no link abaixo:</p>
       <p><a href="${resetUrl}">${resetUrl}</a></p>
       <p>Se você não pediu isso, pode ignorar este e-mail com segurança.</p>`,
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: this.fromAddress, to, subject, html }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Falha ao enviar e-mail via Resend (HTTP ${response.status}): ${body}`);
    }
  }
}
