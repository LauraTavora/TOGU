import type { Event } from "../domain/event";
import type { CreateEventInput, EventRepository, UpdateEventInput } from "../ports/event-repository";
import { EventNotFoundError } from "../application/errors";

export class InMemoryEventRepository implements EventRepository {
  private readonly events = new Map<string, Event>();

  async create(input: CreateEventInput): Promise<Event> {
    const now = new Date();
    const event: Event = {
      id: input.id,
      calendarId: input.calendarId,
      title: input.title,
      notes: input.notes ?? null,
      startAt: input.startAt,
      endAt: input.endAt,
      availabilityState: input.availabilityState,
      privacyLevel: input.privacyLevel,
      meetingKind: input.meetingKind,
      location: input.location ?? null,
      onlineLink: input.onlineLink ?? null,
      bufferBeforeMin: input.bufferBeforeMin,
      bufferAfterMin: input.bufferAfterMin,
      participantUserIds: input.participantUserIds,
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(event.id, event);
    return event;
  }

  async findById(id: string): Promise<Event | null> {
    return this.events.get(id) ?? null;
  }

  async findInRange(calendarId: string, start: Date, end: Date): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) =>
        event.calendarId === calendarId && event.startAt < end && start < event.endAt,
    );
  }

  async findVisibleToUserInRange(
    userId: string,
    calendarId: string,
    start: Date,
    end: Date,
  ): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) =>
        (event.calendarId === calendarId || event.participantUserIds.includes(userId)) &&
        event.startAt < end &&
        start < event.endAt,
    );
  }

  async update(id: string, patch: UpdateEventInput): Promise<Event> {
    const existing = this.events.get(id);
    if (!existing) {
      throw new EventNotFoundError();
    }

    const updated: Event = {
      ...existing,
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.notes !== undefined && { notes: patch.notes }),
      ...(patch.startAt !== undefined && { startAt: patch.startAt }),
      ...(patch.endAt !== undefined && { endAt: patch.endAt }),
      ...(patch.availabilityState !== undefined && { availabilityState: patch.availabilityState }),
      ...(patch.privacyLevel !== undefined && { privacyLevel: patch.privacyLevel }),
      ...(patch.meetingKind !== undefined && { meetingKind: patch.meetingKind }),
      ...(patch.location !== undefined && { location: patch.location }),
      ...(patch.onlineLink !== undefined && { onlineLink: patch.onlineLink }),
      ...(patch.bufferBeforeMin !== undefined && { bufferBeforeMin: patch.bufferBeforeMin }),
      ...(patch.bufferAfterMin !== undefined && { bufferAfterMin: patch.bufferAfterMin }),
      updatedAt: new Date(),
    };
    this.events.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.events.delete(id);
  }
}
