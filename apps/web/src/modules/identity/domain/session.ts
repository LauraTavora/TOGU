export interface Session {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export function isSessionActive(session: Session, now: Date): boolean {
  return session.revokedAt === null && session.expiresAt > now;
}
