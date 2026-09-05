import { assertValidEventTimeRange } from "../domain/event-time";
import type { AvailabilityState, Event, MeetingKind, PrivacyLevel } from "../domain/event";
import type { EventRepository } from "../ports/event-repository";
import type { CalendarRepository } from "../ports/calendar-repository";
import { EventNotFoundError, ForbiddenEventAccessError } from "./errors";
import type { AuditLogger } from "@/shared/audit";

export interface UpdateEventInput {
  title?: string | undefined;
  notes?: string | undefined;
  startAt?: Date | undefined;
  endAt?: Date | undefined;
  availabilityState?: AvailabilityState | undefined;
  privacyLevel?: PrivacyLevel | undefined;
  meetingKind?: MeetingKind | undefined;
  location?: string | undefined;
  onlineLink?: string | undefined;
  bufferBeforeMin?: number | undefined;
  bufferAfterMin?: number | undefined;
}

export class UpdateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly calendarRepository: CalendarRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(eventId: string, requesterUserId: string, patch: UpdateEventInput): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new EventNotFoundError();
    }

    const ownerId = await this.calendarRepository.findOwnerId(event.calendarId);
    if (ownerId !== requesterUserId) {
      throw new ForbiddenEventAccessError();
    }

    const nextStartAt = patch.startAt ?? event.startAt;
    const nextEndAt = patch.endAt ?? event.endAt;
    assertValidEventTimeRange(nextStartAt, nextEndAt);

    const updated = await this.eventRepository.update(eventId, patch);

    await this.auditLogger.record({
      action: "EVENT_UPDATED",
      actorId: requesterUserId,
      metadata: { eventId },
    });

    return updated;
  }
}
