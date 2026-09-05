import { randomUUID } from "node:crypto";
import type { PriorityLevel } from "../domain/priority-level";
import type { PriorityRule, PriorityTargetType } from "../domain/priority-rule";
import type { PriorityRuleRepository } from "../ports/priority-rule-repository";

export class InMemoryPriorityRuleRepository implements PriorityRuleRepository {
  private readonly rules: PriorityRule[] = [];

  async upsert(
    userId: string,
    targetType: PriorityTargetType,
    targetId: string,
    level: PriorityLevel,
  ): Promise<PriorityRule> {
    const existing = this.rules.find(
      (r) => r.userId === userId && r.targetType === targetType && r.targetId === targetId,
    );
    if (existing) {
      existing.level = level;
      return existing;
    }
    const rule: PriorityRule = { id: randomUUID(), userId, targetType, targetId, level };
    this.rules.push(rule);
    return rule;
  }

  async list(userId: string): Promise<PriorityRule[]> {
    return this.rules.filter((r) => r.userId === userId);
  }

  async remove(userId: string, targetType: PriorityTargetType, targetId: string): Promise<void> {
    const index = this.rules.findIndex(
      (r) => r.userId === userId && r.targetType === targetType && r.targetId === targetId,
    );
    if (index >= 0) this.rules.splice(index, 1);
  }
}
