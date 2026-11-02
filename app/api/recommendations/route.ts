import { NextRequest, NextResponse } from "next/server"

import { tmdb } from "@/tmdb/api"

export const revalidate = 900

const MAX_SEEDS = 4
const MAX_RESULTS = 18

type Seed = {
  mediaType: "movie" | "tv"
  id: number
}

function parseSeeds(raw: string): Seed[] {
  const seen = new Set<string>()
  const seeds: Seed[] = []

  for (const value of raw.split(",").slice(0, MAX_SEEDS * 2)) {
    const [mediaType, idText] = value.trim().split(":")
    const id = Number(idText)
    if ((mediaType !== "movie" && mediaType !== "tv") || !Number.isInteger(id) || id <= 0) continue
    const key = `${mediaType}:${id}`
    if (seen.has(key)) continue
    seen.add(key)
    seeds.push({ mediaType, id })
    if (seeds.length >= MAX_SEEDS) break
  }

  return seeds
}

export async function GET(request: NextRequest) {
  const seeds = parseSeeds(request.nextUrl.searchParams.get("seeds") || "")
  if (!seeds.length) return NextResponse.json({ results: [], seeds: [] })

  const responses = await Promise.allSettled(
    seeds.map((seed) => seed.mediaType === "movie"
      ? tmdb.movie.recommendations({ id: seed.id, page: "1" })
      : tmdb.tv.recommendations({ id: seed.id, page: "1" }))
  )

  const results = responses.flatMap((response, index) => {
    if (response.status !== "fulfilled") return []
    const mediaType = seeds[index].mediaType
    return response.value.results.map((item) => ({ ...item, media_type: mediaType }))
  })

  const deduped = Array.from(
    new Map(results.map((item) => [`${item.media_type}:${item.id}`, item])).values()
  ).slice(0, MAX_RESULTS)

  return NextResponse.json({ results: deduped, seeds: seeds.map((seed) => `${seed.mediaType}:${seed.id}`) }, {
    headers: { "Cache-Control": "private, max-age=900, stale-while-revalidate=3600" },
  })
}
