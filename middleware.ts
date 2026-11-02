import { NextResponse, type NextRequest } from "next/server"
import { checkRateLimit } from "@/lib/security/rate-limiter"

export function middleware(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const clientIp = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : realIp || "127.0.0.1"

  const rateLimit = checkRateLimit(clientIp, "public-route", {
    windowMs: 60000,
    maxRequests: 90,
  })

  if (!rateLimit.success) {
    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfterSeconds: rateLimit.retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfter),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.reset),
        },
      }
    )
  }

  const response = NextResponse.next()

  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )
  response.headers.set("X-RateLimit-Limit", String(rateLimit.limit))
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining))
  response.headers.set("X-RateLimit-Reset", String(rateLimit.reset))

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
