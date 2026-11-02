"use client"

import { useEffect, useState } from "react"
import { Activity, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react"

type ProviderStatus = {
  id: string
  name: string
  host: string | null
  status: number | null
  ok: boolean
  latencyMs: number
}

type HealthResponse = {
  checkedAt: string
  providers: ProviderStatus[]
}

export function ProviderHealthDashboard() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/provider-health", { cache: "no-store" })
      if (!response.ok) throw new Error("Unable to check providers")
      setData((await response.json()) as HealthResponse)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Playback diagnostics</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Provider health</h1>
          <p className="mt-2 text-sm text-muted-foreground">A quick reachability check for the configured third-party player hosts.</p>
        </div>
        <button type="button" onClick={() => void refresh()} className="rounded-full border border-border/60 p-2 text-muted-foreground hover:border-primary/60 hover:text-primary" aria-label="Refresh provider health">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {loading && !data ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Checking providers…</div> : null}
      {data ? (
        <>
          <p className="text-xs text-muted-foreground">Checked {new Date(data.checkedAt).toLocaleString()}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.providers.map((provider) => (
              <div key={provider.id} className="sidequests-panel flex items-center justify-between gap-4 rounded-2xl p-4">
                <div className="flex min-w-0 items-center gap-3">
                  {provider.ok ? <CheckCircle2 className="size-5 shrink-0 text-emerald-500" /> : <XCircle className="size-5 shrink-0 text-destructive" />}
                  <div className="min-w-0"><p className="truncate font-bold">{provider.name}</p><p className="truncate text-xs text-muted-foreground">{provider.host || "No host configured"}</p></div>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{provider.ok ? `${provider.latencyMs}ms` : "Unavailable"}</span>
              </div>
            ))}
          </div>
        </>
      ) : <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><Activity className="mr-2 inline size-4" />Provider checks are temporarily unavailable.</div>}
    </section>
  )
}
