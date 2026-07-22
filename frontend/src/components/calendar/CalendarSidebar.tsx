import { AlertCircle, ListTodo } from 'lucide-react'
import { useMemo } from 'react'
import type { CalendarEvent } from '../../types/calendar'
import { formatDateShort, isSameDay } from '../../types/calendar'
import { MiniCalendar as MiniCalendarComponent } from './MiniCalendar'

interface CalendarSidebarProps {
  allEvents: CalendarEvent[]
  year: number
  month: number
  selectedDate: Date
  onSelectDate: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  collapsed?: boolean
  showTasks: boolean
  showProjects: boolean
  showMeetings: boolean
  showMilestones: boolean
  showReminders: boolean
  onToggleFilter: (key: 'tasks' | 'projects' | 'meetings' | 'milestones' | 'reminders') => void
}

export function CalendarSidebar({
  allEvents, year, month, selectedDate, onSelectDate, onPrevMonth, onNextMonth,
  collapsed, showTasks, showProjects, showMeetings, showMilestones, showReminders, onToggleFilter,
}: CalendarSidebarProps) {
  // Upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)
    return allEvents
      .filter((e) => new Date(e.startDate) >= today && new Date(e.startDate) <= weekEnd)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
  }, [allEvents])

  // Today's tasks
  const todayEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return allEvents.filter((e) => isSameDay(new Date(e.startDate), today))
  }, [allEvents])

  // Overdue tasks
  const overdueEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return allEvents.filter((e) => new Date(e.startDate) < today && e.type !== 'meeting')
  }, [allEvents])

  if (collapsed) return null

  return (
    <div className="w-64 shrink-0 space-y-4">
      {/* Mini Calendar */}
      <MiniCalendarComponent
        year={year} month={month} selectedDate={selectedDate}
        onSelectDate={onSelectDate} onPrevMonth={onPrevMonth} onNextMonth={onNextMonth}
      />

      {/* Quick Filters */}
      <div className="rounded-xl border border-slate-800/60 bg-[#121827] p-3">
        <h3 className="mb-2 text-xs font-medium text-slate-400">Show</h3>
        <div className="space-y-1">
          {([
            ['tasks', showTasks, 'Tasks'],
            ['projects', showProjects, 'Projects'],
            ['meetings', showMeetings, 'Meetings'],
            ['milestones', showMilestones, 'Milestones'],
            ['reminders', showReminders, 'Reminders'],
          ] as const).map(([key, active, label]) => (
            <button key={key} onClick={() => onToggleFilter(key)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition ${
                active ? 'text-slate-200' : 'text-slate-600'
              }`}
            >
              <span className={`size-2 rounded-full ${active ? 'bg-indigo-400' : 'bg-slate-700'}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="rounded-xl border border-slate-800/60 bg-[#121827] p-3">
        <h3 className="mb-2 text-xs font-medium text-slate-400">Upcoming</h3>
        {upcomingEvents.length === 0 ? (
          <p className="text-xs text-slate-600">No upcoming events</p>
        ) : (
          <div className="space-y-1.5">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-2">
                <span className={`size-2 shrink-0 rounded-full ${e.type === 'task' ? 'bg-indigo-400' : e.type === 'meeting' ? 'bg-emerald-400' : e.type === 'milestone' ? 'bg-amber-400' : 'bg-sky-400'}`} />
                <div className="min-w-0">
                  <p className="truncate text-xs text-slate-400">{e.title}</p>
                  <p className="text-[10px] text-slate-600">{formatDateShort(new Date(e.startDate))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today / Overdue counts */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl border border-slate-800/60 bg-[#121827] p-3 text-center">
          <ListTodo size={14} className="mx-auto mb-1 text-indigo-400" />
          <p className="text-lg font-semibold text-slate-200">{todayEvents.length}</p>
          <p className="text-[10px] text-slate-500">Today</p>
        </div>
        <div className="flex-1 rounded-xl border border-slate-800/60 bg-[#121827] p-3 text-center">
          <AlertCircle size={14} className="mx-auto mb-1 text-rose-400" />
          <p className="text-lg font-semibold text-slate-200">{overdueEvents.length}</p>
          <p className="text-[10px] text-slate-500">Overdue</p>
        </div>
      </div>
    </div>
  )
}


