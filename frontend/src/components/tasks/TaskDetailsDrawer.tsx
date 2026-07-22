import { Calendar, Clock, User, MessageSquare, Paperclip } from 'lucide-react'
import type { Task } from '../../types/task'
import { LABEL_LABELS } from '../../types/task'
import { Drawer } from '../ui/Drawer'
import { TaskStatusBadge } from './TaskStatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { TaskActivityTimeline } from './TaskActivityTimeline'

interface TaskDetailsDrawerProps {
  task: Task | null
  open: boolean
  onClose: () => void
}

const LABEL_STYLES: Record<string, string> = {
  bug: 'bg-red-500/10 text-red-400',
  feature: 'bg-indigo-500/10 text-indigo-400',
  improvement: 'bg-emerald-500/10 text-emerald-400',
  design: 'bg-violet-500/10 text-violet-400',
  documentation: 'bg-sky-500/10 text-sky-400',
  testing: 'bg-amber-500/10 text-amber-400',
  devops: 'bg-rose-500/10 text-rose-400',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function TaskDetailsDrawer({ task, open, onClose }: TaskDetailsDrawerProps) {
  if (!task) return null

  const completedChecklist = task.checklist.filter((c) => c.completed).length
  const pct = task.checklist.length > 0 ? Math.round((completedChecklist / task.checklist.length) * 100) : null

  return (
    <Drawer open={open} onClose={onClose} title={task.title}>
      <div className="space-y-7">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <TaskStatusBadge status={task.status} size="md" />
          <PriorityBadge priority={task.priority} size="md" />
        </div>

        {/* Description */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-400">Description</h3>
          <p className="text-sm leading-relaxed text-slate-300">
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <User size={15} className="shrink-0 text-slate-500" />
            <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar size={15} className="shrink-0 text-slate-500" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock size={15} className="shrink-0 text-slate-500" />
            <span>{task.spentHours}/{task.estimatedHours}h</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MessageSquare size={15} className="shrink-0 text-slate-500" />
            <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Labels */}
        {task.labels.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-400">Labels</h3>
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map((label) => (
                <span key={label} className={`rounded-md px-2 py-0.5 text-xs font-medium ${LABEL_STYLES[label] || 'bg-slate-800/60 text-slate-500'}`}>
                  {LABEL_LABELS[label]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Checklist */}
        {task.checklist.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-400">Checklist</h3>
              <span className="text-xs text-slate-500">{completedChecklist}/{task.checklist.length}</span>
            </div>
            {pct !== null && (
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
              </div>
            )}
            <div className="space-y-2">
              {task.checklist.map((item) => (
                <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={item.completed} readOnly
                    className="mt-0.5 size-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/30" />
                  <span className={`text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        {task.comments.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-400">Comments</h3>
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-indigo-500 text-[9px] font-semibold text-white">
                    {comment.authorInitials}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200">{comment.author}</span>
                      <span className="text-[11px] text-slate-600">{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files placeholder */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-400">Files</h3>
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-800/50 px-4 py-6 text-center">
            <Paperclip size={18} className="text-slate-600" />
            <p className="text-sm text-slate-600">No files attached yet.</p>
          </div>
        </div>

        {/* Activity */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-400">Activity</h3>
          <TaskActivityTimeline
            comments={task.comments}
            updatedAt={task.updatedAt}
            checklistCompleted={completedChecklist}
            checklistTotal={task.checklist.length}
          />
        </div>
      </div>
    </Drawer>
  )
}
