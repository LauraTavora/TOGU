import { randomUUID } from "node:crypto";
import type { PrismaClient, Prisma } from "@fecho/database";
import type { OutboxEvent } from "./outbox-event";
import type { OutboxEventPublisher } from "./outbox-publisher";
import type { OutboxEventStore } from "./outbox-store";

export class PrismaOutboxRepository implements OutboxEventPublisher, OutboxEventStore {
  constructor(private readonly prisma: PrismaClient) {}

  async publish(type: string, payload: Record<string, unknown>): Promise<void> {
    await this.prisma.outboxEvent.create({
      data: { id: randomUUID(), type, payload: payload as Prisma.InputJsonValue },
    });
  }

  async listUnprocessed(limit: number): Promise<OutboxEvent[]> {
    const records = await this.prisma.outboxEvent.findMany({
      where: { processedAt: null },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
    return records.map((record) => ({
      id: record.id,
      type: record.type,
      payload: record.payload as Record<string, unknown>,
      createdAt: record.createdAt,
      processedAt: record.processedAt,
    }));
  }

  async markProcessed(id: string, processedAt: Date): Promise<void> {
    await this.prisma.outboxEvent.update({ where: { id }, data: { processedAt } });
  }
}
