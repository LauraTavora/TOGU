import type { BusyBlock } from "./busy-block";
import { expand, overlaps, type TimeRange } from "./time-range";

export type AvailabilityStatus = "AVAILABLE" | "SOFT_CONFLICT" | "HARD_CONFLICT";

export interface ParticipantConflict {
  participantId: string;
  status: AvailabilityStatus;
}

export interface AvailabilityCheckResult {
  status: AvailabilityStatus;
  participants: ParticipantConflict[];
}

export interface AvailabilityCheckInput {
  participantIds: string[];
  range: TimeRange;
  /** Compromissos existentes de cada participante, indexados por participantId. */
  busyBlocksByParticipant: Map<string, BusyBlock[]>;
  /** Minutos de buffer exigidos antes/depois do compromisso (ex.: deslocamento). */
  bufferMinutes?: number | undefined;
}

/**
 * AvailabilityEngine — núcleo puro de domínio, sem I/O.
 * Datas de entrada devem já estar normalizadas em UTC pelo chamador;
 * o motor é agnóstico a timezone (opera sobre instantes).
 */
export class AvailabilityEngine {
  check(input: AvailabilityCheckInput): AvailabilityCheckResult {
    const { participantIds, range, busyBlocksByParticipant, bufferMinutes = 0 } = input;
    const effectiveRange = bufferMinutes > 0 ? expand(range, bufferMinutes) : range;

    const participants: ParticipantConflict[] = participantIds.map((participantId) => {
      const blocks = busyBlocksByParticipant.get(participantId) ?? [];
      const overlapping = blocks.filter((block) => overlaps(effectiveRange, block.range));

      const hasHardConflict = overlapping.some(
        (block) => block.state === "BUSY" || block.state === "PRIVATE_BUSY",
      );
      if (hasHardConflict) {
        return { participantId, status: "HARD_CONFLICT" };
      }

      const hasSoftConflict = overlapping.some((block) => block.state === "SOFT_HOLD");
      if (hasSoftConflict) {
        return { participantId, status: "SOFT_CONFLICT" };
      }

      return { participantId, status: "AVAILABLE" };
    });

    const status = this.aggregate(participants);
    return { status, participants };
  }

  private aggregate(participants: ParticipantConflict[]): AvailabilityStatus {
    if (participants.some((p) => p.status === "HARD_CONFLICT")) return "HARD_CONFLICT";
    if (participants.some((p) => p.status === "SOFT_CONFLICT")) return "SOFT_CONFLICT";
    return "AVAILABLE";
  }
}
