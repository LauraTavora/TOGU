import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { requireAuth } from "./require-auth";

function requestWithAuth(header?: string): Request {
  const headers = new Headers();
  if (header) headers.set("authorization", header);
  return new Request("http://localhost/api/v1/test", { headers });
}

describe("requireAuth", () => {
  it("rejeita requisição sem cabeçalho Authorization (rota sem login)", async () => {
    const result = await requireAuth(requestWithAuth());
    expect(result).toBeNull();
  });

  it("rejeita cabeçalho sem esquema Bearer", async () => {
    const result = await requireAuth(requestWithAuth("Basic abc123"));
    expect(result).toBeNull();
  });

  it("rejeita token malformado", async () => {
    const result = await requireAuth(requestWithAuth("Bearer token-invalido"));
    expect(result).toBeNull();
  });

  it("rejeita token assinado com segredo diferente", async () => {
    const secretKey = new TextEncoder().encode("outro-segredo");
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-1")
      .setExpirationTime("15m")
      .sign(secretKey);

    const result = await requireAuth(requestWithAuth(`Bearer ${token}`));
    expect(result).toBeNull();
  });

  it("rejeita token expirado", async () => {
    const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET!);
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-1")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 1800)
      .sign(secretKey);

    const result = await requireAuth(requestWithAuth(`Bearer ${token}`));
    expect(result).toBeNull();
  });

  it("aceita token válido assinado com o segredo correto", async () => {
    const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET!);
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-42")
      .setExpirationTime("15m")
      .sign(secretKey);

    const result = await requireAuth(requestWithAuth(`Bearer ${token}`));
    expect(result).toEqual({ userId: "user-42" });
  });
});
