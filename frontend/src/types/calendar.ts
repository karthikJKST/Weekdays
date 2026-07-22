export type CalendarEventType = 'task' | 'project-deadline' | 'meeting' | 'milestone' | 'reminder'

export type CalendarView = 'month' | 'week' | 'day' | 'agenda'

export interface CalendarEvent {
  id: string
  title: string
  type: CalendarEventType
  projectId: string | null
  taskId: string | null
  project?: string
  priority?: string
  status?: string
  color: string
  startDate: string
  endDate: string | null
  description: string | null
  assignee?: string | null
  labels?: string[]
}

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  task: 'Task',
  'project-deadline': 'Project Deadline',
  meeting: 'Meeting',
  milestone: 'Milestone',
  reminder: 'Reminder',
}

export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  task: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'project-deadline': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  meeting: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  milestone: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  reminder: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
