import { randomUUID } from "node:crypto";
import { REFRESH_TOKEN_TTL_MS } from "../domain/constants";
import type { UserRepository } from "../ports/user-repository";
import type { SessionRepository } from "../ports/session-repository";
import type { PasswordHasher } from "../ports/password-hasher";
import type { OpaqueTokenGenerator } from "../ports/opaque-token-generator";
import type { AccessTokenSigner } from "../ports/access-token-signer";
import type { AuditLogger } from "@/shared/audit";

export class InvalidCredentialsError extends Error {
  constructor() {
    // Mensagem genérica de propósito — nunca revelar se o e-mail existe (anti-enumeration).
    super("E-mail ou senha inválidos.");
  }
}

export interface LoginInput {
  email: string;
  rawPassword: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: OpaqueTokenGenerator,
    private readonly accessTokenSigner: AccessTokenSigner,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email.trim().toLowerCase());
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.verify(input.rawPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const refresh = this.tokenGenerator.generate();
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.sessionRepository.create({
      id: randomUUID(),
      userId: user.id,
      refreshTokenHash: refresh.tokenHash,
      expiresAt: refreshTokenExpiresAt,
    });

    const accessToken = await this.accessTokenSigner.sign({ userId: user.id });

    await this.auditLogger.record({ action: "LOGIN", actorId: user.id });

    return { accessToken, refreshToken: refresh.token, refreshTokenExpiresAt };
  }
}
