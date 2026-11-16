"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bookmark, Cloud, Loader2, Play, Sparkles } from "lucide-react"

import { getLocalWatchData } from "@/lib/local-watch-data"
import { getSyncCredentials } from "@/lib/sync-config"
import { getWatchData } from "@/lib/watch-data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HistoryCardWrapper } from "@/components/history-card-wrapper"
import SyncDialog from "@/components/sync-dialog"
import { WatchlistCardWrapper } from "@/components/watchlist-card-wrapper"

interface LibraryItem {
  id: number
  title?: string | null
  name?: string | null
  media_type?: "movie" | "tv"
  mediaType?: "movie" | "tv"
  addedAt?: number
  lastWatched?: number
  last_watched?: number
  watchedAt?: number
  watched_at?: number
  [key: string]: unknown
}

const WATCH_DATA_UPDATED = "WATCH_DATA_UPDATED"
const itemType = (item: LibraryItem) =>
  item.media_type || item.mediaType || "movie"
const itemTitle = (item: LibraryItem) => item.title || item.name || "Untitled"
const lastActivity = (item: LibraryItem) =>
  item.lastWatched ||
  item.last_watched ||
  item.watchedAt ||
  item.watched_at ||
  0

export default function LibraryPage() {
  const [watchlist, setWatchlist] = useState<LibraryItem[]>([])
  const [history, setHistory] = useState<LibraryItem[]>([])
  const [syncEmail, setSyncEmail] = useState<string | null>(null)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const credentials = getSyncCredentials()
      setSyncEmail(credentials?.email || null)
      const watchData = await getWatchData()
      const localData = getLocalWatchData()
      const saved = watchData?.watches
        ? JSON.parse(watchData.watches)
        : JSON.parse(localData.watches || "[]")
      const recent = localData.watchHistory
        ? JSON.parse(localData.watchHistory)
        : []
      setWatchlist(
        Array.isArray(saved)
          ? [...saved].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
          : []
      )
      setHistory(
        Array.isArray(recent)
          ? [...recent].sort((a, b) => lastActivity(b) - lastActivity(a))
          : []
      )
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

  if (loading)
    return (
      <div className="library-loading">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Opening your library</span>
      </div>
    )

  return (
    <main className="sq-library">
      <header className="sq-library__head">
        <div>
          <p className="sq-library__eyebrow">
            <Sparkles className="size-3.5" /> YOUR SIDEQUESTS
          </p>
          <h1>
            Pick up <em>where you left off.</em>
          </h1>
          <p className="sq-library__sub">
            Your saved titles and recent watches. Nothing else in the way.
          </p>
        </div>
        <button
          type="button"
          className="sq-library__sync"
          onClick={() => setShowSyncDialog(true)}
        >
          <span
            className={
              syncEmail
                ? "sq-library__sync-dot is-connected"
                : "sq-library__sync-dot"
            }
          />
          <span>
            <b>{syncEmail ? "Synced" : "Sync across devices"}</b>
            <small>{syncEmail || "This device only"}</small>
          </span>
          <Cloud className="size-4" />
        </button>
      </header>

      <Tabs defaultValue="continue" className="sq-library__tabs">
        <TabsList className="sq-library__tablist">
          <TabsTrigger value="continue" className="sq-library__tab">
            <Play className="size-4" /> CONTINUE <span>{history.length}</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="sq-library__tab">
            <Bookmark className="size-4" /> MY LIST{" "}
            <span>{watchlist.length}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="continue" className="sq-library__content">
          {history.length ? (
            <div className="sq-library__grid">
              {history.map((item) => (
                <HistoryCardWrapper
                  key={`${itemType(item)}_${item.id}`}
                  item={item as any}
                />
              ))}
            </div>
          ) : (
            <EmptyLibrary kind="continue" />
          )}
        </TabsContent>
        <TabsContent value="list" className="sq-library__content">
          {watchlist.length ? (
            <div className="sq-library__grid">
              {watchlist.map((item) => (
                <WatchlistCardWrapper
                  key={`${itemType(item)}_${item.id}`}
                  item={item as any}
                  onRemoveSuccess={() => void loadData()}
                />
              ))}
            </div>
          ) : (
            <EmptyLibrary kind="list" />
          )}
        </TabsContent>
      </Tabs>
      <SyncDialog open={showSyncDialog} onOpenChange={setShowSyncDialog} />
    </main>
  )
}

function EmptyLibrary({ kind }: { kind: "continue" | "list" }) {
  const isList = kind === "list"
  return (
    <div className="sq-library__empty">
      <span className="sq-library__empty-mark">
        {isList ? <Bookmark className="size-6" /> : <Play className="size-6" />}
      </span>
      <h2>
        {isList ? "Your list starts here." : "Your next watch is waiting."}
      </h2>
      <p>
        {isList
          ? "Save a movie or series and it will be waiting right here."
          : "Start a title and your recent watches will show up here."}
      </p>
      <Button asChild className="sq-library__browse">
        <Link href="/">FIND SOMETHING TO WATCH</Link>
      </Button>
    </div>
  )
}
