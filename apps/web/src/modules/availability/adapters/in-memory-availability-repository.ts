import type { BusyBlock } from "../domain/busy-block";
import { overlaps, type TimeRange } from "../domain/time-range";
import type { AvailabilityRepository } from "../ports/availability-repository";

/**
 * Adapter de desenvolvimento/teste. Em produção será substituído por um
 * adapter Prisma (ver docs/DATABASE.md) sem qualquer mudança no domínio
 * ou na application layer.
 */
export class InMemoryAvailabilityRepository implements AvailabilityRepository {
  constructor(private readonly blocks: BusyBlock[] = []) {}

  async findBusyBlocks(
    participantIds: string[],
    range: TimeRange,
  ): Promise<Map<string, BusyBlock[]>> {
    const result = new Map<string, BusyBlock[]>();
    for (const participantId of participantIds) {
      const participantBlocks = this.blocks.filter(
        (block) => block.participantId === participantId && overlaps(block.range, range),
      );
      result.set(participantId, participantBlocks);
    }
    return result;
  }
}
