import { notFound } from "next/navigation"
import { tmdb } from "@/tmdb/api"
import { MovieListType } from "@/tmdb/api/types"

import { ListPagination } from "@/components/list-pagination"
import { MovieCard } from "@/components/movie-card"

interface MovieListProps {
  list: MovieListType
  page: string
  title?: string
  description?: string
}

export const MovieList: React.FC<MovieListProps> = async ({
  list,
  page,
  title,
  description,
}) => {
  const region = "US"

  const {
    results,
    total_pages: totalPages,
    page: currentPage,
  } = await tmdb.movie.list({
    region,
    list,
    page,
  })

  if (!results?.length) {
    return notFound()
  }

  return (
    <div className="sq-list-page container space-y-8">
      <header className="sq-route-intro">
        <p className="sq-route-kicker">SIDEQUESTS / MOVIES</p>
        <h1>{title}</h1>
        <p className="max-w-3xl text-muted-foreground">{description}</p>
      </header>

      <div className="grid-list">
        {results.map((movie) => (
          <MovieCard key={movie.id} {...movie} />
        ))}
      </div>

      <ListPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
