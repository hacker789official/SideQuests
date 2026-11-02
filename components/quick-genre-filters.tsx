import Link from "next/link"

const filters = [
  { label: "Action", href: "/movie/discover?with_genres=28" },
  { label: "Comedy", href: "/movie/discover?with_genres=35" },
  { label: "Drama", href: "/tv/discover?with_genres=18" },
  { label: "Sci-Fi", href: "/movie/discover?with_genres=878" },
  { label: "Animation", href: "/cartoons" },
  { label: "Hindi cartoons", href: "/cartoons?lang=hi" },
  { label: "English cartoons", href: "/cartoons?lang=en" },
]

export function QuickGenreFilters() {
  return (
    <section className="streamhub-rail px-4 sm:px-6 lg:px-10" aria-labelledby="quick-filters-title">
      <div className="sidequests-section-heading px-1">
        <div>
          <p>Jump straight into a mood</p>
          <h2 id="quick-filters-title">Browse by genre</h2>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {filters.map((filter) => (
          <Link key={filter.href} href={filter.href} prefetch={false} className="shrink-0 rounded-full border border-cyan-300/15 bg-[#0b2038]/80 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 hover:text-cyan-100">
            {filter.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
