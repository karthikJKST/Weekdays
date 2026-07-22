import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  CalendarDays,
  Waypoints,
  BarChart3,
  Settings,
  ChevronLeft,
} from 'lucide-react'
import { Logomark } from '../Logo'

const navigation = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'My Tasks', href: '/tasks', icon: ListTodo },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Timeline', href: '/timeline', icon: Waypoints },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const

interface SidebarProps {
  isCollapsed: boolean
  isMobileOpen: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

export function Sidebar({ isCollapsed, isMobileOpen, onClose, onToggleCollapse }: SidebarProps) {
  const location = useLocation()

  function isActive(href: string): boolean {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-800/60 bg-[#0e1421]
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-60'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Logo area */}
        <div className="flex h-14 shrink-0 items-center border-b border-slate-800/60 px-4">
          <a href="/" className="flex items-center gap-2.5 overflow-hidden">
            <Logomark size={32} />
            <span
              className={`whitespace-nowrap text-sm font-semibold tracking-wide text-indigo-300 transition-opacity duration-200 ${
                isCollapsed ? 'opacity-0' : 'opacity-100'
              }`}
            >
              WeekDays
            </span>
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <NavLink
                key={href}
                to={href}
                end={href === '/'}
                onClick={onClose}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-indigo-500/10 text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
                }`}
              >
                <Icon
                  size={19}
                  className={`shrink-0 transition-colors ${
                    isCollapsed ? 'mx-auto' : ''
                  }`}
                />
                <span
                  className={`whitespace-nowrap transition-all duration-200 ${
                    isCollapsed ? 'lg:invisible lg:w-0 lg:opacity-0' : 'opacity-100'
                  }`}
                >
                  {label}
                </span>

                {/* Active indicator bar */}
                <span
                  className={`absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-indigo-400 transition-opacity duration-150 ${
                    active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </NavLink>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-slate-800/60 px-2 py-3">
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-2 text-slate-600 transition hover:bg-slate-800/40 hover:text-slate-400"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={17}
              className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
            />
            <span
              className={`whitespace-nowrap text-xs font-medium transition-opacity duration-200 ${
                isCollapsed ? 'w-0 opacity-0' : 'opacity-100'
              }`}
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
