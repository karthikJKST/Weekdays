import { useState, useCallback, useMemo, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, LayoutGrid, List, Search, X } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Modal } from '../components/ui/Modal'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskTable } from '../components/tasks/TaskTable'
import { TaskFilters } from '../components/tasks/TaskFilters'
import { TaskForm } from '../components/tasks/TaskForm'
import type { TaskFormValues } from '../components/tasks/TaskForm'
import { DeleteTaskDialog } from '../components/tasks/DeleteTaskDialog'
import { TaskDetailsDrawer } from '../components/tasks/TaskDetailsDrawer'
import { TaskSkeleton } from '../components/tasks/TaskSkeleton'
import { EmptyTasks } from '../components/tasks/EmptyTasks'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useBulkUpdateStatus, useBulkUpdatePriority, useBulkDelete } from '../api/tasks'
import { useProjects } from '../api/projects'
import type { Task, TaskStatus, TaskPriority, TaskLabel, TaskSortKey, SortOrder } from '../types/task'

type ViewMode = 'grid' | 'table'

const PAGE_SIZE = 12

export function TasksPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Data from API
  const { data: tasks = [], isLoading: loading, error: apiError } = useTasks()
  const { data: projects = [] } = useProjects()

  // View
  const [view, setView] = useState<ViewMode>('grid')

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [labelFilter, setLabelFilter] = useState<TaskLabel | 'all'>('all')
  const [dueDateFilter, setDueDateFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<TaskSortKey>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Pagination
  const [page, setPage] = useState(1)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTargets, setDeleteTargets] = useState<Task[]>([])
  const [drawerTask, setDrawerTask] = useState<Task | null>(null)

  // Mutations
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const bulkStatus = useBulkUpdateStatus()
  const bulkPriority = useBulkUpdatePriority()
  const bulkDelete = useBulkDelete()

  // Filtered & sorted
  const filteredTasks = useMemo(() => {
    let result = [...tasks]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') result = result.filter((t) => t.status === statusFilter)
    if (priorityFilter !== 'all') result = result.filter((t) => t.priority === priorityFilter)
    if (projectFilter !== 'all') result = result.filter((t) => t.projectId === projectFilter)
    if (labelFilter !== 'all') result = result.filter((t) => t.labels.includes(labelFilter))

    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (dueDateFilter === 'overdue') result = result.filter((t) => t.dueDate !== null && new Date(t.dueDate) < today)
    else if (dueDateFilter === 'this-week') {
      const wEnd = new Date(today); wEnd.setDate(wEnd.getDate() + 7)
      result = result.filter((t) => t.dueDate !== null && new Date(t.dueDate) >= today && new Date(t.dueDate) <= wEnd)
    } else if (dueDateFilter === 'this-month') {
      const mEnd = new Date(today); mEnd.setMonth(mEnd.getMonth() + 1)
      result = result.filter((t) => t.dueDate !== null && new Date(t.dueDate) >= today && new Date(t.dueDate) <= mEnd)
    } else if (dueDateFilter === 'no-date') result = result.filter((t) => t.dueDate === null)

    const PRIORITY_ORDER: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 }
    result.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title)
      else if (sortKey === 'updatedAt') cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      else if (sortKey === 'dueDate') {
        const aD = a.dueDate ?? '9999-12-31'; const bD = b.dueDate ?? '9999-12-31'
        cmp = aD.localeCompare(bD)
      } else if (sortKey === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      return sortOrder === 'desc' ? -cmp : cmp
    })
    return result
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, labelFilter, dueDateFilter, sortKey, sortOrder])

  const paginatedTasks = useMemo(() => filteredTasks.slice(0, page * PAGE_SIZE), [filteredTasks, page])

  const hasFilters = searchQuery !== '' || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || labelFilter !== 'all' || dueDateFilter !== 'all'

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => prev.size === paginatedTasks.length ? new Set() : new Set(paginatedTasks.map((t) => t.id)))
  }, [paginatedTasks])

  const handleCreate = useCallback((values: TaskFormValues) => {
    createTask.mutate({
      title: values.title.trim(),
      description: values.description.trim(),
      projectId: values.projectId,
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate || null,
      assigneeName: values.assigneeName.trim(),
      estimatedHours: values.estimatedHours,
      labels: values.labels,
    })
    setFormModalOpen(false)
  }, [createTask])

  const handleUpdate = useCallback((values: TaskFormValues) => {
    if (!editingTask) return
    updateTask.mutate({
      id: editingTask.id,
      title: values.title.trim(),
      description: values.description.trim(),
      projectId: values.projectId,
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate || null,
      assigneeName: values.assigneeName.trim(),
      estimatedHours: values.estimatedHours,
      spentHours: editingTask.spentHours,
      labels: values.labels,
    })
    setEditingTask(null)
    setFormModalOpen(false)
  }, [editingTask, updateTask])

  const handleDeleteConfirm = useCallback((ids: string[]) => {
    if (ids.length === 1) {
      deleteTask.mutate(ids[0])
    } else {
      bulkDelete.mutate(ids)
    }
    setSelectedIds(new Set())
    setDeleteTargets([])
  }, [deleteTask, bulkDelete])

  const handleBulkStatus = useCallback((status: TaskStatus) => {
    if (selectedIds.size > 0) {
      bulkStatus.mutate({ ids: Array.from(selectedIds), status })
    }
    setSelectedIds(new Set())
  }, [selectedIds, bulkStatus])

  const handleBulkPriority = useCallback((priority: TaskPriority) => {
    if (selectedIds.size > 0) {
      bulkPriority.mutate({ ids: Array.from(selectedIds), priority })
    }
    setSelectedIds(new Set())
  }, [selectedIds, bulkPriority])

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }, [queryClient])

  const handleClearFilters = useCallback(() => {
    setSearchQuery(''); setStatusFilter('all'); setPriorityFilter('all')
    setProjectFilter('all'); setLabelFilter('all'); setDueDateFilter('all')
    setSortKey('updatedAt'); setSortOrder('desc')
  }, [])

  function openCreate() { setEditingTask(null); setFormModalOpen(true) }
  function openDrawer(task: Task) { setDrawerTask(task) }
  function openDeleteForSelected() { setDeleteTargets(Array.from(selectedIds).map((id) => tasks.find((t) => t.id === id)).filter(Boolean) as Task[]) }

  const isEditing = editingTask !== null
  const formDefaults: TaskFormValues | undefined = isEditing ? {
    title: editingTask.title,
    description: editingTask.description,
    status: editingTask.status,
    priority: editingTask.priority,
    projectId: editingTask.projectId,
    assigneeName: editingTask.assignee?.name ?? '',
    dueDate: editingTask.dueDate ?? '',
    labels: editingTask.labels,
    estimatedHours: editingTask.estimatedHours,
  } : undefined

  return (
    <>
      <PageContainer
        title="My Tasks"
        description="Track and manage tasks across all projects."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-xl border border-slate-700/60 bg-[#121827] p-0.5">
              {(['grid', 'table'] as const).map((mode) => (
                <button key={mode} onClick={() => setView(mode)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${view === mode ? 'bg-indigo-500/15 text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  aria-label={`${mode} view`}
                >
                  {mode === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
                  <span className="hidden sm:inline">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                </button>
              ))}
            </div>
            <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400" aria-label="New task (N)">
              <Plus size={16} /> <span className="hidden sm:inline">New task</span>
            </button>
          </div>
        }
      >
        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input ref={searchRef} type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              placeholder="Search tasks…" className="w-full rounded-xl border border-slate-700/60 bg-[#121827] py-2 pl-9 pr-8 text-sm text-slate-200 placeholder-slate-600 caret-indigo-400 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50" />
            {searchQuery && <button onClick={() => { setSearchQuery(''); setPage(1) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 grid size-5 place-items-center rounded text-slate-600 hover:text-slate-400" aria-label="Clear search"><X size={14} /></button>}
          </div>

          <TaskFilters
            statusFilter={statusFilter} priorityFilter={priorityFilter} projectFilter={projectFilter}
            labelFilter={labelFilter} dueDateFilter={dueDateFilter} sortKey={sortKey} sortOrder={sortOrder}
            projects={projects} hasFilters={hasFilters}
            onStatusChange={(v) => { setStatusFilter(v); setPage(1) }}
            onPriorityChange={(v) => { setPriorityFilter(v); setPage(1) }}
            onProjectChange={(v) => { setProjectFilter(v); setPage(1) }}
            onLabelChange={(v) => { setLabelFilter(v); setPage(1) }}
            onDueDateChange={(v) => { setDueDateFilter(v); setPage(1) }}
            onSortKeyChange={setSortKey} onSortOrderChange={setSortOrder} onClear={handleClearFilters}
          />
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-2.5">
            <span className="text-sm text-slate-300">{selectedIds.size} selected</span>
            <span className="text-slate-600">|</span>
            <select onChange={(e) => handleBulkStatus(e.target.value as TaskStatus)} defaultValue=""
              className="rounded-lg border border-slate-700/60 bg-[#121827] px-2.5 py-1 text-xs text-slate-400 outline-none [color-scheme:dark]" aria-label="Bulk status update">
              <option value="" disabled>Set status…</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
            <select onChange={(e) => handleBulkPriority(e.target.value as TaskPriority)} defaultValue=""
              className="rounded-lg border border-slate-700/60 bg-[#121827] px-2.5 py-1 text-xs text-slate-400 outline-none [color-scheme:dark]" aria-label="Bulk priority update">
              <option value="" disabled>Set priority…</option>
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button onClick={openDeleteForSelected} className="ml-auto rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/10">Delete ({selectedIds.size})</button>
          </div>
        )}

        {/* Content */}
        {loading && <TaskSkeleton count={8} />}

        {apiError && !loading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <p className="text-sm text-red-400">{apiError instanceof Error ? apiError.message : 'Failed to load tasks.'}</p>
            <button onClick={handleRetry} className="rounded-xl border border-slate-700/60 px-4 py-2 text-sm text-slate-400 transition hover:border-slate-600">Try again</button>
          </div>
        )}

        {!loading && !apiError && paginatedTasks.length === 0 && (
          <EmptyTasks type={hasFilters ? 'no-results' : 'empty'} onCreateClick={openCreate} onClearFilters={handleClearFilters} />
        )}

        {!loading && !apiError && paginatedTasks.length > 0 && view === 'grid' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedTasks.map((task) => (
              <TaskCard key={task.id} task={task} selected={selectedIds.has(task.id)} onSelect={handleSelect} onClick={openDrawer} />
            ))}
          </div>
        )}

        {!loading && !apiError && paginatedTasks.length > 0 && view === 'table' && (
          <TaskTable tasks={paginatedTasks} selectedIds={selectedIds} onSelect={handleSelect} onSelectAll={handleSelectAll} onClick={openDrawer} />
        )}

        {/* Load more */}
        {!loading && !apiError && filteredTasks.length > paginatedTasks.length && (
          <div className="flex justify-center pt-2">
            <button onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-slate-700/60 px-6 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300">
              Show more ({filteredTasks.length - paginatedTasks.length} remaining)
            </button>
          </div>
        )}

        {/* Results count */}
        {!loading && !apiError && (
          <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
            <span>
              Showing {paginatedTasks.length} of {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              {filteredTasks.length !== tasks.length && ` (filtered from ${tasks.length})`}
              {hasFilters && <button onClick={handleClearFilters} className="ml-2 text-indigo-500 hover:text-indigo-400">Clear filters</button>}
            </span>
            <span className="hidden sm:inline text-slate-700">
              <kbd className="rounded-md border border-slate-800 bg-slate-800/50 px-1.5 py-0.5 text-[10px]">N</kbd> New
              {' · '}
              <kbd className="rounded-md border border-slate-800 bg-slate-800/50 px-1.5 py-0.5 text-[10px]">⌘F</kbd> Search
            </span>
          </div>
        )}
      </PageContainer>

      {/* Create/Edit modal */}
      <Modal open={formModalOpen} onClose={() => { setFormModalOpen(false); setEditingTask(null) }} title={isEditing ? 'Edit task' : 'Create task'}>
        <TaskForm key={isEditing ? editingTask.id : 'create'} projects={projects} defaultValues={formDefaults} isSubmitting={createTask.isPending}
          onSubmit={isEditing ? handleUpdate : handleCreate}
          onCancel={() => { setFormModalOpen(false); setEditingTask(null) }} />
      </Modal>

      {/* Delete dialog */}
      <DeleteTaskDialog tasks={deleteTargets} open={deleteTargets.length > 0} onClose={() => setDeleteTargets([])} onConfirm={handleDeleteConfirm} />

      {/* Detail drawer */}
      <TaskDetailsDrawer task={drawerTask} open={drawerTask !== null} onClose={() => setDrawerTask(null)} />
    </>
  )
}
