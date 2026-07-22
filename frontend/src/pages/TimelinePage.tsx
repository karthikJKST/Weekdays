import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, CheckCircle, PlusCircle, Edit, Calendar, FolderPlus, Loader2 } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { TimelineSkeleton } from '../components/timeline/TimelineSkeleton'
import { EmptyTimeline } from '../components/timeline/EmptyTimeline'
import { useTimeline } from '../api/timeline'
import type { TimelineActivity } from '../api/timeline'

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  'project_created': <FolderPlus size={14} />,
  'project_updated': <Edit size={14} />,
  'project_completed': <CheckCircle size={14} />,
  'task_created': <PlusCircle size={14} />,
  'task_updated': <Edit size={14} />,
  'task_completed': <CheckCircle size={14} />,
  'calendar_event_created': <Calendar size={14} />,
  'calendar_event_updated': <Edit size={14} />,
}

const ACTIVITY_BG: Record<string, string> = {
  'project_created': 'bg-indigo-500/10 text-indigo-400',
  'project_updated': 'bg-amber-500/10 text-amber-400',
  'project_completed': 'bg-emerald-500/10 text-emerald-400',
  'task_created': 'bg-blue-500/10 text-blue-400',
  'task_updated': 'bg-amber-500/10 text-amber-400',
  'task_completed': 'bg-emerald-500/10 text-emerald-400',
  'calendar_event_created': 'bg-violet-500/10 text-violet-400',
  'calendar_event_updated': 'bg-sky-500/10 text-sky-400',
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

function groupByDate(items: TimelineActivity[]): Map<string, TimelineActivity[]> {
  const map = new Map<string, TimelineActivity[]>()
  for (const item of items) {
    const date = new Date(item.timestamp).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
    const existing = map.get(date) || []
    existing.push(item)
    map.set(date, existing)
  }
  return map
}

export function TimelinePage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [allItems, setAllItems] = useState<TimelineActivity[]>([])
  const [hasMore, setHasMore] = useState(true)
  const { data, isLoading, error } = useTimeline(page, 20)

  useEffect(() => {
    if (data) {
      setAllItems((prev) => page === 0 ? data.items : [...prev, ...data.items])
      setHasMore(page + 1 < data.totalPages)
    }
  }, [data, page])

  // Reset when going back to page 0
  const handleLoadMore = () => {
    setPage((p) => p + 1)
  }

  const groups = groupByDate(allItems)

  if (isLoading && page === 0) {
    return (
      <PageContainer title="Activity Timeline" description="Chronological feed of all project activity.">
        <TimelineSkeleton />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="Activity Timeline" description="">
        <div className="flex flex-col items-center gap-4 py-20">
          <p className="text-sm text-red-400">Failed to load timeline.</p>
        </div>
      </PageContainer>
    )
  }

  if (allItems.length === 0) {
    return (
      <PageContainer title="Activity Timeline" description="">
        <EmptyTimeline onCreateClick={() => navigate('/projects')} />
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Activity Timeline" description="Chronological feed of all project activity.">
      <div className="max-w-3xl mx-auto space-y-0">
        {Array.from(groups.entries()).map(([dateLabel, items]) => (
          <div key={dateLabel}>
            {/* Date header */}
            <div className="flex items-center gap-3 py-4">
              <div className="flex items-center gap-2">
                <ChevronDown size={14} className="text-slate-600" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{dateLabel}</h3>
              </div>
              <div className="flex-1 h-px bg-slate-800/60" />
              <span className="text-[10px] text-slate-700">{items.length} activity</span>
            </div>

            {/* Activity cards */}
            <div className="space-y-1">
              {items.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-start gap-4 rounded-xl px-4 py-3 transition hover:bg-slate-800/30"
                >
                  {/* Icon */}
                  <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl ${
                    ACTIVITY_BG[activity.type] || 'bg-slate-800/60 text-slate-500'
                  }`}>
                    {ACTIVITY_ICONS[activity.type] || <Edit size={14} />}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-200 truncate">{activity.title}</p>
                      {activity.projectName && (
                        <span className="shrink-0 rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                          {activity.projectName}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{activity.description}</p>
                  </div>

                  {/* Timestamp + actor */}
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-slate-600">{formatRelativeTime(activity.timestamp)}</p>
                    <p className="text-[10px] text-slate-700">{activity.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center py-6">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300 disabled:opacity-50"
            >
              {isLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Loading…</>
              ) : (
                <>Load more activity</>
              )}
            </button>
          </div>
        )}

        {!hasMore && allItems.length > 0 && (
          <p className="py-8 text-center text-xs text-slate-700">You've reached the beginning of the timeline.</p>
        )}
      </div>
    </PageContainer>
  )
}
