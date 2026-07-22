import { useForm } from 'react-hook-form'
import type { TaskStatus, TaskPriority, TaskLabel } from '../../types/task'
import { STATUS_OPTIONS, PRIORITY_OPTIONS, LABEL_LABELS } from '../../types/task'
import type { Project } from '../../types/project'

export interface TaskFormValues {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeName: string
  dueDate: string
  labels: TaskLabel[]
  estimatedHours: number
}

interface TaskFormProps {
  projects: Project[]
  defaultValues?: TaskFormValues
  isSubmitting: boolean
  onSubmit: (data: TaskFormValues) => void
  onCancel: () => void
}

const ALL_LABELS = Object.keys(LABEL_LABELS) as TaskLabel[]

export function TaskForm({ projects, defaultValues, isSubmitting, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: defaultValues ?? {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      projectId: projects[0]?.id ?? '',
      assigneeName: '',
      dueDate: '',
      labels: [],
      estimatedHours: 0,
    },
  })

  const selectedLabels = watch('labels')
  const isEditing = !!defaultValues

  function toggleLabel(label: TaskLabel) {
    const current = selectedLabels
    if (current.includes(label)) {
      setValue('labels', current.filter((l) => l !== label), { shouldValidate: true })
    } else {
      setValue('labels', [...current, label], { shouldValidate: true })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div>
        <label htmlFor="task-title" className="mb-1.5 block text-sm font-medium text-slate-300">Title <span className="text-red-400">*</span></label>
        <input id="task-title" {...register('title', { required: 'Title is required', minLength: { value: 2, message: 'At least 2 characters' }, maxLength: { value: 200, message: 'Max 200 characters' } })} placeholder="e.g. Implement rate limiting" className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 caret-indigo-400 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50" autoFocus />
        {errors.title && <p className="mt-1.5 text-xs text-red-400">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="task-desc" className="mb-1.5 block text-sm font-medium text-slate-300">Description</label>
        <textarea id="task-desc" {...register('description', { maxLength: { value: 2000, message: 'Max 2000 characters' } })} placeholder="Brief description…" rows={3} className="w-full resize-none rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 caret-indigo-400 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50" />
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-status" className="mb-1.5 block text-sm font-medium text-slate-300">Status</label>
          <select id="task-status" {...register('status')} className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="task-priority" className="mb-1.5 block text-sm font-medium text-slate-300">Priority</label>
          <select id="task-priority" {...register('priority')} className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50">
            {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Project + Assignee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-project" className="mb-1.5 block text-sm font-medium text-slate-300">Project</label>
          <select id="task-project" {...register('projectId')} className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50">
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="task-assignee" className="mb-1.5 block text-sm font-medium text-slate-300">Assignee</label>
          <input id="task-assignee" {...register('assigneeName')} placeholder="Name (local only)" className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50" />
        </div>
      </div>

      {/* Due Date + Est. Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-due" className="mb-1.5 block text-sm font-medium text-slate-300">Due date</label>
          <input id="task-due" type="date" {...register('dueDate')} className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50 [color-scheme:dark]" />
        </div>
        <div>
          <label htmlFor="task-hours" className="mb-1.5 block text-sm font-medium text-slate-300">Est. hours</label>
          <input id="task-hours" type="number" min={0} step={0.5} {...register('estimatedHours', { valueAsNumber: true, min: { value: 0, message: 'Min 0' } })} className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50" />
        </div>
      </div>

      {/* Labels */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">Labels</label>
        <div className="flex flex-wrap gap-2">
          {ALL_LABELS.map((label) => {
            const active = selectedLabels.includes(label)
            return (
              <button key={label} type="button" onClick={() => toggleLabel(label)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  active ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30' : 'bg-slate-800/60 text-slate-500 hover:bg-slate-700/60 hover:text-slate-400'
                }`}
              >
                {LABEL_LABELS[label]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-700/60 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  )
}
