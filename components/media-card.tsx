import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const Root: React.FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return <div className={cn("group relative aspect-poster overflow-hidden rounded-md bg-zinc-900/60 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-2xl hover:shadow-cyan-950/50", className)} {...props} />
}

const Content: React.FC<ComponentProps<"div">> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("overlay rounded-md border border-cyan-200/15 bg-gradient-to-t from-black via-black/25 to-transparent opacity-0 transition duration-300 group-hover:opacity-100", className)} {...props}>
      <div className="p-3 md:p-4">{children}</div>
    </div>
  )
}

const Title: React.FC<ComponentProps<"h2">> = ({ className, ...props }) => {
  return (
    <h2
      className={cn("line-clamp-1 text-sm font-semibold tracking-tight text-white md:text-base", className)}
      {...props}
    />
  )
}

const Excerpt: React.FC<ComponentProps<"p">> = ({ className, ...props }) => {
  return (
    <p
      className={cn(
        "line-clamp-3 text-xs text-zinc-300 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export const MediaCard = {
  Root,
  Content,
  Title,
  Excerpt,
}
