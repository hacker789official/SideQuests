import Link from "next/link"

import { tmdb } from "@/tmdb/api"

export const revalidate = 604800

const CURATED_COLLECTIONS = [
  { id: 10, label: "Galaxy essentials", description: "A fast route into iconic space opera." },
  { id: 119, label: "Middle-earth journey", description: "Epic fantasy from the Shire to Mordor." },
  { id: 263, label: "Way of the wizard", description: "A magical school story in one collection." },
  { id: 529892, label: "Mission protocol", description: "High-stakes spy action for a weekend binge." },
]

export const metadata = {
  title: "Curated Collections",
  description: "Hand-picked movie collections for your next SideQuest.",
}

export default async function CollectionsPage() {
  const collections = await Promise.all(
    CURATED_COLLECTIONS.map(async (entry) => {
      try {
        const collection = await tmdb.collection.details({ id: String(entry.id) })
        return { ...entry, collection }
      } catch {
        return null
      }
    })
  )

  return (
    <div className="container space-y-8 py-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Staff picks</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Curated collections</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Start with a complete story arc instead of hunting title by title.</p>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        {collections.filter(Boolean).map((entry) => {
          if (!entry) return null
          return (
            <section key={entry.id} className="sidequests-panel overflow-hidden rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">{entry.label}</p>
              <h2 className="mt-1 text-xl font-black">{entry.collection.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.collection.parts.slice(0, 8).map((part) => <Link key={part.id} href={`/movie/${part.id}`} className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-semibold transition hover:border-primary/60 hover:text-primary">{part.title}</Link>)}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
