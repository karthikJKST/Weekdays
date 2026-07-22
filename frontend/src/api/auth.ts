import type { AuthResponse, UserSummary } from '../types/auth'
import client from './client'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return client.post('/auth/login', payload).then((r) => r.data)
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return client.post('/auth/register', payload).then((r) => r.data)
}

export function getMe(): Promise<UserSummary> {
  return client.get('/auth/me').then((r) => r.data)
}
