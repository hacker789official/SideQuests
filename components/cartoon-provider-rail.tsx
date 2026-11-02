import { ExternalLink, ShieldCheck } from "lucide-react"

const providers = [
  { name: "YouTube Kids", kind: "Free · multilingual channels", href: "https://www.youtube.com/kids/" },
  { name: "PBS KIDS", kind: "Free · kids shows", href: "https://pbskids.org/video/" },
  { name: "Tubi Kids", kind: "Free with ads · region dependent", href: "https://tubitv.com/category/kids_shows" },
  { name: "Pluto TV Kids & Family", kind: "Free · live and on-demand", href: "https://pluto.tv/" },
  { name: "Disney+", kind: "Subscription · region dependent", href: "https://www.disneyplus.com/" },
  { name: "Cartoon Network", kind: "Official network videos", href: "https://www.cartoonnetwork.com/" },
  { name: "Crunchyroll", kind: "Subscription · animation and anime", href: "https://www.crunchyroll.com/" },
]

export function CartoonProviderRail() {
  return (
    <section className="space-y-4" aria-labelledby="cartoon-providers-title">
      <div className="sidequests-section-heading">
        <div>
          <p>Official destinations</p>
          <h2 id="cartoon-providers-title">Cartoon watch options</h2>
        </div>
        <span className="hidden items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 sm:flex"><ShieldCheck className="size-3.5" /> Safer links</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {providers.map((provider) => (
          <a key={provider.name} href={provider.href} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-cyan-300/15 bg-[#0b2038]/80 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-cyan-300/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-100">{provider.name}</h3>
                <p className="mt-1 text-[11px] leading-5 text-slate-400">{provider.kind}</p>
              </div>
              <ExternalLink className="size-4 shrink-0 text-cyan-300/60" />
            </div>
          </a>
        ))}
      </div>
      <p className="text-[11px] leading-5 text-muted-foreground">Availability, languages, subscriptions, and geographic access are controlled by each official provider. SideQuests does not scrape or proxy their playback.</p>
    </section>
  )
}
