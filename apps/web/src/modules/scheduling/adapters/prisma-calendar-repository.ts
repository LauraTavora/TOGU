import type { PrismaClient } from "@togu/database";
import type { CalendarRepository } from "../ports/calendar-repository";

export class PrismaCalendarRepository implements CalendarRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPersonalCalendarIdForUser(userId: string): Promise<string | null> {
    const calendar = await this.prisma.calendar.findFirst({
      where: { ownerId: userId, workspace: { type: "PERSONAL" } },
      select: { id: true },
    });
    return calendar?.id ?? null;
  }

  async findOwnerId(calendarId: string): Promise<string | null> {
    const calendar = await this.prisma.calendar.findUnique({
      where: { id: calendarId },
      select: { ownerId: true },
    });
    return calendar?.ownerId ?? null;
  }
}
