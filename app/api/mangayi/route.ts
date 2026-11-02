import { NextRequest, NextResponse } from "next/server"

import { MANGAYI_ORIGIN, normalizeMangaYiResponse } from "@/lib/mangayi-api"

export const runtime = "nodejs"
export const revalidate = 3600

const MAX_PAGE = 1142
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 30
const requestLog = new Map<string, { startedAt: number; count: number }>()

function isRateLimited(request: NextRequest) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous"
  const now = Date.now()
  const previous = requestLog.get(key)
  if (!previous || now - previous.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestLog.set(key, { startedAt: now, count: 1 })
    return false
  }
  previous.count += 1
  return previous.count > RATE_LIMIT_MAX_REQUESTS
}

export async function GET(request: NextRequest) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: "MangaYi request limit reached. Please try again shortly." }, { status: 429 })
  }

  const rawPage = Number(request.nextUrl.searchParams.get("page") || "1")
  const page = Number.isFinite(rawPage) ? Math.min(MAX_PAGE, Math.max(1, Math.floor(rawPage))) : 1
  const query = request.nextUrl.searchParams.get("query")?.trim().slice(0, 80) || ""

  try {
    const response = await fetch(`${MANGAYI_ORIGIN}/api/search`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "SideQuests-public-catalog/1.0",
      },
      body: JSON.stringify(query ? { s: query.toLowerCase(), p: page } : { t: 1, p: page }),
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "MangaYi is temporarily unavailable." }, { status: 502 })
    }

    const payload = await response.json()
    return NextResponse.json(normalizeMangaYiResponse(payload, page), {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("MangaYi metadata proxy error:", error)
    return NextResponse.json({ error: "Unable to load MangaYi releases right now." }, { status: 502 })
  }
}
