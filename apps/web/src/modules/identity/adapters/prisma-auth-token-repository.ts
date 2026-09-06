import type { PrismaClient } from "@fecho/database";
import type {
  AuthTokenPurpose,
  AuthTokenRecord,
  AuthTokenRepository,
  CreateAuthTokenInput,
} from "../ports/auth-token-repository";

export class PrismaAuthTokenRepository implements AuthTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateAuthTokenInput): Promise<AuthTokenRecord> {
    const record = await this.prisma.authToken.create({
      data: {
        id: input.id,
        userId: input.userId,
        purpose: input.purpose,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
    return record;
  }

  async findByHash(tokenHash: string, purpose: AuthTokenPurpose): Promise<AuthTokenRecord | null> {
    const record = await this.prisma.authToken.findFirst({ where: { tokenHash, purpose } });
    return record;
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    await this.prisma.authToken.update({ where: { id }, data: { usedAt } });
  }
}
