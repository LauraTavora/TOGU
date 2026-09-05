import type { RateLimiter, RateLimitResult } from "./rate-limiter";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Janela fixa por chave, em memória do processo. Suficiente para
 * desenvolvimento e para uma única instância; em produção serverless
 * com múltiplas instâncias, cada instância tem seu próprio contador —
 * ver docs/adr/ADR-011.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt: new Date(resetAt) };
    }

    if (existing.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: new Date(existing.resetAt) };
    }

    existing.count += 1;
    return { allowed: true, remaining: limit - existing.count, resetAt: new Date(existing.resetAt) };
  }
}
