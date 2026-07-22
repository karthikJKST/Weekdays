import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useUnreadCount } from '../../api/notifications'
import type { Notification } from '../../api/notifications'

function getTypeIcon(type: string) {
  switch (type) {
    case 'warning': return AlertTriangle
    case 'success': return CheckCircle
    default: return Info
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'warning': return 'bg-amber-500/10 text-amber-400'
    case 'success': return 'bg-emerald-500/10 text-emerald-400'
    default: return 'bg-indigo-500/10 text-indigo-400'
  }
}

function formatTime(dateStr: string): string {
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

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const { data: notifications = [], isLoading, isError } = useNotifications()
  const { data: unreadCount = 0 } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  function handleNotificationClick(n: Notification) {
    if (!n.isRead) {
      markAsRead.mutate(n.id)
    }
    if (n.link) {
      navigate(n.link)
    }
    onClose()
  }

  if (!open) return null

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-96 origin-top-right rounded-2xl border border-slate-800 bg-[#0e1421] shadow-2xl shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-200">Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-300"
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="grid size-6 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-800/60 hover:text-slate-400"
            aria-label="Close notifications"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800/40" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Bell size={28} className="text-slate-700" />
            <p className="text-sm text-slate-500">Could not load notifications</p>
            <p className="text-xs text-slate-600">Please try again later.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Bell size={28} className="text-slate-700" />
            <p className="text-sm text-slate-500">No notifications</p>
            <p className="text-xs text-slate-600">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {notifications.map((n) => {
              const Icon = getTypeIcon(n.type)
              return (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-800/30 ${
                    !n.isRead ? 'bg-indigo-500/[0.02]' : ''
                  }`}
                >
                  <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl ${getTypeColor(n.type)}`}>
                    <Icon size={15} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`truncate text-sm ${n.isRead ? 'text-slate-400' : 'font-medium text-slate-200'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && <span className="size-1.5 shrink-0 rounded-full bg-indigo-400" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-600">{formatTime(n.createdAt)}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
