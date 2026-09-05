import { describe, expect, it } from "vitest";
import { Email, InvalidEmailError } from "./email";

describe("Email", () => {
  it("aceita e-mails válidos e normaliza para minúsculas", () => {
    const email = Email.create("  Ana@Example.COM  ");
    expect(email.toString()).toBe("ana@example.com");
  });

  it("rejeita e-mails sem @", () => {
    expect(() => Email.create("ana.example.com")).toThrow(InvalidEmailError);
  });

  it("rejeita e-mails sem domínio", () => {
    expect(() => Email.create("ana@")).toThrow(InvalidEmailError);
  });

  it("considera iguais dois e-mails equivalentes após normalização", () => {
    const a = Email.create("Ana@Example.com");
    const b = Email.create("ana@example.com");
    expect(a.equals(b)).toBe(true);
  });
});
