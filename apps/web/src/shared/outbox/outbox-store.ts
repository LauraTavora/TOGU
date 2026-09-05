import type { OutboxEvent } from "./outbox-event";

/**
 * Port usado pelo consumidor (módulo `notifications`) para drenar a
 * outbox — ver docs/adr/ADR-004 e ADR-009.
 */
export interface OutboxEventStore {
  listUnprocessed(limit: number): Promise<OutboxEvent[]>;
  markProcessed(id: string, processedAt: Date): Promise<void>;
}
