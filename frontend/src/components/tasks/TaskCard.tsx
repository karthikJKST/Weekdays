import { memo } from 'react'
import { Calendar, MessageSquare, CheckSquare, Clock } from 'lucide-react'
import type { Task } from '../../types/task'
import { TaskStatusBadge } from './TaskStatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { LABEL_LABELS } from '../../types/task'

const LABEL_STYLES: Record<string, string> = {
  bug: 'bg-red-500/10 text-red-400',
  feature: 'bg-indigo-500/10 text-indigo-400',
  improvement: 'bg-emerald-500/10 text-emerald-400',
  design: 'bg-violet-500/10 text-violet-400',
  documentation: 'bg-sky-500/10 text-sky-400',
  testing: 'bg-amber-500/10 text-amber-400',
  devops: 'bg-rose-500/10 text-rose-400',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface TaskCardProps {
  task: Task
  selected?: boolean
  onSelect?: (id: string) => void
  onClick: (task: Task) => void
}

export const TaskCard = memo(function TaskCard({ task, selected, onSelect, onClick }: TaskCardProps) {
  const completedChecklist = task.checklist.filter((c) => c.completed).length
  const checklistPct = task.checklist.length > 0
    ? Math.round((completedChecklist / task.checklist.length) * 100)
    : null

  const dueDays = task.dueDate
    ? (() => {
        const now = new Date(); now.setHours(0, 0, 0, 0)
        const due = new Date(task.dueDate); due.setHours(0, 0, 0, 0)
        return Math.ceil((due.getTime() - now.getTime()) / 86400000)
      })()
    : null

  return (
    <div
      onClick={() => onClick(task)}
      className={`group relative cursor-pointer rounded-2xl border bg-[#0e1421] p-4 shadow-xl shadow-black/10 transition-all duration-200 hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20 ${
        selected ? 'border-indigo-500/40 ring-1 ring-indigo-500/20' : 'border-slate-800/60'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(task) }}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <div className="absolute left-3 top-3 z-10 opacity-0 transition group-hover:opacity-100">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onSelect(task.id)}
            onClick={(e) => e.stopPropagation()}
            className="size-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/30"
            aria-label={`Select ${task.title}`}
          />
        </div>
      )}

      {/* Badges row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <TaskStatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        {task.assignee && (
          <span
            title={task.assignee.name}
            className="grid size-6 shrink-0 place-items-center rounded-full bg-indigo-500 text-[9px] font-semibold text-white ring-2 ring-slate-800"
          >
            {task.assignee.avatarInitials}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="mt-3 text-sm font-medium leading-snug text-slate-200 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {task.description}
        </p>
      )}

      {/* Meta row */}
      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
        {task.dueDate && (
          <span className={`flex items-center gap-1 ${dueDays !== null && dueDays < 0 ? 'text-red-400' : ''}`}>
            <Calendar size={11} />
            {formatDate(task.dueDate)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {task.spentHours}/{task.estimatedHours}h
        </span>
        {task.comments.length > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare size={11} />
            {task.comments.length}
          </span>
        )}
        {checklistPct !== null && (
          <span className="flex items-center gap-1">
            <CheckSquare size={11} />
            {completedChecklist}/{task.checklist.length}
          </span>
        )}
      </div>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label}
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${LABEL_STYLES[label] || 'bg-slate-800/60 text-slate-500'}`}
            >
              {LABEL_LABELS[label]}
            </span>
          ))}
        </div>
      )}

      {/* Updated timestamp */}
      <div className="mt-3 border-t border-slate-800/40 pt-2 text-[10px] text-slate-600">
        Updated {relativeTime(task.updatedAt)}
      </div>
    </div>
  )
})
