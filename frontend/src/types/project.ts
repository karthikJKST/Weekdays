export type ProjectStatus = 'backlog' | 'in_progress' | 'review' | 'done'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'

export interface TeamMember {
  id: string
  name: string
  avatarInitials: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  color: string
  dueDate: string | null
  teamMembers: TeamMember[]
  taskCount: number
  completedTaskCount: number
  createdAt: string
  updatedAt: string
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
}

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

export type SortKey = 'name' | 'updatedAt' | 'dueDate'
export type SortOrder = 'asc' | 'desc'
