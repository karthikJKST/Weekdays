import { useMemo } from 'react'
import type { CalendarEvent } from '../../types/calendar'
import { isSameDay } from '../../types/calendar'
import { CalendarEventChip } from './CalendarEvent'

interface WeekViewProps {
  selectedDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function WeekView({ selectedDate, events, onEventClick }: WeekViewProps) {
  const weekStart = useMemo(() => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    return d
  }, [selectedDate])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  const today = new Date()
  const nowHours = today.getHours() + today.getMinutes() / 60

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-[#0e1421] overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-800/60">
        <div />
        {weekDays.map((d, i) => {
          const isToday = isSameDay(d, today)
          return (
            <div key={i} className={`px-2 py-2.5 text-center ${isToday ? '' : ''}`}>
              <p className="text-[10px] font-medium text-slate-500">{DAYS[i]}</p>
              <p className={`text-sm font-semibold ${isToday ? 'flex size-7 items-center justify-center rounded-full bg-indigo-500 text-white mx-auto' : 'text-slate-300'}`}>
                {d.getDate()}
              </p>
            </div>
          )
        })}
      </div>

      {/* Body */}
      <div className="overflow-y-auto max-h-[600px] relative">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              <div className="border-b border-slate-800/30 px-2 py-3 text-right text-[10px] text-slate-600">
                {hour === 0 ? '' : new Date(0, 0, 0, hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
              </div>
              {weekDays.map((d, dayIdx) => {
                const dayEvents = events.filter((e) => isSameDay(new Date(e.startDate), d))
                const hourEvents = dayEvents.filter((e) => new Date(e.startDate).getHours() === hour)
                return (
                  <div key={dayIdx} className="border-b border-l border-slate-800/30 min-h-[60px] p-0.5 relative">
                    {hourEvents.map((event) => (
                      <CalendarEventChip key={event.id} event={event} onClick={onEventClick} compact />
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
          {/* Current time line */}
          {isSameDay(today, selectedDate) && (
            <div className="absolute left-[60px] right-0 z-10 pointer-events-none" style={{ top: `${(nowHours / 24) * 100}%` }}>
              <div className="flex items-center">
                <span className="size-2 rounded-full bg-red-500" />
                <div className="flex-1 h-px bg-red-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
