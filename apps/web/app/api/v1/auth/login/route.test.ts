import { describe, expect, it } from "vitest";
import { POST } from "./route";

// Corpo inválido de propósito: garante que as primeiras respostas venham
// da validação (400), sem tocar o banco — o rate limit por IP é aplicado
// antes de qualquer outra coisa na rota, então isso ainda exercita o
// comportamento real de bloqueio.
function invalidLoginRequest(ip: string): Request {
  return new Request("http://localhost/api/v1/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ email: "not-an-email" }),
  });
}

describe("POST /api/v1/auth/login — rate limiting", () => {
  it("bloqueia com 429 após exceder o limite de tentativas para o mesmo IP", async () => {
    const ip = "203.0.113.10";

    for (let i = 0; i < 10; i++) {
      const response = await POST(invalidLoginRequest(ip));
      expect(response.status).toBe(400);
    }

    const eleventh = await POST(invalidLoginRequest(ip));
    expect(eleventh.status).toBe(429);
    expect(eleventh.headers.get("Retry-After")).toBeTruthy();
  });

  it("não bloqueia um IP diferente mesmo com o primeiro já limitado", async () => {
    const limitedIp = "203.0.113.20";
    for (let i = 0; i < 11; i++) {
      await POST(invalidLoginRequest(limitedIp));
    }
    const stillLimited = await POST(invalidLoginRequest(limitedIp));
    expect(stillLimited.status).toBe(429);

    const otherIp = "203.0.113.21";
    const response = await POST(invalidLoginRequest(otherIp));
    expect(response.status).toBe(400);
  });
});
