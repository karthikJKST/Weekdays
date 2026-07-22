export function CalendarSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-32 rounded-lg bg-slate-800" />
        <div className="h-8 w-24 rounded-lg bg-slate-800" />
        <div className="h-8 w-20 rounded-lg bg-slate-800" />
      </div>
      <div className="grid grid-cols-7 gap-px rounded-2xl border border-slate-800/60 bg-[#0e1421] p-4">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-4 w-full rounded bg-slate-800" />
        ))}
        {Array.from({ length: 35 }, (_, i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-800/50" />
        ))}
      </div>
    </div>
  )
}
