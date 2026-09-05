import type { PrismaClient } from "@togu/database";
import type { User } from "../domain/user";
import type { CreateUserInput, UserRepository } from "../ports/user-repository";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findManyByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const records = await this.prisma.user.findMany({ where: { id: { in: ids } } });
    return records.map((record) => this.toDomain(record));
  }

  async create(input: CreateUserInput): Promise<User> {
    const record = await this.prisma.user.create({
      data: { id: input.id, email: input.email, passwordHash: input.passwordHash },
    });
    return this.toDomain(record);
  }

  async markEmailVerified(userId: string, verifiedAt: Date): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { emailVerified: verifiedAt } });
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  private toDomain(record: {
    id: string;
    email: string;
    passwordHash: string | null;
    emailVerified: Date | null;
    createdAt: Date;
  }): User {
    return {
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash ?? "",
      emailVerifiedAt: record.emailVerified,
      createdAt: record.createdAt,
    };
  }
}
