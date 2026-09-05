import { randomUUID } from "node:crypto";
import type { OutboxEventStore } from "@/shared/outbox";
import type { NotificationRepository } from "../ports/notification-repository";
import { handleMeetingRequestEvent } from "./handlers/meeting-request-event-handler";

const DEFAULT_BATCH_SIZE = 50;

/**
 * Drena a outbox compartilhada e materializa notificações in-app.
 * Cada evento é marcado como processado apenas depois de todas as
 * notificações correspondentes serem criadas — se o processo falhar no
 * meio, o evento continua pendente e será reprocessado (idempotente: os
 * handlers apenas leem o payload, nunca mutam estado fora daqui).
 * Ver docs/adr/ADR-004 e ADR-009.
 */
export class ProcessOutboxUseCase {
  constructor(
    private readonly outboxStore: OutboxEventStore,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(batchSize: number = DEFAULT_BATCH_SIZE): Promise<{ processedEvents: number; createdNotifications: number }> {
    const events = await this.outboxStore.listUnprocessed(batchSize);
    let createdNotifications = 0;

    for (const event of events) {
      const notificationsToCreate = handleMeetingRequestEvent(event);

      for (const notification of notificationsToCreate) {
        await this.notificationRepository.create({
          id: randomUUID(),
          userId: notification.userId,
          type: notification.type,
          payload: notification.payload,
        });
        createdNotifications += 1;
      }

      await this.outboxStore.markProcessed(event.id, new Date());
    }

    return { processedEvents: events.length, createdNotifications };
  }
}
