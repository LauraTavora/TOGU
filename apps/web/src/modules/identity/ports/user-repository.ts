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
}
