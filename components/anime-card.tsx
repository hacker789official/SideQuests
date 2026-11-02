import Link from "next/link"
import Image from "next/image"
import { AniListMedia } from "@/anilist/models/media"
import { formatLabel, mediaYear, preferredTitle, scoreToTenPoint } from "@/anilist/utils"

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
    <Link href={`/${basePath}/${media.id}`} prefetch={false} className="group block">
      <div className="relative aspect-poster overflow-hidden rounded-md border cp-border-glow bg-muted transition-transform duration-300 group-hover:-translate-y-1">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 20vw, 15vw"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground text-xs">
            No Cover
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {score !== null && (
          <div className="absolute top-2 right-2 rounded-sm border border-primary/60 bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-primary cp-glow-cyan backdrop-blur-sm">
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
