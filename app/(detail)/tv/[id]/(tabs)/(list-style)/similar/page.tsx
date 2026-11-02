import { tmdb } from "@/tmdb/api"

import { ListPagination } from "@/components/list-pagination"
import { TvCard } from "@/components/tv-card"

export const revalidate = 604800

interface DetailSimilarProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    page: string
  }>
}

export async function generateMetadata({ params }: DetailSimilarProps) {
  const { id } = await params
  const { name } = await tmdb.tv.detail({
    id,
  })

  return {
    title: `Similar - ${name}`,
  }
}

export default async function DetailSimilar({
  params,
  searchParams,
}: DetailSimilarProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const {
    results: tvShows,
    total_pages: totalPages,
    page: currentPage,
  } = await tmdb.tv.similar({
    id,
    page: resolvedSearchParams.page,
  })

  if (!tvShows?.length) {
    return <div className="empty-box">No recommendations</div>
  }

  return (
    <div className="space-y-4">
      <section className="grid-list">
        {tvShows.map((tv) => (
          <TvCard key={tv.id} {...tv} />
        ))}
      </section>
      <ListPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
