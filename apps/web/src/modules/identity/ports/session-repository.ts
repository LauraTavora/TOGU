import type { Session } from "../domain/session";

export interface CreateSessionInput {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<Session>;
  findByRefreshTokenHash(refreshTokenHash: string): Promise<Session | null>;
  revoke(sessionId: string, revokedAt: Date): Promise<void>;
  revokeAllForUser(userId: string, revokedAt: Date): Promise<void>;
}
