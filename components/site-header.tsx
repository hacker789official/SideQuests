"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchInput } from "@/components/search-input"
import { SiteMenu } from "@/components/site-menu"
import { SiteNav } from "@/components/site-nav"
import { SiteSettings } from "@/components/site-settings"
import SyncDialog from "@/components/sync-dialog"

export const SiteHeader = () => {
  const pathname = usePathname()
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (pathname?.startsWith("/app")) {
    return null
  }

  const isFloatingHeaderPage =
    pathname === "/" || /^\/(movie|tv|person)\/\d+/.test(pathname || "")

  return (
    <header
      className={cn(
        "sq-site-header fixed inset-x-0 top-0 z-40 w-full transition-all duration-300",
        isFloatingHeaderPage
          ? "fixed border-b-0"
          : "border-b border-white/[0.08] bg-zinc-950/95 backdrop-blur-xl",
        isFloatingHeaderPage && isScrolled
          ? "border-b border-cyan-300/15 bg-zinc-950/90 shadow-[0_12px_40px_rgba(0,0,0,0.30)] backdrop-blur-xl"
          : isFloatingHeaderPage
          ? "border-transparent bg-gradient-to-b from-zinc-950/95 via-zinc-950/55 to-transparent"
          : ""
      )}
    >
      <div className="sq-site-header__inner container flex h-14 items-center gap-2 px-3 sm:h-16 sm:justify-between sm:gap-3 sm:px-4 lg:h-[4.5rem] lg:px-0">
        <Link
          href="/"
          aria-label="SideQuests home"
          className="sq-site-header__brand group flex shrink-0 items-center gap-2 text-sm font-black tracking-tight text-white"
        >
          <span className="group-hover:bg-cyan-300/20 flex size-8 items-center justify-center rounded-xl border border-cyan-200/35 bg-cyan-300/10 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.22)] transition sm:size-9">
            <Zap className="size-4 fill-current sm:size-[18px]" />
          </span>
          <span className="hidden sm:inline">
            Side<span className="text-cyan-300">Quests</span>
          </span>
        </Link>
        <SiteNav />

        <div className="flex min-w-0 flex-1 justify-end gap-1.5 sm:gap-2">
          <Suspense
            fallback={<Skeleton className="h-10 w-[min(14rem,50vw)] sm:w-60" />}
          >
            <SearchInput className="w-[min(10rem,40vw)] sm:w-56 lg:w-64" />
          </Suspense>

          <SiteSettings />

          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-full border border-cyan-300/15 bg-white/[0.04] text-zinc-300 shadow-sm backdrop-blur-md transition-all hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100 active:scale-95"
            onClick={() => setShowSyncDialog(true)}
            title="Sync Account"
          >
            <User className="size-4" />
            <span className="sr-only">Sync Account</span>
          </Button>

          <div className="lg:hidden">
            <SiteMenu />
          </div>
        </div>
      </div>

      <SyncDialog open={showSyncDialog} onOpenChange={setShowSyncDialog} />
    </header>
  )
}
