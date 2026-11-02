"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, XIcon } from "lucide-react"

import { useSearch } from "@/hooks"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input, InputProps } from "@/components/ui/input"

interface SearchInputProps extends InputProps {
  auto?: boolean
}

type Suggestion = {
  id: number
  mediaType: "movie" | "tv" | "person"
  title: string
  subtitle: string
}

export const SearchInput: React.FC<SearchInputProps> = ({
  auto = true,
  value,
  className,
  onChange,
  onKeyDown,
  name = "q",
  type = "text",
  placeholder = "Search movies, shows, anime…",
}) => {
  const router = useRouter()
  const { term, handleChange, handleKeyDown, clearSearch } = useSearch(auto)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [focused, setFocused] = useState(false)
  const activeTerm = String(value ?? term)

  useEffect(() => {
    if (value !== undefined || activeTerm.trim().length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(activeTerm)}`, { signal: controller.signal, cache: "no-store" })
        if (!response.ok) return setSuggestions([])
        const payload = await response.json() as { results?: Suggestion[] }
        setSuggestions(payload.results || [])
      } catch (error) {
        if ((error as Error).name !== "AbortError") setSuggestions([])
      }
    }, 180)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [activeTerm, value])

  const selectSuggestion = (suggestion: Suggestion) => {
    setSuggestions([])
    setFocused(false)
    router.push(`/${suggestion.mediaType}/${suggestion.id}`)
  }

  const clear = () => {
    setSuggestions([])
    clearSearch()
  }

  return (
    <div className="relative flex items-center">
      <Search className="pointer-events-none absolute left-3 z-10 size-4 text-cyan-200/70 sm:left-4" />
      <Input
        name={name}
        type={type}
        value={value ?? term}
        onChange={onChange ?? handleChange}
        onKeyDown={onKeyDown ?? handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 140)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "h-10 w-[min(8.5rem,42vw)] rounded-md border border-cyan-300/15 bg-zinc-950/55 px-9 text-xs text-zinc-200 placeholder:text-zinc-500 backdrop-blur-md transition-all focus:border-cyan-300/45 focus:bg-zinc-950/80 focus-visible:ring-primary/30 sm:h-9 sm:w-60 sm:rounded-full sm:px-10 sm:text-sm",
          className
        )}
      />
      {(term || value) && (
        <Button size="icon" variant="ghost" className="absolute right-1 z-10 size-8 rounded-md text-zinc-400 transition-all hover:bg-cyan-300/10 hover:text-cyan-100 sm:size-7 sm:rounded-full" onClick={clear}>
          <XIcon className="size-3" />
        </Button>
      )}
      {focused && suggestions.length > 0 && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071426] p-1.5 shadow-2xl shadow-black/50">
          {suggestions.map((suggestion) => (
            <button key={`${suggestion.mediaType}-${suggestion.id}`} type="button" onMouseDown={() => selectSuggestion(suggestion)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-cyan-400/10">
              <span className="min-w-0 truncate text-sm font-semibold text-slate-100">{suggestion.title}</span>
              <span className="ml-3 shrink-0 text-[10px] font-bold uppercase tracking-wider text-cyan-300/70">{suggestion.subtitle}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
