import { useEffect, useState } from "react"
import { getCurrentSession } from "@/lib/auth"

type AuthSession = Awaited<ReturnType<typeof getCurrentSession>>

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void getCurrentSession().then((current) => {
      if (active) { setSession(current); setLoading(false) }
    })
    const refresh = () => void getCurrentSession().then((current) => { if (active) setSession(current) })
    window.addEventListener("ACCOUNT_SESSION_UPDATED", refresh)
    return () => { active = false; window.removeEventListener("ACCOUNT_SESSION_UPDATED", refresh) }
  }, [])

  return { session, user: session, loading }
}
