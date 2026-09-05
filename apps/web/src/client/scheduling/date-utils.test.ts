import { describe, expect, it } from "vitest";
import { addDays, fractionOfDay, isSameDay, startOfDay, startOfWeek } from "./date-utils";

describe("startOfDay", () => {
  it("zera horas, minutos e segundos", () => {
    const result = startOfDay(new Date(2026, 0, 15, 18, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
});

describe("addDays", () => {
  it("soma dias corretamente, inclusive virando o mês", () => {
    const result = addDays(new Date(2026, 0, 30), 3);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(2);
  });

  it("aceita valores negativos", () => {
    const result = addDays(new Date(2026, 1, 1), -1);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(31);
  });
});

describe("startOfWeek", () => {
  it("retorna o domingo da semana (uma quarta-feira volta 3 dias)", () => {
    // 2026-01-14 é uma quarta-feira.
    const result = startOfWeek(new Date(2026, 0, 14));
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(11);
  });

  it("um domingo permanece o mesmo dia", () => {
    const sunday = new Date(2026, 0, 11);
    const result = startOfWeek(sunday);
    expect(isSameDay(result, sunday)).toBe(true);
  });
});

describe("isSameDay", () => {
  it("ignora o horário ao comparar", () => {
    expect(isSameDay(new Date(2026, 0, 1, 1), new Date(2026, 0, 1, 23))).toBe(true);
  });

  it("distingue dias diferentes", () => {
    expect(isSameDay(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(false);
  });
});

describe("fractionOfDay", () => {
  it("meio-dia é 0.5", () => {
    expect(fractionOfDay(new Date(2026, 0, 1, 12, 0))).toBeCloseTo(0.5);
  });

  it("meia-noite é 0", () => {
    expect(fractionOfDay(new Date(2026, 0, 1, 0, 0))).toBe(0);
  });
});
