import { useMemo } from 'react'
import type { CalendarEvent } from '../../types/calendar'
import { isSameDay } from '../../types/calendar'
import { CalendarEventChip } from './CalendarEvent'

interface DayViewProps {
  selectedDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function DayView({ selectedDate, events, onEventClick }: DayViewProps) {
  const dayEvents = useMemo(
    () => events.filter((e) => isSameDay(new Date(e.startDate), selectedDate)),
    [events, selectedDate],
  )

  const today = new Date()
  const nowHours = today.getHours() + today.getMinutes() / 60
  const isToday = isSameDay(today, selectedDate)

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-[#0e1421] overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-800/60 px-4 py-3">
        <p className="text-lg font-semibold text-slate-100">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-xs text-slate-500">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Timeline */}
      <div className="overflow-y-auto max-h-[700px] relative">
        <div className="relative">
          {HOURS.map((hour) => {
            const hourEvents = dayEvents.filter((e) => new Date(e.startDate).getHours() === hour)
            return (
              <div key={hour} className="flex border-b border-slate-800/30 last:border-b-0">
                <div className="w-20 shrink-0 border-r border-slate-800/30 px-3 py-4 text-right text-xs text-slate-600">
                  {hour === 0 ? '' : new Date(0, 0, 0, hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                </div>
                <div className="flex-1 min-h-[72px] p-1.5 space-y-1">
                  {hourEvents.map((event) => (
                    <CalendarEventChip key={event.id} event={event} onClick={onEventClick} />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Current time line */}
          {isToday && (
            <div className="absolute left-20 right-0 z-10 pointer-events-none" style={{ top: `${(nowHours / 24) * 100}%` }}>
              <div className="flex items-center">
                <span className="size-2.5 rounded-full bg-red-500 shrink-0 -ml-[5px]" />
                <div className="flex-1 h-0.5 bg-red-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
