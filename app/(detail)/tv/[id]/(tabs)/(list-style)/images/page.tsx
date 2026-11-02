import { tmdb } from "@/tmdb/api"

import { MediaImages } from "@/components/media-images"

export const revalidate = 604800

interface DetailImagesProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: DetailImagesProps) {
  const { id } = await params
  const { name } = await tmdb.tv.detail({
    id,
  })

  return {
    title: `Images - ${name}`,
  }
}

export default async function DetailImages({ params }: DetailImagesProps) {
  const { id } = await params
  const { posters, backdrops } = await tmdb.tv.images({
    id,
    langs: "en",
  })
  return <MediaImages posters={posters} backdrops={backdrops} />
}
