import { FolderKanban, ListTodo, Users, Clock, TrendingUp, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/analytics/StatCard'
import { BarChart } from '../components/analytics/BarChart'
import { DoughnutChart } from '../components/analytics/DoughnutChart'
import { ProjectHealthList } from '../components/analytics/ProjectHealthList'
import { useAnalytics } from '../api/analytics'

export function AnalyticsPage() {
  const { data, isLoading, error } = useAnalytics()

  // Guard: loading
  if (isLoading) {
    return (
      <PageContainer title="Analytics" description="Engineering metrics and team insights.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-800/40" />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-800/40" />
          ))}
        </div>
      </PageContainer>
    )
  }

  // Guard: error
  if (error || !data) {
    return (
      <PageContainer title="Analytics" description="Engineering metrics and team insights.">
        <div className="flex flex-col items-center gap-4 py-20">
          <p className="text-sm text-red-400">Failed to load analytics data.</p>
        </div>
      </PageContainer>
    )
  }

  const summary = data.summary
  const statusDistribution = data.statusDistribution
  const priorityDistribution = data.priorityDistribution
  const projectHealths = data.projectHealth
  const teamWorkload = data.teamWorkload
  const recentActivity = data.recentActivity

  const budgetPct = summary.totalEstimatedHours > 0
    ? Math.round((summary.totalSpentHours / summary.totalEstimatedHours) * 100)
    : 0

  return (
    <PageContainer
      title="Analytics"
      description="Engineering metrics and team insights."
    >
      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FolderKanban size={20} />}
          label="Active Projects"
          value={summary.activeProjects}
          change={`${summary.totalProjects} total`}
          changeDirection="neutral"
        />
        <StatCard
          icon={<ListTodo size={20} />}
          label="Task Completion"
          value={`${summary.completionRate}%`}
          change={`${summary.completedTasks}/${summary.totalTasks} done`}
          changeDirection={summary.completionRate >= 50 ? 'up' : 'down'}
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Overdue Tasks"
          value={summary.overdueTasks}
          change={summary.overdueTasks > 0 ? 'Needs attention' : 'All clear'}
          changeDirection={summary.overdueTasks > 0 ? 'down' : 'up'}
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Hours Budget"
          value={`${budgetPct}%`}
          change={`${summary.totalSpentHours}/${summary.totalEstimatedHours}h used`}
          changeDirection={budgetPct > 100 ? 'down' : budgetPct > 75 ? 'neutral' : 'up'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Status Distribution */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Task Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across all projects</p>
            </div>
            <TrendingUp size={18} className="text-indigo-400" />
          </div>
          <div className="flex items-center justify-center">
            <DoughnutChart data={statusDistribution} size={180} />
          </div>
        </Card>

        {/* Priority Distribution */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Task Priority</h2>
              <p className="text-xs text-slate-500 mt-0.5">Breakdown by urgency level</p>
            </div>
            <Activity size={18} className="text-amber-400" />
          </div>
          <div className="h-48">
            <BarChart data={priorityDistribution} height={180} />
          </div>
        </Card>
      </div>

      {/* Project Health */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Project Health</h2>
            <p className="text-xs text-slate-500 mt-0.5">Completion status and overdue tasks</p>
          </div>
        </div>
        <ProjectHealthList projects={projectHealths} />
      </Card>

      {/* Team Workload + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Workload */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Team Workload</h2>
              <p className="text-xs text-slate-500 mt-0.5">{summary.totalMembers} members</p>
            </div>
            <Users size={16} className="text-slate-500" />
          </div>
          <div className="space-y-1">
            {teamWorkload.slice(0, 8).map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-800/30"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-indigo-500 text-[10px] font-semibold text-white">
                  {member.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{member.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {member.completedCount}/{member.taskCount} tasks
                  </p>
                </div>
                <span className="text-[11px] text-slate-600">
                  {member.spentHours}/{member.estimatedHours}h
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest updates across projects</p>
            </div>
            <Activity size={16} className="text-slate-500" />
          </div>
          <div className="space-y-0.5 max-h-80 overflow-y-auto">
            {recentActivity.slice(0, 12).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-800/30"
              >
                <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                  act.type === 'task_completed'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : act.type === 'task_updated'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {act.type === 'task_completed' ? (
                    <ArrowDown size={11} />
                  ) : act.type === 'task_updated' ? (
                    <Activity size={11} />
                  ) : (
                    <ArrowUp size={11} />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">{act.title}</p>
                  <p className="text-[10px] text-slate-600 truncate">{act.projectName}</p>
                </div>
                <span className="text-[10px] text-slate-700 shrink-0">
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
