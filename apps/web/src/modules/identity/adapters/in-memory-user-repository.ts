import type { User } from "../domain/user";
import type { CreateUserInput, UserRepository } from "../ports/user-repository";

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findManyByIds(ids: string[]): Promise<User[]> {
    return ids.map((id) => this.users.get(id)).filter((user): user is User => user !== undefined);
  }

  async create(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: input.id,
      email: input.email,
      passwordHash: input.passwordHash,
      emailVerifiedAt: null,
      deletionRequestedAt: null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async markEmailVerified(userId: string, verifiedAt: Date): Promise<void> {
    const user = this.users.get(userId);
    if (user) user.emailVerifiedAt = verifiedAt;
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) user.passwordHash = passwordHash;
  }

  async setDeletionRequestedAt(userId: string, at: Date | null): Promise<void> {
    const user = this.users.get(userId);
    if (user) user.deletionRequestedAt = at;
  }

  async findScheduledForDeletion(before: Date): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.deletionRequestedAt !== null && user.deletionRequestedAt <= before,
    );
  }

  async anonymize(userId: string, anonymizedEmail: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;
    user.email = anonymizedEmail;
    user.passwordHash = "";
    user.emailVerifiedAt = null;
    user.deletionRequestedAt = null;
  }
}
