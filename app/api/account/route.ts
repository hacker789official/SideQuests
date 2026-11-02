import { promises as fs } from "node:fs"
import path from "node:path"
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const scrypt = promisify(scryptCallback)
// Vercel serverless functions cannot persist writes inside the deployment bundle.
// /tmp is writable for the lifetime of a warm instance; local development keeps
// using the project data directory.
const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "sidequests-data") : path.join(process.cwd(), "data")
const STORE_PATH = path.join(DATA_DIR, "accounts.json")
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const KV_STORE_KEY = "sidequests:account-store:v1"
const SESSION_COOKIE = "sidequests_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

type CloudWatchData = {
  watchHistory: string
  watchHistoryEnabled: string
  watches: string
  watchProgress: Record<string, string>
  updated_at: string
  deletedItems?: Record<string, number>
}

type Account = {
  email: string
  displayName: string
  username: string
  accountCode: string
  pinSalt: string
  pinHash: string
  createdAt: string
  updatedAt: string
  data: CloudWatchData
}

type Session = { username: string; expiresAt: number }
type Store = { accounts: Record<string, Account>; sessions: Record<string, Session> }

const emptyData = (): CloudWatchData => ({ watchHistory: "[]", watchHistoryEnabled: "true", watches: "[]", watchProgress: {}, updated_at: new Date().toISOString(), deletedItems: {} })
const normalizeEmail = (email: unknown) => String(email || "").trim().toLowerCase()
const normalizeUsername = (username: unknown) => String(username || "").trim().toLowerCase()
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const validUsername = (username: string) => /^[a-z0-9_]{3,20}$/.test(username)
const validPin = (pin: unknown) => /^\d{4}$/.test(String(pin || ""))

