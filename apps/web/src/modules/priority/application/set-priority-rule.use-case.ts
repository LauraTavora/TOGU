import type { PriorityLevel } from "../domain/priority-level";
import type { PriorityRule, PriorityTargetType } from "../domain/priority-rule";
import type { PriorityRuleRepository } from "../ports/priority-rule-repository";

export class SetPriorityRuleUseCase {
  constructor(private readonly priorityRuleRepository: PriorityRuleRepository) {}

  async execute(
    userId: string,
    targetType: PriorityTargetType,
    targetId: string,
    level: PriorityLevel,
  ): Promise<PriorityRule> {
    return this.priorityRuleRepository.upsert(userId, targetType, targetId, level);
  }
}
