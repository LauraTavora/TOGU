import { prisma } from "@togu/database";
import { PrismaOutboxRepository } from "./prisma-outbox-repository";

export type { OutboxEvent } from "./outbox-event";
export type { OutboxEventPublisher } from "./outbox-publisher";
export type { OutboxEventStore } from "./outbox-store";

const sharedOutboxRepository = new PrismaOutboxRepository(prisma);

/** Instância única compartilhada — produtores e o consumidor usam o mesmo outbox. */
export function getOutboxRepository(): PrismaOutboxRepository {
  return sharedOutboxRepository;
}
