import { isAxiosError } from 'axios'
import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await register({ firstName, lastName, email, password, confirmPassword })
      navigate('/')
    } catch (err) {
      if (isAxiosError(err) && !err.response) {
        setError('Cannot reach the server. Check that the backend is running.')
      } else {
        setError('Could not create your account. That email may already be in use.')
      }
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
            Your tasks,
            <br />
            everywhere you work.
          </h1>
          <p className="max-w-90 text-[15px] leading-relaxed text-teal-100">
            One free account gives you access on the web and on mobile, always in sync.
          </p>
        </div>
        <p className="text-sm text-teal-200">© 2026 Cova</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="flex w-full max-w-90 flex-col gap-5.5">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-neutral-900">Create your account</h2>
            <p className="text-sm text-neutral-500">It only takes a minute.</p>
          </div>

          {error && (
            <div className="rounded-lg border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="firstName" className="text-[13px] font-semibold text-neutral-900">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alice"
                  className="h-11 w-full rounded-[10px] border border-neutral-200 px-3.5 text-sm outline-cova-orange focus:outline-2"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="lastName" className="text-[13px] font-semibold text-neutral-900">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="h-11 w-full rounded-[10px] border border-neutral-200 px-3.5 text-sm outline-cova-orange focus:outline-2"
                />
              </div>
            </div>

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

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="password" className="text-[13px] font-semibold text-neutral-900">
                  Password
                </label>
                <PasswordInput
                  id="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                  placeholder="min. 8 characters"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-[13px] font-semibold text-neutral-900"
                >
                  Confirm
                </label>
                <PasswordInput
                  id="confirmPassword"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="repeat it"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1.5 h-11.5 w-full cursor-pointer rounded-[10px] bg-cova-orange text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="text-cova-teal hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
