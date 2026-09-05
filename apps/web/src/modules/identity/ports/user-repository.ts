import type { User } from "../domain/user";

export interface CreateUserInput {
  id: string;
  email: string;
  passwordHash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findManyByIds(ids: string[]): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  markEmailVerified(userId: string, verifiedAt: Date): Promise<void>;
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
  setDeletionRequestedAt(userId: string, at: Date | null): Promise<void>;
  findScheduledForDeletion(before: Date): Promise<User[]>;
  /** Anonimiza a conta (e-mail/senha) sem apagar a linha — ver ADR-022. */
  anonymize(userId: string, anonymizedEmail: string): Promise<void>;
}
