export interface User {
  id: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt: Date | null;
  deletionRequestedAt: Date | null;
  createdAt: Date;
}
