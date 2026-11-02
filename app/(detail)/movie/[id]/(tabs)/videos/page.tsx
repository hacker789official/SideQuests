import { tmdb } from "@/tmdb/api"

import { VideoList } from "@/components/video-list"

export const revalidate = 604800

interface DetailVideosProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: DetailVideosProps) {
  const { id } = await params
  const { title } = await tmdb.movie.detail({
    id,
  })

  return {
    title: `Videos - ${title}`,
  }
}

export default async function DetailVideos({ params }: DetailVideosProps) {
  const { id } = await params
  return <VideoList type="movie" id={id} />
}
