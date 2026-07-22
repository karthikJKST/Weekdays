export interface UserSummary {
  id: string
  fullName: string
  email: string
  role: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: UserSummary
}

export interface ProblemDetail {
  title?: string
  status: number
  detail?: string
  errors?: Record<string, string>
}
