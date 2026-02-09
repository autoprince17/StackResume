/**
 * Simple in-memory rate limiter for API routes.
 * 
 * Limits requests per IP address within a sliding time window.
 * Suitable for a single-instance deployment. For multi-instance
 * deployments, replace with Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Periodically clean up expired entries to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function startCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS)
  // Unref so it doesn't keep the process alive
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  headers: Record<string, string>
}

/**
 * Check if a request should be allowed based on rate limit rules.
 * 
 * @param identifier - Unique key (typically IP address or IP + route)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with allowed status and response headers
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  startCleanup()

  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const existing = store.get(identifier)

  if (!existing || now > existing.resetAt) {
    // First request or window expired — start a new window
    const resetAt = now + windowMs
    store.set(identifier, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
      headers: {
        'X-RateLimit-Limit': String(config.maxRequests),
        'X-RateLimit-Remaining': String(config.maxRequests - 1),
        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
      },
    }
  }

  existing.count++
  const remaining = Math.max(0, config.maxRequests - existing.count)
  const allowed = existing.count <= config.maxRequests

  return {
    allowed,
    remaining,
    resetAt: existing.resetAt,
    headers: {
      'X-RateLimit-Limit': String(config.maxRequests),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(existing.resetAt / 1000)),
      ...(allowed ? {} : { 'Retry-After': String(Math.ceil((existing.resetAt - now) / 1000)) }),
    },
  }
}

/**
 * Extract a client identifier from a Next.js request for rate limiting.
 * Uses x-forwarded-for (set by Vercel/reverse proxies) or falls back to a generic key.
 */
export function getClientIdentifier(req: { headers: { get(name: string): string | null } }, route: string): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  return `${route}:${ip}`
}
