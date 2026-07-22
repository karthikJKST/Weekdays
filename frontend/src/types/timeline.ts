export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter'

export type TimelineItemType = 'task' | 'milestone' | 'project-group' | 'project-deadline'

export interface TimelineDependency {
  fromId: string
  toId: string
}

export interface TimelineItem {
  id: string
  type: TimelineItemType
  title: string
  description: string | null
  projectId: string | null
  project: string
  groupId: string | null
  startDate: string | null
  endDate: string | null
  progress: number
  priority: string
  status: string
  assignee: string | null
  assigneeInitials: string | null
  color: string
  dependencies: TimelineDependency[]
  collapsed?: boolean
  children?: TimelineItem[]
}

export interface TimelineGroup {
  id: string
  title: string
  color: string
  collapsed: boolean
  items: TimelineItem[]
}

export const ZOOM_LABELS: Record<ZoomLevel, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  quarter: 'Quarter',
}

export const DAY_WIDTH: Record<ZoomLevel, number> = {
  day: 60,
  week: 30,
  month: 12,
  quarter: 4,
}

export function daysBetween(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil((e.getTime() - s.getTime()) / 86400000)
}

export function getZoomRange(items: TimelineItem[], zoom: ZoomLevel): { start: Date; end: Date; totalDays: number } {
  let minDate = new Date()
  let maxDate = new Date()
  minDate.setDate(minDate.getDate() - 30)
  maxDate.setDate(maxDate.getDate() + 90)

  for (const item of items) {
    if (item.startDate) {
      const d = new Date(item.startDate)
      if (d < minDate) minDate = d
    }
    if (item.endDate) {
      const d = new Date(item.endDate)
      if (d > maxDate) maxDate = d
    }
  }

  // Extend range based on zoom
  if (zoom === 'month') {
    minDate.setDate(minDate.getDate() - 15)
    maxDate.setDate(maxDate.getDate() + 15)
  } else if (zoom === 'quarter') {
    minDate.setMonth(minDate.getMonth() - 2)
    maxDate.setMonth(maxDate.getMonth() + 2)
  }

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / 86400000)
  return { start: minDate, end: maxDate, totalDays: Math.max(totalDays, 60) }
}

export function dateToX(date: Date, rangeStart: Date, pixelsPerDay: number): number {
  const diff = Math.ceil((date.getTime() - rangeStart.getTime()) / 86400000)
  return diff * pixelsPerDay
}
