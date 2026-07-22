import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { getErrorDetail } from '../utils/error'
import type { ProblemDetail } from '../types/auth'

interface RegisterFormValues {
  fullName: string
  email: string
  password: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const registerUser = useAuthStore((s) => s.register)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: { fullName: '', email: '', password: '' },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null)
    try {
      await registerUser(data.fullName, data.email, data.password)
      navigate('/', { replace: true })
    } catch (err) {
      const detail = getErrorDetail(err)
      if (detail) {
        const problem = detail as ProblemDetail

        // Set field-level errors if the backend returned them
        if (problem.errors) {
          for (const [field, message] of Object.entries(problem.errors)) {
            if (field === 'fullName' || field === 'email' || field === 'password') {
              setError(field, { message })
            }
          }
        }

        setServerError(problem.detail ?? 'An unexpected error occurred.')
      } else {
        setServerError('Unable to connect to the server.')
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Create an account</h1>
        <p className="mt-1.5 text-sm text-slate-400">Get started with WeekDays.</p>
      </div>

      {serverError && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-300">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            autoFocus
            {...register('fullName', {
              required: 'Full name is required',
              maxLength: { value: 120, message: 'Name must be 120 characters or less' },
            })}
            className="w-full rounded-xl border border-slate-700 bg-[#121827] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Jane Doe"
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
            className="w-full rounded-xl border border-slate-700 bg-[#121827] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="jane@company.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                maxLength: { value: 72, message: 'Password must be 72 characters or less' },
              })}
              className="w-full rounded-xl border border-slate-700 bg-[#121827] px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-400 transition hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </div>
  )
}
