import { pages } from "@/config"

import { MovieList } from "@/components/movie-list"

interface ListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata() {
  return {
    title: "Popular Movies",
    description: pages.movie.popular.description,
  }
}

export const revalidate = 604800 

export default async function Popular({ searchParams }: ListPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <MovieList
      list="popular"
      page={(resolvedSearchParams?.page as string) ?? "1"}
      title={pages.movie.popular.title}
      description={pages.movie.popular.description}
    />
  )
}
