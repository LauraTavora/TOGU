import { InMemoryRateLimiter } from "./in-memory-rate-limiter";
import type { RateLimiter } from "./rate-limiter";

const sharedRateLimiter: RateLimiter = new InMemoryRateLimiter();

export function getRateLimiter(): RateLimiter {
  return sharedRateLimiter;
}
