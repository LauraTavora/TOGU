import { ACCOUNT_DELETION_GRACE_PERIOD_DAYS, anonymizedEmailFor } from "../domain/account-deletion";
import type { UserRepository } from "../ports/user-repository";
import type { AuditLogger } from "@/shared/audit";

/**
 * Roda periodicamente (worker/cron externo, protegido por segredo — mesmo
 * padrão de `sync-nearby-events`) depois que a carência de uma solicitação
 * de exclusão vence. Anonimiza a linha de `User` (e-mail, senha) em vez de
 * apagá-la — ver ADR-022 para o porquê e para o que ainda NÃO é limpo por
 * este use case (dados pessoais em outros módulos).
 */
export class ExecuteScheduledAccountDeletionsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(now: Date = new Date()): Promise<{ processedCount: number }> {
    // findScheduledForDeletion só compara deletionRequestedAt <= corte — a
    // carência precisa ser subtraída aqui, ou toda solicitação seria
    // executada na hora, sem esperar nenhum dia.
    const cutoff = new Date(now.getTime() - ACCOUNT_DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const dueUsers = await this.userRepository.findScheduledForDeletion(cutoff);

    for (const user of dueUsers) {
      await this.userRepository.anonymize(user.id, anonymizedEmailFor(user.id));
      await this.auditLogger.record({
        action: "ACCOUNT_DELETED",
        actorId: user.id,
        metadata: { stage: "executed" },
      });
    }

    return { processedCount: dueUsers.length };
  }
}
