export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Port de rate limiting — ver docs/adr/ADR-011 para a implementação
 * atual (em memória, por instância) e sua limitação conhecida em
 * ambiente serverless com múltiplas instâncias.
 */
export interface RateLimiter {
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}
