import type { RateLimiter, RateLimitResult } from "./rate-limiter";
import type { RedisLike } from "./redis-like";

/**
 * Backend de produção do rate limiter: contador de janela fixa
 * compartilhado via Upstash Redis (REST, sem conexão persistente —
 * funciona em serverless/edge, diferente de um cliente Redis
 * tradicional como ioredis). Substitui o `InMemoryRateLimiter` — cujo
 * contador por instância não sobrevive entre invocações serverless
 * diferentes — quando `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`
 * estão configurados. Ver ADR-023.
 *
 * Limitação conhecida: `incr` e `pexpire` não são atômicos entre si — uma
 * falha exatamente entre as duas chamadas deixaria a chave sem expiração
 * (contando para sempre até uma reinicialização manual). Aceitável para
 * esta entrega; a correção completa exigiria um script Lua atômico.
 */
export class UpstashRateLimiter implements RateLimiter {
  constructor(private readonly redis: RedisLike) {}

  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.pexpire(key, windowMs);
    }

    const ttlMs = await this.redis.pttl(key);
    const resetAt = new Date(Date.now() + (ttlMs > 0 ? ttlMs : windowMs));

    if (count > limit) {
      return { allowed: false, remaining: 0, resetAt };
    }
    return { allowed: true, remaining: Math.max(0, limit - count), resetAt };
  }
}
