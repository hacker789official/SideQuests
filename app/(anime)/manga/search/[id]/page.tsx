import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
import { notFound } from "next/navigation"

import { MangaReader } from "@/components/manga-reader"
import { getMangaById, getMangaTitle } from "@/lib/mangadex-api"

interface MangaDexDetailProps {
  params: Promise<{ id: string }>
}

export const revalidate = 1800

export async function generateMetadata({ params }: MangaDexDetailProps) {
  try {
    const { id } = await params
    const manga = await getMangaById(id)
    return { title: `${getMangaTitle(manga)} · MangaDex reader` }
  } catch {
    return { title: "MangaDex reader" }
  }
}

export default async function MangaDexDetail({ params }: MangaDexDetailProps) {
  const { id } = await params
  let manga

  try {
    manga = await getMangaById(id)
  } catch {
    notFound()
  }

  const title = getMangaTitle(manga)
  const description = manga.attributes.description?.en || Object.values(manga.attributes.description || {})[0] || "Open chapters in the SideQuests in-site reader."
  const totalChapters = manga.attributes.lastChapter ? Number(manga.attributes.lastChapter) || null : null

  return (
    <div className="container space-y-8 pb-12">
      <div className="pt-6">
        <Link href={`/search?q=${encodeURIComponent(title)}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to cross-media search
        </Link>
      </div>

      <section className="rounded-3xl border border-border/60 bg-background/30 p-5 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary"><BookOpen className="size-8" /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">MangaDex · in-site reader</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
            <p className="mt-3 text-xs text-muted-foreground">Status: {manga.attributes.status || "unknown"}{manga.attributes.year ? ` · ${manga.attributes.year}` : ""}</p>
          </div>
        </div>
      </section>

      <MangaReader mangaId={id} title={title} totalChapters={totalChapters} sourceMangaDexId={id} />
    </div>
  )
}
