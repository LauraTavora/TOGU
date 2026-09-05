import type { Session } from "../domain/session";
import type { CreateSessionInput, SessionRepository } from "../ports/session-repository";

export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, Session>();

  async create(input: CreateSessionInput): Promise<Session> {
    const session: Session = {
      id: input.id,
      userId: input.userId,
      refreshTokenHash: input.refreshTokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
      createdAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async findByRefreshTokenHash(refreshTokenHash: string): Promise<Session | null> {
    for (const session of this.sessions.values()) {
      if (session.refreshTokenHash === refreshTokenHash) return session;
    }
    return null;
  }

  async revoke(sessionId: string, revokedAt: Date): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) session.revokedAt = revokedAt;
  }

  async revokeAllForUser(userId: string, revokedAt: Date): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.revokedAt === null) {
        session.revokedAt = revokedAt;
      }
    }
  }
}
