import { tmdb } from "@/tmdb/api"

import { ListPagination } from "@/components/list-pagination"
import { MovieCard } from "@/components/movie-card"

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
  const { title } = await tmdb.movie.detail({
    id,
  })

  return {
    title: `Similar - ${title}`,
  }
}

export default async function DetailSimilar({
  params,
  searchParams,
}: DetailSimilarProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const {
    results: movies,
    total_pages: totalPages,
    page: currentPage,
  } = await tmdb.movie.similar({
    id,
    page: resolvedSearchParams.page,
  })

  if (!movies?.length) {
    return <div className="empty-box">No recommendations</div>
  }

  return (
    <div className="space-y-4">
      <section className="grid-list">
        {movies.map((movie) => (
          <MovieCard key={movie.id} {...movie} />
        ))}
      </section>
      <ListPagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  )
}
