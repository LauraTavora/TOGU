import type { PriorityRule } from "../domain/priority-rule";
import type { PriorityRuleRepository } from "../ports/priority-rule-repository";

/**
 * Sempre retorna apenas as regras do próprio userId autenticado — nunca
 * expor prioridades de outra pessoa (docs/PRODUCT.md §17: são privadas).
 */
export class ListPriorityRulesUseCase {
  constructor(private readonly priorityRuleRepository: PriorityRuleRepository) {}

  async execute(userId: string): Promise<PriorityRule[]> {
    return this.priorityRuleRepository.list(userId);
  }
}
