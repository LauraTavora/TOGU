import type { SessionRepository } from "../ports/session-repository";
import type { OpaqueTokenGenerator } from "../ports/opaque-token-generator";

export class LogoutUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly tokenGenerator: OpaqueTokenGenerator,
  ) {}

  async execute(rawRefreshToken: string): Promise<void> {
    const refreshTokenHash = this.tokenGenerator.hash(rawRefreshToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(refreshTokenHash);
    if (!session) {
      return;
    }
    await this.sessionRepository.revoke(session.id, new Date());
  }
}
