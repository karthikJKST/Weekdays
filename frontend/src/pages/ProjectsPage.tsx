import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Plus, Columns3, LayoutGrid, List, Search, ArrowUpDown, X } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Modal } from '../components/ui/Modal'
import { ProjectGrid } from '../components/projects/ProjectGrid'
import { ProjectForm } from '../components/projects/ProjectForm'
import type { ProjectFormValues } from '../components/projects/ProjectForm'
import { DeleteProjectDialog } from '../components/projects/DeleteProjectDialog'
import { KanbanBoard } from '../components/projects/KanbanBoard'
import { ProjectListView } from '../components/projects/ProjectListView'
import { useProjects, useCreateProject, useUpdateProject, useUpdateProjectStatus, useDeleteProject } from '../api/projects'
import type { Project, ProjectStatus, SortKey, SortOrder } from '../types/project'

type ViewMode = 'board' | 'list' | 'grid'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'updatedAt', label: 'Recently updated' },
  { key: 'dueDate', label: 'Due date' },
]

const STORAGE_KEY = 'weekdays-projects-state'

interface PersistedState {
  view: ViewMode
  searchQuery: string
  statusFilter: ProjectStatus | 'all'
  progressFilter: string
  dueDateFilter: string
  sortKey: SortKey
  sortOrder: SortOrder
}

function loadPersistedState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Partial<PersistedState>
  } catch { /* ignore */ }
  return {}
}

function savePersistedState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

