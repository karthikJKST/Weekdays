import { useMemo, useCallback, memo, type DragEvent } from 'react'
import type { CalendarEvent } from '../../types/calendar'
import { isSameDay, getDaysInMonth, getFirstDayOfMonth } from '../../types/calendar'
import { CalendarEventChip } from './CalendarEvent'

interface MonthViewProps {
  year: number
  month: number
  events: CalendarEvent[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onEventDrop?: (event: CalendarEvent, newDate: Date) => void
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const MonthView = memo(function MonthView({
  year, month, events, selectedDate, onSelectDate, onEventClick, onEventDrop,
}: MonthViewProps) {
  const today = new Date()

  const days = useMemo(() => {
    const totalDays = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const d: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) d.push(null)
    for (let i = 1; i <= totalDays; i++) d.push(i)
    return d
  }, [year, month])

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>()
    for (const event of events) {
      const date = new Date(event.startDate)
      if (date.getMonth() === month || event.endDate) {
        const day = date.getDate()
        const existing = map.get(day) || []
        existing.push(event)
        map.set(day, existing)
      }
    }
    return map
  }, [events, month])

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, event: CalendarEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: event.id, type: event.type }))
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDayDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDayDrop = useCallback((e: DragEvent<HTMLDivElement>, day: number) => {
    e.preventDefault()
    if (!onEventDrop) return
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      const event = events.find((ev) => ev.id === data.id)
      if (event) {
        const newDate = new Date(year, month, day)
        onEventDrop(event, newDate)
      }
    } catch { /* ignore */ }
  }, [events, year, month, onEventDrop])

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-[#0e1421] overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-800/60">
        {DAY_NAMES.map((d) => (
          <div key={d} className="px-2 py-2.5 text-center text-xs font-medium text-slate-500">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const isCurrentMonth = day !== null
          const date = isCurrentMonth ? new Date(year, month, day) : null
          const isToday = date && isSameDay(date, today)
          const isSelected = date && isSameDay(date, selectedDate)
          const dayEvents = isCurrentMonth ? (eventsByDay.get(day) || []) : []
          const maxVisible = 3

          return (
            <div
              key={i}
              onClick={() => date && onSelectDate(date)}
              onDragOver={handleDayDragOver}
              onDrop={(e) => isCurrentMonth && handleDayDrop(e, day!)}
              className={`min-h-24 border-b border-r border-slate-800/40 p-1.5 transition cursor-pointer ${
                isSelected ? 'bg-indigo-500/5' : isCurrentMonth ? 'hover:bg-slate-800/20' : 'bg-slate-900/50'
              } ${i % 7 === 6 ? 'border-r-0' : ''}`}
            >
              <span className={`text-xs font-medium ${isToday ? 'flex size-6 items-center justify-center rounded-full bg-indigo-500 text-white' : isCurrentMonth ? 'text-slate-400' : 'text-slate-700'}`}>
                {day ?? ''}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, maxVisible).map((event) => (
                  <CalendarEventChip key={event.id} event={event} onClick={onEventClick} compact onDragStart={handleDragStart} />
                ))}
                {dayEvents.length > maxVisible && (
                  <button className="w-full text-left text-[10px] text-slate-600 hover:text-slate-400 transition px-1" onClick={(e) => { e.stopPropagation(); /* could expand */ }}>
                    +{dayEvents.length - maxVisible} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
