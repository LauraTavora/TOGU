import type { EventRepository } from "../ports/event-repository";
import type { CalendarRepository } from "../ports/calendar-repository";
import { EventNotFoundError, ForbiddenEventAccessError } from "./errors";
import type { AuditLogger } from "@/shared/audit";

export class DeleteEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly calendarRepository: CalendarRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(eventId: string, requesterUserId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new EventNotFoundError();
    }

    const ownerId = await this.calendarRepository.findOwnerId(event.calendarId);
    if (ownerId !== requesterUserId) {
      throw new ForbiddenEventAccessError();
    }

    await this.eventRepository.delete(eventId);

    await this.auditLogger.record({
      action: "EVENT_DELETED",
      actorId: requesterUserId,
      metadata: { eventId },
    });
  }
}
