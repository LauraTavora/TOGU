import type { TimeRange } from "./time-range";

export type BlockState = "SOFT_HOLD" | "BUSY" | "PRIVATE_BUSY";

export interface BusyBlock {
  participantId: string;
  range: TimeRange;
  state: BlockState;
}
