import { MessageSquare, CheckSquare, GitCommit } from 'lucide-react'
import type { TaskComment } from '../../types/task'
import type { ReactNode } from 'react'

interface TaskActivityTimelineProps {
  comments: TaskComment[]
  updatedAt: string
  checklistCompleted: number
  checklistTotal: number
}

interface TimelineEvent {
  id: string
  icon: typeof MessageSquare
  text: string | ReactNode
  time: string
  color: string
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function TaskActivityTimeline({ comments, updatedAt, checklistCompleted, checklistTotal }: TaskActivityTimelineProps) {
  const events: TimelineEvent[] = []

  events.push({
    id: 'created',
    icon: GitCommit,
    text: 'Task was created',
    time: relativeTime(updatedAt),
    color: 'text-indigo-400',
  })

  if (checklistTotal > 0) {
    events.push({
      id: 'checklist',
      icon: CheckSquare,
      text: `${checklistCompleted}/${checklistTotal} checklist items completed`,
      time: relativeTime(updatedAt),
      color: 'text-emerald-400',
    })
  }

  comments.forEach((c) => {
    events.push({
      id: c.id,
      icon: MessageSquare,
      text: `${c.author} commented`,
      time: relativeTime(c.createdAt),
      color: 'text-sky-400',
    })
  })

  if (events.length === 0) {
    return <p className="text-sm text-slate-500">No activity yet.</p>
  }

  return (
    <div className="relative space-y-0">
      {events.map((event, i) => (
        <div key={event.id} className="relative flex gap-4 pb-5 last:pb-0">
          {i < events.length - 1 && (
            <div className="absolute left-[11px] top-6 h-full w-px bg-slate-800" />
          )}
          <div className={`relative z-10 mt-0.5 ${event.color}`}>
            <event.icon size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">
              {event.text}
            </p>
            <p className="mt-0.5 text-xs text-slate-600">{event.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
