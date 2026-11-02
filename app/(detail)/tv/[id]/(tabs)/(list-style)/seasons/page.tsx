import { Fragment } from "react"
import Link from "next/link"
import { tmdb } from "@/tmdb/api"

import { MediaCard } from "@/components/media-card"
import { MediaPoster } from "@/components/media-poster"
import { MediaRating } from "@/components/media-rating"
import { TvSeasonDetails } from "@/components/tv-season-details"

export const revalidate = 604800

interface DetailSeasonsProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    s: string
  }>
}

export async function generateMetadata({ params }: DetailSeasonsProps) {
  const { id } = await params
  const { name } = await tmdb.tv.detail({
    id,
  })

  return {
    title: `Seasons - ${name}`,
  }
}

export default async function DetailSeasons({
  params,
  searchParams,
}: DetailSeasonsProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const { seasons } = await tmdb.tv.detail({
    id,
  })

  if (!seasons) return <div className="empty-box">No seasons</div>

  return (
    <section className="grid-list">
      {seasons.map((season) => (
        <Fragment key={season.id}>
          <Link
            href={`/tv/${id}/seasons?s=${season.season_number}`}
            prefetch={false}
            replace
            scroll={false}
          >
            <MediaCard.Root>
              <MediaPoster image={season.poster_path} alt={season.name} />
              <MediaCard.Content>
                <MediaRating average={season.vote_average} className="mb-2" />
                <MediaCard.Title>{season.name}</MediaCard.Title>
                <MediaCard.Excerpt>
                  {season.episode_count} Episodes
                </MediaCard.Excerpt>
              </MediaCard.Content>
            </MediaCard.Root>
          </Link>

          {parseInt(resolvedSearchParams.s) === season.season_number && (
            <TvSeasonDetails id={id} season={season.season_number} />
          )}
        </Fragment>
      ))}
    </section>
  )
}
