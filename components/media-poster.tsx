import { ComponentProps } from "react"
import Image from "next/image"
import { PosterSize, tmdbImage } from "@/tmdb/utils"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface MediaPosterProps extends ComponentProps<"div"> {
  image?: string
  size?: PosterSize
  alt: string
  priority?: boolean
}

export const MediaPoster: React.FC<MediaPosterProps> = ({
  image,
  size = "w342", 
  alt,
  className,
  priority,
  ...props
}) => {
  const src = image ? tmdbImage.poster(image, size) : null

  if (!src) {
    return (
      <div
        className={cn(
          "size-full rounded-md border bg-muted text-muted-foreground",
          className
        )}
        {...props}
      >
        <div className="grid size-full place-items-center">
          <Icons.Logo className="size-12" />
        </div>
      </div>
    )
  }

  return (
    <Image
      className={cn(
        "size-full rounded-md border bg-muted object-cover",
        className
      )}
      src={src}
      alt={alt}
      priority={priority}
      fill
      sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 20vw, 15vw"
      quality={75}
    />
  )
}
