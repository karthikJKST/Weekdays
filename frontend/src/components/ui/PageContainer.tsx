import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
}

export function PageContainer({ children, title, description, actions }: PageContainerProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      {(title || actions) && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="mt-3 flex items-center gap-3 sm:mt-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
