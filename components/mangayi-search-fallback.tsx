"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Loader2 } from "lucide-react"

import type { MangaYiRelease, MangaYiResponse } from "@/lib/mangayi-api"

export function MangaYiSearchFallback({ query }: { query: string }) {
  const [results, setResults] = useState<MangaYiRelease[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(`/api/mangayi?query=${encodeURIComponent(query)}`, { cache: "no-store" })
        if (!response.ok) return
        const payload = (await response.json()) as MangaYiResponse
        if (!cancelled) setResults(payload.results.slice(0, 12))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [query])

  if (loading) return <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Checking MangaYi metadata…</div>
  if (!results.length) return null

  return (
    <section className="mt-8 space-y-3 text-left" aria-labelledby="mangayi-fallback-title">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Manga fallback</p><h2 id="mangayi-fallback-title" className="mt-1 text-xl font-black">MangaYi matches</h2></div>
      <div className="grid gap-2 sm:grid-cols-2">
        {results.map((result) => <Link key={`${result.id}-${result.chapter}`} href={result.readerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 p-3 transition hover:border-primary/60 hover:bg-primary/5"><span className="min-w-0"><span className="block truncate text-sm font-semibold">{result.title}</span><span className="text-xs text-muted-foreground">Chapter {result.chapter} · MangaYi</span></span><ExternalLink className="size-4 shrink-0 text-primary" /></Link>)}
      </div>
    </section>
  )
}
