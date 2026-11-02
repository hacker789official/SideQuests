import Link from "next/link"

import { getMangaTitle, mangaCoverUrl, type MangaDexManga } from "@/lib/mangadex-api"

interface MangaDexSearchCardProps {
  manga: MangaDexManga
}

export const MangaDexSearchCard: React.FC<MangaDexSearchCardProps> = ({ manga }) => {
  const title = getMangaTitle(manga)
  const cover = mangaCoverUrl(manga)

  return (
    <Link
      href={`/manga/search/${encodeURIComponent(manga.id)}`}
      className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-primary/50 hover:bg-white/[0.06]"
    >
      <div className="aspect-[2/3] overflow-hidden bg-black/30">
        {cover ? (
          <img src={cover} alt={title} className="size-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center text-xs text-zinc-600">No cover</div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-bold text-white">{title}</p>
        <p className="text-xs capitalize text-zinc-500">{manga.attributes.status || "MangaDex"}{manga.attributes.year ? ` · ${manga.attributes.year}` : ""}</p>
      </div>
    </Link>
  )
}
