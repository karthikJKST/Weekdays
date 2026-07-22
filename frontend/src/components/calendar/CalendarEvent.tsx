import { memo, type DragEvent } from 'react'
import type { CalendarEvent as CalendarEventType } from '../../types/calendar'
import { EVENT_TYPE_LABELS } from '../../types/calendar'

interface CalendarEventProps {
  event: CalendarEventType
  onClick: (event: CalendarEventType) => void
  compact?: boolean
  onDragStart?: (e: DragEvent<HTMLDivElement>, event: CalendarEventType) => void
}

const TYPE_BORDER: Record<string, string> = {
  task: 'border-l-indigo-500',
  'project-deadline': 'border-l-rose-500',
  meeting: 'border-l-emerald-500',
  milestone: 'border-l-amber-500',
  reminder: 'border-l-sky-500',
}

const TYPE_DOT: Record<string, string> = {
  task: 'bg-indigo-500',
  'project-deadline': 'bg-rose-500',
  meeting: 'bg-emerald-500',
  milestone: 'bg-amber-500',
  reminder: 'bg-sky-500',
}

export const CalendarEventChip = memo(function CalendarEventChip({
  event,
  onClick,
  compact = false,
  onDragStart,
}: CalendarEventProps) {
  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (e) => onDragStart(e, event) : undefined}
      onClick={(e) => { e.stopPropagation(); onClick(event) }}
      className={`group cursor-pointer rounded-md border ${TYPE_BORDER[event.type] || 'border-l-slate-500'} bg-[#121827] px-2 py-1 text-xs transition hover:bg-slate-800/60 hover:shadow-sm ${compact ? 'truncate' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`${EVENT_TYPE_LABELS[event.type]}: ${event.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(event) }}
    >
      <div className="flex items-center gap-1.5">
        <span className={`size-1.5 shrink-0 rounded-full ${TYPE_DOT[event.type] || 'bg-slate-500'}`} />
        <span className="truncate font-medium text-slate-200">{event.title}</span>
        {event.type === 'meeting' && event.endDate && (
          <span className="shrink-0 text-[10px] text-slate-500">
            {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
      </div>
      {!compact && event.type !== 'meeting' && event.project && (
        <p className="mt-0.5 truncate text-[10px] text-slate-500">{event.project}</p>
      )}
    </div>
  )
})
