

export interface RateLimitOptions {
  windowMs: number
  maxRequests: number
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitRecord>()

if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key)
      }
    }
  }, 120000)
  if (timer.unref) timer.unref()
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter: number
}

export function checkRateLimit(
  identifier: string,
  bucket: string = "default",
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 60 }
): RateLimitResult {
  const now = Date.now()
  const key = `${bucket}:${identifier}`
  const record = store.get(key)

  if (!record || now > record.resetTime) {
    const resetTime = now + options.windowMs
    store.set(key, { count: 1, resetTime })
    return {
      success: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      reset: Math.ceil(resetTime / 1000),
      retryAfter: 0,
    }
  }

  if (record.count >= options.maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000))
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
      retryAfter,
    }
  }

  record.count += 1
  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - record.count,
    reset: Math.ceil(record.resetTime / 1000),
    retryAfter: 0,
  }
}
