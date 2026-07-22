import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CalendarClock,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  Sparkles,
  GitBranch,
  CalendarDays,
} from 'lucide-react'
import { useProjects } from '../api/projects'
import { useUpcomingTasks, useOverdueTasks, useCompletedTasks, useTasks } from '../api/tasks'
import { useCalendar } from '../api/calendar'
import type { Project } from '../types/project'
import type { Task } from '../types/task'
import type { CalendarEvent } from '../types/calendar'

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.FC<{ size?: number; className?: string }>
  label: string
  value: string | number
  color: string
  trend?: { value: string; positive: boolean }
}) {
  return (
    <div className="group rounded-2xl border border-slate-800/60 bg-[#121827] p-5 transition hover:border-slate-700/60 hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-start justify-between">
        <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              trend.positive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'
            }`}
          >
            <TrendingUp size={12} className={trend.positive ? '' : 'rotate-180'} />
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </div>
  )
}

function RecentProjectCard({ project }: { project: Project }) {
  const progress = project.taskCount > 0 ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0

  return (
    <div className="group rounded-xl border border-slate-800/50 bg-[#0e1421] p-4 transition hover:border-slate-700/50 hover:shadow-md hover:shadow-black/20">
      <div className="flex items-center gap-3">
        <div
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">{project.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {project.taskCount} tasks · {progress}% done
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
            project.status === 'done'
              ? 'bg-emerald-400/10 text-emerald-400'
              : project.status === 'in_progress'
                ? 'bg-indigo-400/10 text-indigo-400'
                : project.status === 'review'
                  ? 'bg-amber-400/10 text-amber-400'
                  : 'bg-slate-700/30 text-slate-500'
          }`}
        >
          {project.status === 'done' ? 'Done' : project.status === 'in_progress' ? 'Active' : project.status === 'review' ? 'Review' : 'Backlog'}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function UpcomingTaskCard({ task }: { task: Task }) {
  const now = new Date()
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  const isOverdue = dueDate && dueDate < new Date(now.toDateString())
  const isToday = dueDate && dueDate.toDateString() === now.toDateString()

  let dueText = 'No due date'
  if (isToday) dueText = 'Today'
  else if (isOverdue) dueText = 'Overdue'
  else if (dueDate) dueText = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-800/30 bg-[#0e1421] px-4 py-3 transition hover:border-slate-700/50 hover:shadow-sm">
      <span
        className={`size-2 shrink-0 rounded-full ${
          task.priority === 'urgent'
            ? 'bg-rose-500'
            : task.priority === 'high'
              ? 'bg-amber-500'
              : task.priority === 'medium'
                ? 'bg-indigo-500'
                : 'bg-slate-600'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-slate-200 group-hover:text-white">{task.title}</p>
      </div>
      <span
        className={`shrink-0 text-xs font-medium ${
          isOverdue ? 'text-rose-400' : isToday ? 'text-amber-400' : 'text-slate-500'
        }`}
      >
        {dueText}
      </span>
    </div>
  )
}

function CalendarEventCard({ event }: { event: CalendarEvent }) {
  const startDate = new Date(event.startDate)

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800/30 bg-[#0e1421] px-4 py-3">
      <div
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: event.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-slate-200">{event.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: tasks = [] } = useTasks()
  const { data: upcomingTasks = [] } = useUpcomingTasks()
  const { data: overdueTasks = [] } = useOverdueTasks()
  const { data: completedTasks = [] } = useCompletedTasks()
  const { data: calendarEvents = [] } = useCalendar()

  const activeProjects = useMemo(() => projects.filter((p) => p.status !== 'done'), [projects])
  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [projects],
  )

  const todayEvents = useMemo(
    () =>
      calendarEvents.filter((e) => {
        const today = new Date()
        const eventDate = new Date(e.startDate)
        return eventDate.toDateString() === today.toDateString()
      }),
    [calendarEvents],
  )

  const totalTasks = tasks.length
  const completedCount = completedTasks.length
  const overdueCount = overdueTasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  const recentActivity = useMemo(() => {
    const activity: { time: string; text: string; icon: React.FC<{ size?: number; className?: string }>; color: string }[] = []
    const recentCompleted = completedTasks.slice(0, 3)
    recentCompleted.forEach((t) => {
      activity.push({
        time: new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        text: `Completed "${t.title}"`,
        icon: CheckCircle2,
        color: 'text-emerald-400',
      })
    })
    const recentProjects_ = projects.slice(0, 2)
    recentProjects_.forEach((p) => {
      activity.push({
        time: new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        text: `Updated "${p.name}" project`,
        icon: FolderKanban,
        color: 'text-indigo-400',
      })
    })
    return activity.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5)
  }, [completedTasks, projects])

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back. Here&apos;s your engineering overview.
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            <FolderKanban size={15} />
            Projects
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
          >
            <Plus size={15} />
            New Task
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          icon={FolderKanban}
          label="Active Projects"
          value={projectsLoading ? '—' : activeProjects.length}
          color="bg-indigo-500/10 text-indigo-400"
        />
        <MetricCard
          icon={ListTodo}
          label="Total Tasks"
          value={totalTasks}
          color="bg-sky-500/10 text-sky-400"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Completed"
          value={completedCount}
          color="bg-emerald-500/10 text-emerald-400"
          trend={{ value: `${completionRate}%`, positive: completionRate >= 50 }}
        />
        <MetricCard
          icon={AlertCircle}
          label="Overdue"
          value={overdueCount}
          color={overdueCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-700/30 text-slate-500'}
          trend={overdueCount > 0 ? { value: `${overdueCount} tasks`, positive: false } : undefined}
        />
        <MetricCard
          icon={TrendingUp}
          label="Productivity"
          value={`${completionRate}%`}
          color="bg-amber-500/10 text-amber-400"
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Recent Projects */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#121827] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban size={16} className="text-indigo-400" />
              <h2 className="text-sm font-medium text-slate-200">Recent Projects</h2>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-1 text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          {projectsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[72px] animate-pulse rounded-xl bg-slate-800/40" />
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="space-y-2.5">
              {recentProjects.map((project) => (
                <RecentProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <FolderKanban size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">Create your first project to get started.</p>
              <button
                onClick={() => navigate('/projects')}
                className="rounded-lg bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/20"
              >
                Create Project
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#121827] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock size={16} className="text-amber-400" />
              <h2 className="text-sm font-medium text-slate-200">Upcoming Tasks</h2>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="flex items-center gap-1 text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          {upcomingTasks.length > 0 || overdueTasks.length > 0 ? (
            <div className="space-y-1.5">
              {overdueTasks.slice(0, 3).map((task) => (
                <UpcomingTaskCard key={task.id} task={task} />
              ))}
              {upcomingTasks.slice(0, 3 - Math.min(overdueTasks.length, 3)).map((task) => (
                <UpcomingTaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Clock size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">No upcoming tasks due.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
        {/* Today's Schedule */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#121827] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-sky-400" />
            <h2 className="text-sm font-medium text-slate-200">Today&apos;s Schedule</h2>
          </div>
          {todayEvents.length > 0 ? (
            <div className="space-y-2">
              {todayEvents.slice(0, 4).map((event) => (
                <CalendarEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CalendarDays size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">No events scheduled for today.</p>
              <button
                onClick={() => navigate('/calendar')}
                className="rounded-lg bg-sky-500/10 px-4 py-2 text-xs font-medium text-sky-400 transition hover:bg-sky-500/20"
              >
                View Calendar
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#121827] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <h2 className="text-sm font-medium text-slate-200">Recent Activity</h2>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon size={15} className={`mt-0.5 shrink-0 ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-slate-300">{item.text}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Sparkles size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">Activity will appear as you work.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#121827] p-5">
          <div className="mb-4 flex items-center gap-2">
            <GitBranch size={16} className="text-emerald-400" />
            <h2 className="text-sm font-medium text-slate-200">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/projects')}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800/50 bg-[#0e1421] px-4 py-3 text-left transition hover:border-slate-700/50 hover:bg-[#111827]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <FolderKanban size={17} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">Create Project</p>
                <p className="text-xs text-slate-500">Start a new engineering project</p>
              </div>
              <ArrowRight size={15} className="text-slate-600" />
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800/50 bg-[#0e1421] px-4 py-3 text-left transition hover:border-slate-700/50 hover:bg-[#111827]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
                <ListTodo size={17} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">Create Task</p>
                <p className="text-xs text-slate-500">Add a new task to track work</p>
              </div>
              <ArrowRight size={15} className="text-slate-600" />
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800/50 bg-[#0e1421] px-4 py-3 text-left transition hover:border-slate-700/50 hover:bg-[#111827]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sky-500/10 text-sky-400">
                <CalendarDays size={17} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">Create Meeting</p>
                <p className="text-xs text-slate-500">Schedule a team event</p>
              </div>
              <ArrowRight size={15} className="text-slate-600" />
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800/50 bg-[#0e1421] px-4 py-3 text-left transition hover:border-slate-700/50 hover:bg-[#111827]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp size={17} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">View Analytics</p>
                <p className="text-xs text-slate-500">Check project and team metrics</p>
              </div>
              <ArrowRight size={15} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
