import type { PriorityTargetType } from "../domain/priority-rule";
import type { PriorityRuleRepository } from "../ports/priority-rule-repository";

export class RemovePriorityRuleUseCase {
  constructor(private readonly priorityRuleRepository: PriorityRuleRepository) {}

  async execute(userId: string, targetType: PriorityTargetType, targetId: string): Promise<void> {
    await this.priorityRuleRepository.remove(userId, targetType, targetId);
  }
}
