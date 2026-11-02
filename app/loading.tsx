export default function Loading() {
  return (
    <main className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#060b12]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.14),transparent_38%)]" />
      <div className="relative flex flex-col items-center gap-5 px-8 text-center">
        <div className="relative size-40 overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[#071a2d] shadow-[0_0_70px_rgba(34,211,238,0.2)] sm:size-48">
          <img
            src="/sidequests-splash.png"
            alt=""
            className="size-full object-cover object-center"
          />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.42em] text-cyan-200">SideQuests</p>
          <p className="mt-2 text-[11px] font-medium tracking-wide text-zinc-500">Preparing your next detour</p>
        </div>
      </div>
    </main>
  )
}
