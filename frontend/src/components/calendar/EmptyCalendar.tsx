import { Calendar, SearchX, Plus } from 'lucide-react'

interface EmptyCalendarProps {
  type?: 'empty' | 'no-results' | 'no-upcoming'
  onCreateClick?: () => void
  onClearFilters?: () => void
}

export function EmptyCalendar({ type = 'empty', onCreateClick, onClearFilters }: EmptyCalendarProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-slate-800/60">
          <SearchX size={28} className="text-slate-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-300">No matching events</p>
          <p className="mt-1 max-w-xs text-xs text-slate-500">Try adjusting your search or filters to find what you&apos;re looking for.</p>
        </div>
        {onClearFilters && (
          <button onClick={onClearFilters} className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-600">Clear filters</button>
        )}
      </div>
    )
  }

  if (type === 'no-upcoming') {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Calendar size={24} className="text-slate-700" />
        <p className="text-sm text-slate-500">No upcoming events</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="grid size-20 place-items-center rounded-2xl bg-indigo-500/10">
        <Calendar size={40} className="text-indigo-400" />
      </div>
      <div>
        <p className="text-lg font-medium text-slate-200">Schedule your first event</p>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
          Plan sprints, set milestones, schedule meetings, and keep your team aligned on one shared calendar.
        </p>
      </div>
      {onCreateClick && (
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
        >
          <Plus size={16} />
          Schedule an event
        </button>
      )}
    </div>
  )
}
