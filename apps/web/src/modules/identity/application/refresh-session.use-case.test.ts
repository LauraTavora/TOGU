import { describe, expect, it } from "vitest";
import { RefreshSessionUseCase, InvalidSessionError } from "./refresh-session.use-case";
import { InMemorySessionRepository } from "../adapters/in-memory-session-repository";
import { CryptoOpaqueTokenGenerator } from "../adapters/crypto-opaque-token-generator";
import { JoseAccessTokenSigner } from "../adapters/jose-access-token-signer";

describe("RefreshSessionUseCase", () => {
  it("rotaciona o refresh token e revoga o anterior", async () => {
    const sessionRepository = new InMemorySessionRepository();
    const tokenGenerator = new CryptoOpaqueTokenGenerator();
    const useCase = new RefreshSessionUseCase(
      sessionRepository,
      tokenGenerator,
      new JoseAccessTokenSigner("test-secret"),
    );

    const initial = tokenGenerator.generate();
    await sessionRepository.create({
      id: "session-1",
      userId: "user-1",
      refreshTokenHash: initial.tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const result = await useCase.execute(initial.token);
    expect(result.refreshToken).not.toBe(initial.token);

    const oldSession = await sessionRepository.findByRefreshTokenHash(initial.tokenHash);
    expect(oldSession?.revokedAt).not.toBeNull();

    // O token antigo não pode mais ser usado (evita replay).
    await expect(useCase.execute(initial.token)).rejects.toThrow(InvalidSessionError);
  });

  it("rejeita refresh token inexistente", async () => {
    const sessionRepository = new InMemorySessionRepository();
    const tokenGenerator = new CryptoOpaqueTokenGenerator();
    const useCase = new RefreshSessionUseCase(
      sessionRepository,
      tokenGenerator,
      new JoseAccessTokenSigner("test-secret"),
    );

    await expect(useCase.execute("token-nunca-emitido")).rejects.toThrow(InvalidSessionError);
  });

  it("rejeita refresh token expirado", async () => {
    const sessionRepository = new InMemorySessionRepository();
    const tokenGenerator = new CryptoOpaqueTokenGenerator();
    const useCase = new RefreshSessionUseCase(
      sessionRepository,
      tokenGenerator,
      new JoseAccessTokenSigner("test-secret"),
    );

    const expired = tokenGenerator.generate();
    await sessionRepository.create({
      id: "session-2",
      userId: "user-1",
      refreshTokenHash: expired.tokenHash,
      expiresAt: new Date(Date.now() - 1_000),
    });

    await expect(useCase.execute(expired.token)).rejects.toThrow(InvalidSessionError);
  });
});
