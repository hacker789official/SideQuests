"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Maximize2, Rows3 } from "lucide-react"

import {
  getLocalMangaReadingProgress,
  saveLocalMangaReadingProgress,
  type LocalMangaReadingProgress,
} from "@/lib/local-watch-data"
import { cn } from "@/lib/utils"

interface MangaReaderProps {
  mangaId: number | string
  title: string
  totalChapters: number | null
  sourceMangaDexId?: string
}

interface MangaDexChapter {
  id: string
  attributes: {
    chapter: string | null
    volume: string | null
    title: string | null
    translatedLanguage: string
    pages: number
    externalUrl: string | null
    isUnavailable: boolean
  }
}

interface ChapterPages {
  baseUrl: string
  chapter: {
    hash: string
    data: string[]
    dataSaver?: string[]
  }
}

interface MangaDexSearchMatch {
  id: string
}

const isChapterReadable = (chapter: MangaDexChapter) =>
  chapter.attributes.pages > 0 && !chapter.attributes.isUnavailable

const chapterLabel = (chapter: MangaDexChapter) => {
  const number = chapter.attributes.chapter || "Oneshot"
  return `Chapter ${number}${chapter.attributes.title ? ` · ${chapter.attributes.title}` : ""}`
}

export const MangaReader: React.FC<MangaReaderProps> = ({
  mangaId,
  title,
  totalChapters,
  sourceMangaDexId,
}) => {
  const [resolvedMangaId, setResolvedMangaId] = useState<string | null>(sourceMangaDexId || null)
  const [chapters, setChapters] = useState<MangaDexChapter[]>([])
  const [chapterId, setChapterId] = useState("")
  const [pages, setPages] = useState<ChapterPages | null>(null)
  const [page, setPage] = useState(1)
  const [savedProgress, setSavedProgress] = useState<LocalMangaReadingProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [panelMode, setPanelMode] = useState(false)
  const readerRef = useRef<HTMLDivElement>(null)

  const readableChapters = useMemo(
    () => chapters.filter(isChapterReadable),
    [chapters]
  )
  const currentChapter = chapters.find((chapter) => chapter.id === chapterId)

  useEffect(() => {
    setPanelMode(localStorage.getItem("sidequests-manga-panel-mode") === "true")
    const stored = getLocalMangaReadingProgress(mangaId)
    setSavedProgress(stored)
    setResolvedMangaId(sourceMangaDexId || stored?.mangaDexId || null)
    if (stored?.mangaDexId) {
      setChapterId(stored.chapterId)
      setPage(stored.page || 1)
    }
  }, [mangaId, sourceMangaDexId])

  useEffect(() => {
    let cancelled = false

    const resolveTitle = async () => {
      if (resolvedMangaId) return
      setLoading(true)
      setError("")

      try {
        const response = await fetch(`/api/mangadex?title=${encodeURIComponent(title)}`)
        if (!response.ok) throw new Error("Manga search failed")

        const payload = (await response.json()) as { data?: MangaDexSearchMatch[] }
        const candidates = payload.data || []
        let selectedId = candidates[0]?.id

        // MangaDex can return an official or publisher-only match first. Prefer a
        // matching title that actually has page images so the reader stays in-app.
        for (const candidate of candidates.slice(0, 10)) {
          try {
            const chaptersResponse = await fetch(
              `/api/mangadex?mangaId=${encodeURIComponent(candidate.id)}`
            )
            if (!chaptersResponse.ok) continue
            const chaptersPayload = (await chaptersResponse.json()) as {
              data?: MangaDexChapter[]
            }
            if ((chaptersPayload.data || []).some(isChapterReadable)) {
              selectedId = candidate.id
              break
            }
          } catch {
            // Try the next MangaDex match before falling back to the best title match.
          }
        }

        if (!selectedId) throw new Error("No MangaDex match found")
        if (!cancelled) setResolvedMangaId(selectedId)
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Manga search failed")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void resolveTitle()
    return () => {
      cancelled = true
    }
  }, [resolvedMangaId, title])

  useEffect(() => {
    if (!resolvedMangaId) return
    let cancelled = false

    const loadChapters = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetch(`/api/mangadex?mangaId=${encodeURIComponent(resolvedMangaId)}`)
        if (!response.ok) throw new Error("Chapter list unavailable")

        const payload = (await response.json()) as { data?: MangaDexChapter[] }
        const nextChapters = payload.data || []
        const stored = getLocalMangaReadingProgress(mangaId)
        const firstReadable = nextChapters.find(isChapterReadable)
        const resumedChapter = stored?.mangaDexId === resolvedMangaId
          ? nextChapters.find(
              (chapter) => chapter.id === stored.chapterId && isChapterReadable(chapter)
            )
          : undefined

        if (!cancelled) {
          setChapters(nextChapters)
          setChapterId(
            resumedChapter?.id || firstReadable?.id || nextChapters[0]?.id || ""
          )
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Chapter list unavailable")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadChapters()
    return () => {
      cancelled = true
    }
  }, [mangaId, resolvedMangaId])

  useEffect(() => {
    if (!chapterId) return
    let cancelled = false

    const loadPages = async () => {
      setLoading(true)
      setError("")
      setPages(null)

      const selectedChapter = chapters.find((chapter) => chapter.id === chapterId)
      if (!selectedChapter || !isChapterReadable(selectedChapter)) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/mangadex?chapterId=${encodeURIComponent(chapterId)}`)
        if (!response.ok) throw new Error("Reader pages unavailable")

        const payload = (await response.json()) as ChapterPages
        if (!payload.chapter?.data?.length) throw new Error("This chapter has no page images")

        if (!cancelled) {
          setPages(payload)
          const stored = getLocalMangaReadingProgress(mangaId)
          const storedPage = stored?.chapterId === chapterId ? stored.page : 1
          setPage(Math.max(1, Math.min(storedPage || 1, payload.chapter.data.length)))
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Reader pages unavailable")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadPages()
    return () => {
      cancelled = true
    }
  }, [chapterId, chapters, mangaId])

  const imageUrls = useMemo(() => {
    if (!pages) return []
    return pages.chapter.data.map((filename) =>
      `/api/mangadex?image=${encodeURIComponent(`${pages.baseUrl}/data/${pages.chapter.hash}/${filename}`)}`
    )
  }, [pages])

  const activeImageUrls = imageUrls


  useEffect(() => {
    if (!resolvedMangaId || !chapterId || activeImageUrls.length === 0) return

    const timeout = window.setTimeout(() => {
      const nextProgress: LocalMangaReadingProgress = {
        mangaId,
        title,
        mangaDexId: resolvedMangaId,
        chapterId,
        chapterNumber: currentChapter?.attributes.chapter || "Oneshot",
        page,
        totalPages: activeImageUrls.length,
        updatedAt: new Date().toISOString(),
      }
      saveLocalMangaReadingProgress(nextProgress)
      setSavedProgress(nextProgress)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [activeImageUrls.length, chapterId, currentChapter, mangaId, page, pages, resolvedMangaId, title])

  const togglePanelMode = () => {
    const next = !panelMode
    setPanelMode(next)
    localStorage.setItem("sidequests-manga-panel-mode", String(next))
  }

  const changeChapter = (nextChapterId: string) => {
    if (!readableChapters.some((chapter) => chapter.id === nextChapterId)) return
    setChapterId(nextChapterId)
    setPage(1)
    readerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }

  const changePage = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(nextPage, activeImageUrls.length || 1))
    setPage(safePage)
    const target = readerRef.current?.querySelector(`[data-page-index="${safePage}"]`)
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }


  const toggleFullscreen = async () => {
    if (!readerRef.current) return
    if (!document.fullscreenElement) {
      await readerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const resumeText = savedProgress
    ? `Resume ${chapterLabel({
        id: savedProgress.chapterId,
        attributes: {
          chapter: savedProgress.chapterNumber,
          title: null,
          volume: null,
          translatedLanguage: "en",
          pages: savedProgress.totalPages,
          externalUrl: null,
          isUnavailable: false,
        },
      })} at page ${savedProgress.page}`
    : "Your reading position is saved on this device."

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl shadow-black/25">
      <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.035] p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              <BookOpen className="size-3.5" />
              Manga reader
            </div>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-white">Read {title}</h2>
            <p className="mt-1 text-xs text-zinc-500">{resumeText}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="manga-chapter">Chapter</label>
            <select
              id="manga-chapter"
              value={readableChapters.some((chapter) => chapter.id === chapterId) ? chapterId : ""}
              onChange={(event) => changeChapter(event.target.value)}
              disabled={loading || readableChapters.length === 0}
              className="h-9 min-w-52 rounded-lg border border-white/10 bg-black/40 px-3 text-xs font-semibold text-zinc-200 outline-none transition focus:border-primary/60 disabled:opacity-50"
            >
              {readableChapters.length === 0 ? (
                <option value="">No in-site chapters found</option>
              ) : readableChapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>{chapterLabel(chapter)}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
            >
              <Maximize2 className="size-3.5" />
              {isFullscreen ? "Exit reader" : "Focus reader"}
            </button>
            <button
              type="button"
              onClick={togglePanelMode}
              aria-pressed={panelMode}
              className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition", panelMode ? "border-primary/60 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.1] hover:text-white")}
            >
              <Rows3 className="size-3.5" />
              {panelMode ? "Panel mode" : "Page mode"}
            </button>

          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <span>
            {currentChapter ? chapterLabel(currentChapter) : "Finding an in-site chapter…"}
            {readableChapters.length > 0
              ? ` · ${readableChapters.length} chapters available in SideQuests`
              : totalChapters
                ? ` · ${totalChapters} chapters listed in AniList`
                : ""}
          </span>
          {activeImageUrls.length > 0 && (
            <span className="inline-flex items-center gap-2">
              Page {page} of {activeImageUrls.length}
            </span>
          )}
        </div>
      </div>

      <div
        ref={readerRef}
        onScroll={() => {
          if (!readerRef.current) return
          const readerTop = readerRef.current.getBoundingClientRect().top
          const pageElements = Array.from(
            readerRef.current.querySelectorAll<HTMLElement>("[data-page-index]")
          )
          const closest = pageElements.reduce(
            (best, element) => {
              const distance = Math.abs(element.getBoundingClientRect().top - readerTop - 12)
              return distance < best.distance
                ? { distance, index: Number(element.dataset.pageIndex) }
                : best
            },
            { distance: Number.POSITIVE_INFINITY, index: page }
          )
          if (closest.index && closest.index !== page) setPage(closest.index)
        }}
        className={cn("relative max-h-[78vh] min-h-[24rem] bg-[#09090b] scroll-smooth", panelMode ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto")}
      >
        {loading ? (
          <div className="flex min-h-[24rem] items-center justify-center gap-3 text-sm text-zinc-500">
            <Loader2 className="size-4 animate-spin" />
            Preparing reader inside SideQuests…
          </div>
        ) : error && activeImageUrls.length === 0 ? (
          <div className="flex min-h-[24rem] flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-semibold text-white">Reader unavailable</p>
            <p className="max-w-md text-sm text-zinc-500">{error}</p>
          </div>
        ) : activeImageUrls.length > 0 ? (
          <div className={cn("mx-auto w-full", panelMode ? "flex max-w-5xl snap-x snap-mandatory" : "max-w-3xl")}>
            {activeImageUrls.map((imageUrl, index) => (
              <div key={imageUrl} data-page-index={index + 1} className={cn(panelMode && "flex min-w-full snap-center items-center justify-center p-3")}>
                <img
                  src={imageUrl}
                  alt={`${title} ${currentChapter ? chapterLabel(currentChapter) : "chapter"} page ${index + 1}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  className={cn("block h-auto w-full bg-zinc-950", panelMode && "max-h-[72vh] w-auto max-w-full object-contain")}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[24rem] flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="font-semibold text-white">
              {currentChapter ? "This chapter has no in-site page images" : "No in-site chapters found"}
            </p>
            <p className="max-w-md text-sm leading-relaxed text-zinc-500">
              {currentChapter
                ? "Choose another chapter from the SideQuests reader. Only chapters with page images supplied by MangaDex can be displayed here."
                : "MangaDex does not currently provide readable page images for this title. The reader stays inside SideQuests and will not redirect you away."}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 bg-white/[0.025] p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changePage(page - 1)}
            disabled={page <= 1 || activeImageUrls.length === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-zinc-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
            Previous page
          </button>
          <button
            type="button"
            onClick={() => changePage(page + 1)}
            disabled={page >= activeImageUrls.length || activeImageUrls.length === 0}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-30",
              page < activeImageUrls.length
                ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                : "border-white/10 bg-white/[0.03] text-zinc-400"
            )}
          >
            Next page
            <ChevronRight className="size-4" />
          </button>
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-600">
          Chapters, page images, and reading progress stay inside SideQuests.
        </p>
      </div>
    </section>
  )
}
