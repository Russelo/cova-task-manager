import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden w-[480px] shrink-0 flex-col justify-between bg-cova-teal p-14 text-white md:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full border-2 border-white">
            <div className="h-3 w-3 rounded-full bg-cova-orange" />
          </div>
          <span className="text-lg font-semibold">Cova Task Manager</span>
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl leading-tight font-bold">
            Organize your work,
            <br />
            one task at a time.
          </h1>
          <p className="max-w-90 text-[15px] leading-relaxed text-teal-100">
            Create, track and manage your tasks from anywhere — synced instantly between web and
            mobile.
          </p>
        </div>
        <p className="text-sm text-teal-200">© 2026 Cova</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="flex w-full max-w-90 flex-col gap-7">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-neutral-900">Welcome back</h2>
            <p className="text-sm text-neutral-500">Log in to see your tasks.</p>
          </div>

          {error && (
            <div className="rounded-lg border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-semibold text-neutral-900">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-[10px] border border-neutral-200 px-3.5 text-sm outline-cova-orange focus:outline-2"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-semibold text-neutral-900">
                Password
              </label>
              <PasswordInput
                id="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1.5 h-11.5 w-full rounded-[10px] bg-cova-orange text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500">
            No account yet?{' '}
            <Link to="/register" className="text-cova-teal hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
