import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("junta strings simples", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", null, undefined, false, "", "b")).toBe("a b");
  });

  it("resolve objetos condicionais", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("combina strings e objetos", () => {
    expect(cn("a", { b: true }, "c", { d: false })).toBe("a b c");
  });
});
