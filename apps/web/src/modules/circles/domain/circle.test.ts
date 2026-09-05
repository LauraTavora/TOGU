import { describe, expect, it } from "vitest";
import { assertValidCircleName, InvalidCircleNameError } from "./circle";

describe("assertValidCircleName", () => {
  it("aceita nome válido", () => {
    expect(() => assertValidCircleName("Família")).not.toThrow();
  });

  it("rejeita nome vazio", () => {
    expect(() => assertValidCircleName("   ")).toThrow(InvalidCircleNameError);
  });

  it("rejeita nome maior que 100 caracteres", () => {
    expect(() => assertValidCircleName("a".repeat(101))).toThrow(InvalidCircleNameError);
  });
});
