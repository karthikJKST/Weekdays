import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { CalendarHeader } from '../components/calendar/CalendarHeader'
import { CalendarToolbar } from '../components/calendar/CalendarToolbar'
import { CalendarSidebar } from '../components/calendar/CalendarSidebar'
import { MonthView } from '../components/calendar/MonthView'
import { WeekView } from '../components/calendar/WeekView'
import { DayView } from '../components/calendar/DayView'
import { AgendaView } from '../components/calendar/AgendaView'
import { EventDrawer } from '../components/calendar/EventDrawer'
import { CalendarSkeleton } from '../components/calendar/CalendarSkeleton'
import { EmptyCalendar } from '../components/calendar/EmptyCalendar'
import { useCalendar } from '../api/calendar'
import { useTasks } from '../api/tasks'
import { useProjects } from '../api/projects'
import type { CalendarEvent, CalendarView, CalendarEventType } from '../types/calendar'

const PROJ_COLORS: Record<string, string> = {
  backlog: 'slate',
  in_progress: 'indigo',
  review: 'amber',
  done: 'emerald',
}

const TASK_TYPE: CalendarEventType = 'task'
const DEADLINE_TYPE: CalendarEventType = 'project-deadline'


const STORAGE_KEY = 'weekdays-calendar-state'

interface PersistedState {
  view: CalendarView
  selectedDate: string
  sidebarCollapsed: boolean
  showTasks: boolean
  showProjects: boolean
  showMeetings: boolean
  showMilestones: boolean
  showReminders: boolean
}

function loadState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Partial<PersistedState>
  } catch { /* ignore */ }
  return {}
}

function saveState(state: PersistedState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}

