import { hydrateMediaProgressFromSync } from "@/lib/local-watch-data"

export const WATCH_DATA_UPDATED = "WATCH_DATA_UPDATED"

export type WatchData = {
  watchHistory: string
  watchHistoryEnabled: string
  watches: string
  watchProgress: Record<string, string>
  updated_at: string
  deletedItems?: Record<string, number>
}

export type AccountSummary = {
  email: string
  displayName: string
  username: string
  accountCode: string
  createdAt: string
  updatedAt: string
}

const api = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, { ...init, cache: "no-store", credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers || {}) } })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || "Account request failed.")
  return payload as T
}

export const mergeWatchData = (local: WatchData, cloud: WatchData): WatchData => ({
  ...local,
  ...cloud,
  watchProgress: { ...(local.watchProgress || {}), ...(cloud.watchProgress || {}) },
  updated_at: new Date(Math.max(Date.parse(local.updated_at || "0"), Date.parse(cloud.updated_at || "0"))).toISOString(),
})

export const signUpAccount = (email: string, displayName: string, username: string, pin: string) =>
  api<{ account: AccountSummary; created: boolean }>("/api/account", { method: "POST", body: JSON.stringify({ action: "signup", email, displayName, username, pin }) })

export const signInAccount = (username: string, pin: string) =>
  api<{ account: AccountSummary; data: WatchData }>("/api/account", { method: "POST", body: JSON.stringify({ action: "login", username, pin }) })

export const signOutAccount = () => api<{ ok: boolean }>("/api/account", { method: "POST", body: JSON.stringify({ action: "logout" }) })
export const getAccountSession = () => api<{ account: AccountSummary | null }>("/api/account?action=me")
export const retrieveFromCloud = async (): Promise<WatchData | null> => { try { return (await api<{ data: WatchData }>("/api/account?action=data")).data } catch { return null } }
export const syncToCloud = async (data: WatchData): Promise<boolean> => { try { await api("/api/account", { method: "POST", body: JSON.stringify({ action: "sync", data }) }); return true } catch { return false } }
export const syncToAccountCloud = async (_identifier: string, _pin: string, data: WatchData, _force = false): Promise<boolean> => syncToCloud(data)
export const retrieveFromAccountCloud = async (_identifier?: string, _pin?: string) => retrieveFromCloud()
export const getLastSyncTime = async (_identifier?: string, _pin?: string) => { const data = await retrieveFromCloud(); return data?.updated_at ? Date.parse(data.updated_at) : null }
export const unlinkDevice = async (_identifier?: string, _pin?: string) => { await signOutAccount() }

export const applyWatchData = (data: WatchData): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("watchHistory", data.watchHistory || "[]")
  localStorage.setItem("watchHistoryEnabled", data.watchHistoryEnabled || "true")
  localStorage.setItem("watches", data.watches || "[]")
  localStorage.setItem("watchProgress", JSON.stringify(data.watchProgress || {}))
  localStorage.setItem("syncUpdatedAt", data.updated_at || new Date().toISOString())
  hydrateMediaProgressFromSync(data.watchProgress || {})
  window.dispatchEvent(new CustomEvent(WATCH_DATA_UPDATED, { detail: { hasNewHistory: true, hasNewWatches: true, hasProgressUpdate: true, cloudChange: true } }))
}

export const subscribeToChanges = (_identifier?: string, _pin?: string, callback?: (data: WatchData) => void) => {
  const timer = window.setInterval(async () => { const data = await retrieveFromCloud(); if (data) callback?.(data) }, 300000)
  return () => window.clearInterval(timer)
}
