import type { PrismaClient } from "@fecho/database";
import type { Session } from "../domain/session";
import type { CreateSessionInput, SessionRepository } from "../ports/session-repository";

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateSessionInput): Promise<Session> {
    const record = await this.prisma.session.create({
      data: {
        id: input.id,
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
      },
    });
    return this.toDomain(record);
  }

  async findByRefreshTokenHash(refreshTokenHash: string): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({ where: { refreshTokenHash } });
    return record ? this.toDomain(record) : null;
  }

  async revoke(sessionId: string, revokedAt: Date): Promise<void> {
    await this.prisma.session.update({ where: { id: sessionId }, data: { revokedAt } });
  }

  async revokeAllForUser(userId: string, revokedAt: Date): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt },
    });
  }

  private toDomain(record: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }): Session {
    return { ...record };
  }
}
