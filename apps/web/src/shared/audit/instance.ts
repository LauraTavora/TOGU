import { prisma } from "@fecho/database";
import { PrismaAuditLogger } from "./prisma-audit-logger";
import type { AuditLogger } from "./audit-logger";

const sharedAuditLogger: AuditLogger = new PrismaAuditLogger(prisma);

export function getAuditLogger(): AuditLogger {
  return sharedAuditLogger;
}
