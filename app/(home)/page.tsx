import { Metadata } from "next"
import Link from "next/link"
import { tmdb } from "@/tmdb/api"
import {
  ArrowUpRight,
  Clapperboard,
  Compass,
  MonitorPlay,
  Sparkles,
} from "lucide-react"

import { MovieHero } from "@/components/movie-hero"
import { PersonalRecommendations } from "@/components/personal-recommendations"
import { QuickGenreFilters } from "@/components/quick-genre-filters"
import { TrendCarousel } from "@/components/trend-carousel"
import { WatchHistoryCarousel } from "@/components/watch-history-carousel"

export const metadata: Metadata = { title: "Home" }
export const revalidate = 604800

const destinations = [
  {
    href: "/movie/popular",
    label: "FEATURES",
    title: "Movies",
    icon: Clapperboard,
    tone: "movie",
  },
  {
    href: "/tv/popular",
    label: "LONG FORM",
    title: "Series",
    icon: MonitorPlay,
    tone: "series",
  },
  {
    href: "/anime",
    label: "ANIME + MANGA",
    title: "Anime",
    icon: Sparkles,
    tone: "anime",
  },
  {
    href: "/cartoons",
    label: "ALL AGES",
    title: "Cartoons",
    icon: Compass,
    tone: "cartoons",
  },
]

export default async function Home() {
  const [{ results: movies }, { results: tvShows }] = await Promise.all([
    tmdb.trending.movie({ time: "day", page: "1" }),
    tmdb.trending.tv({ time: "day", page: "1" }),
  ])

  return (
    <main className="sq-home">
      <MovieHero movies={movies} label="THE ARCADE SELECTS" />
      <section className="sq-portals" aria-label="Explore SideQuests">
        <div className="sq-portals__intro">
          <p>
            <span /> PICK A PORTAL
          </p>
          <h2>
            What are you <em>in the mood for?</em>
          </h2>
        </div>
        <div className="sq-portals__grid">
          {destinations.map(
            ({ href, label, title, icon: Icon, tone }, index) => (
              <Link
                href={href}
                key={href}
                className={`sq-portal sq-portal--${tone}`}
                prefetch={false}
              >
                <span className="sq-portal__index">0{index + 1}</span>
                <Icon className="sq-portal__icon" strokeWidth={1.5} />
                <span className="sq-portal__label">{label}</span>
                <strong>{title}</strong>
                <ArrowUpRight className="sq-portal__arrow" />
              </Link>
            )
          )}
        </div>
      </section>
      <QuickGenreFilters />
      <div className="sq-home__lanes">
        <section className="sq-home__continue">
          <div className="sq-home__section-tag">
            <span /> YOUR STORY, RIGHT WHERE YOU LEFT IT
          </div>
          <WatchHistoryCarousel
            title="Continue Watching"
            mode="continue"
            link="/library"
          />
        </section>
        <PersonalRecommendations />
        <TrendCarousel
          type="movie"
          title="In the spotlight"
          link="/trending/movie"
          items={movies}
        />
        <TrendCarousel
          type="tv"
          title="The series queue"
          link="/trending/tv"
          items={tvShows}
        />
      </div>
    </main>
  )
}
