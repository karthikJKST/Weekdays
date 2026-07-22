import { memo } from 'react'
import { MessageSquare } from 'lucide-react'
import type { Task } from '../../types/task'
import { TaskStatusBadge } from './TaskStatusBadge'
import { PriorityBadge } from './PriorityBadge'

interface TaskTableProps {
  tasks: Task[]
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onSelectAll: () => void
  onClick: (task: Task) => void
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const TaskTable = memo(function TaskTable({ tasks, selectedIds, onSelect, onSelectAll, onClick }: TaskTableProps) {
  const allSelected = tasks.length > 0 && selectedIds.size === tasks.length

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800/60 bg-[#0e1421]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800/60 text-xs font-medium uppercase tracking-wider text-slate-600">
            <th className="w-10 px-4 py-3 text-left">
              <input type="checkbox" checked={allSelected} onChange={onSelectAll}
                className="size-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/30" aria-label="Select all" />
            </th>
            <th className="px-3 py-3 text-left">Task</th>
            <th className="px-3 py-3 text-left hidden md:table-cell">Status</th>
            <th className="px-3 py-3 text-left hidden lg:table-cell">Priority</th>
            <th className="px-3 py-3 text-left hidden lg:table-cell">Assignee</th>
            <th className="px-3 py-3 text-left hidden md:table-cell">Due</th>
            <th className="px-3 py-3 text-right hidden sm:table-cell">Hours</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {tasks.map((task) => (
            <tr key={task.id}
              onClick={() => onClick(task)}
              className={`cursor-pointer transition hover:bg-slate-800/20 ${selectedIds.has(task.id) ? 'bg-indigo-500/5' : ''}`}
              role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onClick(task) }}
              aria-label={`Task: ${task.title}`}
            >
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" checked={selectedIds.has(task.id)} onChange={() => onSelect(task.id)}
                  className="size-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/30" aria-label={`Select ${task.title}`} />
              </td>
              <td className="px-3 py-3">
                <p className="font-medium text-slate-200 truncate max-w-xs">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {task.comments.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MessageSquare size={11} />{task.comments.length}
                    </span>
                  )}
                  {task.checklist.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      {task.checklist.filter(c => c.completed).length}/{task.checklist.length}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className="px-3 py-3 hidden lg:table-cell">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="px-3 py-3 hidden lg:table-cell">
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-full bg-indigo-500 text-[9px] font-semibold text-white">{task.assignee.avatarInitials}</span>
                    <span className="text-slate-400 text-sm">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <span className={`text-sm ${task.dueDate && (() => { const now = new Date(); now.setHours(0, 0, 0, 0); return new Date(task.dueDate) < now })() ? 'text-red-400' : 'text-slate-400'}`}>
                  {formatDate(task.dueDate)}
                </span>
              </td>
              <td className="px-3 py-3 text-right hidden sm:table-cell">
                <span className="text-slate-400">{task.spentHours}/{task.estimatedHours}h</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
