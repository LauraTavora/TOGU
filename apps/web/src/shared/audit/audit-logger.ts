import type { AuditAction } from "./audit-action";

export interface AuditEntry {
  action: AuditAction;
  actorId?: string | undefined;
  workspaceId?: string | undefined;
  /** Nunca incluir senhas, tokens ou dados sensíveis — ver docs/SECURITY.md §Auditoria. */
  metadata?: Record<string, unknown> | undefined;
}

/**
 * Port de auditoria — usado por qualquer módulo para registrar eventos
 * de segurança relevantes (docs/PRODUCT.md §62). Ver docs/adr/ADR-012
 * para a política de falha (best-effort, nunca bloqueia a ação principal).
 */
export interface AuditLogger {
  record(entry: AuditEntry): Promise<void>;
}
