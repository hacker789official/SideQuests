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

  return (
    <div className="container space-y-16 py-8">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary cp-glow-cyan">
          Anime & Manga
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl cp-gradient-text">
          Anime
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Browse trending and popular anime series and films, then page through AniList’s 20k+ anime catalog with filters for genre, season, year, and score.
        </p>
      </div>

      <Section title="Trending Now" href="/anime/trending" media={trending.media} />
      <Section title="Popular" href="/anime/popular" media={popular.media} />

      <div className="flex flex-wrap gap-3 pt-4">
        <Link
          href="/anime/popular"
          className="rounded-full border border-primary/50 px-5 py-2 text-sm font-semibold text-primary cp-glow-cyan hover:bg-primary/10 transition-colors"
        >
          Explore full catalog →
        </Link>
        <Link
          href="/anime/top-rated"
          className="rounded-full border border-primary/50 px-5 py-2 text-sm font-semibold text-primary cp-glow-cyan hover:bg-primary/10 transition-colors"
        >
          Top Rated →
        </Link>
        <Link
          href="/manga"
          className="rounded-full border border-accent/50 px-5 py-2 text-sm font-semibold text-accent cp-glow-magenta hover:bg-accent/10 transition-colors"
        >
          Browse Manga →
        </Link>
      </div>
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
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      <Link href={href} className="text-sm text-primary hover:underline">
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
