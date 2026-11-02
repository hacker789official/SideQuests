import { NextRequest, NextResponse } from "next/server"

import { tmdb } from "@/tmdb/api"

export const runtime = "nodejs"
export const revalidate = 300

type Suggestion = {
  id: number
  mediaType: "movie" | "tv" | "person"
  title: string
  subtitle: string
  posterPath?: string | null
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().replace(/\s+/g, " ").slice(0, 80) || ""
  if (query.length < 2) return NextResponse.json({ results: [] })

  try {
    const response = await tmdb.search.multi({ query, page: "1" })
    const results: Suggestion[] = response.results
      .filter((item) => item.media_type === "movie" || item.media_type === "tv" || item.media_type === "person")
      .slice(0, 7)
      .map((item) => {
        if (item.media_type === "person") {
          return { id: item.id, mediaType: "person", title: item.name, subtitle: "Person", posterPath: item.profile_path }
        }
        const title = item.media_type === "movie" ? item.title : item.name
        const year = (item.media_type === "movie" ? item.release_date : item.first_air_date)?.slice(0, 4)
        return { id: item.id, mediaType: item.media_type, title, subtitle: `${item.media_type === "movie" ? "Movie" : "Series"}${year ? ` · ${year}` : ""}`, posterPath: item.poster_path }
      })

    return NextResponse.json({ results }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } })
  } catch {
    return NextResponse.json({ results: [], error: "Autocomplete unavailable" }, { status: 200 })
  }
}
