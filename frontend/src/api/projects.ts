import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import client from './client'
import type { Project, ProjectStatus, ProjectPriority } from '../types/project'
import type { ProblemDetail } from '../types/auth'

interface CreateProjectPayload {
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  color: string
  dueDate: string | null
}

interface UpdateProjectPayload {
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  color: string
  dueDate: string | null
}

interface ProjectApiResponse {
  id: string
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  color: string
  dueDate: string | null
  taskCount: number
  completedTaskCount: number
  createdAt: string
  updatedAt: string
}

function mapProject(data: ProjectApiResponse): Project {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status,
    priority: data.priority,
    color: data.color,
    dueDate: data.dueDate,
    teamMembers: [],
    taskCount: data.taskCount,
    completedTaskCount: data.completedTaskCount,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ProblemDetail>
  if (axiosError.response?.data?.detail) {
    return axiosError.response.data.detail
  }
  if (axiosError.message) {
    return axiosError.message
  }
  return 'An unexpected error occurred.'
}

const QUERY_KEY = ['projects'] as const

export function useProjects(includeArchived = false) {
  return useQuery({
    queryKey: [...QUERY_KEY, { includeArchived }],
    queryFn: async () => {
      const params = includeArchived ? '?includeArchived=true' : ''
      const { data } = await client.get<ProjectApiResponse[]>(`/projects${params}`)
      return data.map(mapProject)
    },
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateProjectPayload) => {
      const { data } = await client.post<ProjectApiResponse>('/projects', payload)
      return mapProject(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateProjectPayload & { id: string }) => {
      const { data } = await client.put<ProjectApiResponse>(`/projects/${id}`, payload)
      return mapProject(data)
    },
    onMutate: async ({ id, ...payload }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData<Project[]>([...QUERY_KEY, { includeArchived: false }])
      queryClient.setQueryData<Project[]>([...QUERY_KEY, { includeArchived: false }], (old) =>
        old?.map((p) => (p.id === id ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...QUERY_KEY, { includeArchived: false }], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      const { data } = await client.patch<ProjectApiResponse>(`/projects/${id}/status`, { status })
      return mapProject(data)
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData<Project[]>([...QUERY_KEY, { includeArchived: false }])
      queryClient.setQueryData<Project[]>([...QUERY_KEY, { includeArchived: false }], (old) =>
        old?.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...QUERY_KEY, { includeArchived: false }], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/projects/${id}`)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData<Project[]>([...QUERY_KEY, { includeArchived: false }])
      queryClient.setQueryData<Project[]>([...QUERY_KEY, { includeArchived: false }], (old) =>
        old?.filter((p) => p.id !== id),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...QUERY_KEY, { includeArchived: false }], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export { getErrorMessage }
