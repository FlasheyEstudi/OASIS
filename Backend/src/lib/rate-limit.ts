import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ── IP Helper ──────────────────────────────────────────────────
export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

// ── Redis Setup ───────────────────────────────────────────────
const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = isRedisConfigured 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// ── Mock Result (for dev without redis) ──────────────────────
const mockLimitResult = {
  success: true,
  remaining: 999,
  reset: Date.now() + 60000,
  limit: 1000,
};

// ── Limiters ──────────────────────────────────────────────────

export const loginLimiter = isRedisConfigured && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: 'oasis_ratelimit_login',
    })
  : { limit: async () => mockLimitResult };

export const registerLimiter = isRedisConfigured && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'oasis_ratelimit_register',
    })
  : { limit: async () => mockLimitResult };

export const apiLimiter = isRedisConfigured && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      analytics: true,
      prefix: 'oasis_ratelimit_api',
    })
  : { limit: async () => mockLimitResult };

// ── Response Helper ────────────────────────────────────────────
export function getRateLimitHeaders(remaining: number, reset: number) {
  return {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };
}
