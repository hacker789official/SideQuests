import { pages } from "@/config"

import { TvList } from "@/components/tv-list"

export const revalidate = 604800

interface ListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata() {
  return {
    title: "Top Rated TV Shows",
    description: pages.tv.topRated.description,
  }
}

export default async function TopRated({ searchParams }: ListPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <TvList
      list="top_rated"
      page={(resolvedSearchParams?.page as string) ?? "1"}
      title={pages.tv.topRated.title}
      description={pages.tv.topRated.description}
    />
  )
}
