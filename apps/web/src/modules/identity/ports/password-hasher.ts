export interface PasswordHasher {
  hash(rawPassword: string): Promise<string>;
  verify(rawPassword: string, hash: string): Promise<boolean>;
}
