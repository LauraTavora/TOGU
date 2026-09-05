import { randomUUID } from "node:crypto";
import { isSessionActive } from "../domain/session";
import { REFRESH_TOKEN_TTL_MS } from "../domain/constants";
import type { SessionRepository } from "../ports/session-repository";
import type { OpaqueTokenGenerator } from "../ports/opaque-token-generator";
import type { AccessTokenSigner } from "../ports/access-token-signer";

export class InvalidSessionError extends Error {
  constructor() {
    super("Sessão inválida, expirada ou revogada.");
  }
}

export interface RefreshSessionOutput {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

/**
 * Rotação de refresh token: a cada uso, o token anterior é revogado e um
 * novo é emitido. Evita reutilização indevida (replay) de um token vazado
 * antigo — ver docs/SECURITY.md.
 */
export class RefreshSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly tokenGenerator: OpaqueTokenGenerator,
    private readonly accessTokenSigner: AccessTokenSigner,
  ) {}

  async execute(rawRefreshToken: string): Promise<RefreshSessionOutput> {
    const refreshTokenHash = this.tokenGenerator.hash(rawRefreshToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(refreshTokenHash);

    const now = new Date();
    if (!session || !isSessionActive(session, now)) {
      throw new InvalidSessionError();
    }

    await this.sessionRepository.revoke(session.id, now);

    const nextRefresh = this.tokenGenerator.generate();
    const refreshTokenExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_MS);

    await this.sessionRepository.create({
      id: randomUUID(),
      userId: session.userId,
      refreshTokenHash: nextRefresh.tokenHash,
      expiresAt: refreshTokenExpiresAt,
    });

    const accessToken = await this.accessTokenSigner.sign({ userId: session.userId });

    return { accessToken, refreshToken: nextRefresh.token, refreshTokenExpiresAt };
  }
}
