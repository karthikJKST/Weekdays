import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, LogIn, Sparkles } from 'lucide-react'
import { Logo } from '../components/Logo'
import { useAuthStore } from '../store/authStore'
import { getErrorDetail } from '../utils/error'

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [demoLoading, setDemoLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null)
    try {
      await login(data.email, data.password)
      navigate('/', { replace: true })
    } catch (err) {
      const detail = getErrorDetail(err)
      if (detail) {
        setServerError(detail.detail ?? 'An unexpected error occurred.')
      } else {
        setServerError('Unable to connect to the server.')
      }
    }
  }

  const handleDemoLogin = async () => {
    setServerError(null)
    setDemoLoading(true)
    setValue('email', 'demo@weekdays.dev')
    setValue('password', 'Demo@123')
    try {
      await login('demo@weekdays.dev', 'Demo@123')
      navigate('/', { replace: true })
    } catch (err) {
      const detail = getErrorDetail(err)
      if (detail) {
        setServerError(detail.detail ?? 'An unexpected error occurred.')
      } else {
        setServerError('Unable to connect to the server.')
      }
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo size={48} />
        <h1 className="mt-4 text-2xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-400">Sign in to your WeekDays account.</p>
      </div>

      {serverError && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {serverError}
        </div>
      )}

      {/* Demo account quick login */}
      <div className="mb-6 rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-400">
            <Sparkles size={16} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-indigo-200">Demo Account</p>
            <p className="mt-0.5 text-xs text-indigo-400/80">
              demo@weekdays.dev
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {demoLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <LogIn size={13} />
              )}
              {demoLoading ? 'Signing in...' : 'Login as Demo'}
            </button>
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0b0f19] px-2 text-slate-600">or sign in manually</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
            className="w-full rounded-xl border border-slate-700 bg-[#121827] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="you@company.com"
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
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
              className="w-full rounded-xl border border-slate-700 bg-[#121827] px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter your password"
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
            <LogIn size={16} />
          )}
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-indigo-400 transition hover:text-indigo-300">
          Create one
        </Link>
      </p>
    </div>
  )
}
