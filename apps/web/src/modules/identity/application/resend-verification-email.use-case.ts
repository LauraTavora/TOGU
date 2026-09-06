import { randomUUID } from "node:crypto";
import { EMAIL_VERIFICATION_TOKEN_TTL_MS } from "../domain/constants";
import type { UserRepository } from "../ports/user-repository";
import type { AuthTokenRepository } from "../ports/auth-token-repository";
import type { OpaqueTokenGenerator } from "../ports/opaque-token-generator";
import type { EmailProvider } from "../ports/email-provider";

export class ResendVerificationEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly tokenGenerator: OpaqueTokenGenerator,
    private readonly emailProvider: EmailProvider,
  ) {}

  /**
   * Nunca revela se o e-mail existe ou já foi verificado (anti-enumeration,
   * mesmo padrão de request-password-reset.use-case.ts): sempre resolve
   * silenciosamente, enviando o e-mail só quando faz sentido de verdade.
   * Necessário porque o token de verificação expira em 24h (ver
   * domain/constants.ts) e, sem isso, quem perdesse o e-mail original
   * ficaria com a conta travada para sempre (login já bloqueia contas não
   * verificadas — ver login.use-case.ts).
   */
  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email.trim().toLowerCase());
    if (!user || user.emailVerifiedAt) {
      return;
    }

    const verification = this.tokenGenerator.generate();
    await this.authTokenRepository.create({
      id: randomUUID(),
      userId: user.id,
      purpose: "EMAIL_VERIFICATION",
      tokenHash: verification.tokenHash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
    });
    await this.emailProvider.sendVerificationEmail(user.email, verification.token);
  }
}