export function CalendarPage() {
  const persisted = useRef(loadState())
  const searchRef = useRef<HTMLInputElement>(null)

  // Data from API
  const { data: apiEvents = [], isLoading: calendarLoading } = useCalendar()
  const { data: tasks = [] } = useTasks()
  const { data: projects = [] } = useProjects()
  const loading = calendarLoading

  // Date state
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const saved = persisted.current.selectedDate
    return saved ? new Date(saved) : today
  })

  // View
  const [view, setView] = useState<CalendarView>(persisted.current.view ?? 'month')

  // Sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(persisted.current.sidebarCollapsed ?? false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [showTasks, setShowTasks] = useState(persisted.current.showTasks ?? true)
  const [showProjects, setShowProjects] = useState(persisted.current.showProjects ?? true)
  const [showMeetings, setShowMeetings] = useState(persisted.current.showMeetings ?? true)
  const [showMilestones, setShowMilestones] = useState(persisted.current.showMilestones ?? true)
  const [showReminders, setShowReminders] = useState(persisted.current.showReminders ?? true)

  // Derive calendar events: merge API events + task due dates + project deadlines
  const allEvents = useMemo(() => {
    const merged = [...apiEvents]

    // Task due dates → calendar events
    for (const task of tasks) {
      if (task.dueDate && !merged.some((e) => e.taskId === task.id)) {
        const proj = projects.find((p) => p.id === task.projectId)
        merged.push({
          id: `cal-task-${task.id}`,
          title: task.title,
          type: TASK_TYPE,
          projectId: task.projectId,
          taskId: task.id,
          project: proj?.name,
          priority: task.priority,
          status: task.status,
          color: proj?.color ?? PROJ_COLORS[proj?.status ?? 'in_progress'] ?? 'indigo',
          startDate: task.dueDate,
          endDate: null,
          description: task.description,
          assignee: task.assignee?.name ?? null,
          labels: task.labels,
        })
      }
    }

    // Project deadlines → calendar events
    for (const proj of projects) {
      if (proj.dueDate && !merged.some((e) => e.projectId === proj.id && e.type === DEADLINE_TYPE)) {
        merged.push({
          id: `cal-proj-${proj.id}`,
          title: `${proj.name} deadline`,
          type: DEADLINE_TYPE,
          projectId: proj.id,
          taskId: null,
          project: proj.name,
          priority: proj.priority,
          status: proj.status,
          color: proj.color,
          startDate: proj.dueDate,
          endDate: null,
          description: proj.description,
          assignee: null,
          labels: [],
        })
      }
    }

    return merged
  }, [apiEvents, tasks, projects])

  // Drawer
  const [drawerEvent, setDrawerEvent] = useState<CalendarEvent | null>(null)

  // Persist state
  useEffect(() => {
    saveState({
      view, selectedDate: selectedDate.toISOString(), sidebarCollapsed,
      showTasks, showProjects, showMeetings, showMilestones, showReminders,
    })
  }, [view, selectedDate, sidebarCollapsed, showTasks, showProjects, showMeetings, showMilestones, showReminders])

  // Filtered events
  const filteredEvents = useMemo(() => {
    let result = allEvents
    if (!showTasks) result = result.filter((e) => e.type !== 'task')
    if (!showProjects) result = result.filter((e) => e.type !== 'project-deadline')
    if (!showMeetings) result = result.filter((e) => e.type !== 'meeting')
    if (!showMilestones) result = result.filter((e) => e.type !== 'milestone')
    if (!showReminders) result = result.filter((e) => e.type !== 'reminder')
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((e) => e.title.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q)))
    }
    return result
  }, [allEvents, showTasks, showProjects, showMeetings, showMilestones, showReminders, searchQuery])

  // Handlers
  const goToToday = useCallback(() => {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth())
    setSelectedDate(d)
  }, [])

  const goToPrev = useCallback(() => {
    if (view === 'month') {
      setMonth((m) => { const newM = m - 1; if (newM < 0) { setYear((y) => y - 1); return 11 }; return newM })
    } else if (view === 'week') {
      const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); setYear(d.getFullYear()); setMonth(d.getMonth())
    } else if (view === 'day') {
      const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); setYear(d.getFullYear()); setMonth(d.getMonth())
    }
  }, [view, selectedDate])

  const goToNext = useCallback(() => {
    if (view === 'month') {
      setMonth((m) => { const newM = m + 1; if (newM > 11) { setYear((y) => y + 1); return 0 }; return newM })
    } else if (view === 'week') {
      const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); setYear(d.getFullYear()); setMonth(d.getMonth())
    } else if (view === 'day') {
      const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); setYear(d.getFullYear()); setMonth(d.getMonth())
    }
  }, [view, selectedDate])

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
    setYear(date.getFullYear())
    setMonth(date.getMonth())
  }, [])

  const handleEventDrop = useCallback((_event: CalendarEvent, _newDate: Date) => {
    // Drag-and-drop date updates will be implemented with the update API
  }, [])

  const toggleFilter = useCallback((key: 'tasks' | 'projects' | 'meetings' | 'milestones' | 'reminders') => {
    if (key === 'tasks') setShowTasks((v) => !v)
    else if (key === 'projects') setShowProjects((v) => !v)
    else if (key === 'meetings') setShowMeetings((v) => !v)
    else if (key === 'milestones') setShowMilestones((v) => !v)
    else if (key === 'reminders') setShowReminders((v) => !v)
  }, [])

  // Stable refs for navigation callbacks to avoid re-registering keyboard listener
  const goToTodayRef = useRef(goToToday)
  const goToPrevRef = useRef(goToPrev)
  const goToNextRef = useRef(goToNext)
  goToTodayRef.current = goToToday
  goToPrevRef.current = goToPrev
  goToNextRef.current = goToNext

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
      const isCmd = e.metaKey || e.ctrlKey

      if (e.key === 'Escape') { setDrawerEvent(null); return }
      if (!isInput && !isCmd) {
        if (e.key === 't' || e.key === 'T') { e.preventDefault(); goToTodayRef.current(); return }
        if (e.key === 'm' || e.key === 'M') { e.preventDefault(); setView('month'); return }
        if (e.key === 'w' || e.key === 'W') { e.preventDefault(); setView('week'); return }
        if (e.key === 'd' || e.key === 'D') { e.preventDefault(); setView('day'); return }
        if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setView('agenda'); return }
        if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrevRef.current(); return }
        if (e.key === 'ArrowRight') { e.preventDefault(); goToNextRef.current(); return }
      }
      if (e.key === 'f' && isCmd) { e.preventDefault(); searchRef.current?.focus(); return }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, []) // Stable effect: refs always point to latest callbacks

  return (
    <PageContainer
      title=""
      description=""
      actions={null}
    >
      <CalendarHeader
        year={year} month={month} view={view} selectedDate={selectedDate}
        onPrev={goToPrev} onNext={goToNext} onToday={goToToday}
      />

      <CalendarToolbar
        view={view} searchQuery={searchQuery}
        onViewChange={setView} onSearchChange={setSearchQuery}
        showTasks={showTasks} showProjects={showProjects}
        showMeetings={showMeetings} showMilestones={showMilestones} showReminders={showReminders}
        onToggleFilter={toggleFilter}
      />

      {loading && <CalendarSkeleton />}

      {!loading && (
        <div className="flex gap-6">
          <CalendarSidebar
            allEvents={allEvents}
            year={year} month={month} selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onPrevMonth={() => { setMonth((m) => { const nm = m - 1; if (nm < 0) { setYear((y) => y - 1); return 11 }; return nm }) }}
            onNextMonth={() => { setMonth((m) => { const nm = m + 1; if (nm > 11) { setYear((y) => y + 1); return 0 }; return nm }) }}
            collapsed={sidebarCollapsed}
            showTasks={showTasks} showProjects={showProjects}
            showMeetings={showMeetings} showMilestones={showMilestones} showReminders={showReminders}
            onToggleFilter={toggleFilter}
          />

          <div className="flex-1 min-w-0">
            {/* Sidebar toggle */}
            <div className="flex items-center mb-3">
              <button
                onClick={() => setSidebarCollapsed((v) => !v)}
                className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition"
                aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              >
                {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </div>

            {filteredEvents.length === 0 && searchQuery && (
              <EmptyCalendar type="no-results" onClearFilters={() => setSearchQuery('')} />
            )}

            {view === 'month' && filteredEvents.length > 0 && (
              <MonthView
                year={year} month={month} events={filteredEvents}
                selectedDate={selectedDate} onSelectDate={handleSelectDate}
                onEventClick={setDrawerEvent} onEventDrop={handleEventDrop}
              />
            )}

            {view === 'week' && (
              <WeekView selectedDate={selectedDate} events={filteredEvents} onEventClick={setDrawerEvent} />
            )}

            {view === 'day' && (
              <DayView selectedDate={selectedDate} events={filteredEvents} onEventClick={setDrawerEvent} />
            )}

            {view === 'agenda' && (
              <AgendaView events={filteredEvents} onEventClick={setDrawerEvent} />
            )}

            {/* Empty state for views with no events */}
            {filteredEvents.length === 0 && !searchQuery && view !== 'agenda' && (
              <EmptyCalendar type="empty" />
            )}
            {filteredEvents.length === 0 && !searchQuery && view === 'agenda' && (
              <EmptyCalendar type="no-upcoming" />
            )}
          </div>
        </div>
      )}

      <EventDrawer event={drawerEvent} open={drawerEvent !== null} onClose={() => setDrawerEvent(null)} />
    </PageContainer>
  )
}
