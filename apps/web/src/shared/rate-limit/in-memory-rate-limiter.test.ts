import { describe, expect, it, vi } from "vitest";
import { InMemoryRateLimiter } from "./in-memory-rate-limiter";

describe("InMemoryRateLimiter", () => {
  it("permite requisições até o limite", async () => {
    const limiter = new InMemoryRateLimiter();
    const first = await limiter.consume("k", 2, 60_000);
    const second = await limiter.consume("k", 2, 60_000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it("bloqueia a partir da requisição que excede o limite", async () => {
    const limiter = new InMemoryRateLimiter();
    await limiter.consume("k", 2, 60_000);
    await limiter.consume("k", 2, 60_000);
    const third = await limiter.consume("k", 2, 60_000);

    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("chaves diferentes têm contadores independentes", async () => {
    const limiter = new InMemoryRateLimiter();
    await limiter.consume("a", 1, 60_000);
    const b = await limiter.consume("b", 1, 60_000);

    expect(b.allowed).toBe(true);
  });

  it("reseta o contador depois que a janela expira", async () => {
    vi.useFakeTimers();
    try {
      const limiter = new InMemoryRateLimiter();
      await limiter.consume("k", 1, 1_000);
      const blocked = await limiter.consume("k", 1, 1_000);
      expect(blocked.allowed).toBe(false);

      vi.advanceTimersByTime(1_001);

      const afterWindow = await limiter.consume("k", 1, 1_000);
      expect(afterWindow.allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
