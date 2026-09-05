export interface CalendarRepository {
  findPersonalCalendarIdForUser(userId: string): Promise<string | null>;
  /** Retorna o dono (ownerId) do calendário, para checagem de ownership. */
  findOwnerId(calendarId: string): Promise<string | null>;
}
