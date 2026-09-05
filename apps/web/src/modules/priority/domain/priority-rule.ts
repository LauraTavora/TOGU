import type { PriorityLevel } from "./priority-level";

export type PriorityTargetType = "PERSON" | "CIRCLE" | "PLACE" | "EVENT_TYPE";

export interface PriorityRule {
  id: string;
  userId: string;
  targetType: PriorityTargetType;
  targetId: string;
  level: PriorityLevel;
}
