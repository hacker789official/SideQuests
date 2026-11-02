import Link from "next/link"

const MOODS = [
  { label: "Laugh", genre: 35, description: "Light comedies" },
  { label: "Adrenaline", genre: 28, description: "Action picks" },
  { label: "Chill", genre: 10751, description: "Comfort viewing" },
  { label: "Think", genre: 878, description: "Science fiction" },
  { label: "Feel", genre: 10749, description: "Romance" },
  { label: "Brave", genre: 27, description: "Horror" },
]

export function MoodDiscoveryChips() {
  return (
    <section aria-labelledby="mood-discovery-title" className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Choose a mood</p>
        <h2 id="mood-discovery-title" className="mt-1 text-lg font-black tracking-tight">Find your next SideQuest</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <Link key={mood.label} href={`/movie/discover?with_genres=${mood.genre}`} className="rounded-full border border-border/70 bg-background/40 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/60 hover:bg-primary/10 hover:text-primary" title={mood.description}>
            {mood.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
