import { NextResponse } from "next/server"

import { PLAYER_SOURCES } from "@/lib/player-sources"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PROVIDER_HOSTS: Record<string, string> = {
  vidlink: "https://vidlink.pro",
  vidsrc: "https://vidsrc.sbs",
  "vidsrc-classic": "https://vidsrc.xyz",
  superembed: "https://multiembed.mov",
  vidcore: "https://vidcore.io",
  vidfast: "https://vidfast.vc",
  vidrock: "https://vidrock.net",
  primesrc: "https://primesrc.me",
}

async function checkHost(url: string) {
  const startedAt = Date.now()
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    })
    return { status: response.status, ok: response.status < 500, latencyMs: Date.now() - startedAt }
  } catch {
    return { status: null, ok: false, latencyMs: Date.now() - startedAt }
  }
}

export async function GET() {
  const entries = await Promise.all(
    PLAYER_SOURCES.map(async (source) => ({
      id: source.id,
      name: source.name,
      host: PROVIDER_HOSTS[source.id] || null,
      ...(PROVIDER_HOSTS[source.id] ? await checkHost(PROVIDER_HOSTS[source.id]) : { status: null, ok: false, latencyMs: 0 }),
    }))
  )

  return NextResponse.json({ checkedAt: new Date().toISOString(), providers: entries }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
  })
}
