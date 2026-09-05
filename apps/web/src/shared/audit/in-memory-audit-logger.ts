import type { AuditEntry, AuditLogger } from "./audit-logger";

export class InMemoryAuditLogger implements AuditLogger {
  readonly entries: AuditEntry[] = [];

  async record(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
  }
}
