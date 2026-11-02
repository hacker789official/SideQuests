import Link from "next/link"
import { anilist } from "@/anilist/api"

import { AnimeCard } from "@/components/anime-card"
import { MangaYiReleaseRail } from "@/components/mangayi-release-rail"

export const revalidate = 21600

export async function generateMetadata() {
  return {
    title: "Manga",
    description:
      "Discover trending, popular, and top rated manga. Metadata powered by AniList.",
  }
}

export default async function MangaHub() {
  const [{ Page: trending }, { Page: popular }] = await Promise.all([
    anilist.browse.trending({ type: "MANGA", perPage: 12 }),
    anilist.browse.popular({ type: "MANGA", perPage: 12 }),
  ])

  return (
    <div className="container space-y-16 py-8">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent cp-glow-magenta">
          Anime & Manga
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl cp-gradient-text">
          Manga
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Browse AniList’s 100k+ manga catalog alongside public latest-release metadata from MangaYi. MangaYi reading links open on the original source, while MangaDex remains available for in-site reading.
        </p>
      </div>

      <MangaYiReleaseRail />

      <Section title="Trending Now" href="/manga/trending" media={trending.media} />
      <Section title="Popular" href="/manga/popular" media={popular.media} />

      <div className="flex flex-wrap gap-3 pt-4">
        <Link
          href="/manga/popular"
          className="rounded-full border border-accent/50 px-5 py-2 text-sm font-semibold text-accent cp-glow-magenta hover:bg-accent/10 transition-colors"
        >
          Explore full catalog →
        </Link>
        <Link
          href="/manga/top-rated"
          className="rounded-full border border-accent/50 px-5 py-2 text-sm font-semibold text-accent cp-glow-magenta hover:bg-accent/10 transition-colors"
        >
          Top Rated →
        </Link>
        <Link
          href="/anime"
          className="rounded-full border border-primary/50 px-5 py-2 text-sm font-semibold text-primary cp-glow-cyan hover:bg-primary/10 transition-colors"
        >
          Browse Anime →
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
      <Link href={href} className="text-sm text-accent hover:underline">
        View all
      </Link>
    </div>
    <div className="grid-list">
      {media.map((item) => (
        <AnimeCard key={item.id} media={item} basePath="manga" />
      ))}
    </div>
  </section>
)
