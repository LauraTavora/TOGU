import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { POST } from "./route";

function jsonRequest(body: unknown, authorization?: string): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (authorization) headers.set("authorization", authorization);
  return new Request("http://localhost/api/v1/availability/check", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function validToken(): Promise<string> {
  const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET!);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("user-1")
    .setExpirationTime("15m")
    .sign(secretKey);
}

describe("POST /api/v1/availability/check", () => {
  it("rejeita requisição sem autenticação", async () => {
    const response = await POST(
      jsonRequest({ participantIds: ["ana"], start: "2026-01-10T20:00:00Z", end: "2026-01-10T22:00:00Z" }),
    );
    expect(response.status).toBe(401);
  });

  // O caminho feliz (200) depende do PrismaAvailabilityRepository, que consulta
  // calendários/eventos reais — é um teste de integração (requer Postgres) e
  // não roda no CI de testes unitários. Ver docs/TESTING.md §Integration.
  it.skip("retorna disponibilidade para requisição autenticada e válida (integração, requer banco)", async () => {
    const token = await validToken();
    const response = await POST(
      jsonRequest(
        { participantIds: ["ana"], start: "2026-01-10T20:00:00Z", end: "2026-01-10T22:00:00Z" },
        `Bearer ${token}`,
      ),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string };
    expect(body.status).toBe("AVAILABLE");
  });

  it("retorna 400 para corpo inválido mesmo autenticado", async () => {
    const token = await validToken();
    const response = await POST(jsonRequest({ participantIds: [] }, `Bearer ${token}`));
    expect(response.status).toBe(400);
  });
});
