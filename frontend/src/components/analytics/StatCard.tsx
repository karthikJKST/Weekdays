import { type ReactNode } from 'react'
import { Card } from '../ui/Card'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  change?: string
  changeDirection?: 'up' | 'down' | 'neutral'
}

export function StatCard({ icon, label, value, change, changeDirection = 'neutral' }: StatCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div className="grid size-10 place-items-center rounded-xl bg-indigo-500/10 text-indigo-400">
          {icon}
        </div>
        {change && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              changeDirection === 'up'
                ? 'bg-emerald-500/10 text-emerald-400'
                : changeDirection === 'down'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-slate-500/10 text-slate-400'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </Card>
  )
}
