import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-8 pb-12">
      <Skeleton className="h-[85vh] min-h-[700px] w-full -mt-4 border-b border-zinc-900/50" />
      <div className="container space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="flex flex-wrap">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="basis-1/2 rounded-md pb-4 pr-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <Skeleton className="aspect-poster w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