export function ProjectsPage() {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const persisted = useRef(loadPersistedState())

  // Data from API
  const { data: projects = [], isLoading, error, refetch } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const updateStatus = useUpdateProjectStatus()
  const deleteProject = useDeleteProject()

  // View
  const [view, setView] = useState<ViewMode>(persisted.current.view ?? 'grid')

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState(persisted.current.searchQuery ?? '')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>(persisted.current.statusFilter ?? 'all')
  const [progressFilter, setProgressFilter] = useState(persisted.current.progressFilter ?? 'all')
  const [dueDateFilter, setDueDateFilter] = useState(persisted.current.dueDateFilter ?? 'all')
  const [sortKey, setSortKey] = useState<SortKey>(persisted.current.sortKey ?? 'updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>(persisted.current.sortOrder ?? 'desc')

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  // Persist view + filters + sorting
  useEffect(() => {
    savePersistedState({
      view,
      searchQuery,
      statusFilter,
      progressFilter,
      dueDateFilter,
      sortKey,
      sortOrder,
    })
  }, [view, searchQuery, statusFilter, progressFilter, dueDateFilter, sortKey, sortOrder])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
      const isCmdOrCtrl = e.metaKey || e.ctrlKey

      if (e.key === 'Escape') {
        if (formModalOpen) {
          setFormModalOpen(false)
          setEditingProject(null)
        }
        if (deleteTarget) setDeleteTarget(null)
        return
      }

      if (isCmdOrCtrl && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }

      if (!isInput && !isCmdOrCtrl && e.key === 'n') {
        e.preventDefault()
        setEditingProject(null)
        setFormModalOpen(true)
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [formModalOpen, deleteTarget])

  // Derived: filtered & sorted projects
  const filteredProjects = useMemo(() => {
    let result = [...projects]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }

    if (progressFilter === 'not-started') {
      result = result.filter((p) => p.completedTaskCount === 0)
    } else if (progressFilter === 'in-progress') {
      result = result.filter(
        (p) => p.completedTaskCount > 0 && p.completedTaskCount < p.taskCount,
      )
    } else if (progressFilter === 'complete') {
      result = result.filter(
        (p) => p.taskCount > 0 && p.completedTaskCount === p.taskCount,
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (dueDateFilter === 'overdue') {
      result = result.filter((p) => p.dueDate !== null && new Date(p.dueDate) < today)
    } else if (dueDateFilter === 'this-week') {
      const weekEnd = new Date(today)
      weekEnd.setDate(weekEnd.getDate() + 7)
      result = result.filter(
        (p) => p.dueDate !== null && new Date(p.dueDate) >= today && new Date(p.dueDate) <= weekEnd,
      )
    } else if (dueDateFilter === 'this-month') {
      const monthEnd = new Date(today)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      result = result.filter(
        (p) => p.dueDate !== null && new Date(p.dueDate) >= today && new Date(p.dueDate) <= monthEnd,
      )
    } else if (dueDateFilter === 'no-date') {
      result = result.filter((p) => p.dueDate === null)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name)
      } else if (sortKey === 'updatedAt') {
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      } else if (sortKey === 'dueDate') {
        const aDate = a.dueDate ?? '9999-12-31'
        const bDate = b.dueDate ?? '9999-12-31'
        cmp = aDate.localeCompare(bDate)
      }
      return sortOrder === 'desc' ? -cmp : cmp
    })

    return result
  }, [projects, searchQuery, statusFilter, progressFilter, dueDateFilter, sortKey, sortOrder])

  const hasFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    progressFilter !== 'all' ||
    dueDateFilter !== 'all'

  // Handlers
  const handleStatusChange = useCallback((id: string, status: ProjectStatus) => {
    updateStatus.mutate({ id, status })
  }, [updateStatus])

  const handleProjectCreated = useCallback((values: ProjectFormValues) => {
    createProject.mutate(
      {
        name: values.name.trim(),
        description: values.description.trim(),
        status: values.status,
        priority: values.priority,
        color: values.color,
        dueDate: values.dueDate || null,
      },
      {
        onSuccess: () => setFormModalOpen(false),
      },
    )
  }, [createProject])

  const handleProjectUpdated = useCallback((values: ProjectFormValues) => {
    if (!editingProject) return
    updateProject.mutate(
      {
        id: editingProject.id,
        name: values.name.trim(),
        description: values.description.trim(),
        status: values.status,
        priority: values.priority,
        color: values.color,
        dueDate: values.dueDate || null,
      },
      {
        onSuccess: () => {
          setEditingProject(null)
          setFormModalOpen(false)
        },
      },
    )
  }, [editingProject, updateProject])

  const handleDeleteConfirm = useCallback((project: Project) => {
    deleteProject.mutate(project.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }, [deleteProject])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setProgressFilter('all')
    setDueDateFilter('all')
    setSortKey('updatedAt')
    setSortOrder('desc')
  }, [])

  const openCreateModal = useCallback(() => {
    setEditingProject(null)
    setFormModalOpen(true)
  }, [])

  const openEditModal = useCallback((project: Project) => {
    setEditingProject(project)
    setFormModalOpen(true)
  }, [])

  const isFormEditing = editingProject !== null
  const formDefaultValues: ProjectFormValues | undefined = isFormEditing
    ? {
        name: editingProject.name,
        description: editingProject.description,
        status: editingProject.status,
        priority: editingProject.priority,
        color: editingProject.color,
        dueDate: editingProject.dueDate ?? '',
      }
    : undefined

  const apiError = error ? (error as Error).message : null
  const isSaving = createProject.isPending || updateProject.isPending || deleteProject.isPending

  return (
    <>
      <PageContainer
        title="Projects"
        description="Manage your engineering projects and initiatives."
        actions={
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex overflow-hidden rounded-xl border border-slate-700/60 bg-[#121827] p-0.5">
              {(['grid', 'board', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    view === mode
                      ? 'bg-indigo-500/15 text-indigo-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  aria-label={`${mode} view`}
                >
                  {mode === 'grid' ? <LayoutGrid size={15} /> : mode === 'board' ? <Columns3 size={15} /> : <List size={15} />}
                  <span className="hidden sm:inline">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                </button>
              ))}
            </div>

            <button
              onClick={openCreateModal}
              disabled={createProject.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
              aria-label="New project (N)"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New project</span>
            </button>
          </div>
        }
      >
        {/* Search & filters bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects…"
              className="w-full rounded-xl border border-slate-700/60 bg-[#121827] py-2 pl-9 pr-8 text-sm text-slate-200 placeholder-slate-600 caret-indigo-400 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 grid size-5 place-items-center rounded text-slate-600 hover:text-slate-400"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
              className="rounded-xl border border-slate-700/60 bg-[#121827] px-3 py-2 text-sm text-slate-400 outline-none transition focus:border-slate-600 [color-scheme:dark]"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="backlog">Backlog</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>

            <select
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
              className="rounded-xl border border-slate-700/60 bg-[#121827] px-3 py-2 text-sm text-slate-400 outline-none transition focus:border-slate-600 [color-scheme:dark]"
              aria-label="Filter by progress"
            >
              <option value="all">All progress</option>
              <option value="not-started">Not started</option>
              <option value="in-progress">In progress</option>
              <option value="complete">Complete</option>
            </select>

            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="rounded-xl border border-slate-700/60 bg-[#121827] px-3 py-2 text-sm text-slate-400 outline-none transition focus:border-slate-600 [color-scheme:dark]"
              aria-label="Filter by due date"
            >
              <option value="all">All dates</option>
              <option value="overdue">Overdue</option>
              <option value="this-week">Due this week</option>
              <option value="this-month">Due this month</option>
              <option value="no-date">No due date</option>
            </select>

            <div className="flex items-center gap-1 rounded-xl border border-slate-700/60 bg-[#121827] px-3 py-2">
              <ArrowUpDown size={14} className="text-slate-500" />
              <select
                value={`${sortKey}-${sortOrder}`}
                onChange={(e) => {
                  const [key, order] = e.target.value.split('-') as [SortKey, SortOrder]
                  setSortKey(key)
                  setSortOrder(order)
                }}
                className="bg-transparent text-sm text-slate-400 outline-none"
                aria-label="Sort projects"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={`${opt.key}-asc`} value={`${opt.key}-asc`}>
                    {opt.label} ↑
                  </option>
                ))}
                {SORT_OPTIONS.map((opt) => (
                  <option key={`${opt.key}-desc`} value={`${opt.key}-desc`}>
                    {opt.label} ↓
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {view === 'grid' && (
          <ProjectGrid
            projects={filteredProjects}
            loading={isLoading}
            error={apiError}
            hasFilters={hasFilters}
            onEdit={openEditModal}
            onDelete={setDeleteTarget}
            onCreateClick={openCreateModal}
            onImportClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.json'
              input.style.display = 'none'
              document.body.appendChild(input)
              input.onchange = () => {
                document.body.removeChild(input)
                // Import logic will be implemented in a future iteration
              }
              input.click()
            }}
            onClearFilters={handleClearFilters}
            onRetry={handleRetry}
          />
        )}

        {view === 'board' && !isLoading && !error && (
          <KanbanBoard
            projects={filteredProjects}
            onStatusChange={handleStatusChange}
            onAddClick={openCreateModal}
            onEdit={openEditModal}
            onDelete={setDeleteTarget}
          />
        )}

        {view === 'list' && !isLoading && !error && (
          <ProjectListView
            projects={filteredProjects}
            onEdit={openEditModal}
            onDelete={setDeleteTarget}
          />
        )}

        {/* Loading state for board/list views */}
        {isLoading && (view === 'board' || view === 'list') && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="size-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
              <p className="text-sm text-slate-500">Loading projects…</p>
            </div>
          </div>
        )}

        {/* Error state for board/list views */}
        {apiError && view !== 'grid' && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-sm text-red-400">{apiError}</p>
            <button
              onClick={handleRetry}
              className="rounded-xl border border-slate-700/60 px-4 py-2 text-sm text-slate-400 transition hover:border-slate-600"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results count */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
              {hasFilters && (
                <button onClick={handleClearFilters} className="ml-2 text-indigo-500 hover:text-indigo-400">
                  Clear filters
                </button>
              )}
            </span>
            <span className="hidden sm:inline text-slate-700">
              <kbd className="rounded-md border border-slate-800 bg-slate-800/50 px-1.5 py-0.5 text-[10px]">N</kbd> New
              {' · '}
              <kbd className="rounded-md border border-slate-800 bg-slate-800/50 px-1.5 py-0.5 text-[10px]">⌘F</kbd> Search
            </span>
          </div>
        )}
      </PageContainer>

      {/* Saving overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#0e1421] px-6 py-4 shadow-2xl shadow-black/40">
            <svg className="size-[18px] animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-slate-300">Saving changes…</span>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingProject(null)
        }}
        title={isFormEditing ? 'Edit project' : 'Create project'}
      >
        <ProjectForm
          key={isFormEditing ? editingProject.id : 'create'}
          defaultValues={formDefaultValues}
          isSubmitting={false}
          onSubmit={isFormEditing ? handleProjectUpdated : handleProjectCreated}
          onCancel={() => {
            setFormModalOpen(false)
            setEditingProject(null)
          }}
        />
      </Modal>

      {/* Delete confirmation */}
      <DeleteProjectDialog
        project={deleteTarget}
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
