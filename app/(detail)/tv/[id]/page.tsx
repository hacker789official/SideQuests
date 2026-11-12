import Link from "next/link"
import { tmdb } from "@/tmdb/api"
import { format } from "@/tmdb/utils"

import { cn, formatValue, joiner, pad } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { MediaBackdrop } from "@/components/media-backdrop"
import { WatchHistoryTracker } from "@/components/watch-history-tracker"

export const revalidate = 604800

export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tvShow = await tmdb.tv.detail({
    id,
  })

  const {
    first_air_date,
    last_air_date,
    status,
    original_name,
    created_by,
    number_of_seasons,
    number_of_episodes,
    spoken_languages,
    production_companies,
    networks,
    last_episode_to_air: lastEpisode,
  } = tvShow

  const items = [
    {
      title: "Created By",
      value: created_by.map(({ id, name }) => (
        <Link
          key={id}
          href={`/person/${id}`}
          className="mr-1 border-b-2 transition hover:text-foreground"
          prefetch={false}
        >
          {name}
        </Link>
      )),
    },
    {
      title: "Status",
      value: formatValue(status),
    },
    {
      title: "Original Name",
      value: formatValue(original_name),
    },
    {
      title: "First Air Date",
      value: formatValue(first_air_date, format.date),
    },
    {
      title: "Last Air Date",
      value: formatValue(last_air_date, format.date),
    },
    {
      title: "Seasons",
      value: formatValue(number_of_seasons),
    },
    {
      title: "Episodes",
      value: formatValue(number_of_episodes),
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
          href={`/tv/discover?with_companies=${id}`}
          className="mr-1 border-b-2 transition hover:text-foreground"
          prefetch={false}
        >
          {name}
        </Link>
      )),
    },
    {
      title: "Networks",
      value: networks.map(({ id, name }) => (
        <Link
          key={id}
          href={`/tv/discover?with_networks=${id}`}
          className="mr-1 border-b-2 transition hover:text-foreground"
          prefetch={false}
        >
          {name}
        </Link>
      )),
    },
  ]

  return (
    <section
      className="sidequests-rail space-y-4"
      aria-label="TV series details"
    >
      <WatchHistoryTracker id={id} mediaType="tv" data={tvShow} />

      <div className="grid grid-cols-2 gap-x-5 gap-y-8 rounded-2xl border border-cyan-200/15 bg-slate-950/45 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.2)] sm:p-6 lg:grid-cols-4">
        {items.map((item) => (
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

      {lastEpisode && (
        <div className="sidequests-panel h-hero relative w-full overflow-hidden rounded-2xl">
          <MediaBackdrop
            image={lastEpisode.still_path}
            alt={lastEpisode.name}
          />
          <div className="overlay">
            <div className="p-4 md:p-10">
              <Badge className="mb-4 gap-1 border border-cyan-200/30 bg-cyan-300/10 text-cyan-100">
                <span>S{pad(lastEpisode.season_number)}</span>
                <span>E{pad(lastEpisode.episode_number)}</span>
              </Badge>

              <h2 className="line-clamp-1 text-lg font-black text-white md:text-2xl">
                {lastEpisode.name}
              </h2>
              <p className="line-clamp-3 max-w-xl text-muted-foreground md:line-clamp-6">
                {lastEpisode.overview}
              </p>
              <Link
                href={`/tv/${id}/seasons?s=${lastEpisode.season_number}`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "mt-4 min-h-11 rounded-xl bg-primary font-bold text-primary-foreground hover:bg-cyan-200"
                )}
                prefetch={false}
              >
                View Episodes
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
