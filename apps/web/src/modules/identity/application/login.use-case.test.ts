import { describe, expect, it } from "vitest";
import { LoginUseCase, EmailNotVerifiedError, InvalidCredentialsError } from "./login.use-case";
import { InMemoryUserRepository } from "../adapters/in-memory-user-repository";
import { InMemorySessionRepository } from "../adapters/in-memory-session-repository";
import { BcryptPasswordHasher } from "../adapters/bcrypt-password-hasher";
import { CryptoOpaqueTokenGenerator } from "../adapters/crypto-opaque-token-generator";
import { JoseAccessTokenSigner } from "../adapters/jose-access-token-signer";
import { InMemoryAuditLogger } from "@/shared/audit/in-memory-audit-logger";

async function buildScenario() {
  const userRepository = new InMemoryUserRepository();
  const sessionRepository = new InMemorySessionRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenGenerator = new CryptoOpaqueTokenGenerator();
  const accessTokenSigner = new JoseAccessTokenSigner("test-secret");
  const auditLogger = new InMemoryAuditLogger();

  const passwordHash = await passwordHasher.hash("Segura123");
  const user = await userRepository.create({
    id: "user-1",
    email: "ana@example.com",
    passwordHash,
  });
  await userRepository.markEmailVerified(user.id, new Date());

  const useCase = new LoginUseCase(
    userRepository,
    sessionRepository,
    passwordHasher,
    tokenGenerator,
    accessTokenSigner,
    auditLogger,
  );

  return { useCase, user, userRepository, sessionRepository, accessTokenSigner, tokenGenerator, auditLogger };
}

describe("LoginUseCase", () => {
  it("autentica com credenciais corretas e cria uma sessão", async () => {
    const { useCase, sessionRepository, accessTokenSigner, tokenGenerator, auditLogger } =
      await buildScenario();

    const result = await useCase.execute({ email: "ana@example.com", rawPassword: "Segura123" });

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();

    const payload = await accessTokenSigner.verify(result.accessToken);
    expect(payload?.userId).toBe("user-1");

    const session = await sessionRepository.findByRefreshTokenHash(
      tokenGenerator.hash(result.refreshToken),
    );
    expect(session).not.toBeNull();

    expect(auditLogger.entries).toEqual([{ action: "LOGIN", actorId: "user-1" }]);
  });

  it("rejeita senha incorreta com erro genérico e não registra auditoria de LOGIN", async () => {
    const { useCase, auditLogger } = await buildScenario();
    await expect(
      useCase.execute({ email: "ana@example.com", rawPassword: "SenhaErrada1" }),
    ).rejects.toThrow(InvalidCredentialsError);
    expect(auditLogger.entries).toHaveLength(0);
  });

  it("rejeita e-mail inexistente com o mesmo erro genérico (anti-enumeration)", async () => {
    const { useCase } = await buildScenario();
    await expect(
      useCase.execute({ email: "outra@example.com", rawPassword: "Segura123" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("bloqueia login de conta com e-mail ainda não verificado", async () => {
    const { useCase, userRepository, auditLogger } = await buildScenario();
    const passwordHasher = new BcryptPasswordHasher();
    const unverified = await userRepository.create({
      id: "user-2",
      email: "bruno@example.com",
      passwordHash: await passwordHasher.hash("OutraSenha123"),
    });

    await expect(
      useCase.execute({ email: unverified.email, rawPassword: "OutraSenha123" }),
    ).rejects.toThrow(EmailNotVerifiedError);
    expect(auditLogger.entries).toHaveLength(0);
  });
});
