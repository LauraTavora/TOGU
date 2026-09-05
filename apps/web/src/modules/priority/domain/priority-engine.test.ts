import { describe, expect, it } from "vitest";
import { PriorityEngine } from "./priority-engine";
import type { PriorityRule } from "./priority-rule";

function rule(overrides: Partial<PriorityRule>): PriorityRule {
  return {
    id: "rule-1",
    userId: "ana",
    targetType: "PERSON",
    targetId: "joao",
    level: "NORMAL",
    ...overrides,
  };
}

describe("PriorityEngine.resolveLevel", () => {
  const engine = new PriorityEngine();

  it("retorna NORMAL quando não há nenhuma regra correspondente", () => {
    const level = engine.resolveLevel([], {
      personId: "joao",
      circleIds: [],
      createdAt: new Date(),
    });
    expect(level).toBe("NORMAL");
  });

  it("usa a regra de pessoa quando existe", () => {
    const rules = [rule({ targetType: "PERSON", targetId: "joao", level: "MAXIMUM" })];
    const level = engine.resolveLevel(rules, { personId: "joao", circleIds: [], createdAt: new Date() });
    expect(level).toBe("MAXIMUM");
  });

  it("usa a regra de círculo quando a pessoa não tem regra própria", () => {
    const rules = [rule({ targetType: "CIRCLE", targetId: "familia", level: "HIGH" })];
    const level = engine.resolveLevel(rules, {
      personId: "joao",
      circleIds: ["familia"],
      createdAt: new Date(),
    });
    expect(level).toBe("HIGH");
  });

  it("prioriza o maior nível entre múltiplas regras correspondentes", () => {
    const rules = [
      rule({ targetType: "PERSON", targetId: "joao", level: "LOW" }),
      rule({ targetType: "CIRCLE", targetId: "familia", level: "MAXIMUM" }),
    ];
    const level = engine.resolveLevel(rules, {
      personId: "joao",
      circleIds: ["familia"],
      createdAt: new Date(),
    });
    expect(level).toBe("MAXIMUM");
  });

  it("ignora regra de círculo que não está entre os círculos em comum", () => {
    const rules = [rule({ targetType: "CIRCLE", targetId: "trabalho", level: "MAXIMUM" })];
    const level = engine.resolveLevel(rules, {
      personId: "joao",
      circleIds: ["familia"],
      createdAt: new Date(),
    });
    expect(level).toBe("NORMAL");
  });

  it("considera regra de local quando informado", () => {
    const rules = [rule({ targetType: "PLACE", targetId: "igreja-central", level: "HIGH" })];
    const level = engine.resolveLevel(rules, {
      personId: "estranho",
      circleIds: [],
      place: "igreja-central",
      createdAt: new Date(),
    });
    expect(level).toBe("HIGH");
  });
});

describe("PriorityEngine.computeScore", () => {
  const engine = new PriorityEngine();
  const now = new Date("2026-01-10T12:00:00Z");

  it("nunca deixa a urgência de um nível menor ultrapassar um nível maior", () => {
    const highPriorityOld = engine.computeScore(
      [rule({ targetType: "PERSON", targetId: "joao", level: "HIGH" })],
      { personId: "joao", circleIds: [], createdAt: new Date("2020-01-01T00:00:00Z") },
      now,
    );
    const normalPriorityBrandNew = engine.computeScore(
      [],
      { personId: "estranho", circleIds: [], createdAt: now },
      now,
    );
    expect(highPriorityOld).toBeGreaterThan(normalPriorityBrandNew + 1);
  });

  it("dentro do mesmo nível, a solicitação mais antiga tem score maior", () => {
    const older = engine.computeScore(
      [],
      { personId: "joao", circleIds: [], createdAt: new Date("2026-01-09T00:00:00Z") },
      now,
    );
    const newer = engine.computeScore(
      [],
      { personId: "joao", circleIds: [], createdAt: new Date("2026-01-10T11:00:00Z") },
      now,
    );
    expect(older).toBeGreaterThan(newer);
  });
});
