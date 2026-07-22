import { AlertTriangle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import type { Project } from '../../types/project'

interface DeleteProjectDialogProps {
  project: Project | null
  open: boolean
  onClose: () => void
  onConfirm: (project: Project) => void
}

export function DeleteProjectDialog({ project, open, onClose, onConfirm }: DeleteProjectDialogProps) {
  if (!project) return null

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-red-500/10">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Delete project</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Are you sure you want to delete <span className="font-medium text-slate-300">{project.name}</span>?
            This action cannot be undone and will remove all associated tasks and data.
          </p>
        </div>
        <div className="flex w-full items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700/60 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(project)}
            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-400"
          >
            Delete project
          </button>
        </div>
      </div>
    </Modal>
  )
}
