import { useForm } from 'react-hook-form'
import type { ProjectStatus, ProjectPriority } from '../../types/project'

export interface ProjectFormValues {
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  dueDate: string
  color: string
}

const COLOR_OPTIONS = [
  { value: 'indigo', bg: 'bg-indigo-500' },
  { value: 'emerald', bg: 'bg-emerald-500' },
  { value: 'amber', bg: 'bg-amber-500' },
  { value: 'violet', bg: 'bg-violet-500' },
  { value: 'rose', bg: 'bg-rose-500' },
  { value: 'cyan', bg: 'bg-cyan-500' },
  { value: 'sky', bg: 'bg-sky-500' },
  { value: 'orange', bg: 'bg-orange-500' },
]

interface ProjectFormProps {
  defaultValues?: ProjectFormValues
  isSubmitting: boolean
  onSubmit: (data: ProjectFormValues) => void
  onCancel: () => void
}

export function ProjectForm({ defaultValues, isSubmitting, onSubmit, onCancel }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    defaultValues: defaultValues ?? {
      name: '',
      description: '',
      status: 'backlog',
      priority: 'medium',
      dueDate: '',
      color: 'indigo',
    },
  })

  const selectedColor = watch('color')
  const isEditing = !!defaultValues

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
          Project name <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          {...register('name', {
            required: 'Project name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
            maxLength: { value: 100, message: 'Name must be under 100 characters' },
          })}
          placeholder="e.g. Platform API"
          className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 caret-indigo-400 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50"
          autoFocus
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-300">
          Description
        </label>
        <textarea
          id="description"
          {...register('description', {
            maxLength: { value: 500, message: 'Description must be under 500 characters' },
          })}
          placeholder="Brief description of the project…"
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 caret-indigo-400 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50"
        />
        {errors.description && (
          <p className="mt-1.5 text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>

      {/* Status + Priority row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-slate-300">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50"
          >
            <option value="backlog">Backlog</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-slate-300">
            Priority
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="dueDate" className="mb-1.5 block text-sm font-medium text-slate-300">
          Due date
        </label>
        <input
          id="dueDate"
          type="date"
          {...register('dueDate')}
          className="w-full rounded-xl border border-slate-700/60 bg-[#121827] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50 [color-scheme:dark]"
        />
      </div>

      {/* Color picker */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">Color</label>
        <div className="flex flex-wrap gap-2.5">
          {COLOR_OPTIONS.map(({ value, bg }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('color', value)}
              className={`size-7 rounded-lg transition-all ${bg} ${
                selectedColor === value
                  ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-[#0e1421] scale-110'
                  : 'opacity-50 hover:opacity-80'
              }`}
              aria-label={`${value} color`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-700/60 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </form>
  )
}
