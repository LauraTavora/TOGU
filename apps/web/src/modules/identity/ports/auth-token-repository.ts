export type AuthTokenPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

export interface AuthTokenRecord {
  id: string;
  userId: string;
  purpose: AuthTokenPurpose;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface CreateAuthTokenInput {
  id: string;
  userId: string;
  purpose: AuthTokenPurpose;
  tokenHash: string;
  expiresAt: Date;
}

export interface AuthTokenRepository {
  create(input: CreateAuthTokenInput): Promise<AuthTokenRecord>;
  findByHash(tokenHash: string, purpose: AuthTokenPurpose): Promise<AuthTokenRecord | null>;
  markUsed(id: string, usedAt: Date): Promise<void>;
}
