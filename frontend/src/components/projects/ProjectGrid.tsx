import { AlertCircle, RefreshCw } from 'lucide-react'
import type { Project } from '../../types/project'
import { ProjectCard } from './ProjectCard'
import { ProjectSkeleton } from './ProjectSkeleton'
import { EmptyProjects } from './EmptyProjects'

interface ProjectGridProps {
  projects: Project[]
  loading: boolean
  error: string | null
  hasFilters: boolean
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onCreateClick: () => void
  onImportClick?: () => void
  onClearFilters: () => void
  onRetry: () => void
}

export function ProjectGrid({
  projects,
  loading,
  error,
  hasFilters,
  onEdit,
  onDelete,
  onCreateClick,
  onImportClick,
  onClearFilters,
  onRetry,
}: ProjectGridProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-red-800/30 bg-red-500/5 px-6 py-16">
        <div className="grid size-16 place-items-center rounded-2xl bg-red-500/10">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-200">Failed to load projects</h3>
          <p className="mt-1.5 text-sm text-slate-500">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    )
  }

  if (loading) {
    return <ProjectSkeleton count={6} />
  }

  if (projects.length === 0 && hasFilters) {
    return <EmptyProjects type="no-results" onClearFilters={onClearFilters} />
  }

  if (projects.length === 0) {
    return <EmptyProjects type="empty" onCreateClick={onCreateClick} onImportClick={onImportClick} />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
