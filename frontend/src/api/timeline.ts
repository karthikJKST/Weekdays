import { useQuery } from '@tanstack/react-query'
import client from './client'

export interface TimelineActivity {
  id: string
  type: string
  title: string
  description: string
  projectId: string
  projectName: string
  taskId: string | null
  calendarEventId: string | null
  timestamp: string
  actor: string
  icon: string
  color: string
}

interface TimelineApiResponse {
  items: TimelineActivity[]
  page: number
  size: number
  totalPages: number
  totalItems: number
}

const QUERY_KEY = ['timeline'] as const

export function useTimeline(page = 0, size = 20) {
  return useQuery({
    queryKey: [...QUERY_KEY, { page, size }],
    queryFn: async () => {
      const { data } = await client.get<TimelineApiResponse>(`/timeline?page=${page}&size=${size}`)
      return data
    },
  })
}
