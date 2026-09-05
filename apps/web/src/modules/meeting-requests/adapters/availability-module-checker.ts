import { createCheckAvailabilityUseCase } from "../../availability";
import type { AvailabilityChecker, AvailabilityCheckStatus } from "../ports/availability-checker";

export class AvailabilityModuleChecker implements AvailabilityChecker {
  async check(participantIds: string[], start: Date, end: Date): Promise<AvailabilityCheckStatus> {
    const useCase = createCheckAvailabilityUseCase();
    const result = await useCase.execute({ participantIds, range: { start, end } });
    return result.status;
  }
}
