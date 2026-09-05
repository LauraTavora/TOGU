import { assertPasswordStrength } from "../domain/password-policy";
import type { UserRepository } from "../ports/user-repository";
import type { AuthTokenRepository } from "../ports/auth-token-repository";
import type { OpaqueTokenGenerator } from "../ports/opaque-token-generator";
import type { PasswordHasher } from "../ports/password-hasher";
import type { SessionRepository } from "../ports/session-repository";
import { InvalidOrExpiredTokenError } from "./verify-email.use-case";
import type { AuditLogger } from "@/shared/audit";

export interface ResetPasswordInput {
  rawToken: string;
  newRawPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly tokenGenerator: OpaqueTokenGenerator,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionRepository: SessionRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    assertPasswordStrength(input.newRawPassword);

    const tokenHash = this.tokenGenerator.hash(input.rawToken);
    const record = await this.authTokenRepository.findByHash(tokenHash, "PASSWORD_RESET");

    const now = new Date();
    if (!record || record.usedAt !== null || record.expiresAt <= now) {
      throw new InvalidOrExpiredTokenError();
    }

    const passwordHash = await this.passwordHasher.hash(input.newRawPassword);
    await this.userRepository.updatePasswordHash(record.userId, passwordHash);
    await this.authTokenRepository.markUsed(record.id, now);

    // Redefinir a senha revoga todas as sessões ativas — mitiga sequestro de sessão.
    await this.sessionRepository.revokeAllForUser(record.userId, now);

    await this.auditLogger.record({ action: "PASSWORD_CHANGED", actorId: record.userId });
  }
}
