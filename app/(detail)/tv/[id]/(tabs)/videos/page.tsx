import { tmdb } from "@/tmdb/api"

import { VideoList } from "@/components/video-list"

export const revalidate = 604800

interface VideosProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: VideosProps) {
  const { id } = await params
  const { name } = await tmdb.tv.detail({
    id,
  })

  return {
    title: `Videos - ${name}`,
  }
}

export default async function DetailVideos({ params }: VideosProps) {
  const { id } = await params
  return <VideoList type="tv" id={id} />
}
