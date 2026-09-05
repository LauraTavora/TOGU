import { describe, expect, it } from "vitest";
import { RequestAccountDeletionUseCase, IncorrectPasswordError } from "./request-account-deletion.use-case";
import { CancelAccountDeletionUseCase } from "./cancel-account-deletion.use-case";
import { ExecuteScheduledAccountDeletionsUseCase } from "./execute-scheduled-account-deletions.use-case";
import { GetAccountDeletionStatusUseCase } from "./get-account-deletion-status.use-case";
import { ACCOUNT_DELETION_GRACE_PERIOD_DAYS } from "../domain/account-deletion";
import { InMemoryUserRepository } from "../adapters/in-memory-user-repository";
import { InMemorySessionRepository } from "../adapters/in-memory-session-repository";
import { BcryptPasswordHasher } from "../adapters/bcrypt-password-hasher";
import { InMemoryAuditLogger } from "@/shared/audit/in-memory-audit-logger";

async function buildScenario() {
  const userRepository = new InMemoryUserRepository();
  const sessionRepository = new InMemorySessionRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const auditLogger = new InMemoryAuditLogger();

  const passwordHash = await passwordHasher.hash("SenhaCerta1");
  const user = await userRepository.create({ id: "user-1", email: "ana@example.com", passwordHash });

  await sessionRepository.create({
    id: "session-1",
    userId: user.id,
    refreshTokenHash: "active-session-hash",
    expiresAt: new Date(Date.now() + 60_000),
  });

  const requestUseCase = new RequestAccountDeletionUseCase(
    userRepository,
    passwordHasher,
    sessionRepository,
    auditLogger,
  );
  const cancelUseCase = new CancelAccountDeletionUseCase(userRepository);
  const statusUseCase = new GetAccountDeletionStatusUseCase(userRepository);
  const executeUseCase = new ExecuteScheduledAccountDeletionsUseCase(userRepository, auditLogger);

  return { user, userRepository, sessionRepository, auditLogger, requestUseCase, cancelUseCase, statusUseCase, executeUseCase };
}

describe("Fluxo de exclusão de conta (LGPD)", () => {
  it("rejeita senha incorreta e não altera nada", async () => {
    const { requestUseCase, userRepository, user } = await buildScenario();

    await expect(requestUseCase.execute(user.id, "senha-errada")).rejects.toThrow(IncorrectPasswordError);

    const unchanged = await userRepository.findById(user.id);
    expect(unchanged?.deletionRequestedAt).toBeNull();
  });

  it("agenda a exclusão, revoga sessões ativas e registra auditoria", async () => {
    const { requestUseCase, userRepository, sessionRepository, auditLogger, user } = await buildScenario();

    const { scheduledDeletionAt } = await requestUseCase.execute(user.id, "SenhaCerta1");

    const updated = await userRepository.findById(user.id);
    expect(updated?.deletionRequestedAt).not.toBeNull();
    expect(scheduledDeletionAt.getTime() - updated!.deletionRequestedAt!.getTime()).toBe(
      ACCOUNT_DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    );

    const session = await sessionRepository.findByRefreshTokenHash("active-session-hash");
    expect(session?.revokedAt).not.toBeNull();

    expect(auditLogger.entries).toContainEqual({
      action: "ACCOUNT_DELETED",
      actorId: user.id,
      metadata: { stage: "requested" },
    });
  });

  it("permite cancelar dentro da carência", async () => {
    const { requestUseCase, cancelUseCase, statusUseCase, userRepository, user } = await buildScenario();

    await requestUseCase.execute(user.id, "SenhaCerta1");
    await cancelUseCase.execute(user.id);

    const updated = await userRepository.findById(user.id);
    expect(updated?.deletionRequestedAt).toBeNull();

    const status = await statusUseCase.execute(user.id);
    expect(status).toEqual({ requestedAt: null, scheduledDeletionAt: null });
  });

  it("anonimiza só quem já venceu a carência, preservando quem ainda está dentro dela", async () => {
    const { requestUseCase, executeUseCase, userRepository, auditLogger, user } = await buildScenario();

    await requestUseCase.execute(user.id, "SenhaCerta1");

    // Ainda dentro da carência: nada muda.
    const tooEarly = await executeUseCase.execute(new Date());
    expect(tooEarly.processedCount).toBe(0);
    expect((await userRepository.findById(user.id))?.email).toBe("ana@example.com");

    // Depois do fim da carência: anonimiza.
    const afterGracePeriod = new Date(Date.now() + (ACCOUNT_DELETION_GRACE_PERIOD_DAYS + 1) * 24 * 60 * 60 * 1000);
    const result = await executeUseCase.execute(afterGracePeriod);
    expect(result.processedCount).toBe(1);

    const anonymized = await userRepository.findById(user.id);
    expect(anonymized?.email).toBe(`deleted-${user.id}@togu.invalid`);
    expect(anonymized?.passwordHash).toBe("");
    expect(anonymized?.deletionRequestedAt).toBeNull();

    expect(auditLogger.entries).toContainEqual({
      action: "ACCOUNT_DELETED",
      actorId: user.id,
      metadata: { stage: "executed" },
    });
  });
});
