export function TimelineSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-32 rounded-lg bg-slate-800" />
        <div className="h-8 w-20 rounded-lg bg-slate-800" />
      </div>
      <div className="rounded-2xl border border-slate-800/60 bg-[#0e1421] p-4 space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-40 rounded bg-slate-800" />
            <div className="flex-1 h-6 rounded-lg bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
