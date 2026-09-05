import type { BusyBlock } from "../domain/busy-block";
import type { TimeRange } from "../domain/time-range";

/**
 * Port — implementado por adapters (Prisma, etc). O domínio e a application
 * layer nunca conhecem a origem concreta dos dados (banco, cache...).
 */
export interface AvailabilityRepository {
  findBusyBlocks(participantIds: string[], range: TimeRange): Promise<Map<string, BusyBlock[]>>;
}
