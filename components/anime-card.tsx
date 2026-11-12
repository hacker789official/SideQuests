import Image from "next/image"
import Link from "next/link"
import { AniListMedia } from "@/anilist/models/media"
import {
  formatLabel,
  mediaYear,
  preferredTitle,
  scoreToTenPoint,
} from "@/anilist/utils"

interface AnimeCardProps {
  media: AniListMedia
  basePath: "anime" | "manga"
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ media, basePath }) => {
  const title = preferredTitle(media)
  const year = mediaYear(media)
  const score = scoreToTenPoint(media.averageScore)
  const image = media.coverImage.extraLarge || media.coverImage.large

  return (
    <Link
      href={`/${basePath}/${media.id}`}
      prefetch={false}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="group-hover:-translate-y-1 group-hover:border-cyan-200/60 group-hover:shadow-cyan-950/60 group-focus-visible:border-cyan-200/70 relative aspect-poster overflow-hidden rounded-xl border border-cyan-100/15 bg-muted shadow-lg shadow-black/25 transition duration-200">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 20vw, 15vw"
            className="group-hover:scale-105 group-focus-visible:scale-105 size-full object-cover transition-transform duration-300"
          />
        ) : (
          <div className="grid size-full place-items-center text-xs text-muted-foreground">
            No Cover
          </div>
        )}

        <div className="group-hover:opacity-100 group-focus-visible:opacity-100 absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/15 to-transparent opacity-0 transition-opacity duration-200" />

        {score !== null && (
          <div className="cp-glow-cyan absolute right-2 top-2 rounded-md border border-cyan-200/60 bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-bold text-cyan-100 backdrop-blur-sm">
            {score}
          </div>
        )}
      </div>

      <div className="mt-2 space-y-0.5">
        <h3 className="line-clamp-1 text-xs font-semibold text-foreground md:text-sm">
          {title}
        </h3>
        <p className="text-[10px] text-muted-foreground md:text-xs">
          {[formatLabel(media.format), year].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  )
}
