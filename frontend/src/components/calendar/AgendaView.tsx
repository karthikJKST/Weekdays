import { useMemo, useState } from 'react'
import type { CalendarEvent } from '../../types/calendar'
import { isSameDay, formatDateShort } from '../../types/calendar'
import { CalendarEventChip } from './CalendarEvent'

interface AgendaViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

export function AgendaView({ events, onEventClick }: AgendaViewProps) {
  const [visibleCount, setVisibleCount] = useState(20)

  const sortedEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Group events: today, tomorrow, this week, later
    const future = events
      .filter((e) => new Date(e.startDate) >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    return future
  }, [events])

  const visibleEvents = sortedEvents.slice(0, visibleCount)

  // Group by day
  const grouped = useMemo(() => {
    const groups: { date: Date; label: string; events: CalendarEvent[] }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const event of visibleEvents) {
      const date = new Date(event.startDate)
      date.setHours(0, 0, 0, 0)
      const lastGroup = groups[groups.length - 1]

      let label: string
      if (isSameDay(date, today)) label = 'Today'
      else if (isSameDay(date, new Date(today.getTime() + 86400000))) label = 'Tomorrow'
      else label = formatDateShort(date)

      if (lastGroup && lastGroup.label === label) {
        lastGroup.events.push(event)
      } else {
        groups.push({ date, label, events: [event] })
      }
    }
    return groups
  }, [visibleEvents])

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-slate-500">No events to show.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-medium text-slate-300">{group.label}</h3>
            <div className="flex-1 h-px bg-slate-800/60" />
            <span className="text-[11px] text-slate-600">{group.events.length}</span>
          </div>
          <div className="space-y-2">
            {group.events.map((event) => (
              <div key={event.id} className="flex items-center gap-4">
                {event.type === 'meeting' && event.endDate ? (
                  <span className="w-16 shrink-0 text-right text-[10px] text-slate-600">
                    {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                ) : (
                  <span className="w-16 shrink-0" />
                )}
                <div className="flex-1">
                  <CalendarEventChip event={event} onClick={onEventClick} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {sortedEvents.length > visibleCount && (
        <div className="flex justify-center pt-2">
          <button onClick={() => setVisibleCount((c) => c + 20)}
            className="rounded-xl border border-slate-700/60 px-6 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300">
            Show more ({sortedEvents.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
