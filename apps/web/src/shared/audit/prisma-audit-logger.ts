import { randomUUID } from "node:crypto";
import type { PrismaClient, Prisma } from "@togu/database";
import type { AuditEntry, AuditLogger } from "./audit-logger";

/**
 * Best-effort por design (ver ADR-012): uma falha ao gravar o log de
 * auditoria nunca deve impedir a ação de negócio que está sendo
 * auditada (ex.: login, criação de evento). Erros são capturados e
 * apenas logados.
 */
export class PrismaAuditLogger implements AuditLogger {
  constructor(private readonly prisma: PrismaClient) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          id: randomUUID(),
          action: entry.action,
          ...(entry.actorId !== undefined && { actorId: entry.actorId }),
          ...(entry.workspaceId !== undefined && { workspaceId: entry.workspaceId }),
          ...(entry.metadata !== undefined && { metadata: entry.metadata as Prisma.InputJsonValue }),
        },
      });
    } catch (error) {
      console.error("[audit] falha ao gravar log de auditoria", entry.action, error);
    }
  }
}
