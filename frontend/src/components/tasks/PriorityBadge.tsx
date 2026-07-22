import type { TaskPriority } from '../../types/task'
import { PRIORITY_LABELS } from '../../types/task'

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  none: 'bg-slate-800/60 text-slate-500',
  low: 'bg-slate-800/60 text-slate-400',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
}

const PRIORITY_DOTS: Record<TaskPriority, string> = {
  none: 'bg-slate-600',
  low: 'bg-slate-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
}

interface PriorityBadgeProps {
  priority: TaskPriority
  size?: 'sm' | 'md'
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  if (priority === 'none') return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        PRIORITY_STYLES[priority]
      } ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}`}
    >
      <span className={`size-1.5 rounded-full ${PRIORITY_DOTS[priority]}`} />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
