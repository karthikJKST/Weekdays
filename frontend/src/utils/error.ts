import type { ProblemDetail } from '../types/auth'

interface AxiosErrorShape {
  response?: {
    data: ProblemDetail
  }
}

function isAxiosError(err: unknown): err is AxiosErrorShape {
  return typeof err === 'object' && err !== null && 'response' in err
}

export function getErrorDetail(err: unknown): ProblemDetail | null {
  if (isAxiosError(err) && err.response?.data) {
    return err.response.data
  }
  return null
}
