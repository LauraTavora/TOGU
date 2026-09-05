import bcrypt from "bcryptjs";
import type { PasswordHasher } from "../ports/password-hasher";

const SALT_ROUNDS = 12;

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(rawPassword: string): Promise<string> {
    return bcrypt.hash(rawPassword, SALT_ROUNDS);
  }

  async verify(rawPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hash);
  }
}
