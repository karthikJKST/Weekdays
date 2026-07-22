import { Route, SearchX } from 'lucide-react'

interface EmptyTimelineProps {
  type?: 'empty' | 'no-results'
  onClearFilters?: () => void
}

export function EmptyTimeline({ type = 'empty', onClearFilters }: EmptyTimelineProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-slate-800/60">
          <SearchX size={28} className="text-slate-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-300">No matching items</p>
          <p className="mt-1 text-xs text-slate-500">Try adjusting your search or filters.</p>
        </div>
        {onClearFilters && (
          <button onClick={onClearFilters} className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-600">Clear filters</button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="grid size-20 place-items-center rounded-2xl bg-indigo-500/10">
        <Route size={40} className="text-indigo-400" />
      </div>
      <div>
        <p className="text-lg font-medium text-slate-200">No timeline data</p>
        <p className="mt-1 text-sm text-slate-500">Create projects and tasks to see them on the timeline.</p>
      </div>
    </div>
  )
}
