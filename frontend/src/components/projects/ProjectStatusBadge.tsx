import type { ProjectStatus } from '../../types/project'
import { STATUS_LABELS } from '../../types/project'

const STATUS_STYLES: Record<ProjectStatus, string> = {
  backlog: 'bg-slate-800/60 text-slate-400',
  in_progress: 'bg-indigo-500/10 text-indigo-400',
  review: 'bg-amber-500/10 text-amber-400',
  done: 'bg-emerald-500/10 text-emerald-400',
}

interface ProjectStatusBadgeProps {
  status: ProjectStatus
  size?: 'sm' | 'md'
}

export function ProjectStatusBadge({ status, size = 'sm' }: ProjectStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        STATUS_STYLES[status]
      } ${size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'}`}
    >
      <span
        className={`rounded-full ${
          size === 'sm' ? 'size-1.5' : 'size-2'
        } ${status === 'backlog' ? 'bg-slate-400' : status === 'in_progress' ? 'bg-indigo-400' : status === 'review' ? 'bg-amber-400' : 'bg-emerald-400'}`}
      />
      {STATUS_LABELS[status]}
    </span>
  )
}
