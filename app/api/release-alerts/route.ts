import { NextRequest, NextResponse } from "next/server"

import { searchManga } from "@/lib/mangadex-api"
import { searchMangaYi } from "@/lib/mangayi-api"
import { tmdb } from "@/tmdb/api"

export const revalidate = 900

export type ReleaseSignal = {
  key: string
  source: "MangaDex" | "MangaYi" | "TMDB"
  kind: "Chapter" | "Episode"
  title: string
  detail: string
  href: string
  observedAt: string | null
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim().slice(0, 80) || ""
  if (!query) return NextResponse.json({ signals: [] })

  const [mangaDexResponse, mangaYiResponse, tmdbResponse] = await Promise.allSettled([
    searchManga(query, 1, 4),
    searchMangaYi(query, 1),
    tmdb.search.multi({ query, page: "1" }),
  ])

  const signals: ReleaseSignal[] = []

  if (mangaDexResponse.status === "fulfilled") {
    for (const manga of mangaDexResponse.value.data) {
      const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || "Untitled manga"
      const chapter = manga.attributes.latestUploadedChapter || manga.attributes.lastChapter
      if (!chapter) continue
      signals.push({
        key: `mangadex:${manga.id}:${chapter}`,
        source: "MangaDex",
        kind: "Chapter",
        title,
        detail: `Chapter ${chapter}`,
        href: `/manga/search/${encodeURIComponent(manga.id)}`,
        observedAt: null,
      })
    }
  }

  if (mangaYiResponse.status === "fulfilled") {
    for (const release of mangaYiResponse.value.results.slice(0, 6)) {
      signals.push({
        key: `mangayi:${release.id}:${release.chapter}`,
        source: "MangaYi",
        kind: "Chapter",
        title: release.title,
        detail: `Chapter ${release.chapter || "latest"}`,
        href: release.readerUrl,
        observedAt: null,
      })
    }
  }

  if (tmdbResponse.status === "fulfilled") {
    const tvMatches = tmdbResponse.value.results
      .filter((result): result is Extract<typeof result, { media_type: "tv" }> => result.media_type === "tv")
      .slice(0, 3)
    const tvDetails = await Promise.allSettled(tvMatches.map((show) => tmdb.tv.detail({ id: String(show.id) })))

    tvDetails.forEach((detail, index) => {
      if (detail.status !== "fulfilled") return
      const episode = detail.value.next_episode_to_air || detail.value.last_episode_to_air
      if (!episode) return
      const show = tvMatches[index]
      const isUpcoming = Boolean(detail.value.next_episode_to_air)
      signals.push({
        key: `tmdb:${show.id}:s${episode.season_number}e${episode.episode_number}:${episode.air_date}`,
        source: "TMDB",
        kind: "Episode",
        title: show.name,
        detail: `${isUpcoming ? "Next" : "Latest"} S${episode.season_number} E${episode.episode_number} · ${episode.air_date}`,
        href: `/tv/${show.id}`,
        observedAt: episode.air_date || null,
      })
    })
  }

  return NextResponse.json({ signals: signals.slice(0, 18) }, {
    headers: { "Cache-Control": "private, max-age=900, stale-while-revalidate=3600" },
  })
}
