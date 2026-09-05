import type { PriorityLevel } from "../domain/priority-level";
import type { PriorityRule, PriorityTargetType } from "../domain/priority-rule";

export interface PriorityRuleRepository {
  upsert(userId: string, targetType: PriorityTargetType, targetId: string, level: PriorityLevel): Promise<PriorityRule>;
  list(userId: string): Promise<PriorityRule[]>;
  remove(userId: string, targetType: PriorityTargetType, targetId: string): Promise<void>;
}
