import { ArrowUpDown, X } from 'lucide-react'
import type { TaskStatus, TaskPriority, TaskLabel, TaskSortKey, SortOrder } from '../../types/task'
import { STATUS_OPTIONS, PRIORITY_OPTIONS, LABEL_LABELS } from '../../types/task'
import type { Project } from '../../types/project'

interface TaskFiltersProps {
  statusFilter: TaskStatus | 'all'
  priorityFilter: TaskPriority | 'all'
  projectFilter: string
  labelFilter: TaskLabel | 'all'
  dueDateFilter: string
  sortKey: TaskSortKey
  sortOrder: SortOrder
  projects: Project[]
  hasFilters: boolean
  onStatusChange: (v: TaskStatus | 'all') => void
  onPriorityChange: (v: TaskPriority | 'all') => void
  onProjectChange: (v: string) => void
  onLabelChange: (v: TaskLabel | 'all') => void
  onDueDateChange: (v: string) => void
  onSortKeyChange: (v: TaskSortKey) => void
  onSortOrderChange: (v: SortOrder) => void
  onClear: () => void
}

const SORT_OPTIONS: { key: TaskSortKey; label: string }[] = [
  { key: 'updatedAt', label: 'Recently updated' },
  { key: 'dueDate', label: 'Due date' },
  { key: 'priority', label: 'Priority' },
  { key: 'title', label: 'Title' },
]

const LABEL_OPTIONS = (Object.keys(LABEL_LABELS) as TaskLabel[]).map((key) => ({
  value: key,
  label: LABEL_LABELS[key],
}))

export function TaskFilters({
  statusFilter, priorityFilter, projectFilter, labelFilter, dueDateFilter,
  sortKey, sortOrder, projects, hasFilters,
  onStatusChange, onPriorityChange, onProjectChange, onLabelChange, onDueDateChange,
  onSortKeyChange, onSortOrderChange, onClear,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value as TaskStatus | 'all')}
        className="rounded-xl border border-slate-700/60 bg-[#121827] px-3 py-2 text-sm text-slate-400 outline-none transition focus:border-slate-600 [color-scheme:dark]" aria-label="Filter by status">
        <option value="all">All statuses</option>
        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select value={priorityFilter} onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
        className="rounded-xl border border-slate-700/60 bg-[#121827] px-3 py-2 text-sm text-slate-400 outline-none transition focus:border-slate-600 [color-scheme:dark]" aria-label="Filter by priority">
        <option value="all">All priorities</option>
        {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select value={projectFilter} onChange={(e) => onProjectChange(e.target.value)}
        className="rounded-xl border border-slate-700/60 bg-[#121827] px-3 py-2 text-sm text-slate-400 outline-none transition focus:border-slate-600 [color-scheme:dark]" aria-label="Filter by project">
        <option value="all">All projects</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      <select value={labelFilter} onChange={(e) => onLabelChange(e.target.value as TaskLabel | 'all')}
        className="rounded-xl border border-slate-700/60 bg-[#121827] px-3 py-2 text-sm text-slate-400 outline-none transition focus:border-slate-600 [color-scheme:dark]" aria-label="Filter by label">
        <option value="all">All labels</option>
        {LABEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select value={dueDateFilter} onChange={(e) => onDueDateChange(e.target.value)}
        className="rounded-xl border border-slate-700/60 bg-[#121827] px-3 py-2 text-sm text-slate-400 outline-none transition focus:border-slate-600 [color-scheme:dark]" aria-label="Filter by due date">
        <option value="all">All dates</option>
        <option value="overdue">Overdue</option>
        <option value="this-week">Due this week</option>
        <option value="this-month">Due this month</option>
        <option value="no-date">No due date</option>
      </select>

      <div className="flex items-center gap-1 rounded-xl border border-slate-700/60 bg-[#121827] px-3 py-2">
        <ArrowUpDown size={14} className="text-slate-500" />
        <select value={`${sortKey}-${sortOrder}`} onChange={(e) => {
          const [k, o] = e.target.value.split('-') as [TaskSortKey, SortOrder]
          onSortKeyChange(k); onSortOrderChange(o)
        }} className="bg-transparent text-sm text-slate-400 outline-none" aria-label="Sort tasks">
          {SORT_OPTIONS.map((opt) => (
            <optgroup key={opt.key} label={opt.label}>
              <option value={`${opt.key}-asc`}>{opt.label} ↑</option>
              <option value={`${opt.key}-desc`}>{opt.label} ↓</option>
            </optgroup>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button onClick={onClear} className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-indigo-500 hover:text-indigo-400 transition" aria-label="Clear filters">
          <X size={14} /> Clear
        </button>
      )}
    </div>
  )
}
