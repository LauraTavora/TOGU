import { describe, expect, it, vi } from "vitest";
import { UpstashRateLimiter } from "./upstash-rate-limiter";
import type { RedisLike } from "./redis-like";

/**
 * Fake mínimo que reproduz a semântica INCR/PEXPIRE/PTTL o suficiente
 * para testar o algoritmo do adapter — não é um teste de integração
 * contra o Upstash de verdade (nunca disponível neste ambiente).
 */
class FakeRedis implements RedisLike {
  private readonly store = new Map<string, { count: number; expiresAt: number | null }>();

  async incr(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry || (entry.expiresAt !== null && entry.expiresAt <= Date.now())) {
      this.store.set(key, { count: 1, expiresAt: null });
      return 1;
    }
    entry.count += 1;
    return entry.count;
  }

  async pexpire(key: string, milliseconds: number): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + milliseconds;
    return 1;
  }

  async pttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2;
    if (entry.expiresAt === null) return -1;
    return Math.max(0, entry.expiresAt - Date.now());
  }
}

describe("UpstashRateLimiter", () => {
  it("permite requisições até o limite", async () => {
    const limiter = new UpstashRateLimiter(new FakeRedis());
    const first = await limiter.consume("k", 2, 60_000);
    const second = await limiter.consume("k", 2, 60_000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it("bloqueia a partir da requisição que excede o limite", async () => {
    const limiter = new UpstashRateLimiter(new FakeRedis());
    await limiter.consume("k", 2, 60_000);
    await limiter.consume("k", 2, 60_000);
    const third = await limiter.consume("k", 2, 60_000);

    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("chaves diferentes têm contadores independentes", async () => {
    const limiter = new UpstashRateLimiter(new FakeRedis());
    await limiter.consume("a", 1, 60_000);
    const b = await limiter.consume("b", 1, 60_000);

    expect(b.allowed).toBe(true);
  });

  it("reseta o contador depois que a janela expira", async () => {
    vi.useFakeTimers();
    try {
      const limiter = new UpstashRateLimiter(new FakeRedis());
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

  it("compartilha o contador entre instâncias do adapter (o ponto central do Redis)", async () => {
    const sharedRedis = new FakeRedis();
    const instanceA = new UpstashRateLimiter(sharedRedis);
    const instanceB = new UpstashRateLimiter(sharedRedis);

    await instanceA.consume("k", 1, 60_000);
    const second = await instanceB.consume("k", 1, 60_000);

    expect(second.allowed).toBe(false);
  });
});
