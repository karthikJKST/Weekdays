import { ListTodo, SearchX, Plus } from 'lucide-react'

interface EmptyTasksProps {
  type?: 'empty' | 'no-results'
  onCreateClick?: () => void
  onClearFilters?: () => void
}

export function EmptyTasks({ type = 'empty', onCreateClick, onClearFilters }: EmptyTasksProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-slate-800/50 bg-[#0e1421] px-6 py-16">
        <div className="grid size-16 place-items-center rounded-2xl bg-slate-800/60">
          <SearchX size={32} className="text-slate-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-300">No matching tasks</h3>
          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">
            Try adjusting your search or filters to find what you&apos;re looking for.
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
        <ListTodo size={40} className="text-indigo-400" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-200">Create your first task</h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
          Break down your projects into actionable tasks. Assign them to team members, set priorities, and track progress.
        </p>
      </div>
      {onCreateClick && (
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
        >
          <Plus size={16} />
          Create your first task
        </button>
      )}
    </div>
  )
}
