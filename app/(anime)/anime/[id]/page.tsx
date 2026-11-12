import Image from "next/image"
import { notFound } from "next/navigation"
import { anilist } from "@/anilist/api"
import {
  formatLabel,
  mediaYear,
  preferredTitle,
  scoreToTenPoint,
  stripDescriptionHtml,
} from "@/anilist/utils"
import { Play } from "lucide-react"

import { AnimeWatchPlayer } from "@/components/anime-watch-player"

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AnimeDetailPageProps) {
  const { id } = await params
  const { Media } = await anilist.detail.byId(Number(id))
  if (!Media) return {}
  return {
    title: preferredTitle(Media),
    description: stripDescriptionHtml(Media.description).slice(0, 160),
  }
}

export const revalidate = 21600

export default async function AnimeDetailPage({
  params,
}: AnimeDetailPageProps) {
  const { id } = await params
  const { Media } = await anilist.detail.byId(Number(id))

  if (!Media) return notFound()

  const title = preferredTitle(Media)
  const score = scoreToTenPoint(Media.averageScore)
  const year = mediaYear(Media)
  const cover = Media.coverImage.extraLarge || Media.coverImage.large
  const studios = Media.studios?.nodes?.map((s) => s.name).join(", ")

  return (
    <div className="sidequests-page relative">
      {Media.bannerImage && (
        <div className="relative h-64 w-full overflow-hidden md:h-96">
          <Image
            src={Media.bannerImage}
            alt={title}
            fill
            className="object-cover opacity-40"
            priority
          />
          <div
            className="sidequests-neon-wash pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <div className="container -mt-24 flex flex-col gap-8 pb-16 md:flex-row">
        <div className="relative mx-auto aspect-poster w-48 shrink-0 overflow-hidden rounded-2xl border border-cyan-200/25 shadow-[0_20px_55px_rgba(0,0,0,0.4),0_0_30px_hsl(var(--primary)/0.18)] md:mx-0 md:w-64">
          {cover ? (
            <Image src={cover} alt={title} fill className="object-cover" />
          ) : null}
        </div>

        <div className="flex-1 space-y-4">
          <p className="cp-glow-cyan text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Anime
          </p>
          <h1 className="cp-gradient-text text-3xl font-black tracking-tight md:text-5xl">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {score !== null && (
              <span className="cp-glow-cyan rounded-sm border border-primary/60 px-2 py-0.5 font-bold text-primary">
                {score} / 10
              </span>
            )}
            {formatLabel(Media.format) && (
              <span>{formatLabel(Media.format)}</span>
            )}
            {year && <span>{year}</span>}
            {Media.episodes && <span>{Media.episodes} episodes</span>}
            {studios && <span>{studios}</span>}
          </div>

          {Media.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Media.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-cyan-200/25 bg-cyan-300/[0.06] px-3 py-1 text-xs text-cyan-100"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center">
            <a
              href="#anime-player"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 active:scale-[0.98]"
            >
              <Play className="size-4 fill-current" />
              Watch in SideQuests
            </a>
            <span className="text-xs text-muted-foreground">
              Choose an episode and audio option below when supported by the
              configured source.
            </span>
          </div>

          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {stripDescriptionHtml(Media.description)}
          </p>
        </div>
      </div>

      <div id="anime-player" className="container scroll-mt-24 pb-16">
        <AnimeWatchPlayer
          animeId={Media.id}
          title={title}
          malId={Media.idMal}
          totalEpisodes={Media.episodes}
        />
      </div>
    </div>
  )
}
