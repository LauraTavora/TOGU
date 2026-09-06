import { prisma } from "@fecho/database";
import { SetPriorityRuleUseCase } from "../application/set-priority-rule.use-case";
import { RemovePriorityRuleUseCase } from "../application/remove-priority-rule.use-case";
import { ListPriorityRulesUseCase } from "../application/list-priority-rules.use-case";
import { ComputePriorityScoreUseCase } from "../application/compute-priority-score.use-case";
import { PrismaPriorityRuleRepository } from "../adapters/prisma-priority-rule-repository";

const priorityRuleRepository = new PrismaPriorityRuleRepository(prisma);

export function createSetPriorityRuleUseCase(): SetPriorityRuleUseCase {
  return new SetPriorityRuleUseCase(priorityRuleRepository);
}

export function createRemovePriorityRuleUseCase(): RemovePriorityRuleUseCase {
  return new RemovePriorityRuleUseCase(priorityRuleRepository);
}

export function createListPriorityRulesUseCase(): ListPriorityRulesUseCase {
  return new ListPriorityRulesUseCase(priorityRuleRepository);
}

export function createComputePriorityScoreUseCase(): ComputePriorityScoreUseCase {
  return new ComputePriorityScoreUseCase(priorityRuleRepository);
}
