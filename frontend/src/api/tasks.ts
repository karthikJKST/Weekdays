import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from './client'
import type { Task, TaskStatus, TaskPriority, TaskLabel } from '../types/task'

interface CreateTaskPayload {
  title: string
  description: string
  projectId: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeName: string
  estimatedHours: number
  labels: TaskLabel[]
}

interface UpdateTaskPayload {
  title: string
  description: string
  projectId: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeName: string
  estimatedHours: number
  spentHours: number
  labels: TaskLabel[]
}

interface TaskApiAssignee {
  id: string
  name: string
}

interface TaskApiChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface TaskApiComment {
  id: string
  author: string
  authorInitials: string
  text: string
  createdAt: string
}

interface TaskApiResponse {
  id: string
  title: string
  description: string
  projectId: string
  projectName: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assignee: TaskApiAssignee | null
  estimatedHours: number
  spentHours: number
  position: number
  labels: TaskLabel[]
  checklist: TaskApiChecklistItem[]
  comments: TaskApiComment[]
  archived: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

function mapTask(data: TaskApiResponse): Task {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    projectId: data.projectId,
    assignee: data.assignee
      ? { id: data.assignee.id, name: data.assignee.name, avatarInitials: data.assignee.name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) }
      : null,
    priority: data.priority,
    status: data.status,
    dueDate: data.dueDate,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    labels: data.labels,
    estimatedHours: data.estimatedHours,
    spentHours: data.spentHours,
    checklist: data.checklist,
    comments: data.comments,
  }
}

const QUERY_KEY = ['tasks'] as const

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', { projectId: projectId ?? 'all' }],
    queryFn: async () => {
      const params = projectId ? `?projectId=${projectId}` : ''
      const { data } = await client.get<TaskApiResponse[]>(`/tasks${params}`)
      return data.map(mapTask)
    },
  })
}

export function useArchivedTasks() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'archived'],
    queryFn: async () => {
      const { data } = await client.get<TaskApiResponse[]>('/tasks/archived')
      return data.map(mapTask)
    },
  })
}

export function useTodaysTasks() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'today'],
    queryFn: async () => {
      const { data } = await client.get<TaskApiResponse[]>('/tasks/today')
      return data.map(mapTask)
    },
  })
}

export function useUpcomingTasks() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'upcoming'],
    queryFn: async () => {
      const { data } = await client.get<TaskApiResponse[]>('/tasks/upcoming')
      return data.map(mapTask)
    },
  })
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'overdue'],
    queryFn: async () => {
      const { data } = await client.get<TaskApiResponse[]>('/tasks/overdue')
      return data.map(mapTask)
    },
  })
}

export function useCompletedTasks() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'completed'],
    queryFn: async () => {
      const { data } = await client.get<TaskApiResponse[]>('/tasks/completed')
      return data.map(mapTask)
    },
  })
}

export function useSearchTasks(query: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'search', query],
    queryFn: async () => {
      const { data } = await client.get<TaskApiResponse[]>(`/tasks/search?q=${encodeURIComponent(query)}`)
      return data.map(mapTask)
    },
    enabled: query.length >= 2,
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', id],
    queryFn: async () => {
      const { data } = await client.get<TaskApiResponse>(`/tasks/${id}`)
      return mapTask(data)
    },
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const { data } = await client.post<TaskApiResponse>('/tasks', payload)
      return mapTask(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateTaskPayload & { id: string }) => {
      const { data } = await client.put<TaskApiResponse>(`/tasks/${id}`, payload)
      return mapTask(data)
    },
    onMutate: async ({ id, ...payload }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: QUERY_KEY })
      queryClient.setQueriesData<Task[]>({ queryKey: QUERY_KEY }, (old) =>
        old?.map((t) => (t.id === id ? {
          ...t,
          title: payload.title,
          description: payload.description,
          projectId: payload.projectId,
          status: payload.status,
          priority: payload.priority,
          dueDate: payload.dueDate,
          estimatedHours: payload.estimatedHours,
          spentHours: payload.spentHours,
          labels: payload.labels,
          assignee: payload.assigneeName.trim()
            ? { id: t.assignee?.id ?? '', name: payload.assigneeName.trim(), avatarInitials: payload.assigneeName.trim().split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) }
            : null,
          updatedAt: new Date().toISOString(),
        } : t))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data } = await client.patch<TaskApiResponse>(`/tasks/${id}/status`, { status })
      return mapTask(data)
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: QUERY_KEY })
      queryClient.setQueriesData<Task[]>({ queryKey: QUERY_KEY }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateTaskPriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: TaskPriority }) => {
      const { data } = await client.patch<TaskApiResponse>(`/tasks/${id}/priority`, { priority })
      return mapTask(data)
    },
    onMutate: async ({ id, priority }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: QUERY_KEY })
      queryClient.setQueriesData<Task[]>({ queryKey: QUERY_KEY }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, priority, updatedAt: new Date().toISOString() } : t))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/tasks/${id}`)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: QUERY_KEY })
      queryClient.setQueriesData<Task[]>({ queryKey: QUERY_KEY }, (old) =>
        old?.filter((t) => t.id !== id)
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useArchiveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.patch<TaskApiResponse>(`/tasks/${id}/archive`)
      return mapTask(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useRestoreTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.patch<TaskApiResponse>(`/tasks/${id}/restore`)
      return mapTask(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useAssignTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, assigneeName }: { id: string; assigneeName: string }) => {
      const { data } = await client.patch<TaskApiResponse>(`/tasks/${id}/assign`, { assigneeName, assigneeId: '' })
      return mapTask(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUnassignTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.patch(`/tasks/${id}/unassign`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useBulkUpdateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: TaskStatus }) => {
      await client.patch('/tasks/bulk/status', { ids, status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useBulkUpdatePriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ids, priority }: { ids: string[]; priority: TaskPriority }) => {
      await client.patch('/tasks/bulk/priority', { ids, priority })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useBulkArchive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await client.patch('/tasks/bulk/archive', { ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useBulkRestore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await client.patch('/tasks/bulk/restore', { ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useBulkDelete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await client.delete('/tasks/bulk', { data: { ids } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
