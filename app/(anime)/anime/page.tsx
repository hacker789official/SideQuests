import Link from "next/link"
import { anilist } from "@/anilist/api"

import { AnimeCard } from "@/components/anime-card"

export const revalidate = 21600

export async function generateMetadata() {
  return {
    title: "Anime",
    description:
      "Discover trending, popular, and top rated anime. Metadata powered by AniList.",
  }
}

export default async function AnimeHub() {
  const [{ Page: trending }, { Page: popular }] = await Promise.all([
    anilist.browse.trending({ type: "ANIME", perPage: 12 }),
    anilist.browse.popular({ type: "ANIME", perPage: 12 }),
  ])

  const actionClassName =
    "inline-flex min-h-11 items-center rounded-xl border border-cyan-200/35 px-5 py-2 text-sm font-bold text-cyan-100 cp-glow-cyan transition-colors hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"

  return (
    <div className="sidequests-page sq-discovery-page container space-y-16 py-8">
      <header className="sq-route-intro">
        <p className="sq-route-kicker">SIDEQUESTS / ANIME</p>
        <h1>Anime</h1>
        <p className="max-w-2xl text-muted-foreground">
          Browse trending and popular anime series and films, then explore
          AniList’s catalog with filters for genre, season, year, and score.
        </p>
      </header>

      <Section
        title="Trending now"
        href="/anime/trending"
        media={trending.media}
      />
      <Section title="Popular" href="/anime/popular" media={popular.media} />

      <nav
        className="flex flex-wrap gap-3 pt-4"
        aria-label="Anime and manga collections"
      >
        <Link href="/anime/popular" className={actionClassName}>
          Explore full catalog{" "}
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </Link>
        <Link href="/anime/top-rated" className={actionClassName}>
          Top rated{" "}
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </Link>
        <Link href="/manga" className={actionClassName}>
          Browse manga{" "}
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </Link>
      </nav>
    </div>
  )
}

const Section = ({
  title,
  href,
  media,
}: {
  title: string
  href: string
  media: import("@/anilist/models/media").AniListMedia[]
}) => (
  <section
    className="sidequests-rail streamhub-rail space-y-4"
    aria-label={`${title} anime`}
  >
    <div className="sidequests-section-heading">
      <div>
        <h2>{title}</h2>
      </div>
      <Link
        href={href}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
      >
        View all
      </Link>
    </div>
    <div className="grid-list">
      {media.map((item) => (
        <AnimeCard key={item.id} media={item} basePath="anime" />
      ))}
    </div>
  </section>
)
