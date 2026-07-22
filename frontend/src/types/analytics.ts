export interface AnalyticsSummary {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  totalEstimatedHours: number
  totalSpentHours: number
  totalMembers: number
}

export interface StatusDistribution {
  label: string
  value: number
  color: string
}

export interface PriorityDistribution {
  label: string
  value: number
  color: string
}

export interface ProjectHealth {
  id: string
  name: string
  status: string
  color: string
  completion: number
  overdueTasks: number
  totalTasks: number
}

export interface TeamMemberWorkload {
  name: string
  initials: string
  taskCount: number
  completedCount: number
  estimatedHours: number
  spentHours: number
}

export interface RecentActivityItem {
  id: string
  type: 'task_created' | 'task_completed' | 'task_updated' | 'project_created'
  title: string
  projectName: string
  timestamp: string
  user: string
}
