import { tmdb } from "@/tmdb/api"

import { Separator } from "@/components/ui/separator"
import { MediaCastCard } from "@/components/media-cast-card"
import { MediaCrewCard } from "@/components/media-crew-card"

export const revalidate = 604800

interface DetailCreditsProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: DetailCreditsProps) {
  const { id } = await params
  const { title } = await tmdb.movie.detail({
    id,
  })

  return {
    title: `Cast - ${title}`,
  }
}

export default async function DetailCredits({ params }: DetailCreditsProps) {
  const { id } = await params
  const { cast, crew } = await tmdb.movie.credits({ id })

  return (
    <section className="space-y-12">
      {cast.length > 0 ? (
        <div className="grid-list">
          {cast.map((cast) => (
            <MediaCastCard key={cast.credit_id} {...cast} />
          ))}
        </div>
      ) : (
        <div className="empty-box">No cast</div>
      )}

      <Separator />

      {crew.length > 0 ? (
        <div className="grid-list">
          {crew.map((crew) => (
            <MediaCrewCard key={crew.credit_id} {...crew} />
          ))}
        </div>
      ) : (
        <div className="empty-box">No crew</div>
      )}
    </section>
  )
}
