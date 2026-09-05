import { PriorityEngine, type PriorityContext } from "../domain/priority-engine";
import type { PriorityRuleRepository } from "../ports/priority-rule-repository";

export class ComputePriorityScoreUseCase {
  constructor(
    private readonly priorityRuleRepository: PriorityRuleRepository,
    private readonly engine: PriorityEngine = new PriorityEngine(),
  ) {}

  async execute(userId: string, context: PriorityContext, now?: Date): Promise<number> {
    const rules = await this.priorityRuleRepository.list(userId);
    return this.engine.computeScore(rules, context, now);
  }
}
