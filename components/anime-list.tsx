import { notFound } from "next/navigation"
import { anilist } from "@/anilist/api"
import { AniListMediaType } from "@/anilist/models/media"

import { AnimeCard } from "@/components/anime-card"
import { ListPagination } from "@/components/list-pagination"

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Sports"]
const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"] as const

type SortMode = "trending" | "popular" | "topRated"
type FilterSort = "TRENDING_DESC" | "POPULARITY_DESC" | "SCORE_DESC" | "START_DATE_DESC"

interface AnimeListProps {
  type: AniListMediaType
  sort: SortMode
  page: string
  title: string
  description: string
  searchParams?: Record<string, string | string[] | undefined>
}

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value

export const AnimeList: React.FC<AnimeListProps> = async ({
  type,
  sort,
  page,
  title,
  description,
  searchParams = {},
}) => {
  const pageNumber = Number(first(searchParams.page) || page) || 1
  const sortMap: Record<SortMode, FilterSort> = {
    trending: "TRENDING_DESC",
    popular: "POPULARITY_DESC",
    topRated: "SCORE_DESC",
  }
  const selectedSort = (first(searchParams.sort) as FilterSort) || sortMap[sort]
  const genre = first(searchParams.genre)
  const season = first(searchParams.season) as typeof seasons[number] | undefined
  const seasonYear = Number(first(searchParams.seasonYear)) || undefined

  const { Page } = await anilist.browse.filtered({
    type,
    page: pageNumber,
    perPage: 24,
    genre: genre || undefined,
    season: type === "ANIME" ? season : undefined,
    seasonYear: type === "ANIME" ? seasonYear : undefined,
    sort: selectedSort,
  })

  if (!Page?.media?.length) return notFound()

  const basePath = type === "ANIME" ? "anime" : "manga"
  const makeQuery = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const next = { genre, season, seasonYear: seasonYear ? String(seasonYear) : undefined, sort: selectedSort, ...changes }
    for (const [key, value] of Object.entries(next)) if (value) params.set(key, value)
    return `?${params.toString()}`
  }

  return (
    <div className="container space-y-8">
      <div className="md:mb-12 md:mt-6">
        <h1 className="mb-2 text-2xl font-medium cp-glow-cyan">{title}</h1>
        <p className="max-w-3xl text-muted-foreground">{description}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Curate your orbit</span>
          <a href={`/${basePath}`} className="text-xs font-semibold text-primary hover:underline">Reset filters</a>
        </div>
        <form method="get" className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="browse-sort">Sort</label>
          <select id="browse-sort" name="sort" defaultValue={selectedSort} className="h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-xs text-zinc-200">
            <option value="POPULARITY_DESC">Popularity</option>
            <option value="SCORE_DESC">Score</option>
            <option value="TRENDING_DESC">Trending</option>
            <option value="START_DATE_DESC">Newest release</option>
          </select>
          <label className="sr-only" htmlFor="browse-genre">Genre</label>
          <select id="browse-genre" name="genre" defaultValue={genre || ""} className="h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-xs text-zinc-200">
            <option value="">All genres</option>
            {genres.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          {type === "ANIME" && (
            <>
              <select name="season" defaultValue={season || ""} className="h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-xs text-zinc-200">
                <option value="">All seasons</option>
                {seasons.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <input name="seasonYear" defaultValue={seasonYear || ""} placeholder="Year" inputMode="numeric" className="h-9 w-24 rounded-lg border border-white/10 bg-black/30 px-3 text-xs text-zinc-200" />
            </>
          )}
          <button type="submit" className="h-9 rounded-lg bg-primary px-3 text-xs font-bold text-black transition hover:bg-primary/90">Apply</button>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <span>Quick:</span>
            <a href={makeQuery({ sort: "POPULARITY_DESC" })} className="text-zinc-300 hover:text-white">Popular</a>
            <a href={makeQuery({ sort: "SCORE_DESC" })} className="text-zinc-300 hover:text-white">Score</a>
          </div>
        </form>
        <p className="mt-3 text-[11px] text-zinc-600">Use URL parameters for shareable filters: `genre`, `season`, `seasonYear`, and `sort`.</p>
      </div>

      <div className="grid-list">
        {Page.media.map((media) => <AnimeCard key={media.id} media={media} basePath={basePath} />)}
      </div>

      <ListPagination
        currentPage={Page.pageInfo.currentPage}
        totalPages={Page.pageInfo.lastPage}
        hasNextPage={Page.pageInfo.hasNextPage}
      />
    </div>
  )
}
