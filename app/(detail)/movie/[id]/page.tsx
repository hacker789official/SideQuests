import Link from "next/link"
import { tmdb } from "@/tmdb/api"
import { format } from "@/tmdb/utils"

import { formatValue, joiner } from "@/lib/utils"
import { MovieCollection } from "@/components/movie-collection"
import { WatchHistoryTracker } from "@/components/watch-history-tracker"

export const revalidate = 604800

interface DetailProps {
  params: Promise<{
    id: string
  }>
}

export default async function Detail({ params }: DetailProps) {
  const { id } = await params
  const movie = await tmdb.movie.detail({
    id,
  })

  const {
    status,
    release_date,
    runtime,
    budget,
    revenue,
    spoken_languages,
    production_companies,
    belongs_to_collection,
    original_title,
  } = movie

  const overview = [
    {
      title: "Release Date",
      value: formatValue(release_date, format.date),
    },
    {
      title: "Status",
      value: formatValue(status),
    },
    {
      title: "Original Title",
      value: formatValue(original_title),
    },
    {
      title: "Runtime",
      value: formatValue(runtime, format.runtime),
    },
    {
      title: "Budget",
      value: formatValue(budget, format.currency),
    },
    {
      title: "Revenue",
      value: formatValue(revenue, format.currency),
    },
    {
      title: "Language",
      value: joiner(spoken_languages, "english_name"),
    },
    {
      title: "Production Companies",
      value: production_companies.map(({ id, name }) => (
        <Link
          key={id}
          href={`/movie/discover?with_companies=${id}`}
          className="mr-1 border-b border-cyan-300/40 transition hover:border-cyan-200 hover:text-cyan-100"
          prefetch={false}
        >
          {name}
        </Link>
      )),
    },
  ]

  return (
    <section className="sidequests-rail space-y-4" aria-label="Movie details">
      <WatchHistoryTracker id={id} mediaType="movie" data={movie} />

      <div className="grid grid-cols-2 gap-x-5 gap-y-8 rounded-2xl border border-cyan-200/15 bg-slate-950/45 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.2)] sm:p-6 md:grid-cols-4">
        {overview.map((item) => (
          <div key={item.title}>
            <h2 className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-200/80 md:text-xs">
              {item.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-zinc-100 md:text-base">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {belongs_to_collection && (
        <MovieCollection id={belongs_to_collection.id} />
      )}
    </section>
  )
}
