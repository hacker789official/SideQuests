import Link from "next/link"

interface SharedCollectionProps {
  searchParams: Promise<{ data?: string }>
}

type SharedItem = {
  id: number
  title?: string
  name?: string
  media_type?: "movie" | "tv"
}

function decodeCollection(value?: string) {
  if (!value) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as { title?: unknown; items?: unknown }
    if (typeof parsed.title !== "string" || !Array.isArray(parsed.items)) return null
    const items = parsed.items.filter((item): item is SharedItem => {
      if (!item || typeof item !== "object") return false
      const candidate = item as SharedItem
      return Number.isFinite(candidate.id) && (candidate.media_type === "movie" || candidate.media_type === "tv")
    }).slice(0, 50)
    return { title: parsed.title.slice(0, 100), items }
  } catch {
    return null
  }
}

export const metadata = {
  title: "Shared Collection",
}

export default async function SharedCollectionPage({ searchParams }: SharedCollectionProps) {
  const collection = decodeCollection((await searchParams).data)

  if (!collection) {
    return <div className="container py-16 text-center"><h1 className="text-2xl font-black">This collection link is invalid</h1><p className="mt-2 text-sm text-muted-foreground">Ask the sender to create a fresh share link.</p><Link href="/library" className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Open My Library</Link></div>
  }

  return (
    <div className="container space-y-8 py-8">
      <header><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Shared SideQuest</p><h1 className="mt-1 text-3xl font-black tracking-tight">{collection.title}</h1><p className="mt-2 text-sm text-muted-foreground">{collection.items.length} title{collection.items.length === 1 ? "" : "s"} shared from a local collection.</p></header>
      {collection.items.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{collection.items.map((item) => <Link key={`${item.media_type}_${item.id}`} href={`/${item.media_type}/${item.id}`} className="sidequests-panel rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-primary/60"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{item.media_type === "tv" ? "Series" : "Film"}</p><h2 className="mt-1 font-bold">{item.title || item.name || "Untitled"}</h2></Link>)}</div> : <p className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">This collection has no items.</p>}
    </div>
  )
}
