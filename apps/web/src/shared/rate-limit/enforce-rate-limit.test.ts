import { describe, expect, it } from "vitest";
import { enforceRateLimit } from "./enforce-rate-limit";
import { getRateLimiter } from "./instance";

describe("enforceRateLimit", () => {
  it("retorna null (permite) enquanto dentro do limite", async () => {
    const response = await enforceRateLimit("test-identifier-1", {
      bucket: "test:bucket-a",
      limit: 5,
      windowMs: 60_000,
    });
    expect(response).toBeNull();
  });

  it("retorna 429 com Retry-After quando o limite estoura", async () => {
    const rule = { bucket: "test:bucket-b", limit: 1, windowMs: 60_000 };
    const first = await enforceRateLimit("test-identifier-2", rule);
    expect(first).toBeNull();

    const second = await enforceRateLimit("test-identifier-2", rule);
    expect(second).not.toBeNull();
    expect(second!.status).toBe(429);
    expect(second!.headers.get("Retry-After")).toBeTruthy();
  });

  it("identificadores diferentes não interferem entre si", async () => {
    const rule = { bucket: "test:bucket-c", limit: 1, windowMs: 60_000 };
    await enforceRateLimit("identifier-a", rule);
    const responseForB = await enforceRateLimit("identifier-b", rule);
    expect(responseForB).toBeNull();
  });

  it("usa a instância compartilhada do rate limiter", async () => {
    const rule = { bucket: "test:bucket-shared", limit: 1, windowMs: 60_000 };
    await enforceRateLimit("shared-identifier", rule);
    const direct = await getRateLimiter().consume("test:bucket-shared:shared-identifier", 1, 60_000);
    expect(direct.allowed).toBe(false);
  });
});
