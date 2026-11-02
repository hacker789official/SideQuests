"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Loader2, RefreshCw, Search } from "lucide-react"

import type { MangaYiResponse, MangaYiRelease } from "@/lib/mangayi-api"

export function MangaYiReleaseRail() {
  const [items, setItems] = useState<MangaYiRelease[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async (search = query) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: "1" })
      if (search.trim()) params.set("query", search.trim())
      const response = await fetch(`/api/mangayi?${params.toString()}`, { cache: "no-store" })
      const payload = (await response.json()) as MangaYiResponse | { error?: string }
      if (!response.ok || !("results" in payload)) {
        throw new Error("error" in payload ? payload.error || "MangaYi is unavailable." : "MangaYi is unavailable.")
      }
      setItems(payload.results.slice(0, 12))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load MangaYi releases.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load("")
    // Load the initial latest-release rail once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="sidequests-panel rounded-2xl p-4 sm:p-6" aria-labelledby="mangayi-releases-title">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">Source spotlight</p>
          <h2 id="mangayi-releases-title" className="mt-1 text-xl font-black tracking-tight">MangaYi latest releases</h2>
          <p className="mt-1 text-xs text-muted-foreground">Public metadata from MangaYi. Reading opens on the original source.</p>
          <form onSubmit={(event) => { event.preventDefault(); void load() }} className="mt-3 flex max-w-xl gap-2">
            <label className="sr-only" htmlFor="mangayi-search">Search MangaYi titles</label>
            <input id="mangayi-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search MangaYi titles" className="min-w-0 flex-1 rounded-full border border-border/60 bg-background/50 px-3 py-2 text-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-primary" />
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"><Search className="size-3.5" />Search</button>
          </form>
        </div>
        <button type="button" onClick={() => void load()} className="rounded-full border border-border/60 p-2 text-muted-foreground transition hover:border-primary/60 hover:text-primary" aria-label="Refresh MangaYi releases">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-24 items-center justify-center text-primary"><Loader2 className="size-5 animate-spin" /></div>
      ) : error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link key={`${item.id}-${item.chapter}`} href={item.readerUrl} target="_blank" rel="noopener noreferrer" className="group flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/40 px-3 py-2 transition hover:border-primary/60 hover:bg-primary/5">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold group-hover:text-primary">{item.title}</span>
                <span className="text-xs text-muted-foreground">Chapter {item.chapter}</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
