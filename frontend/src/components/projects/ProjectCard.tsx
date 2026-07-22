import { Calendar, MoreHorizontal, Edit3, Trash2, Users } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Project } from '../../types/project'
import { ProjectStatusBadge } from './ProjectStatusBadge'

const PROJECT_GRADIENT: Record<string, string> = {
  indigo: 'from-indigo-500/20 to-indigo-500/5',
  emerald: 'from-emerald-500/20 to-emerald-500/5',
  amber: 'from-amber-500/20 to-amber-500/5',
  violet: 'from-violet-500/20 to-violet-500/5',
  rose: 'from-rose-500/20 to-rose-500/5',
  cyan: 'from-cyan-500/20 to-cyan-500/5',
  sky: 'from-sky-500/20 to-sky-500/5',
  orange: 'from-orange-500/20 to-orange-500/5',
}

const AVATAR_COLORS: string[] = [
  'bg-indigo-500 text-indigo-100',
  'bg-emerald-500 text-emerald-100',
  'bg-amber-500 text-amber-100',
  'bg-violet-500 text-violet-100',
  'bg-rose-500 text-rose-100',
  'bg-cyan-500 text-cyan-100',
  'bg-sky-500 text-sky-100',
  'bg-orange-500 text-orange-100',
]

function getAvatarColor(seed: string): string {
  const index = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(dateStr: string): number | null {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const due = new Date(dateStr); due.setHours(0, 0, 0, 0)
  const diff = due.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const pct = project.taskCount > 0
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0

  const gradient = PROJECT_GRADIENT[project.color] || 'from-indigo-500/20 to-indigo-500/5'
  const dueDays = project.dueDate ? daysUntil(project.dueDate) : null

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/60 bg-[#0e1421] shadow-xl shadow-black/10 transition-all duration-200 hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20">
      {/* Color accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        {/* Header row: status badge + menu */}
        <div className="flex items-start justify-between">
          <ProjectStatusBadge status={project.status} />
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="grid size-7 place-items-center rounded-lg text-slate-600 opacity-0 transition hover:bg-slate-800/60 hover:text-slate-400 group-hover:opacity-100"
              aria-label="Project actions"
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 origin-top-right rounded-xl border border-slate-800 bg-[#121827] p-1 shadow-2xl shadow-black/40">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(project) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(project) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project name */}
        <h3 className="mt-4 text-base font-semibold text-slate-100">{project.name}</h3>

        {/* Description */}
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {project.description}
        </p>

        {/* Due date */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar size={13} />
          <span>{formatDate(project.dueDate)}</span>
          {dueDays !== null && dueDays >= 0 && (
            <span className="ml-1 text-slate-600">
              &middot; {dueDays === 0 ? 'Today' : `${dueDays}d remaining`}
            </span>
          )}
          {dueDays !== null && dueDays < 0 && (
            <span className="ml-1 text-red-400">
              &middot; Overdue by {Math.abs(dueDays)}d
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span className="font-medium text-slate-400">{pct}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Bottom row: team avatars + task count */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center">
            {project.teamMembers.length > 0 && (
              <div className="flex">
                {project.teamMembers.slice(0, 3).map((member) => (
                  <span
                    key={member.id}
                    title={member.name}
                    className={`-ml-1.5 first:ml-0 grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold ring-2 ring-[#0e1421] ${getAvatarColor(member.id)}`}
                  >
                    {member.avatarInitials}
                  </span>
                ))}
                {project.teamMembers.length > 3 && (
                  <span className="-ml-1.5 grid size-7 shrink-0 place-items-center rounded-full bg-slate-800 text-[10px] font-medium text-slate-500 ring-2 ring-[#0e1421]">
                    +{project.teamMembers.length - 3}
                  </span>
                )}
              </div>
            )}
            {project.teamMembers.length === 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Users size={13} />
                <span>No members</span>
              </div>
            )}
          </div>
          <span className="text-xs text-slate-500">
            {project.completedTaskCount}/{project.taskCount} tasks
          </span>
        </div>
      </div>
    </div>
  )
}
