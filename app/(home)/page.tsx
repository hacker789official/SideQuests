import { Metadata } from "next"
import Link from "next/link"

import { tmdb } from "@/tmdb/api"
import { MovieHero } from "@/components/movie-hero"
import { TrendCarousel } from "@/components/trend-carousel"
import { WatchHistoryCarousel } from "@/components/watch-history-carousel"
import { RandomSideQuestButton } from "@/components/random-sidequest-button"
import { PersonalRecommendations } from "@/components/personal-recommendations"
import { QuickGenreFilters } from "@/components/quick-genre-filters"

export const metadata: Metadata = {
  title: "Home",
}

export const revalidate = 604800

export default async function Home() {
  const [{ results: movies }, { results: tvShows }] = await Promise.all([
    tmdb.trending.movie({ time: "day", page: "1" }),
    tmdb.trending.tv({ time: "day", page: "1" }),
  ])
  const dailyIndex = new Date().getUTCDate() % Math.max(movies.length, 1)
  const dailyMovie = movies[dailyIndex] || movies[0]

  return (
    <section className="sidequests-page space-y-10 pb-20">
      <MovieHero movies={movies} label="Featured Film" count={3} fullBleed={true} />
      <QuickGenreFilters />

      <div className="space-y-10 pt-2">
        <div className="streamhub-rail px-4 sm:px-6 lg:px-10">
          <WatchHistoryCarousel
            title="Continue Watching"
            mode="continue"
            link="/library"
          />
        </div>

        <PersonalRecommendations />

        {dailyMovie ? (
          <section className="streamhub-rail px-4 sm:px-6 lg:px-10">
            <div className="sidequests-panel flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Daily featured quest</p>
                <h2 className="mt-1 text-xl font-black tracking-tight">{dailyMovie.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">A fresh pick from today’s trending films.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/movie/${dailyMovie.id}`} className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:scale-[1.02]">Open pick</Link>
                <RandomSideQuestButton />
              </div>
            </div>
          </section>
        ) : null}

        <TrendCarousel
          type="movie"
          title="Trending Movies"
          link="/trending/movie"
          items={movies}
        />

        <TrendCarousel
          type="tv"
          title="Trending Series"
          link="/trending/tv"
          items={tvShows}
        />

      </div>
    </section>
  )
}
