/**
 * Subconjunto do cliente Redis usado por `UpstashRateLimiter` — permite
 * testar o adapter com um fake simples em vez de depender do tipo
 * variádico completo de `@upstash/redis` (ou de uma instância real).
 */
export interface RedisLike {
  incr(key: string): Promise<number>;
  pexpire(key: string, milliseconds: number): Promise<number>;
  pttl(key: string): Promise<number>;
}
