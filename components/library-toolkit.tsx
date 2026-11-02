"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArchiveRestore,
  Check,
  ChevronDown,
  Download,
  Filter,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
} from "lucide-react"
import { getLocalWatchData, saveLocalWatchData } from "@/lib/local-watch-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type LibraryFilter = "all" | "movie" | "tv"
export type LibrarySort = "recent" | "added" | "title" | "rating"

interface LibraryItem {
  id: number
  title?: string | null
  name?: string | null
  media_type?: "movie" | "tv"
  mediaType?: "movie" | "tv"
  vote_average?: number
  addedAt?: number
}

interface LibraryToolkitProps {
  watchlist: LibraryItem[]
  history: LibraryItem[]
  onFilterChange: (filter: LibraryFilter, sort: LibrarySort, query: string) => void
  onRefresh: () => void
}

function labelFor(item: LibraryItem) {
  return item.title || item.name || "Untitled quest"
}

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function LibraryToolkit({ watchlist, history, onFilterChange, onRefresh }: LibraryToolkitProps) {
  const [filter, setFilter] = useState<LibraryFilter>("all")
  const [sort, setSort] = useState<LibrarySort>("recent")
  const [query, setQuery] = useState("")
  const [compact, setCompact] = useState(false)
  const [notice, setNotice] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allItems = useMemo(() => [...watchlist, ...history], [history, watchlist])
  const uniqueItems = useMemo(() => {
    const keys = new Set<string>()
    return allItems.filter((item) => {
      const type = item.media_type || item.mediaType || "movie"
      const key = `${type}:${item.id}`
      if (keys.has(key)) return false
      keys.add(key)
      return true
    })
  }, [allItems])
  const movieCount = uniqueItems.filter((item) => (item.media_type || item.mediaType) === "movie").length
  const tvCount = uniqueItems.filter((item) => (item.media_type || item.mediaType) === "tv").length
  const ratedCount = uniqueItems.filter((item) => Number(item.vote_average) > 0).length
  const lastActivity = Math.max(...uniqueItems.map((item) => item.addedAt || 0), 0)

  useEffect(() => {
    onFilterChange(filter, sort, query)
  }, [filter, onFilterChange, query, sort])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault()
        document.getElementById("library-search")?.focus()
      }
    }
    window.addEventListener("keydown", handleShortcut)
    const resetControls = () => {
      setFilter("all")
      setSort("recent")
      setQuery("")
    }
    const clearSearch = () => setQuery("")
    window.addEventListener("SIDEQUESTS_RESET_LIBRARY_CONTROLS", resetControls)
    window.addEventListener("SIDEQUESTS_CLEAR_LIBRARY_SEARCH", clearSearch)
    return () => {
      window.removeEventListener("keydown", handleShortcut)
      window.removeEventListener("SIDEQUESTS_RESET_LIBRARY_CONTROLS", resetControls)
      window.removeEventListener("SIDEQUESTS_CLEAR_LIBRARY_SEARCH", clearSearch)
    }
  }, [])

  const announce = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 3200)
  }

  const exportLibrary = () => {
    const data = getLocalWatchData()
    downloadJson(`sidequests-library-${new Date().toISOString().slice(0, 10)}.json`, {
      version: 1,
      exportedAt: new Date().toISOString(),
      watchlist: JSON.parse(data.watches || "[]"),
      history: JSON.parse(data.watchHistory || "[]"),
      watchProgress: data.watchProgress,
    })
    announce("Library backup downloaded.")
  }

  const importLibrary = async (file: File) => {
    try {
      const payload = JSON.parse(await file.text()) as { watchlist?: LibraryItem[]; history?: LibraryItem[]; watchProgress?: Record<string, string> }
      if (!Array.isArray(payload.watchlist) || !Array.isArray(payload.history)) throw new Error("Invalid backup")
      const current = getLocalWatchData()
      saveLocalWatchData({
        ...current,
        watches: JSON.stringify(payload.watchlist),
        watchHistory: JSON.stringify(payload.history),
        watchProgress: payload.watchProgress && typeof payload.watchProgress === "object" ? payload.watchProgress : current.watchProgress,
        updated_at: new Date().toISOString(),
      })
      window.dispatchEvent(new CustomEvent("WATCH_DATA_UPDATED", { detail: { localChange: true } }))
      onRefresh()
      announce("Library backup restored.")
    } catch {
      announce("That file is not a valid SideQuests backup.")
    }
  }

  const clearHistory = () => {
    if (!window.confirm("Remove all Continue Watching entries from this device?")) return
    const current = getLocalWatchData()
    saveLocalWatchData({ ...current, watchHistory: "[]", updated_at: new Date().toISOString() })
    window.dispatchEvent(new CustomEvent("WATCH_DATA_UPDATED", { detail: { localChange: true } }))
    onRefresh()
    announce("Continue Watching cleared.")
  }

  const dedupeWatchlist = () => {
    const current = getLocalWatchData()
    const items = JSON.parse(current.watches || "[]") as LibraryItem[]
    const keys = new Set<string>()
    const deduped = items.filter((item) => {
      const key = `${item.media_type || item.mediaType || "movie"}:${item.id}`
      if (keys.has(key)) return false
      keys.add(key)
      return true
    })
    saveLocalWatchData({ ...current, watches: JSON.stringify(deduped), updated_at: new Date().toISOString() })
    window.dispatchEvent(new CustomEvent("WATCH_DATA_UPDATED", { detail: { localChange: true } }))
    onRefresh()
    announce(`${items.length - deduped.length} duplicate entries removed.`)
  }

  const filterButton = (value: LibraryFilter, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(value)}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === value ? "bg-primary text-primary-foreground" : "bg-background/60 text-muted-foreground hover:bg-primary/10 hover:text-foreground"}`}
      aria-pressed={filter === value}
    >
      {label}
    </button>
  )

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/20 p-4 shadow-xl shadow-black/10 backdrop-blur-md" aria-labelledby="library-tools-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary"><SlidersHorizontal className="size-4" /><p className="text-[10px] font-black uppercase tracking-[0.22em]">Library controls</p></div>
          <h2 id="library-tools-title" className="mt-1 text-lg font-bold">Your quest dashboard</h2>
          <p className="text-xs text-muted-foreground">One place to search, sort, back up, and tidy your local library.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setCompact((value) => !value)}>{compact ? "Comfortable cards" : "Compact cards"}</Button>
          <Button type="button" size="sm" variant="outline" className="rounded-full text-xs" onClick={exportLibrary}><Download className="mr-1.5 size-3.5" />Export</Button>
          <Button type="button" size="sm" variant="outline" className="rounded-full text-xs" onClick={() => fileInputRef.current?.click()}><Upload className="mr-1.5 size-3.5" />Import</Button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importLibrary(file); event.currentTarget.value = "" }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-background/30 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Saved titles</p><p className="mt-1 text-xl font-black">{uniqueItems.length}</p></div>
        <div className="rounded-xl border border-border/50 bg-background/30 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Movies / TV</p><p className="mt-1 text-xl font-black">{movieCount} <span className="text-sm text-muted-foreground">/ {tvCount}</span></p></div>
        <div className="rounded-xl border border-border/50 bg-background/30 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rated titles</p><p className="mt-1 text-xl font-black">{ratedCount}</p></div>
        <div className="rounded-xl border border-border/50 bg-background/30 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last added</p><p className="mt-1 truncate text-sm font-bold">{lastActivity ? new Date(lastActivity).toLocaleDateString() : "—"}</p></div>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="library-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your library… (press /)" className="h-9 rounded-full pl-9 text-sm" /></div>
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/30 p-1">{filterButton("all", "All")}{filterButton("movie", "Movies")}{filterButton("tv", "TV")}</div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground"><span className="sr-only">Sort library</span><ChevronDown className="size-3.5" /><select value={sort} onChange={(event) => setSort(event.target.value as LibrarySort)} className="rounded-md border border-border/60 bg-background/60 px-2 py-1.5 text-xs text-foreground"><option value="recent">Recently watched</option><option value="added">Recently added</option><option value="title">Title A–Z</option><option value="rating">Top rated</option></select></label>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground"><Filter className="size-3.5" />Tools</span>
        <Button type="button" size="sm" variant="ghost" className="h-7 rounded-full px-2.5 text-xs" onClick={dedupeWatchlist}><ArchiveRestore className="mr-1 size-3.5" />Remove duplicates</Button>
        <Button type="button" size="sm" variant="ghost" className="h-7 rounded-full px-2.5 text-xs" onClick={clearHistory}><Trash2 className="mr-1 size-3.5" />Clear Continue Watching</Button>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-emerald-400"><ShieldCheck className="size-3.5" />Local-first · no downloads</span>
      </div>
      {notice ? <p role="status" className="flex items-center gap-2 text-xs font-semibold text-primary"><Check className="size-3.5" />{notice}</p> : null}
      <div className="sr-only" aria-live="polite">{compact ? "Compact card density enabled." : "Comfortable card density enabled."}</div>
    </section>
  )
}
