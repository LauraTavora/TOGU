import type { PrismaClient } from "@togu/database";
import type { BlockState, BusyBlock } from "../domain/busy-block";
import type { TimeRange } from "../domain/time-range";
import type { AvailabilityRepository } from "../ports/availability-repository";

/**
 * Consulta os calendários pessoais reais dos participantes. Eventos
 * AVAILABLE não geram bloqueio; SOFT_HOLD/BUSY/PRIVATE_BUSY sim (ver
 * docs/PRODUCT.md §14 — Tipos de compromisso).
 */
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBusyBlocks(participantIds: string[], range: TimeRange): Promise<Map<string, BusyBlock[]>> {
    const result = new Map<string, BusyBlock[]>();
    for (const participantId of participantIds) {
      result.set(participantId, []);
    }

    const calendars = await this.prisma.calendar.findMany({
      where: { ownerId: { in: participantIds }, workspace: { type: "PERSONAL" } },
      select: { id: true, ownerId: true },
    });
    if (calendars.length === 0) {
      return result;
    }

    const ownerIdByCalendarId = new Map(calendars.map((c) => [c.id, c.ownerId]));

    const events = await this.prisma.event.findMany({
      where: {
        calendarId: { in: calendars.map((c) => c.id) },
        availabilityState: { not: "AVAILABLE" },
        startAt: { lt: range.end },
        endAt: { gt: range.start },
      },
      select: { calendarId: true, startAt: true, endAt: true, availabilityState: true },
    });

    for (const event of events) {
      const ownerId = ownerIdByCalendarId.get(event.calendarId);
      if (!ownerId) continue;
      const block: BusyBlock = {
        participantId: ownerId,
        range: { start: event.startAt, end: event.endAt },
        state: event.availabilityState as BlockState,
      };
      result.get(ownerId)?.push(block);
    }

    return result;
  }
}
