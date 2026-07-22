import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from './client'

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const QUERY_KEY = ['notifications'] as const

export function useNotifications() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list'],
    queryFn: async () => {
      const { data } = await client.get<Notification[]>('/notifications')
      return data
    },
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'unread-count'],
    queryFn: async () => {
      const { data } = await client.get<number>('/notifications/unread-count')
      return data
    },
    refetchInterval: 30_000, // Poll every 30 seconds
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.patch<Notification>(`/notifications/${id}/read`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await client.patch('/notifications/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
