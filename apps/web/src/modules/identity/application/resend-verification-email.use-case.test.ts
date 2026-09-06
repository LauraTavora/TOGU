import { describe, expect, it } from "vitest";
import { ResendVerificationEmailUseCase } from "./resend-verification-email.use-case";
import { InMemoryUserRepository } from "../adapters/in-memory-user-repository";
import { InMemoryAuthTokenRepository } from "../adapters/in-memory-auth-token-repository";
import { CryptoOpaqueTokenGenerator } from "../adapters/crypto-opaque-token-generator";
import type { EmailProvider } from "../ports/email-provider";

class CapturingEmailProvider implements EmailProvider {
  lastVerificationToken: string | null = null;
  sendCount = 0;

  async sendVerificationEmail(_to: string, token: string): Promise<void> {
    this.sendCount += 1;
    this.lastVerificationToken = token;
  }

  async sendPasswordResetEmail(): Promise<void> {}
}

async function buildScenario() {
  const userRepository = new InMemoryUserRepository();
  const authTokenRepository = new InMemoryAuthTokenRepository();
  const tokenGenerator = new CryptoOpaqueTokenGenerator();
  const emailProvider = new CapturingEmailProvider();

  const user = await userRepository.create({
    id: "user-1",
    email: "ana@example.com",
    passwordHash: "hash-irrelevante",
  });

  const useCase = new ResendVerificationEmailUseCase(
    userRepository,
    authTokenRepository,
    tokenGenerator,
    emailProvider,
  );

  return { useCase, user, userRepository, emailProvider };
}

describe("ResendVerificationEmailUseCase", () => {
  it("reenvia o e-mail de verificação para conta ainda não verificada", async () => {
    const { useCase, user, emailProvider } = await buildScenario();

    await useCase.execute(user.email);

    expect(emailProvider.sendCount).toBe(1);
    expect(emailProvider.lastVerificationToken).toBeTruthy();
  });

  it("não envia nada para e-mail inexistente (anti-enumeration)", async () => {
    const { useCase, emailProvider } = await buildScenario();

    await useCase.execute("desconhecido@example.com");

    expect(emailProvider.sendCount).toBe(0);
  });

  it("não envia nada se a conta já estiver verificada", async () => {
    const { useCase, user, userRepository, emailProvider } = await buildScenario();
    await userRepository.markEmailVerified(user.id, new Date());

    await useCase.execute(user.email);

    expect(emailProvider.sendCount).toBe(0);
  });
});
