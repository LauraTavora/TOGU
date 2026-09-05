import { randomUUID } from "node:crypto";
import { assertValidEventTimeRange } from "../domain/event-time";
import type { AvailabilityState, Event, MeetingKind, PrivacyLevel } from "../domain/event";
import type { EventRepository } from "../ports/event-repository";
import type { CalendarRepository } from "../ports/calendar-repository";
import { PersonalCalendarNotFoundError } from "./errors";
import type { AuditLogger } from "@/shared/audit";

export interface CreateEventInput {
  ownerUserId: string;
  title: string;
  notes?: string | undefined;
  startAt: Date;
  endAt: Date;
  availabilityState?: AvailabilityState | undefined;
  privacyLevel?: PrivacyLevel | undefined;
  meetingKind?: MeetingKind | undefined;
  location?: string | undefined;
  onlineLink?: string | undefined;
  bufferBeforeMin?: number | undefined;
  bufferAfterMin?: number | undefined;
  participantUserIds?: string[] | undefined;
}

export class CreateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly calendarRepository: CalendarRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: CreateEventInput): Promise<Event> {
    assertValidEventTimeRange(input.startAt, input.endAt);

    const calendarId = await this.calendarRepository.findPersonalCalendarIdForUser(
      input.ownerUserId,
    );
    if (!calendarId) {
      throw new PersonalCalendarNotFoundError();
    }

    const event = await this.eventRepository.create({
      id: randomUUID(),
      calendarId,
      title: input.title,
      notes: input.notes,
      startAt: input.startAt,
      endAt: input.endAt,
      availabilityState: input.availabilityState ?? "BUSY",
      privacyLevel: input.privacyLevel ?? "BUSY_ONLY",
      meetingKind: input.meetingKind ?? "IN_PERSON",
      location: input.location,
      onlineLink: input.onlineLink,
      bufferBeforeMin: input.bufferBeforeMin ?? 0,
      bufferAfterMin: input.bufferAfterMin ?? 0,
      participantUserIds: input.participantUserIds ?? [],
    });

    await this.auditLogger.record({
      action: "EVENT_CREATED",
      actorId: input.ownerUserId,
      metadata: { eventId: event.id },
    });

    return event;
  }
}
