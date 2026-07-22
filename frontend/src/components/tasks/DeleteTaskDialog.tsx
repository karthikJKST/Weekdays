import { AlertTriangle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import type { Task } from '../../types/task'

interface DeleteTaskDialogProps {
  tasks: Task[]
  open: boolean
  onClose: () => void
  onConfirm: (ids: string[]) => void
}

export function DeleteTaskDialog({ tasks, open, onClose, onConfirm }: DeleteTaskDialogProps) {
  if (tasks.length === 0) return null
  const isMulti = tasks.length > 1

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-red-500/10">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Delete {isMulti ? 'tasks' : 'task'}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {isMulti ? (
              <>Are you sure you want to delete <span className="font-medium text-slate-300">{tasks.length} tasks</span>? This action cannot be undone.</>
            ) : (
              <>Are you sure you want to delete <span className="font-medium text-slate-300">{tasks[0].title}</span>? This action cannot be undone.</>
            )}
          </p>
        </div>
        <div className="flex w-full items-center justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-xl border border-slate-700/60 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300">Cancel</button>
          <button onClick={() => onConfirm(tasks.map((t) => t.id))} className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-400">
            Delete {isMulti ? `(${tasks.length})` : 'task'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
