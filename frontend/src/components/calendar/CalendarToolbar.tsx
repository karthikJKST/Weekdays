import { Search, X } from 'lucide-react'
import type { CalendarView } from '../../types/calendar'

interface CalendarToolbarProps {
  view: CalendarView
  searchQuery: string
  onViewChange: (view: CalendarView) => void
  onSearchChange: (q: string) => void
  showTasks: boolean
  showProjects: boolean
  showMeetings: boolean
  showMilestones: boolean
  showReminders: boolean
  onToggleFilter: (key: 'tasks' | 'projects' | 'meetings' | 'milestones' | 'reminders') => void
}

const VIEWS: { key: CalendarView; label: string; shortcut: string }[] = [
  { key: 'month', label: 'Month', shortcut: 'M' },
  { key: 'week', label: 'Week', shortcut: 'W' },
  { key: 'day', label: 'Day', shortcut: 'D' },
  { key: 'agenda', label: 'Agenda', shortcut: 'A' },
]

export function CalendarToolbar({
  view, searchQuery, onViewChange, onSearchChange,
  showTasks, showProjects, showMeetings, showMilestones, showReminders, onToggleFilter,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* View toggle */}
      <div className="flex overflow-hidden rounded-xl border border-slate-700/60 bg-[#121827] p-0.5">
        {VIEWS.map((v) => (
          <button key={v.key} onClick={() => onViewChange(v.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${view === v.key ? 'bg-indigo-500/15 text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            aria-label={`${v.label} view (${v.shortcut})`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events…" className="w-full rounded-xl border border-slate-700/60 bg-[#121827] py-1.5 pl-8 pr-7 text-xs text-slate-200 placeholder-slate-600 caret-indigo-400 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50" />
        {searchQuery && <button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"><X size={13} /></button>}
      </div>

      {/* Type filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {([['tasks', showTasks], ['projects', showProjects], ['meetings', showMeetings], ['milestones', showMilestones], ['reminders', showReminders]] as const).map(([key, active]) => (
          <button key={key} onClick={() => onToggleFilter(key)}
            className={`rounded-lg px-2 py-1 text-[10px] font-medium transition capitalize ${active ? 'bg-indigo-500/15 text-indigo-300' : 'bg-slate-800/60 text-slate-500 hover:bg-slate-700/60'}`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}
