export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'
export type TaskLabel = 'bug' | 'feature' | 'improvement' | 'design' | 'documentation' | 'testing' | 'devops'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface TaskComment {
  id: string
  author: string
  authorInitials: string
  text: string
  createdAt: string
}

export interface TaskAssignee {
  id: string
  name: string
  avatarInitials: string
}

export interface Task {
  id: string
  title: string
  description: string
  projectId: string
  assignee: TaskAssignee | null
  priority: TaskPriority
  status: TaskStatus
  dueDate: string | null
  createdAt: string
  updatedAt: string
  labels: TaskLabel[]
  estimatedHours: number
  spentHours: number
  checklist: ChecklistItem[]
  comments: TaskComment[]
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const LABEL_LABELS: Record<TaskLabel, string> = {
  bug: 'Bug',
  feature: 'Feature',
  improvement: 'Improvement',
  design: 'Design',
  documentation: 'Docs',
  testing: 'Testing',
  devops: 'DevOps',
}

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
]

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export type TaskSortKey = 'updatedAt' | 'dueDate' | 'priority' | 'title'
export type SortOrder = 'asc' | 'desc'
