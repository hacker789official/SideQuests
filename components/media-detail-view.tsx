import { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { Badge, BadgeProps } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const Root: React.FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return <div className={cn("relative overflow-hidden animate-fade-in-quick pb-24 bg-background -mt-4", className)} {...props} />
}

const Backdrop: React.FC<ComponentProps<"div">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "w-screen absolute left-1/2 -translate-x-1/2 top-0 h-[45vh] md:h-[55vh] lg:h-[65vh] xl:h-[70vh] pointer-events-none overflow-hidden animate-backdrop-reveal select-none z-0",
        className
      )}
      {...props}
    >
      {children}
      
      <div className="absolute inset-0 bg-vignette-bottom z-10" />
      
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent z-10 hidden md:block" />
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
        "container relative z-10 pt-[28vh] md:pt-[38vh] lg:pt-[48vh] px-6 md:px-12 xl:px-24",
        className
      )}
      {...props}
    >
      <div className="grid gap-6 md:grid-cols-[auto,1fr] md:gap-10 lg:gap-14 items-center md:items-end">
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
        "relative aspect-poster w-44 md:w-52 lg:w-60 xl:w-72 place-self-center md:place-self-end animate-scale-up-fade-in shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm",
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
        "container mt-10 md:mt-14 px-6 md:px-12 xl:px-24 animate-slide-up-fade-in animation-delay-300",
        className
      )}
      {...props}
    />
  )
}

const Genres: React.FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return <div className={cn("flex flex-wrap gap-2 animate-slide-up-fade-in animation-delay-100 justify-center md:justify-start", className)} {...props} />
}

const Genre: React.FC<BadgeProps> = ({ variant = "secondary", className, ...props }) => {
  return (
    <Badge
      variant={variant}
      className={cn(
        "bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 px-3 py-1 text-xs rounded-full font-semibold transition-all duration-300 select-none",
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
        "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md text-center md:text-left animate-slide-right-fade-in leading-none",
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
        "space-y-4 text-zinc-350 xl:text-lg animate-slide-up-fade-in animation-delay-100 max-w-3xl text-center md:text-left font-medium leading-relaxed",
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
