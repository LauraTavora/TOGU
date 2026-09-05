import { AvailabilityEngine, type AvailabilityCheckResult } from "../domain/availability-engine";
import type { TimeRange } from "../domain/time-range";
import type { AvailabilityRepository } from "../ports/availability-repository";

export interface CheckAvailabilityInput {
  participantIds: string[];
  range: TimeRange;
  bufferMinutes?: number | undefined;
}

/**
 * Caso de uso: orquestra o carregamento de blocos ocupados (via port) e delega
 * a decisão de conflito ao AvailabilityEngine (domínio puro).
 */
export class CheckAvailabilityUseCase {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly engine: AvailabilityEngine = new AvailabilityEngine(),
  ) {}

  async execute(input: CheckAvailabilityInput): Promise<AvailabilityCheckResult> {
    const busyBlocksByParticipant = await this.availabilityRepository.findBusyBlocks(
      input.participantIds,
      input.range,
    );

    return this.engine.check({
      participantIds: input.participantIds,
      range: input.range,
      busyBlocksByParticipant,
      bufferMinutes: input.bufferMinutes,
    });
  }
}
