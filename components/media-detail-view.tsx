import { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { Badge, BadgeProps } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const Root: React.FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "sidequests-detail-page animate-fade-in-quick relative -mt-4 overflow-hidden bg-background pb-24",
        className
      )}
      {...props}
    />
  )
}

const Backdrop: React.FC<ComponentProps<"div">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-backdrop-reveal pointer-events-none absolute left-1/2 top-0 z-0 h-[45vh] w-screen -translate-x-1/2 select-none overflow-hidden md:h-[55vh] lg:h-[65vh] xl:h-[70vh]",
        className
      )}
      {...props}
    >
      {children}

      <div className="bg-vignette-bottom absolute inset-0 z-10" />

      <div className="absolute inset-0 z-10 hidden bg-gradient-to-r from-background/90 via-background/20 to-transparent md:block" />
    </div>
  )
}

const Hero: React.FC<ComponentProps<"div">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "container relative z-10 px-6 pt-[28vh] md:px-12 md:pt-[38vh] lg:pt-[48vh] xl:px-24",
        className
      )}
      {...props}
    >
      <div className="grid items-center gap-6 md:grid-cols-[auto,1fr] md:items-end md:gap-10 lg:gap-14">
        {children}
      </div>
    </div>
  )
}

const Poster: React.FC<ComponentProps<"div">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-scale-up-fade-in relative aspect-poster w-44 place-self-center overflow-hidden rounded-xl border border-cyan-200/20 bg-zinc-900/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_30px_hsl(var(--primary)/0.12)] backdrop-blur-sm md:w-52 md:place-self-end lg:w-60 xl:w-72",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const Content: React.FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-slide-up-fade-in animation-delay-300 container mt-10 px-6 md:mt-14 md:px-12 xl:px-24",
        className
      )}
      {...props}
    />
  )
}

const Genres: React.FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-slide-up-fade-in animation-delay-100 flex flex-wrap justify-center gap-2 md:justify-start",
        className
      )}
      {...props}
    />
  )
}

const Genre: React.FC<BadgeProps> = ({
  variant = "secondary",
  className,
  ...props
}) => {
  return (
    <Badge
      variant={variant}
      className={cn(
        "select-none rounded-full border border-cyan-200/15 bg-cyan-300/[0.07] px-3 py-1 text-xs font-semibold text-zinc-200 transition-all duration-200 hover:border-cyan-200/40 hover:bg-cyan-300/15",
        className
      )}
      {...props}
    />
  )
}

const Title: React.FC<ComponentProps<"h1">> = ({ className, ...props }) => {
  return (
    <h1
      className={cn(
        "animate-slide-right-fade-in text-center text-3xl font-black leading-none tracking-tight text-white drop-shadow-md sm:text-4xl md:text-left md:text-5xl lg:text-6xl",
        className
      )}
      {...props}
    />
  )
}

const Overview: React.FC<ComponentProps<"p">> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-slide-up-fade-in animation-delay-100 max-w-3xl space-y-4 text-center font-medium leading-relaxed text-zinc-300 md:text-left xl:text-lg",
        className
      )}
      {...props}
    />
  )
}

export const SkeletonMediaDetail = () => (
  <MediaDetailView.Root>
    <MediaDetailView.Backdrop>
      <Skeleton className="size-full rounded-md" />
    </MediaDetailView.Backdrop>

    <MediaDetailView.Hero>
      <MediaDetailView.Poster>
        <Skeleton className="size-full rounded-md" />
      </MediaDetailView.Poster>

      <div className="space-y-4">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-4 w-60 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
      </div>
    </MediaDetailView.Hero>

    <MediaDetailView.Content>
      <Skeleton className="mt-4 h-[30vh] w-full rounded-md" />
    </MediaDetailView.Content>
  </MediaDetailView.Root>
)

export const MediaDetailView = {
  Root,
  Backdrop,
  Hero,
  Content,
  Poster,
  Genres,
  Genre,
  Title,
  Overview,
}
