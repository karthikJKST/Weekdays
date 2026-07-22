interface ProjectSkeletonProps {
  count?: number
}

export function ProjectSkeleton({ count = 6 }: ProjectSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-800/60 bg-[#0e1421] p-5"
        >
          {/* Top row: avatar + badge */}
          <div className="flex items-start justify-between">
            <div className="size-10 rounded-xl bg-slate-800" />
            <div className="h-5 w-20 rounded-full bg-slate-800" />
          </div>

          {/* Title */}
          <div className="mt-4 h-4 w-3/4 rounded-lg bg-slate-800" />

          {/* Description lines */}
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full rounded-lg bg-slate-800" />
            <div className="h-3 w-2/3 rounded-lg bg-slate-800" />
          </div>

          {/* Due date */}
          <div className="mt-4 flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-slate-800" />
            <div className="h-3 w-24 rounded-lg bg-slate-800" />
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded-lg bg-slate-800" />
              <div className="h-3 w-8 rounded-lg bg-slate-800" />
            </div>
            <div className="mt-1.5 h-2 w-full rounded-full bg-slate-800" />
          </div>

          {/* Bottom row: avatars + task count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex">
              <div className="size-7 rounded-full bg-slate-800 ring-2 ring-[#0e1421]" />
              <div className="-ml-2 size-7 rounded-full bg-slate-800 ring-2 ring-[#0e1421]" />
              <div className="-ml-2 size-7 rounded-full bg-slate-800 ring-2 ring-[#0e1421]" />
            </div>
            <div className="h-3 w-14 rounded-lg bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  )
}
