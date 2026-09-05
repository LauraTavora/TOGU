import { Redis } from "@upstash/redis";
import { InMemoryRateLimiter } from "./in-memory-rate-limiter";
import { UpstashRateLimiter } from "./upstash-rate-limiter";
import type { RateLimiter } from "./rate-limiter";
import type { RedisLike } from "./redis-like";

/**
 * Usa Upstash Redis (contador compartilhado entre instâncias) quando
 * configurado; cai para o limitador em memória (por instância, não
 * confiável em serverless com múltiplas instâncias — ver ADR-011/023)
 * caso contrário. Em produção sem Upstash configurado, avisa uma vez no
 * log — silenciar isso esconderia que o rate limiting não está
 * funcionando de verdade.
 */
function buildRateLimiter(): RateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    // O client real do @upstash/redis tem uma assinatura variádica mais
    // ampla que `RedisLike`; os três comandos usados aqui são
    // compatíveis em runtime — ver ADR-023.
    return new UpstashRateLimiter(new Redis({ url, token }) as unknown as RedisLike);
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN não configurados — usando limitador em memória, " +
        "que não funciona corretamente com múltiplas instâncias serverless (ver ADR-023).",
    );
  }

  return new InMemoryRateLimiter();
}

const sharedRateLimiter: RateLimiter = buildRateLimiter();

export function getRateLimiter(): RateLimiter {
  return sharedRateLimiter;
}
