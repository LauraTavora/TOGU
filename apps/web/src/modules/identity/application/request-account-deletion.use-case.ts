import { computeScheduledDeletionAt } from "../domain/account-deletion";
import type { UserRepository } from "../ports/user-repository";
import type { PasswordHasher } from "../ports/password-hasher";
import type { SessionRepository } from "../ports/session-repository";
import type { AuditLogger } from "@/shared/audit";

export class IncorrectPasswordError extends Error {
  constructor() {
    super("Senha incorreta.");
  }
}

export class RequestAccountDeletionUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionRepository: SessionRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(userId: string, rawPassword: string): Promise<{ scheduledDeletionAt: Date }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new IncorrectPasswordError();
    }

    const passwordMatches = await this.passwordHasher.verify(rawPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new IncorrectPasswordError();
    }

    const requestedAt = new Date();
    await this.userRepository.setDeletionRequestedAt(userId, requestedAt);

    // Desloga de todos os dispositivos: quem quiser cancelar dentro da
    // carência precisa entrar de novo com a senha — mesma fricção usada
    // em redefinição de senha (ver reset-password.use-case.ts).
    await this.sessionRepository.revokeAllForUser(userId, requestedAt);

    await this.auditLogger.record({ action: "ACCOUNT_DELETED", actorId: userId, metadata: { stage: "requested" } });

    return { scheduledDeletionAt: computeScheduledDeletionAt(requestedAt) };
  }
}
