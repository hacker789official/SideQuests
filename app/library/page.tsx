"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Bookmark, CloudLightning, Loader2, PlayCircle } from "lucide-react"
import { getSyncCredentials } from "@/lib/sync-config"
import { getLocalWatchData } from "@/lib/local-watch-data"
import { getWatchData } from "@/lib/watch-data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SyncDialog from "@/components/sync-dialog"
import { HistoryCardWrapper } from "@/components/history-card-wrapper"
import { WatchlistCardWrapper } from "@/components/watchlist-card-wrapper"
import { LocalCollectionBuilder } from "@/components/local-collection-builder"
import { ReleaseAlerts } from "@/components/release-alerts"
import { LibraryToolkit, type LibraryFilter, type LibrarySort } from "@/components/library-toolkit"
import { QuestUtilities } from "@/components/quest-utilities"

interface LibraryItem {
  id: number
  title?: string | null
  name?: string | null
  media_type?: "movie" | "tv"
  mediaType?: "movie" | "tv"
  vote_average?: number
  addedAt?: number
  lastWatched?: number
  last_watched?: number
  watchedAt?: number
  watched_at?: number
  [key: string]: unknown
}

const WATCH_DATA_UPDATED = "WATCH_DATA_UPDATED"
const titleFor = (item: LibraryItem) => item.title || item.name || "Untitled quest"
const typeFor = (item: LibraryItem) => item.media_type || item.mediaType || "movie"
const activityFor = (item: LibraryItem) => item.lastWatched || item.last_watched || item.watchedAt || item.watched_at || 0

