/**
 * Período de carência (LGPD — docs/PRIVACY-LGPD.md): dá tempo para o
 * usuário se arrepender antes da anonimização definitiva. Ver ADR-022.
 */
export const ACCOUNT_DELETION_GRACE_PERIOD_DAYS = 14;

export function computeScheduledDeletionAt(requestedAt: Date): Date {
  return new Date(requestedAt.getTime() + ACCOUNT_DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
}

export function anonymizedEmailFor(userId: string): string {
  return `deleted-${userId}@fecho.invalid`;
}
