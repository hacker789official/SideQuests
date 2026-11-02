import { pages } from "@/config"

import { TvList } from "@/components/tv-list"

interface ListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata() {
  return {
    title: "Popular TV Shows",
    description: pages.tv.popular.description,
  }
}

export const revalidate = 604800 

export default async function Popular({ searchParams }: ListPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <TvList
      list="popular"
      page={(resolvedSearchParams?.page as string) ?? "1"}
      title={pages.tv.popular.title}
      description={pages.tv.popular.description}
    />
  )
}
