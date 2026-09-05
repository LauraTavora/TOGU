import { describe, expect, it } from "vitest";
import { SetPriorityRuleUseCase } from "./set-priority-rule.use-case";
import { RemovePriorityRuleUseCase } from "./remove-priority-rule.use-case";
import { ListPriorityRulesUseCase } from "./list-priority-rules.use-case";
import { ComputePriorityScoreUseCase } from "./compute-priority-score.use-case";
import { InMemoryPriorityRuleRepository } from "../adapters/in-memory-priority-rule-repository";

function buildScenario() {
  const repository = new InMemoryPriorityRuleRepository();
  return {
    repository,
    setRule: new SetPriorityRuleUseCase(repository),
    removeRule: new RemovePriorityRuleUseCase(repository),
    listRules: new ListPriorityRulesUseCase(repository),
    computeScore: new ComputePriorityScoreUseCase(repository),
  };
}

describe("SetPriorityRuleUseCase / ListPriorityRulesUseCase", () => {
  it("cria e depois atualiza (upsert) a mesma regra", async () => {
    const { setRule, listRules } = buildScenario();

    await setRule.execute("ana", "PERSON", "joao", "HIGH");
    await setRule.execute("ana", "PERSON", "joao", "MAXIMUM");

    const rules = await listRules.execute("ana");
    expect(rules).toHaveLength(1);
    expect(rules[0]?.level).toBe("MAXIMUM");
  });

  it("isola regras por usuário — nunca vaza prioridade de outra pessoa", async () => {
    const { setRule, listRules } = buildScenario();
    await setRule.execute("ana", "PERSON", "joao", "HIGH");
    await setRule.execute("joao", "PERSON", "ana", "LOW");

    expect(await listRules.execute("ana")).toHaveLength(1);
    expect((await listRules.execute("ana"))[0]?.targetId).toBe("joao");
  });
});

describe("RemovePriorityRuleUseCase", () => {
  it("remove uma regra existente", async () => {
    const { setRule, removeRule, listRules } = buildScenario();
    await setRule.execute("ana", "CIRCLE", "familia", "MAXIMUM");
    await removeRule.execute("ana", "CIRCLE", "familia");
    expect(await listRules.execute("ana")).toHaveLength(0);
  });

  it("não falha ao remover regra inexistente", async () => {
    const { removeRule } = buildScenario();
    await expect(removeRule.execute("ana", "CIRCLE", "inexistente")).resolves.toBeUndefined();
  });
});

describe("ComputePriorityScoreUseCase", () => {
  it("integra repositório + PriorityEngine", async () => {
    const { setRule, computeScore } = buildScenario();
    await setRule.execute("ana", "PERSON", "joao", "MAXIMUM");

    const now = new Date("2026-01-10T12:00:00Z");
    const score = await computeScore.execute(
      "ana",
      { personId: "joao", circleIds: [], createdAt: now },
      now,
    );
    expect(score).toBeGreaterThanOrEqual(3);
    expect(score).toBeLessThan(4);
  });
});
