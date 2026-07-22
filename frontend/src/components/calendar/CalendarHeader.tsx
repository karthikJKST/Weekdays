import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarView } from '../../types/calendar'
import { formatMonthYear } from '../../types/calendar'

interface CalendarHeaderProps {
  year: number
  month: number
  view: CalendarView
  selectedDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarHeader({ year, month, view, selectedDate, onPrev, onNext, onToday }: CalendarHeaderProps) {
  const label = view === 'day'
    ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : view === 'week'
      ? `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : formatMonthYear(year, month)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-slate-100">{label}</h2>
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-800/60 bg-[#121827]">
          <button onClick={onPrev} className="grid size-7 place-items-center rounded-l-lg text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-300" aria-label="Previous">
            <ChevronLeft size={15} />
          </button>
          <button onClick={onToday} className="px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-slate-200">Today</button>
          <button onClick={onNext} className="grid size-7 place-items-center rounded-r-lg text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-300" aria-label="Next">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
