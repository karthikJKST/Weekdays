import { useState } from 'react'
import { Bell, Menu } from 'lucide-react'
import { Logomark } from '../Logo'
import { SearchBar } from './SearchBar'
import { UserMenu } from './UserMenu'
import { NotificationPanel } from '../notifications/NotificationPanel'
import { useUnreadCount } from '../../api/notifications'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadCount()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800/60 bg-[#0e1421] px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Logo — visible when sidebar is collapsed or on mobile */}
        <a href="/" className="flex items-center gap-2.5">
          <Logomark size={32} />
          <span className="text-sm font-semibold tracking-wide text-indigo-300 lg:hidden xl:block">
            WeekDays
          </span>
        </a>
      </div>

      {/* Center */}
      <div className="hidden sm:block">
        <SearchBar />
      </div>

      {/* Right */}
      <div className="relative flex items-center gap-1.5">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-300"
          aria-label="Notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-indigo-500 px-1 py-0.5 text-[10px] font-semibold text-white ring-2 ring-[#0e1421]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

        <div className="ml-1.5">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
