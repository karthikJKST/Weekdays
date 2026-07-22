import { useRef, useState, useEffect, useCallback, memo, type DragEvent } from 'react'
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  Calendar,
  Users,
  GripVertical,
} from 'lucide-react'
import type { Project } from '../../types/project'

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-slate-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
}

const PROJECT_BG: Record<string, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
  violet: 'bg-violet-500/10 text-violet-400',
  rose: 'bg-rose-500/10 text-rose-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
  sky: 'bg-sky-500/10 text-sky-400',
  orange: 'bg-orange-500/10 text-orange-400',
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

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysUntil(dateStr: string): number | null {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const due = new Date(dateStr); due.setHours(0, 0, 0, 0)
  const diff = due.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

interface KanbanCardProps {
  project: Project
  isDragging: boolean
  onDragStart: (e: DragEvent<HTMLDivElement>, projectId: string) => void
  onDragEnd: () => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export const KanbanCard = memo(function KanbanCard({
  project,
  isDragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
}: KanbanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuOpen(false)
      }
    }
    if (menuOpen || contextMenuOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen, contextMenuOpen])

  const pct = project.taskCount > 0
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0

  const dueDays = project.dueDate ? daysUntil(project.dueDate) : null

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuOpen(true)
    setMenuOpen(false)
  }, [])

  function closeAll() {
    setMenuOpen(false)
    setContextMenuOpen(false)
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      onDragEnd={onDragEnd}
      onContextMenu={handleContextMenu}
      className={`group relative cursor-grab rounded-xl border border-slate-800/60 bg-[#121827] transition-all duration-200 active:cursor-grabbing ${
        isDragging
          ? 'opacity-40 ring-2 ring-indigo-500/40 scale-[0.97] rotate-1'
          : 'hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5'
      }`}
    >
      {/* Top section */}
      <div className="px-3 pt-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GripVertical size={13} className="text-slate-700 cursor-grab active:cursor-grabbing shrink-0" />
            <span className={`size-2 rounded-full ${PRIORITY_DOT[project.priority] || 'bg-slate-500'}`} />
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                PROJECT_BG[project.color] || 'bg-slate-800/60 text-slate-400'
              }`}
            >
              {project.color}
            </span>
          </div>

          {/* Actions menu button */}
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); setContextMenuOpen(false) }}
              className="grid size-6 shrink-0 place-items-center rounded-md text-slate-600 opacity-0 transition hover:bg-slate-800/60 hover:text-slate-400 group-hover:opacity-100"
              aria-label="Card actions"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-36 origin-top-right rounded-xl border border-slate-800 bg-[#1a2235] p-1 shadow-2xl shadow-black/50">
                <button
                  onClick={() => { closeAll(); onEdit(project) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-200"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => { closeAll(); onDelete(project) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Context menu (right-click) */}
        {contextMenuOpen && (
          <div
            ref={contextMenuRef}
            className="fixed z-30 w-40 origin-top-right rounded-xl border border-slate-800 bg-[#1a2235] p-1 shadow-2xl shadow-black/50"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <button
              onClick={() => { closeAll(); onEdit(project) }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-200"
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              onClick={() => { closeAll(); onDelete(project) }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}

        {/* Name */}
        <h4 className="mt-3 text-sm font-medium leading-snug text-slate-200">
          {project.name}
        </h4>

        {/* Description */}
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {project.description}
        </p>
      </div>

      {/* Due date */}
      {project.dueDate && (
        <div className="flex items-center gap-1 px-3 pt-3">
          <Calendar size={11} className="shrink-0 text-slate-600" />
          <span className={`text-[11px] ${dueDays !== null && dueDays < 0 ? 'text-red-400' : 'text-slate-500'}`}>
            {formatDueDate(project.dueDate)}
            {dueDays !== null && dueDays < 0 && ` (overdue)`}
          </span>
        </div>
      )}

      {/* Progress */}
      <div className="px-3 pt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>{project.completedTaskCount}/{project.taskCount} tasks</span>
          <span className="font-medium text-slate-400">{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Bottom row: avatars + last updated */}
      <div className="flex items-center justify-between px-3 pb-3 pt-3">
        <div className="flex items-center">
          {project.teamMembers.length > 0 ? (
            <div className="flex">
              {project.teamMembers.slice(0, 3).map((member) => (
                <span
                  key={member.id}
                  title={member.name}
                  className={`-ml-1 first:ml-0 grid size-5 shrink-0 place-items-center rounded-full text-[8px] font-semibold ring-2 ring-[#121827] ${getAvatarColor(member.id)}`}
                >
                  {member.avatarInitials}
                </span>
              ))}
              {project.teamMembers.length > 3 && (
                <span className="-ml-1 grid size-5 shrink-0 place-items-center rounded-full bg-slate-800 text-[8px] font-medium text-slate-500 ring-2 ring-[#121827]">
                  +{project.teamMembers.length - 3}
                </span>
              )}
            </div>
          ) : (
            <Users size={11} className="text-slate-600" />
          )}
        </div>
        <span className="text-[10px] text-slate-600">
          {formatRelativeTime(project.updatedAt)}
        </span>
      </div>
    </div>
  )
})
