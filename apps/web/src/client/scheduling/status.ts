import type { StatusKind } from "@togu/design-system";
import type { AvailabilityState } from "./types";

export function toStatusKind(state: AvailabilityState): StatusKind {
  switch (state) {
    case "AVAILABLE":
      return "available";
    case "SOFT_HOLD":
      return "soft-hold";
    case "BUSY":
    case "PRIVATE_BUSY":
      return "busy";
  }
}
