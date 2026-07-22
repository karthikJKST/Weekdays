import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from './client'
import type { CalendarEvent, CalendarEventType } from '../types/calendar'

interface CreateEventPayload {
  title: string
  description: string
  eventType: CalendarEventType
  startTime: string
  endTime: string | null
  allDay: boolean
  color: string
  location: string
  projectId: string | null
}

interface UpdateEventPayload {
  title: string
  description: string
  eventType: CalendarEventType
  startTime: string
  endTime: string | null
  allDay: boolean
  color: string
  location: string
  projectId: string | null
}

interface EventApiResponse {
  id: string
  title: string
  description: string
  eventType: CalendarEventType
  startTime: string
  endTime: string | null
  allDay: boolean
  color: string
  location: string
  projectId: string | null
  projectName: string | null
  taskId: string | null
  createdAt: string
  updatedAt: string
}

function mapEvent(data: EventApiResponse): CalendarEvent {
  return {
    id: data.id,
    title: data.title,
    type: data.eventType,
    projectId: data.projectId,
    taskId: data.taskId,
    project: data.projectName ?? undefined,
    color: data.color,
    startDate: data.startTime,
    endDate: data.endTime,
    description: data.description,
    labels: [],
  }
}

const QUERY_KEY = ['calendar'] as const

export function useCalendar() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'all'],
    queryFn: async () => {
      const { data } = await client.get<EventApiResponse[]>('/calendar')
      return data.map(mapEvent)
    },
  })
}

export function useCalendarMonth(year: number, month: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'month', year, month],
    queryFn: async () => {
      const { data } = await client.get<EventApiResponse[]>(`/calendar/month?year=${year}&month=${month}`)
      return data.map(mapEvent)
    },
  })
}

export function useCalendarWeek(date: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'week', date],
    queryFn: async () => {
      const { data } = await client.get<EventApiResponse[]>(`/calendar/week?date=${date}`)
      return data.map(mapEvent)
    },
  })
}

export function useCalendarDay(date: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'day', date],
    queryFn: async () => {
      const { data } = await client.get<EventApiResponse[]>(`/calendar/day?date=${date}`)
      return data.map(mapEvent)
    },
  })
}

export function useCalendarRange(from: string, to: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'range', from, to],
    queryFn: async () => {
      const params = new URLSearchParams({ from, to })
      const { data } = await client.get<EventApiResponse[]>(`/calendar/range?${params}`)
      return data.map(mapEvent)
    },
    enabled: !!from && !!to,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateEventPayload) => {
      const { data } = await client.post<EventApiResponse>('/calendar', payload)
      return mapEvent(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateEventPayload & { id: string }) => {
      const { data } = await client.put<EventApiResponse>(`/calendar/${id}`, payload)
      return mapEvent(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/calendar/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
