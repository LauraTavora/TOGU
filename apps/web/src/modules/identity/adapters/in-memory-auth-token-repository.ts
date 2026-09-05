import type {
  AuthTokenPurpose,
  AuthTokenRecord,
  AuthTokenRepository,
  CreateAuthTokenInput,
} from "../ports/auth-token-repository";

export class InMemoryAuthTokenRepository implements AuthTokenRepository {
  private readonly tokens = new Map<string, AuthTokenRecord>();

  async create(input: CreateAuthTokenInput): Promise<AuthTokenRecord> {
    const record: AuthTokenRecord = { ...input, usedAt: null };
    this.tokens.set(record.id, record);
    return record;
  }

  async findByHash(tokenHash: string, purpose: AuthTokenPurpose): Promise<AuthTokenRecord | null> {
    for (const record of this.tokens.values()) {
      if (record.tokenHash === tokenHash && record.purpose === purpose) return record;
    }
    return null;
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    const record = this.tokens.get(id);
    if (record) record.usedAt = usedAt;
  }

  /** Utilitário exclusivo de testes — não faz parte do port AuthTokenRepository. */
  findAllForUser(userId: string): AuthTokenRecord[] {
    return Array.from(this.tokens.values()).filter((record) => record.userId === userId);
  }
}
