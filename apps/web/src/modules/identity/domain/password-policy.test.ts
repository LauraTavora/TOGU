import { describe, expect, it } from "vitest";
import { assertPasswordStrength, WeakPasswordError } from "./password-policy";

describe("assertPasswordStrength", () => {
  it("aceita senha que cumpre todos os requisitos", () => {
    expect(() => assertPasswordStrength("Segura123")).not.toThrow();
  });

  it("rejeita senha curta", () => {
    expect(() => assertPasswordStrength("Ab1")).toThrow(WeakPasswordError);
  });

  it("rejeita senha sem letra maiúscula", () => {
    expect(() => assertPasswordStrength("segura123")).toThrow(WeakPasswordError);
  });

  it("rejeita senha sem número", () => {
    expect(() => assertPasswordStrength("SeguraSenha")).toThrow(WeakPasswordError);
  });
});
