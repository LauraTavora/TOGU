import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { POST } from "./route";

function jsonRequest(body: unknown, authorization?: string): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (authorization) headers.set("authorization", authorization);
  return new Request("http://localhost/api/v1/events", { method: "POST", headers, body: JSON.stringify(body) });
}

async function validToken(): Promise<string> {
  const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET!);
  return new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject("user-1").setExpirationTime("15m").sign(secretKey);
}

describe("POST /api/v1/events", () => {
  it("rejeita requisição sem autenticação (rota sem login)", async () => {
    const response = await POST(
      jsonRequest({ title: "Jantar", startAt: "2026-01-10T20:00:00Z", endAt: "2026-01-10T22:00:00Z" }),
    );
    expect(response.status).toBe(401);
  });

  it("rejeita corpo inválido mesmo autenticado, sem tocar o banco", async () => {
    const token = await validToken();
    const response = await POST(jsonRequest({ title: "" }, `Bearer ${token}`));
    expect(response.status).toBe(400);
  });

  it("rejeita token expirado", async () => {
    const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET!);
    const expiredToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-1")
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secretKey);

    const response = await POST(
      jsonRequest(
        { title: "Jantar", startAt: "2026-01-10T20:00:00Z", endAt: "2026-01-10T22:00:00Z" },
        `Bearer ${expiredToken}`,
      ),
    );
    expect(response.status).toBe(401);
  });
});