export default function LibraryPage() {
  const [watchlist, setWatchlist] = useState<LibraryItem[]>([])
  const [history, setHistory] = useState<LibraryItem[]>([])
  const [syncEmail, setSyncEmail] = useState<string | null>(null)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<LibraryFilter>("all")
  const [sort, setSort] = useState<LibrarySort>("recent")
  const [query, setQuery] = useState("")

  const loadData = useCallback(async () => {
    try {
      const credentials = getSyncCredentials()
      setSyncEmail(credentials?.email || null)
      const watchData = await getWatchData()
      const localWatchData = getLocalWatchData()
      const parsedWatchlist = (watchData?.watches ? JSON.parse(watchData.watches) : JSON.parse(localWatchData.watches || "[]")) as LibraryItem[]
      const parsedHistory = (localWatchData.watchHistory ? JSON.parse(localWatchData.watchHistory) : []) as LibraryItem[]
      parsedWatchlist.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
      parsedHistory.sort((a, b) => activityFor(b) - activityFor(a))
      setWatchlist(Array.isArray(parsedWatchlist) ? parsedWatchlist : [])
      setHistory(Array.isArray(parsedHistory) ? parsedHistory : [])
    } catch (error) {
      console.error("Error loading library data:", error)
      setWatchlist([])
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
    window.addEventListener(WATCH_DATA_UPDATED, loadData)
    return () => window.removeEventListener(WATCH_DATA_UPDATED, loadData)
  }, [loadData])

  const onFilterChange = useCallback((nextFilter: LibraryFilter, nextSort: LibrarySort, nextQuery: string) => {
    setFilter(nextFilter)
    setSort(nextSort)
    setQuery(nextQuery)
  }, [])

  const filterItems = useCallback((items: LibraryItem[]) => {
    const normalizedQuery = query.trim().toLowerCase()
    const visible = items.filter((item) => {
      const type = typeFor(item)
      return (filter === "all" || type === filter) && (!normalizedQuery || titleFor(item).toLowerCase().includes(normalizedQuery))
    })
    return [...visible].sort((a, b) => {
      if (sort === "title") return titleFor(a).localeCompare(titleFor(b))
      if (sort === "rating") return (Number(b.vote_average) || 0) - (Number(a.vote_average) || 0)
      if (sort === "added") return (b.addedAt || 0) - (a.addedAt || 0)
      return activityFor(b) - activityFor(a)
    })
  }, [filter, query, sort])

  const visibleWatchlist = useMemo(() => filterItems(watchlist), [filterItems, watchlist])
  const visibleHistory = useMemo(() => filterItems(history), [filterItems, history])
  const resetLibraryControls = () => window.dispatchEvent(new CustomEvent("SIDEQUESTS_RESET_LIBRARY_CONTROLS"))
  const clearLibrarySearch = () => window.dispatchEvent(new CustomEvent("SIDEQUESTS_CLEAR_LIBRARY_SEARCH"))

  if (loading) {
    return <div className="container flex min-h-[50vh] flex-col items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /><p className="mt-4 text-sm text-muted-foreground">Loading your library...</p></div>
  }

  const EmptyState = ({ type }: { type: "watchlist" | "history" }) => (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/10 px-6 py-20 text-center backdrop-blur-sm">
      <div className="mb-4 rounded-full bg-muted/40 p-4 text-muted-foreground">{type === "watchlist" ? <Bookmark className="size-10" /> : <PlayCircle className="size-10" />}</div>
      <h3 className="mb-1 text-lg font-medium">{type === "watchlist" ? "Your Watchlist is empty" : "Nothing to continue yet"}</h3>
      <p className="mb-6 max-w-sm text-sm font-normal text-muted-foreground">{type === "watchlist" ? "Explore movies and TV shows and add them to your watchlist to keep track of them here." : "Start watching movies and TV shows on SideQuests to build your local Continue Watching queue."}</p>
      <Button asChild className="rounded-full font-medium"><Link href="/">Browse Home</Link></Button>
    </div>
  )

  return (
    <div className="container space-y-8 py-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div><h1 className="mb-2 text-3xl font-medium tracking-tight">My Library</h1><p className="max-w-xl text-sm font-normal text-muted-foreground">Manage your watchlist and return to the stories you have explored on SideQuests.</p></div>
        <div className="flex w-full max-w-md items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/30 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3"><div className={`rounded-full p-2 ${syncEmail ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}><CloudLightning className="size-5 animate-pulse" /></div><div><div className="text-sm font-medium">{syncEmail ? "Synced Account" : "Sync Disabled"}</div><div className="line-clamp-1 max-w-[200px] text-xs font-normal text-muted-foreground">{syncEmail || "Save and access your library anywhere."}</div></div></div>
          <Button variant={syncEmail ? "outline" : "default"} size="sm" onClick={() => setShowSyncDialog(true)} className="rounded-full px-4 text-xs font-semibold">{syncEmail ? "Manage Sync" : "Sync Now"}</Button>
        </div>
      </div>
      <LibraryToolkit watchlist={watchlist} history={history} onFilterChange={onFilterChange} onRefresh={() => void loadData()} />
      <QuestUtilities totalItems={new Set([...watchlist, ...history].map((item) => `${typeFor(item)}:${item.id}`)).size} filter={filter} sort={sort} query={query} onResetControls={resetLibraryControls} onClearSearch={clearLibrarySearch} />
      <LocalCollectionBuilder items={watchlist} />
      <ReleaseAlerts />
      <Tabs defaultValue="watchlist" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-[400px] grid-cols-2"><TabsTrigger value="watchlist" className="flex items-center gap-2"><Bookmark className="size-4" />Watchlist ({visibleWatchlist.length})</TabsTrigger><TabsTrigger value="history" className="flex items-center gap-2"><PlayCircle className="size-4" />Continue Watching ({visibleHistory.length})</TabsTrigger></TabsList>
        <TabsContent value="watchlist" className="outline-none">{visibleWatchlist.length === 0 ? <EmptyState type="watchlist" /> : <div className="grid-list">{visibleWatchlist.map((item) => <WatchlistCardWrapper key={`${typeFor(item)}_${item.id}`} item={item as any} onRemoveSuccess={() => void loadData()} />)}</div>}</TabsContent>
        <TabsContent value="history" className="outline-none">{visibleHistory.length === 0 ? <EmptyState type="history" /> : <div className="grid-list">{visibleHistory.map((item) => <HistoryCardWrapper key={`${typeFor(item)}_${item.id}`} item={item as any} />)}</div>}</TabsContent>
      </Tabs>
      <SyncDialog open={showSyncDialog} onOpenChange={setShowSyncDialog} />
    </div>
  )
}
