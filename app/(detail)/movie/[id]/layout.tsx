import { notFound } from "next/navigation"
import { tmdb } from "@/tmdb/api"
import { WithVideos } from "@/tmdb/api/types"
import { format } from "@/tmdb/utils"
import { Star } from "lucide-react"

import { Tabs, TabsLink, TabsList } from "@/components/ui/tabs"
import { MediaBackdrop } from "@/components/media-backdrop"
import { MediaDetailView } from "@/components/media-detail-view"
import { MediaPoster } from "@/components/media-poster"
import { MediaWatchDialog } from "@/components/media-watch-dialog"
import { WatchlistButton } from "@/components/watchlist-button"

export const revalidate = 604800

interface DetailLayoutProps {
  params: Promise<{
    id: string
  }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: DetailLayoutProps) {
  const { id } = await params
  const { title } = await tmdb.movie.detail({
    id,
  })

  return {
    title,
  }
}

export default async function DetailLayout({
  params,
  children,
}: DetailLayoutProps) {
  const { id } = await params
  const {
    title,
    backdrop_path,
    poster_path,
    release_date,
    runtime,
    overview,
    vote_average,
    genres,
    videos: { results: videos },
  } = await tmdb.movie.detail<WithVideos>({
    id,
    append: "videos",
  })

  if (!title) {
    return notFound()
  }

  const trailer = videos.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  )

  const info = [format.date(release_date), format.runtime(runtime)]
    .filter(Boolean)
    .join(" — ")

  const tabs = [
    {
      title: "Cast",
      href: `/movie/${id}/cast`,
    },
    {
      title: "Images",
      href: `/movie/${id}/images`,
    },
    {
      title: "Videos",
      href: `/movie/${id}/videos`,
    },
    {
      title: "Recommendations",
      href: `/movie/${id}/recommendations`,
    },
    {
      title: "Similar",
      href: `/movie/${id}/similar`,
    },
  ]

  return (
    <MediaDetailView.Root>
      <MediaDetailView.Backdrop>
        <MediaBackdrop image={backdrop_path} alt={title} priority />
      </MediaDetailView.Backdrop>

      <MediaDetailView.Hero>
        <MediaDetailView.Poster>
          <MediaPoster image={poster_path} alt={title} size="w780" priority />
        </MediaDetailView.Poster>

        <div className="space-y-5 flex flex-col items-center md:items-start w-full">
          <div className="flex flex-col md:flex-row items-center gap-3.5 flex-wrap">
            <MediaDetailView.Title>{title}</MediaDetailView.Title>
            {vote_average > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold shadow-sm select-none animate-slide-right-fade-in animation-delay-200">
                <Star className="size-3.5 fill-amber-500" />
                <span>{vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3.5 items-center md:items-start">
            <MediaDetailView.Overview className="text-zinc-400 font-semibold">{info}</MediaDetailView.Overview>
            {genres && genres.length > 0 && (
              <MediaDetailView.Genres>
                {genres.map((genre) => (
                  <MediaDetailView.Genre key={genre.id}>
                    {genre.name}
                  </MediaDetailView.Genre>
                ))}
              </MediaDetailView.Genres>
            )}
          </div>
          
          <MediaDetailView.Overview>{overview}</MediaDetailView.Overview>

          <div className="flex flex-wrap gap-4 mt-6 animate-slide-up-fade-in animation-delay-200 justify-center md:justify-start">
            <MediaWatchDialog tmdbid={parseInt(id)} />
            <WatchlistButton
              tmdbid={parseInt(id)}
              mediaType="movie"
              title={title}
              posterPath={poster_path}
              voteAverage={vote_average}
            />
          </div>
        </div>
      </MediaDetailView.Hero>

      <MediaDetailView.Content>
        <Tabs>
          <TabsList className="w-full justify-start rounded-none border-b border-zinc-900 bg-transparent p-0 h-auto gap-6 scrollbar-hidden pb-px mb-6 overflow-x-auto overflow-y-hidden">
            {tabs.map((tab) => (
              <TabsLink
                key={tab.href}
                href={tab.href}
                className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-1 text-sm font-semibold text-zinc-400 hover:text-zinc-200 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none transition-all duration-305"
              >
                {tab.title}
              </TabsLink>
            ))}
          </TabsList>
          {children}
        </Tabs>
      </MediaDetailView.Content>
    </MediaDetailView.Root>
  )
}
