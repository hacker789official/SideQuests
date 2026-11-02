"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Film, Home, Library, Tv } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movie/popular", label: "Movies", icon: Film },
  { href: "/tv/popular", label: "TV", icon: Tv },
  { href: "/anime", label: "Anime", icon: Compass },
  { href: "/library", label: "Library", icon: Library },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 lg:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 rounded-2xl border border-cyan-300/15 bg-[#07111b]/95 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold tracking-wide transition-colors active:scale-95",
                active
                  ? "bg-cyan-300/15 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                  : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
              )}
            >
              <Icon className={cn("size-5", active && "text-cyan-300")} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
