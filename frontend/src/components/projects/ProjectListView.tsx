import { FolderKanban, MoreHorizontal, Edit3, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Project } from '../../types/project'
import { PRIORITY_LABELS } from '../../types/project'
import { Card } from '../ui/Card'
import { ProjectStatusBadge } from './ProjectStatusBadge'

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
}

const PROJECT_DOT: Record<string, string> = {
  indigo: 'bg-indigo-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  violet: 'bg-violet-400',
  rose: 'bg-rose-400',
  cyan: 'bg-cyan-400',
  sky: 'bg-sky-400',
  orange: 'bg-orange-400',
}

interface ProjectListViewProps {
  projects: Project[]
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
}

export function ProjectListView({ projects, onEdit, onDelete }: ProjectListViewProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {/* Table header */}
      <div className="hidden grid-cols-[2fr_1fr_1fr_1.5fr_80px_40px] gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-600 lg:grid">
        <span>Project</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Progress</span>
        <span className="text-right">Tasks</span>
        <span />
      </div>

      {projects.length === 0 && (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <FolderKanban size={36} className="text-slate-700" />
            <p className="text-sm text-slate-500">No projects yet. Create one to get started.</p>
          </div>
        </Card>
      )}

      {projects.map((project) => {
        const pct =
          project.taskCount > 0
            ? Math.round((project.completedTaskCount / project.taskCount) * 100)
            : 0

        return (
          <Card
            key={project.id}
            padding="md"
            className="group grid-cols-[2fr_1fr_1fr_1.5fr_80px_40px] items-center gap-4 transition hover:border-slate-700/80 lg:grid"
          >
            {/* Name */}
            <div className="flex items-center gap-3">
              <span
                className={`size-2.5 shrink-0 rounded-full ${PROJECT_DOT[project.color] || 'bg-slate-500'}`}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-200">{project.name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{project.description}</p>
              </div>
            </div>

            {/* Status */}
            <ProjectStatusBadge status={project.status} />

            {/* Priority */}
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${PRIORITY_COLORS[project.priority] || 'bg-slate-500'}`} />
              <span className="text-sm text-slate-400">{PRIORITY_LABELS[project.priority]}</span>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="h-2 w-full max-w-32 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-slate-500">{pct}%</span>
            </div>

            {/* Tasks */}
            <span className="text-right text-sm text-slate-400">
              {project.completedTaskCount}/{project.taskCount}
            </span>

            {/* Actions */}
            <div className="relative flex justify-end">
              {(onEdit || onDelete) && (
                <>
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}
                    className="grid size-7 place-items-center rounded-lg text-slate-600 opacity-0 transition hover:bg-slate-800/60 hover:text-slate-400 group-hover:opacity-100"
                    aria-label="Actions"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  {menuOpenId === project.id && (
                    <div className="absolute right-0 top-full z-10 mt-1 w-36 origin-top-right rounded-xl border border-slate-800 bg-[#121827] p-1 shadow-2xl shadow-black/40">
                      {onEdit && (
                        <button
                          onClick={() => { setMenuOpenId(null); onEdit(project) }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => { setMenuOpenId(null); onDelete(project) }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
