import Link from "next/link"

export const metadata = { title: "Install SideQuests" }

export default function PwaInstallPage() {
  return (
    <main className="container flex min-h-[70vh] max-w-3xl flex-col justify-center space-y-8 py-16">
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">SideQuests app</p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">Install once. Browse without browser chrome.</h1>
        <p className="max-w-2xl text-muted-foreground">SideQuests is a Progressive Web App. It installs directly from this website and does not add third-party pop-ups or advertising windows.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-300/15 bg-[#0b2038]/80 p-4"><h2 className="font-bold">Android / Chrome</h2><p className="mt-2 text-sm text-muted-foreground">Open the browser menu and choose “Install app” or “Add to Home screen”.</p></div>
        <div className="rounded-2xl border border-cyan-300/15 bg-[#0b2038]/80 p-4"><h2 className="font-bold">iPhone / iPad</h2><p className="mt-2 text-sm text-muted-foreground">Tap Share in Safari, then choose “Add to Home Screen”.</p></div>
        <div className="rounded-2xl border border-cyan-300/15 bg-[#0b2038]/80 p-4"><h2 className="font-bold">Desktop</h2><p className="mt-2 text-sm text-muted-foreground">Use the install icon in the address bar or the browser menu.</p></div>
      </div>
      <Link href="/" className="inline-flex w-fit rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Back to SideQuests</Link>
    </main>
  )
}
