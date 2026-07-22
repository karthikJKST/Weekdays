import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#0b0f19]">
      {/* Branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0e1421] p-12 lg:flex">
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-indigo-500/5 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-500 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25">
              W
            </span>
            <span className="text-sm font-semibold tracking-wide text-indigo-300">WEEKDAYS</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-200">
            <Sparkles size={15} />
            Engineering execution platform
          </p>
          <blockquote className="max-w-md text-2xl font-medium leading-snug text-slate-200">
            &ldquo;The best engineering teams ship with clarity, not chaos.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="flex size-8 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300">
              W
            </span>
            <span>WeekDays Team</span>
          </div>
        </div>

        <div className="relative text-xs text-slate-600">
          &copy; {new Date().getFullYear()} WeekDays. All rights reserved.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <span className="grid size-9 place-items-center rounded-lg bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25">
              W
            </span>
            <span className="text-sm font-semibold tracking-wide text-indigo-300">WEEKDAYS</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
