import { CalendarDays, User, Tag, AlertCircle, MessageSquare, CheckSquare, Clock } from 'lucide-react'
import type { CalendarEvent } from '../../types/calendar'
import { EVENT_TYPE_LABELS } from '../../types/calendar'
import { Drawer } from '../ui/Drawer'

interface EventDrawerProps {
  event: CalendarEvent | null
  open: boolean
  onClose: () => void
}

const TYPE_COLORS: Record<string, string> = {
  task: 'bg-indigo-500/10 text-indigo-400',
  'project-deadline': 'bg-rose-500/10 text-rose-400',
  meeting: 'bg-emerald-500/10 text-emerald-400',
  milestone: 'bg-amber-500/10 text-amber-400',
  reminder: 'bg-sky-500/10 text-sky-400',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function EventDrawer({ event, open, onClose }: EventDrawerProps) {
  if (!event) return null

  return (
    <Drawer open={open} onClose={onClose} title={event.title}>
      <div className="space-y-6">
        {/* Type badge */}
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${TYPE_COLORS[event.type] || 'bg-slate-800/60 text-slate-500'}`}>
            {EVENT_TYPE_LABELS[event.type]}
          </span>
          {event.priority && event.priority !== 'none' && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              event.priority === 'urgent' ? 'bg-red-500/10 text-red-400' :
              event.priority === 'high' ? 'bg-orange-500/10 text-orange-400' :
              event.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-slate-800/60 text-slate-500'
            }`}>
              {event.priority}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Description</h3>
            <p className="text-sm leading-relaxed text-slate-300">{event.description}</p>
          </div>
        )}

        {/* Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Details</h3>
          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <CalendarDays size={15} className="shrink-0 text-slate-500" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          {event.endDate && (
            <div className="flex items-center gap-2.5 text-sm text-slate-400">
              <Clock size={15} className="shrink-0 text-slate-500" />
              <span>{formatTime(event.startDate)} – {formatTime(event.endDate)}</span>
            </div>
          )}
          {event.project && (
            <div className="flex items-center gap-2.5 text-sm text-slate-400">
              <Tag size={15} className="shrink-0 text-slate-500" />
              <span>{event.project}</span>
            </div>
          )}
          {event.assignee && (
            <div className="flex items-center gap-2.5 text-sm text-slate-400">
              <User size={15} className="shrink-0 text-slate-500" />
              <span>{event.assignee}</span>
            </div>
          )}
          {event.status && (
            <div className="flex items-center gap-2.5 text-sm text-slate-400">
              <AlertCircle size={15} className="shrink-0 text-slate-500" />
              <span className="capitalize">{event.status.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {/* Labels */}
        {event.labels && event.labels.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Labels</h3>
            <div className="flex flex-wrap gap-1.5">
              {event.labels.map((label) => (
                <span key={label} className="rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium text-slate-400 capitalize">
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Comments</h3>
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-800/50 px-4 py-4 text-center">
            <MessageSquare size={16} className="text-slate-600" />
            <p className="text-xs text-slate-600">No comments yet.</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Checklist</h3>
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-800/50 px-4 py-4 text-center">
            <CheckSquare size={16} className="text-slate-600" />
            <p className="text-xs text-slate-600">No checklist items.</p>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
