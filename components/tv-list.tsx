import { notFound } from "next/navigation"
import { tmdb } from "@/tmdb/api"
import { TvListType } from "@/tmdb/api/types"

import { getUserTimezone } from "@/lib/utils"
import { ListPagination } from "@/components/list-pagination"
import { TvCard } from "@/components/tv-card"

interface TvListProps {
  list: TvListType
  page: string
  title: string
  description?: string
}

export const TvList: React.FC<TvListProps> = async ({
  list,
  page,
  title,
  description,
}) => {
  const region = "US"
  const timezone = getUserTimezone()

  const {
    results,
    total_pages: totalPages,
    page: currentPage,
  } = await tmdb.tv.list({
    region,
    list,
    page,
    timezone,
  })

  if (!results?.length) {
    return notFound()
  }

  return (
    <div className="sq-list-page container space-y-8">
      <header className="sq-route-intro">
        <p className="sq-route-kicker">SIDEQUESTS / SERIES</p>
        <h1>{title}</h1>
        <p className="max-w-3xl text-muted-foreground">{description}</p>
      </header>

      <div className="grid-list">
        {results?.map((tvShow) => (
          <TvCard key={tvShow.id} {...tvShow} />
        ))}
      </div>

      <ListPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
