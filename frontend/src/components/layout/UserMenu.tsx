import { useState, useRef, useEffect } from 'react'
import {
  User,
  Settings,
  LogOut,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  const initials = user?.fullName ? getInitials(user.fullName) : '??'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-slate-800/50"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-500 text-[11px] font-semibold text-white shadow-sm shadow-indigo-500/20">
          {initials}
        </span>
        <span className="hidden text-sm font-medium text-slate-300 lg:block">{user?.fullName}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl border border-slate-800 bg-[#0e1421] p-1.5 shadow-2xl shadow-black/40">
          <div className="border-b border-slate-800/60 px-3 py-2.5">
            <p className="text-sm font-medium text-slate-200">{user?.fullName}</p>
            <p className="mt-0.5 text-xs text-slate-500">{user?.email}</p>
          </div>

          <div className="mt-1 space-y-0.5">
            <button
              onClick={() => {
                setOpen(false)
                navigate('/settings')
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200"
            >
              <User size={16} className="shrink-0" />
              Profile
            </button>
            <button
              onClick={() => {
                setOpen(false)
                navigate('/settings')
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200"
            >
              <Settings size={16} className="shrink-0" />
              Settings
            </button>
          </div>

          <div className="mt-1 border-t border-slate-800/60 pt-0.5">
            <button
              onClick={() => {
                setOpen(false)
                logout()
                navigate('/login', { replace: true })
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={16} className="shrink-0" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
