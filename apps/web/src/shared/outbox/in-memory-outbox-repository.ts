import { randomUUID } from "node:crypto";
import type { OutboxEvent } from "./outbox-event";
import type { OutboxEventPublisher } from "./outbox-publisher";
import type { OutboxEventStore } from "./outbox-store";

export class InMemoryOutboxRepository implements OutboxEventPublisher, OutboxEventStore {
  readonly events: OutboxEvent[] = [];

  async publish(type: string, payload: Record<string, unknown>): Promise<void> {
    this.events.push({ id: randomUUID(), type, payload, createdAt: new Date(), processedAt: null });
  }

  async listUnprocessed(limit: number): Promise<OutboxEvent[]> {
    return this.events.filter((e) => e.processedAt === null).slice(0, limit);
  }

  async markProcessed(id: string, processedAt: Date): Promise<void> {
    const event = this.events.find((e) => e.id === id);
    if (event) event.processedAt = processedAt;
  }
}
