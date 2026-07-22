import { FolderKanban, SearchX, Plus, Upload } from 'lucide-react'

interface EmptyProjectsProps {
  type?: 'empty' | 'no-results'
  onCreateClick?: () => void
  onImportClick?: () => void
  onClearFilters?: () => void
}

export function EmptyProjects({ type = 'empty', onCreateClick, onImportClick, onClearFilters }: EmptyProjectsProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-slate-800/50 bg-[#0e1421] px-6 py-16">
        <div className="grid size-16 place-items-center rounded-2xl bg-slate-800/60">
          <SearchX size={32} className="text-slate-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-300">No matching projects</h3>
          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
        </div>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="rounded-xl border border-slate-700/60 px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300"
          >
            Clear filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-slate-800/50 bg-[#0e1421] px-6 py-20">
      <div className="grid size-20 place-items-center rounded-2xl bg-indigo-500/10">
        <FolderKanban size={40} className="text-indigo-400" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-200">Start managing your engineering work</h3>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
          Create a project to organize tasks, set deadlines, track progress, and ship faster with your team.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
          >
            <Plus size={16} />
            Create your first project
          </button>
        )}
        {onImportClick && (
          <button
            onClick={onImportClick}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            <Upload size={16} />
            Import project
          </button>
        )}
      </div>
    </div>
  )
}
