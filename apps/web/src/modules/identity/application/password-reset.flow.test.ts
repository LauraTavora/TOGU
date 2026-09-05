import { describe, expect, it } from "vitest";
import { RequestPasswordResetUseCase } from "./request-password-reset.use-case";
import { ResetPasswordUseCase } from "./reset-password.use-case";
import { InvalidOrExpiredTokenError } from "./verify-email.use-case";
import { InMemoryUserRepository } from "../adapters/in-memory-user-repository";
import { InMemoryAuthTokenRepository } from "../adapters/in-memory-auth-token-repository";
import { InMemorySessionRepository } from "../adapters/in-memory-session-repository";
import { BcryptPasswordHasher } from "../adapters/bcrypt-password-hasher";
import { CryptoOpaqueTokenGenerator } from "../adapters/crypto-opaque-token-generator";
import type { EmailProvider } from "../ports/email-provider";
import { InMemoryAuditLogger } from "@/shared/audit/in-memory-audit-logger";

class CapturingEmailProvider implements EmailProvider {
  lastPasswordResetToken: string | null = null;

  async sendVerificationEmail(): Promise<void> {}

  async sendPasswordResetEmail(_to: string, token: string): Promise<void> {
    this.lastPasswordResetToken = token;
  }
}

async function buildScenario() {
  const userRepository = new InMemoryUserRepository();
  const authTokenRepository = new InMemoryAuthTokenRepository();
  const sessionRepository = new InMemorySessionRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenGenerator = new CryptoOpaqueTokenGenerator();
  const emailProvider = new CapturingEmailProvider();
  const auditLogger = new InMemoryAuditLogger();

  const passwordHash = await passwordHasher.hash("SenhaAntiga1");
  const user = await userRepository.create({
    id: "user-1",
    email: "ana@example.com",
    passwordHash,
  });

  await sessionRepository.create({
    id: "session-1",
    userId: user.id,
    refreshTokenHash: "some-active-session-hash",
    expiresAt: new Date(Date.now() + 60_000),
  });

  const requestUseCase = new RequestPasswordResetUseCase(
    userRepository,
    authTokenRepository,
    tokenGenerator,
    emailProvider,
  );
  const resetUseCase = new ResetPasswordUseCase(
    userRepository,
    authTokenRepository,
    tokenGenerator,
    passwordHasher,
    sessionRepository,
    auditLogger,
  );

  return {
    user,
    userRepository,
    sessionRepository,
    requestUseCase,
    resetUseCase,
    emailProvider,
    passwordHasher,
    auditLogger,
  };
}

describe("Fluxo de redefinição de senha", () => {
  it("não revela se o e-mail existe ao solicitar reset (anti-enumeration)", async () => {
    const { requestUseCase } = await buildScenario();
    await expect(requestUseCase.execute("desconhecido@example.com")).resolves.toBeUndefined();
  });

  it("permite redefinir a senha com token válido e revoga sessões ativas", async () => {
    const {
      user,
      userRepository,
      sessionRepository,
      requestUseCase,
      resetUseCase,
      emailProvider,
      passwordHasher,
      auditLogger,
    } = await buildScenario();

    await requestUseCase.execute("ana@example.com");
    const rawToken = emailProvider.lastPasswordResetToken;
    expect(rawToken).toBeTruthy();

    await resetUseCase.execute({ rawToken: rawToken!, newRawPassword: "NovaSenha123" });

    const updated = await userRepository.findById(user.id);
    expect(await passwordHasher.verify("NovaSenha123", updated!.passwordHash)).toBe(true);
    expect(await passwordHasher.verify("SenhaAntiga1", updated!.passwordHash)).toBe(false);

    const session = await sessionRepository.findByRefreshTokenHash("some-active-session-hash");
    expect(session?.revokedAt).not.toBeNull();

    expect(auditLogger.entries).toEqual([{ action: "PASSWORD_CHANGED", actorId: user.id }]);

    // Token de reset não pode ser reutilizado.
    await expect(
      resetUseCase.execute({ rawToken: rawToken!, newRawPassword: "OutraSenha123" }),
    ).rejects.toThrow(InvalidOrExpiredTokenError);
  });

  it("rejeita token de reset inválido", async () => {
    const { resetUseCase } = await buildScenario();
    await expect(
      resetUseCase.execute({ rawToken: "token-invalido", newRawPassword: "NovaSenha123" }),
    ).rejects.toThrow(InvalidOrExpiredTokenError);
  });
});
