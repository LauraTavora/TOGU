import { describe, expect, it } from "vitest";
import { VerifyEmailUseCase, InvalidOrExpiredTokenError } from "./verify-email.use-case";
import { InMemoryUserRepository } from "../adapters/in-memory-user-repository";
import { InMemoryAuthTokenRepository } from "../adapters/in-memory-auth-token-repository";
import { CryptoOpaqueTokenGenerator } from "../adapters/crypto-opaque-token-generator";

async function buildScenario() {
  const userRepository = new InMemoryUserRepository();
  const authTokenRepository = new InMemoryAuthTokenRepository();
  const tokenGenerator = new CryptoOpaqueTokenGenerator();

  const user = await userRepository.create({
    id: "user-1",
    email: "ana@example.com",
    passwordHash: "hash",
  });

  const useCase = new VerifyEmailUseCase(userRepository, authTokenRepository, tokenGenerator);

  return { useCase, user, userRepository, authTokenRepository, tokenGenerator };
}

describe("VerifyEmailUseCase", () => {
  it("marca o e-mail como verificado com token válido", async () => {
    const { useCase, user, userRepository, authTokenRepository, tokenGenerator } =
      await buildScenario();

    const verification = tokenGenerator.generate();
    await authTokenRepository.create({
      id: "token-1",
      userId: user.id,
      purpose: "EMAIL_VERIFICATION",
      tokenHash: verification.tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
    });

    await useCase.execute(verification.token);

    const stored = await userRepository.findById(user.id);
    expect(stored?.emailVerifiedAt).not.toBeNull();
  });

  it("rejeita token expirado", async () => {
    const { useCase, user, authTokenRepository, tokenGenerator } = await buildScenario();

    const verification = tokenGenerator.generate();
    await authTokenRepository.create({
      id: "token-1",
      userId: user.id,
      purpose: "EMAIL_VERIFICATION",
      tokenHash: verification.tokenHash,
      expiresAt: new Date(Date.now() - 1_000),
    });

    await expect(useCase.execute(verification.token)).rejects.toThrow(InvalidOrExpiredTokenError);
  });

  it("rejeita token já utilizado (replay)", async () => {
    const { useCase, user, authTokenRepository, tokenGenerator } = await buildScenario();

    const verification = tokenGenerator.generate();
    await authTokenRepository.create({
      id: "token-1",
      userId: user.id,
      purpose: "EMAIL_VERIFICATION",
      tokenHash: verification.tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
    });

    await useCase.execute(verification.token);
    await expect(useCase.execute(verification.token)).rejects.toThrow(InvalidOrExpiredTokenError);
  });

  it("rejeita token desconhecido", async () => {
    const { useCase } = await buildScenario();
    await expect(useCase.execute("token-invalido")).rejects.toThrow(InvalidOrExpiredTokenError);
  });
});
