import { useQuery } from '@tanstack/react-query'
import client from './client'

interface Summary {
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

interface DistributionItem {
  label: string
  value: number
  color: string
}

interface ProjectHealthItem {
  id: string
  name: string
  status: string
  color: string
  completion: number
  overdueTasks: number
  totalTasks: number
}

interface TeamMemberWorkloadItem {
  name: string
  initials: string
  taskCount: number
  completedCount: number
  estimatedHours: number
  spentHours: number
}

interface RecentActivityItem {
  id: string
  type: string
  title: string
  projectName: string
  timestamp: string
  user: string
}

interface AnalyticsApiResponse {
  summary: Summary
  statusDistribution: DistributionItem[]
  priorityDistribution: DistributionItem[]
  projectHealth: ProjectHealthItem[]
  teamWorkload: TeamMemberWorkloadItem[]
  recentActivity: RecentActivityItem[]
}

const QUERY_KEY = ['analytics'] as const

export function useAnalytics() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'dashboard'],
    queryFn: async () => {
      const { data } = await client.get<AnalyticsApiResponse>('/analytics/dashboard')
      return data
    },
  })
}
