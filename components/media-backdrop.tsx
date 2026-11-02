import { ComponentProps } from "react"
import Image from "next/image"
import { BackdropSize, tmdbImage } from "@/tmdb/utils"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface MediaBackdropProps extends ComponentProps<"div"> {
  image?: string
  size?: BackdropSize
  alt: string
  priority?: boolean
}

export const MediaBackdrop: React.FC<MediaBackdropProps> = ({
  image,
  size = "w780", 
  alt,
  className,
  priority,
  ...props
}) => {
  const src = image ? tmdbImage.backdrop(image, size) : null

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
        "size-full bg-zinc-950 object-cover object-top",
        className
      )}
      src={src}
      alt={alt}
      priority={priority}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1080px"
      quality={75}
    />
  )
}
