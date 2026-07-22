import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { ProjectHealth } from '../../types/analytics'

const COLOR_HEX: Record<string, string> = {
  indigo: '#6366f1',
  emerald: '#10b981',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  rose: '#f43f5e',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  orange: '#f97316',
  slate: '#64748b',
}

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
}

interface ProjectHealthListProps {
  projects: ProjectHealth[]
}

export function ProjectHealthList({ projects }: ProjectHealthListProps) {
  return (
    <div className="space-y-1">
      {projects.map((p) => (
        <div
          key={p.id}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-800/30"
        >
          {/* Color dot */}
          <div
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: COLOR_HEX[p.color] ?? '#6366f1' }}
          />

          {/* Name + status */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{p.name}</p>
            <p className="text-[11px] text-slate-500">{STATUS_LABELS[p.status] ?? p.status}</p>
          </div>

          {/* Tasks */}
          <span className="text-xs text-slate-600">{p.totalTasks} tasks</span>

          {/* Progress bar */}
          <div className="w-24">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-600">{p.completion}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  p.completion === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${p.completion}%` }}
              />
            </div>
          </div>

          {/* Overdue indicator */}
          {p.overdueTasks > 0 ? (
            <span className="flex items-center gap-1 text-[11px] text-red-400 shrink-0">
              <AlertCircle size={12} />
              {p.overdueTasks} overdue
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 shrink-0">
              <CheckCircle2 size={12} />
              On track
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
