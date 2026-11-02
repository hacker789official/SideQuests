import { NextResponse } from "next/server"
import { tmdb } from "@/tmdb/api"

export const revalidate = 3600

interface TvRouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: TvRouteContext) {
  const { id } = await params
  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return NextResponse.json({ error: "Invalid TV show ID." }, { status: 400 })
  }

  try {
    const show = await tmdb.tv.detail({ id })
    return NextResponse.json(
      {
        title: show.name,
        overview: show.overview,
        releaseDate: show.first_air_date,
        backdropPath: show.backdrop_path,
        seasons: (show.seasons || []).map((season) => ({
          season_number: season.season_number,
          episode_count: season.episode_count,
        })),
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    )
  } catch (error) {
    console.error("TV details API error:", error)
    return NextResponse.json(
      { error: "Unable to load seasons for this show right now." },
      { status: 502 }
    )
  }
}
