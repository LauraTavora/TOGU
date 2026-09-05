import { randomUUID } from "node:crypto";
import { PASSWORD_RESET_TOKEN_TTL_MS } from "../domain/constants";
import type { UserRepository } from "../ports/user-repository";
import type { AuthTokenRepository } from "../ports/auth-token-repository";
import type { OpaqueTokenGenerator } from "../ports/opaque-token-generator";
import type { EmailProvider } from "../ports/email-provider";

export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly tokenGenerator: OpaqueTokenGenerator,
    private readonly emailProvider: EmailProvider,
  ) {}

  /**
   * Nunca revela se o e-mail existe (anti-enumeration): sempre resolve
   * silenciosamente, enviando o e-mail apenas quando a conta existe.
   */
  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email.trim().toLowerCase());
    if (!user) {
      return;
    }

    const reset = this.tokenGenerator.generate();
    await this.authTokenRepository.create({
      id: randomUUID(),
      userId: user.id,
      purpose: "PASSWORD_RESET",
      tokenHash: reset.tokenHash,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    });
    await this.emailProvider.sendPasswordResetEmail(user.email, reset.token);
  }
}
