import type { Event } from "../domain/event";
import type { EventRepository } from "../ports/event-repository";
import type { CalendarRepository } from "../ports/calendar-repository";
import { PersonalCalendarNotFoundError } from "./errors";

export class ListCalendarEventsUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly calendarRepository: CalendarRepository,
  ) {}

  async execute(userId: string, start: Date, end: Date): Promise<Event[]> {
    const calendarId = await this.calendarRepository.findPersonalCalendarIdForUser(userId);
    if (!calendarId) {
      throw new PersonalCalendarNotFoundError();
    }

    const events = await this.eventRepository.findVisibleToUserInRange(userId, calendarId, start, end);
    return [...events].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }
}
