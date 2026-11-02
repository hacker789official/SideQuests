import { pages } from "@/config"

import { MovieList } from "@/components/movie-list"

export const revalidate = 604800

interface ListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata() {
  return {
    title: "Top Rated Movies",
    description: pages.movie.topRated.description,
  }
}

export default async function TopRated({ searchParams }: ListPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <MovieList
      list="top_rated"
      page={(resolvedSearchParams?.page as string) ?? "1"}
      title={pages.movie.topRated.title}
      description={pages.movie.topRated.description}
    />
  )
}
