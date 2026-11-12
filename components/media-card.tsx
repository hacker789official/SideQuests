import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const Root: React.FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "group relative aspect-poster overflow-hidden rounded-xl border border-cyan-100/10 bg-slate-900/70 shadow-lg shadow-black/25 transition duration-200 focus-within:border-cyan-200/70 focus-within:ring-2 focus-within:ring-cyan-300/40 focus-within:ring-offset-2 focus-within:ring-offset-background hover:-translate-y-1 hover:scale-[1.015] hover:border-cyan-200/55 hover:shadow-2xl hover:shadow-cyan-950/60",
        className
      )}
      {...props}
    />
  )
}

const Content: React.FC<ComponentProps<"div">> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "overlay group-hover:opacity-100 group-focus-within:opacity-100 rounded-xl border border-cyan-200/20 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent opacity-0 transition duration-200",
        className
      )}
      {...props}
    >
      <div className="p-3 md:p-4">{children}</div>
    </div>
  )
}

const Title: React.FC<ComponentProps<"h2">> = ({ className, ...props }) => {
  return (
    <h2
      className={cn(
        "line-clamp-1 text-sm font-semibold tracking-tight text-white md:text-base",
        className
      )}
      {...props}
    />
  )
}

const Excerpt: React.FC<ComponentProps<"p">> = ({ className, ...props }) => {
  return (
    <p
      className={cn("line-clamp-3 text-xs text-zinc-300 md:text-sm", className)}
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
