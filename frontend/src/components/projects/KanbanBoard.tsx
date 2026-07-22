import { useState, useCallback, memo, type DragEvent } from 'react'
import { Plus } from 'lucide-react'
import type { Project, ProjectStatus } from '../../types/project'
import { STATUS_LABELS } from '../../types/project'
import { KanbanCard } from './KanbanCard'

const COLUMNS: ProjectStatus[] = ['backlog', 'in_progress', 'review', 'done']

const COLUMN_ACCENTS: Record<ProjectStatus, string> = {
  backlog: 'border-t-slate-600',
  in_progress: 'border-t-indigo-500',
  review: 'border-t-amber-500',
  done: 'border-t-emerald-500',
}

interface KanbanBoardProps {
  projects: Project[]
  onStatusChange: (id: string, status: ProjectStatus) => void
  onAddClick: () => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export const KanbanBoard = memo(function KanbanBoard({
  projects,
  onStatusChange,
  onAddClick,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, projectId: string) => {
      setDraggedId(projectId)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', projectId)
      // Slight delay so the drag ghost shows the semi-transparent state
      requestAnimationFrame(() => {
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move'
        }
      })
    },
    [],
  )

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>, status: ProjectStatus) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverColumn(status)
    },
    [],
  )

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setDragOverColumn(null)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, status: ProjectStatus) => {
      e.preventDefault()
      const projectId = e.dataTransfer.getData('text/plain')
      if (projectId) {
        onStatusChange(projectId, status)
      }
      setDragOverColumn(null)
      setDraggedId(null)
    },
    [onStatusChange],
  )

  const handleDragEnd = useCallback(() => {
    setDragOverColumn(null)
    setDraggedId(null)
  }, [])

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent -mx-6 px-6 lg:mx-0 lg:px-0">
      {COLUMNS.map((status) => {
        const columnProjects = projects.filter((p) => p.status === status)
        const isOver = dragOverColumn === status
        return (
          <div
            key={status}
            className={`flex w-[280px] shrink-0 snap-start flex-col rounded-2xl border border-slate-800/60 border-t-2 bg-[#0e1421] transition-all duration-200 ${
              COLUMN_ACCENTS[status]
            } ${
              isOver
                ? 'bg-slate-800/40 ring-2 ring-indigo-500/30 scale-[1.01]'
                : ''
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-medium text-slate-200">{STATUS_LABELS[status]}</h3>
                <span className="grid min-w-[20px] place-items-center rounded-md bg-slate-800/80 px-1.5 py-0.5 text-[11px] font-medium text-slate-400">
                  {columnProjects.length}
                </span>
              </div>
              <button
                onClick={onAddClick}
                className="grid size-7 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-800/60 hover:text-slate-400"
                aria-label={`Add project to ${STATUS_LABELS[status]}`}
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto px-3 pb-3">
              {columnProjects.map((project) => (
                <KanbanCard
                  key={project.id}
                  project={project}
                  isDragging={draggedId === project.id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}

              {/* Empty state per column */}
              {columnProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/40 px-4 py-10 text-center transition hover:border-slate-700/50">
                  <div className="grid size-10 place-items-center rounded-xl bg-slate-800/40">
                    <Plus size={16} className="text-slate-600" />
                  </div>
                  <p className="mt-3 text-xs text-slate-600">No projects</p>
                  <button
                    onClick={onAddClick}
                    className="mt-2 text-[11px] font-medium text-indigo-500 transition hover:text-indigo-400"
                  >
                    Add project
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
})
