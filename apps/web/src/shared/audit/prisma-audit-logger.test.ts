import { describe, expect, it, vi } from "vitest";
import { PrismaAuditLogger } from "./prisma-audit-logger";
import type { PrismaClient } from "@togu/database";

function fakePrisma(createImpl: (...args: unknown[]) => unknown): PrismaClient {
  return { auditLog: { create: vi.fn(createImpl) } } as unknown as PrismaClient;
}

describe("PrismaAuditLogger", () => {
  it("grava a entrada com os campos informados", async () => {
    const create = vi.fn().mockResolvedValue({});
    const prisma = { auditLog: { create } } as unknown as PrismaClient;
    const logger = new PrismaAuditLogger(prisma);

    await logger.record({ action: "LOGIN", actorId: "user-1", metadata: { via: "password" } });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "LOGIN",
          actorId: "user-1",
          metadata: { via: "password" },
        }),
      }),
    );
  });

  it("nunca lança (best-effort) quando a escrita falha", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const prisma = fakePrisma(() => {
      throw new Error("db indisponível");
    });
    const logger = new PrismaAuditLogger(prisma);

    await expect(logger.record({ action: "EVENT_CREATED", actorId: "user-1" })).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("omite actorId/workspaceId/metadata quando não informados, sem enviar undefined ao Prisma", async () => {
    const create = vi.fn().mockResolvedValue({});
    const prisma = { auditLog: { create } } as unknown as PrismaClient;
    const logger = new PrismaAuditLogger(prisma);

    await logger.record({ action: "LOGIN" });

    const callArg = create.mock.calls[0]?.[0] as { data: Record<string, unknown> };
    expect("actorId" in callArg.data).toBe(false);
    expect("workspaceId" in callArg.data).toBe(false);
    expect("metadata" in callArg.data).toBe(false);
  });
});
