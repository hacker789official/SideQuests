import { notFound } from "next/navigation"
import Image from "next/image"
import { Play } from "lucide-react"
import { anilist } from "@/anilist/api"
import { AnimeWatchPlayer } from "@/components/anime-watch-player"
import {
  formatLabel,
  mediaYear,
  preferredTitle,
  scoreToTenPoint,
  stripDescriptionHtml,
} from "@/anilist/utils"

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

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { id } = await params
  const { Media } = await anilist.detail.byId(Number(id))

  if (!Media) return notFound()

  const title = preferredTitle(Media)
  const score = scoreToTenPoint(Media.averageScore)
  const year = mediaYear(Media)
  const cover = Media.coverImage.extraLarge || Media.coverImage.large
  const studios = Media.studios?.nodes?.map((s) => s.name).join(", ")

  return (
    <div className="relative">
      {Media.bannerImage && (
        <div className="relative h-64 w-full overflow-hidden md:h-96">
          <Image
            src={Media.bannerImage}
            alt={title}
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <div className="container -mt-24 flex flex-col gap-8 pb-16 md:flex-row">
        <div className="relative mx-auto aspect-poster w-48 shrink-0 overflow-hidden rounded-md border cp-border-glow md:mx-0 md:w-64">
          {cover ? (
            <Image src={cover} alt={title} fill className="object-cover" />
          ) : null}
        </div>

        <div className="flex-1 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary cp-glow-cyan">
            Anime
          </p>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl cp-gradient-text">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {score !== null && (
              <span className="rounded-sm border border-primary/60 px-2 py-0.5 font-bold text-primary cp-glow-cyan">
                {score} / 10
              </span>
            )}
            {formatLabel(Media.format) && <span>{formatLabel(Media.format)}</span>}
            {year && <span>{year}</span>}
            {Media.episodes && <span>{Media.episodes} episodes</span>}
            {studios && <span>{studios}</span>}
          </div>

          {Media.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Media.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-accent/40 px-3 py-1 text-xs text-accent"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center">
            <a
              href="#anime-player"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 active:scale-[0.98]"
            >
              <Play className="size-4 fill-current" />
              Watch in SideQuests
            </a>
            <span className="text-xs text-muted-foreground">
              Embedded HD player · episode selector · sub/dub controls
            </span>
          </div>

          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {stripDescriptionHtml(Media.description)}
          </p>
        </div>
      </div>

      <div id="anime-player" className="container pb-16 scroll-mt-24">
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
