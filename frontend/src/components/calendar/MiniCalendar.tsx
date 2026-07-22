import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { getDaysInMonth, getFirstDayOfMonth, isSameDay, formatMonthYear } from '../../types/calendar'

interface MiniCalendarProps {
  year: number
  month: number
  selectedDate: Date
  onSelectDate: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function MiniCalendar({ year, month, selectedDate, onSelectDate, onPrevMonth, onNextMonth }: MiniCalendarProps) {
  const days = useMemo(() => {
    const totalDays = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const result: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) result.push(null)
    for (let d = 1; d <= totalDays; d++) result.push(d)
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [year, month])

  const today = new Date()

  return (
    <div className="rounded-xl border border-slate-800/60 bg-[#121827] p-3">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onPrevMonth} className="grid size-6 place-items-center rounded text-slate-500 hover:text-slate-300" aria-label="Previous month">
          <ChevronLeft size={13} />
        </button>
        <span className="text-xs font-medium text-slate-300">{formatMonthYear(year, month)}</span>
        <button onClick={onNextMonth} className="grid size-6 place-items-center rounded text-slate-500 hover:text-slate-300" aria-label="Next month">
          <ChevronRight size={13} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-medium text-slate-600">{d}</div>
        ))}
        {days.map((d, i) => {
          const date = d !== null ? new Date(year, month, d) : null
          const isSelected = date && isSameDay(date, selectedDate)
          const isToday = date && isSameDay(date, today)
          return (
            <button key={i} disabled={d === null}
              onClick={() => date && onSelectDate(date)}
              className={`py-1 text-center text-[11px] transition rounded ${
                isSelected ? 'bg-indigo-500 text-white font-medium' :
                isToday ? 'text-indigo-400 font-medium' :
                d !== null ? 'text-slate-400 hover:bg-slate-800/60' : 'text-transparent'
              }`}
            >
              {d ?? ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}
