interface TaskSkeletonProps {
  count?: number
}

export function TaskSkeleton({ count = 8 }: TaskSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-800/60 bg-[#0e1421] p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="h-5 w-20 rounded-full bg-slate-800" />
            <div className="h-5 w-14 rounded-full bg-slate-800" />
          </div>
          <div className="mt-3 h-4 w-3/4 rounded-lg bg-slate-800" />
          <div className="mt-2 h-3 w-full rounded-lg bg-slate-800" />
          <div className="mt-4 flex items-center gap-2">
            <div className="size-6 rounded-full bg-slate-800" />
            <div className="h-3 w-24 rounded-lg bg-slate-800" />
          </div>
          <div className="mt-3 flex gap-1.5">
            <div className="h-4 w-12 rounded-md bg-slate-800" />
            <div className="h-4 w-16 rounded-md bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  )
}