async function readStore(): Promise<Store> {
  if (KV_URL && KV_TOKEN) {
    try {
      const response = await fetch(`${KV_URL.replace(/\/$/, "")}/get/${encodeURIComponent(KV_STORE_KEY)}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
        cache: "no-store",
      })
      if (response.ok) {
        const payload = await response.json() as { result?: string | Store | null }
        if (payload.result) return typeof payload.result === "string" ? JSON.parse(payload.result) as Store : payload.result
      }
    } catch (error) {
      console.warn("[AccountStore] KV read failed; using the local fallback.", error)
    }
  }
  try { return JSON.parse(await fs.readFile(STORE_PATH, "utf8")) as Store } catch { return { accounts: {}, sessions: {} } }
}
async function writeStore(store: Store) {
  const serialized = JSON.stringify(store)
  if (KV_URL && KV_TOKEN) {
    try {
      const response = await fetch(KV_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(["set", KV_STORE_KEY, serialized]),
        cache: "no-store",
      })
      if (response.ok) return
      console.warn("[AccountStore] KV write failed; using the local fallback.")
    } catch (error) {
      console.warn("[AccountStore] KV write failed; using the local fallback.", error)
    }
  }
  await fs.mkdir(DATA_DIR, { recursive: true }); await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8")
}
async function hashPin(pin: string, salt = randomBytes(16).toString("hex")) { const derived = (await scrypt(pin, salt, 64)) as Buffer; return { salt, hash: derived.toString("hex") } }
async function verifyPin(pin: string, account: Account) { const candidate = (await scrypt(pin, account.pinSalt, 64)) as Buffer; const stored = Buffer.from(account.pinHash, "hex"); return stored.length === candidate.length && timingSafeEqual(stored, candidate) }
function generateAccountCode(store: Store) {
  let code = ""
  do { code = `SQ-${Array.from({ length: 4 }, () => CODE_ALPHABET[randomBytes(1)[0] % CODE_ALPHABET.length]).join("")}-${Array.from({ length: 4 }, () => CODE_ALPHABET[randomBytes(1)[0] % CODE_ALPHABET.length]).join("")}` } while (Object.values(store.accounts).some((account) => account.accountCode === code))
  return code
}
function safeAccount(account: Account | null | undefined) { return account ? { email: account.email, displayName: account.displayName, username: account.username, accountCode: account.accountCode, createdAt: account.createdAt, updatedAt: account.updatedAt } : null }
async function currentAccount(request: NextRequest, store: Store) { const token = request.cookies.get(SESSION_COOKIE)?.value; if (!token) return null; const session = store.sessions[createHash("sha256").update(token).digest("hex")]; if (!session || session.expiresAt < Date.now()) return null; return store.accounts[session.username] || null }
function setSession(response: NextResponse, token: string) { response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE }) }
function clearSession(response: NextResponse) { response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 }) }
function createSession(store: Store, username: string) { const token = randomBytes(32).toString("hex"); store.sessions[createHash("sha256").update(token).digest("hex")] = { username, expiresAt: Date.now() + SESSION_MAX_AGE * 1000 }; return token }
function findAccount(store: Store, username: string) { return store.accounts[username] || Object.values(store.accounts).find((account) => account.username === username) || null }

export async function GET(request: NextRequest) {
  const store = await readStore(); const account = await currentAccount(request, store); const action = request.nextUrl.searchParams.get("action") || "me"
  if (action === "me") return NextResponse.json({ account: safeAccount(account) })
  if (action === "data") return account ? NextResponse.json({ data: account.data, account: safeAccount(account) }) : NextResponse.json({ error: "Not signed in" }, { status: 401 })
  return NextResponse.json({ error: "Unknown account action" }, { status: 400 })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>; const action = String(body.action || ""); const store = await readStore()
  if (action === "signup") {
    const email = normalizeEmail(body.email); const username = normalizeUsername(body.username); const displayName = String(body.displayName || "").trim(); const pin = String(body.pin || "")
    if (!validEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
    if (!displayName || displayName.length > 40) return NextResponse.json({ error: "Display name must be 1–40 characters." }, { status: 400 })
    if (!validUsername(username)) return NextResponse.json({ error: "Username must be 3–20 characters using letters, numbers, or underscores." }, { status: 400 })
    if (!validPin(pin)) return NextResponse.json({ error: "PIN must contain exactly 4 digits." }, { status: 400 })
    if (Object.values(store.accounts).some((account) => account.email === email)) return NextResponse.json({ error: "That email is already registered." }, { status: 409 })
    if (findAccount(store, username)) return NextResponse.json({ error: "That username is already taken." }, { status: 409 })
    const now = new Date().toISOString(); const credentials = await hashPin(pin); const account: Account = { email, displayName, username, accountCode: generateAccountCode(store), pinSalt: credentials.salt, pinHash: credentials.hash, createdAt: now, updatedAt: now, data: emptyData() }
    store.accounts[username] = account; const token = createSession(store, username); await writeStore(store); const response = NextResponse.json({ account: safeAccount(account), created: true }); setSession(response, token); return response
  }
  if (action === "login") {
    const username = normalizeUsername(body.username); const pin = String(body.pin || ""); const account = findAccount(store, username)
    if (!account || !validPin(pin) || !(await verifyPin(pin, account))) return NextResponse.json({ error: "Incorrect username or PIN." }, { status: 401 })
    const token = createSession(store, account.username); await writeStore(store); const response = NextResponse.json({ account: safeAccount(account), data: account.data }); setSession(response, token); return response
  }
  const account = await currentAccount(request, store); if (!account) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 })
  if (action === "logout") { const token = request.cookies.get(SESSION_COOKIE)?.value; if (token) delete store.sessions[createHash("sha256").update(token).digest("hex")]; await writeStore(store); const response = NextResponse.json({ ok: true }); clearSession(response); return response }
  if (action === "sync") { const incoming = (body.data || {}) as Partial<CloudWatchData>; const current = account.data || emptyData(); account.data = { ...current, ...incoming, watchProgress: { ...(current.watchProgress || {}), ...(incoming.watchProgress || {}) }, updated_at: new Date().toISOString() }; account.updatedAt = account.data.updated_at; await writeStore(store); return NextResponse.json({ data: account.data, syncedAt: account.updatedAt }) }
  return NextResponse.json({ error: "Unknown account action" }, { status: 400 })
}
