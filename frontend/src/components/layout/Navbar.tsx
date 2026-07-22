import { Bell, Menu } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { UserMenu } from './UserMenu'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
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
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-500 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20">
            W
          </span>
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
      <div className="flex items-center gap-1.5">
        <button
          className="relative grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-300"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-1.5 size-2 rounded-full bg-indigo-400 ring-2 ring-[#0e1421]" />
        </button>

        <div className="ml-1.5">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
