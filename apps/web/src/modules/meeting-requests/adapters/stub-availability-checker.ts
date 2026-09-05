import type { AvailabilityChecker, AvailabilityCheckStatus } from "../ports/availability-checker";

/** Test double — permite fixar o resultado retornado pela checagem. */
export class StubAvailabilityChecker implements AvailabilityChecker {
  constructor(public result: AvailabilityCheckStatus = "AVAILABLE") {}

  async check(): Promise<AvailabilityCheckStatus> {
    return this.result;
  }
}
