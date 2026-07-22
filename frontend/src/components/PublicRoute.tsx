import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface PublicRouteProps {
  children: ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const token = useAuthStore((s) => s.token)

  if (token) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
