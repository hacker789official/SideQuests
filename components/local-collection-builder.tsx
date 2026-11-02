"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, FolderPlus, Share2, Trash2 } from "lucide-react"

type LibraryItem = {
  id: number
  title?: string | null
  name?: string | null
  media_type?: "movie" | "tv"
  poster_path?: string | null
  addedAt?: number
}

type SavedCollection = {
  id: string
  title: string
  items: LibraryItem[]
  createdAt: number
}

const STORAGE_KEY = "sidequests-local-collections"

function readCollections(): SavedCollection[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function LocalCollectionBuilder({ items }: { items: LibraryItem[] }) {
  const [collections, setCollections] = useState<SavedCollection[]>([])
  const [name, setName] = useState("")
  const [selected, setSelected] = useState<number[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => setCollections(readCollections()), [])

  const selectedItems = useMemo(() => items.filter((item) => selected.includes(item.id)), [items, selected])

  const createCollection = () => {
    const title = name.trim()
    if (!title || !selectedItems.length) return
    const next = [{ id: crypto.randomUUID(), title, items: selectedItems, createdAt: Date.now() }, ...collections]
    setCollections(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setName("")
    setSelected([])
  }

  const deleteCollection = (id: string) => {
    const next = collections.filter((collection) => collection.id !== id)
    setCollections(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const shareCollection = async (collection: SavedCollection) => {
    const data = encodeURIComponent(JSON.stringify({ title: collection.title, items: collection.items }))
    const url = `${window.location.origin}/collections/shared?data=${data}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(collection.id)
      window.setTimeout(() => setCopiedId(null), 1800)
    } catch {
      window.prompt("Copy your collection link", url)
    }
  }

  return (
    <section className="sidequests-panel space-y-4 rounded-2xl p-4 sm:p-5" aria-labelledby="local-collections-title">
      <div className="flex items-start gap-3"><FolderPlus className="mt-0.5 size-5 text-primary" /><div><h2 id="local-collections-title" className="font-black">My collections</h2><p className="mt-1 text-xs text-muted-foreground">Group watchlist titles into private local collections and share a link when you want.</p></div></div>
      {items.length ? <>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => <label key={`${item.media_type}_${item.id}`} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-xs"><input type="checkbox" checked={selected.includes(item.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /> <span className="truncate">{item.title || item.name || "Untitled"}</span></label>)}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Collection name" className="min-w-0 flex-1 rounded-full border border-border/60 bg-background/40 px-3 py-2 text-xs outline-none focus:border-primary" /><button type="button" onClick={createCollection} disabled={!name.trim() || !selected.length} className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">Create collection</button></div>
      </> : <p className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">Add titles to your watchlist to create a collection.</p>}
      {collections.length ? <div className="space-y-2 border-t border-border/50 pt-3">{collections.map((collection) => <div key={collection.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/30 px-3 py-2"><span className="min-w-0"><span className="block truncate text-sm font-semibold">{collection.title}</span><span className="text-xs text-muted-foreground">{collection.items.length} title{collection.items.length === 1 ? "" : "s"}</span></span><div className="flex shrink-0 gap-1"><button type="button" onClick={() => void shareCollection(collection)} aria-label={`Share ${collection.title}`} className="rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary">{copiedId === collection.id ? <Check className="size-4" /> : <Share2 className="size-4" />}</button><button type="button" onClick={() => deleteCollection(collection.id)} aria-label={`Delete ${collection.title}`} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button></div></div>)}</div> : null}
    </section>
  )
}
