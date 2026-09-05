import { NextResponse } from "next/server";
import { apiError } from "@/shared/http/api-error";
import { getRateLimiter } from "./instance";

export interface RateLimitRule {
  /** Identifica o endpoint/ação (ex.: "auth:login") — compõe a chave junto do identificador. */
  bucket: string;
  limit: number;
  windowMs: number;
}

/**
 * Aplica rate limiting a uma requisição. Retorna a resposta 429 pronta
 * quando o limite estourou, ou `null` quando a requisição pode seguir.
 * `identifier` é normalmente o IP (rotas públicas) ou o userId (rotas
 * autenticadas) — ver docs/SECURITY.md §Rate limiting.
 */
export async function enforceRateLimit(identifier: string, rule: RateLimitRule): Promise<NextResponse | null> {
  const key = `${rule.bucket}:${identifier}`;
  const result = await getRateLimiter().consume(key, rule.limit, rule.windowMs);

  if (result.allowed) {
    return null;
  }

  const retryAfterSeconds = Math.max(0, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000));
  const response = apiError(429, "rate_limited", "Muitas requisições. Tente novamente mais tarde.");
  response.headers.set("Retry-After", String(retryAfterSeconds));
  return response;
}
