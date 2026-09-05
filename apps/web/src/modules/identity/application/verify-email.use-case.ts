import type { UserRepository } from "../ports/user-repository";
import type { AuthTokenRepository } from "../ports/auth-token-repository";
import type { OpaqueTokenGenerator } from "../ports/opaque-token-generator";

export class InvalidOrExpiredTokenError extends Error {
  constructor() {
    super("Token inválido ou expirado.");
  }
}

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly tokenGenerator: OpaqueTokenGenerator,
  ) {}

  async execute(rawToken: string): Promise<void> {
    const tokenHash = this.tokenGenerator.hash(rawToken);
    const record = await this.authTokenRepository.findByHash(tokenHash, "EMAIL_VERIFICATION");

    const now = new Date();
    if (!record || record.usedAt !== null || record.expiresAt <= now) {
      throw new InvalidOrExpiredTokenError();
    }

    await this.userRepository.markEmailVerified(record.userId, now);
    await this.authTokenRepository.markUsed(record.id, now);
  }
}
