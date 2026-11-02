import Link from "next/link"
import { ArrowUpRight, Mail, Sparkles } from "lucide-react"

export const metadata = {
  title: "Contact & Credits",
  description: "Contact and creator credits for SideQuests.",
}

export default function ContactPage() {
  return (
    <main className="container relative min-h-[70vh] py-16 md:py-24">
      <div className="pointer-events-none absolute -right-24 top-8 size-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-8 size-72 rounded-full bg-accent/10 blur-3xl" />

      <section className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/20 bg-white/[0.035] p-6 shadow-2xl shadow-primary/5 backdrop-blur-xl md:p-12">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-accent" />

        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
            <Mail className="size-3.5" />
            Contact & credits
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">SideQuests original</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">
            Built for the next great detour.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
            SideQuests is a cinematic discovery platform for the stories you want to find, follow, and return to. This space is also the creator credit for the project.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles className="size-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Created by</span>
            </div>
            <h2 className="mt-4 text-2xl font-black text-white">Arnav Rana</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Explore the creator’s work, experiments, and other projects through the personal portfolio.
            </p>
            <a
              href="https://arnavrana.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
            >
              Visit Arnav’s portfolio
              <ArrowUpRight className="size-4" />
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Platform note</p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              SideQuests brings discovery, synced watch progress, anime playback, and manga reading into one focused home for media.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent transition hover:text-white"
            >
              Return to SideQuests
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
