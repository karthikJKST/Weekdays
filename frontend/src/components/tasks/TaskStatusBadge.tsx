import type { TaskStatus } from '../../types/task'
import { STATUS_LABELS } from '../../types/task'

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-slate-800/60 text-slate-400',
  in_progress: 'bg-indigo-500/10 text-indigo-400',
  in_review: 'bg-amber-500/10 text-amber-400',
  done: 'bg-emerald-500/10 text-emerald-400',
}

const STATUS_DOTS: Record<TaskStatus, string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-indigo-400',
  in_review: 'bg-amber-400',
  done: 'bg-emerald-400',
}

interface TaskStatusBadgeProps {
  status: TaskStatus
  size?: 'sm' | 'md'
}

export function TaskStatusBadge({ status, size = 'sm' }: TaskStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        STATUS_STYLES[status]
      } ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}`}
    >
      <span className={`size-1.5 rounded-full ${STATUS_DOTS[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}
