import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const paddings = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-[#0e1421] shadow-xl shadow-black/20 ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  )
}
