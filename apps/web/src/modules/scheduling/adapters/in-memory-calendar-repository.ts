import type { CalendarRepository } from "../ports/calendar-repository";

export class InMemoryCalendarRepository implements CalendarRepository {
  private readonly personalCalendarByUser = new Map<string, string>();
  private readonly ownerByCalendar = new Map<string, string>();

  registerPersonalCalendar(userId: string, calendarId: string): void {
    this.personalCalendarByUser.set(userId, calendarId);
    this.ownerByCalendar.set(calendarId, userId);
  }

  async findPersonalCalendarIdForUser(userId: string): Promise<string | null> {
    return this.personalCalendarByUser.get(userId) ?? null;
  }

  async findOwnerId(calendarId: string): Promise<string | null> {
    return this.ownerByCalendar.get(calendarId) ?? null;
  }
}
