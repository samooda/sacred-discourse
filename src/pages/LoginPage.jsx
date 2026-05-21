import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthPageLayout from '../components/AuthPageLayout'
import ErrorBanner from '../components/ErrorBanner'
import PrimaryButton from '../components/PrimaryButton'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <AuthPageLayout
      footer={
        <p className="text-center text-sm text-gray-600 mt-5">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium transition-colors text-indigo-400 hover:text-indigo-300"
          >
            Create one
          </Link>
        </p>
      }
    >
      <div className="text-center mb-8">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold mx-auto mb-4"
          style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
        >
          SD
        </div>
        <h1 className="text-xl font-bold text-white">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

      {error && <ErrorBanner className="mb-5">{error}</ErrorBanner>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 bg-[#0a0a0f] focus:outline-none transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-gray-400" htmlFor="password">
              Password
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs transition-colors text-indigo-400 hover:text-indigo-300"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 bg-[#0a0a0f] focus:outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        <PrimaryButton type="submit" loading={loading} className="w-full py-2.5 mt-2">
          {loading ? 'Signing in…' : 'Sign in'}
        </PrimaryButton>
      </form>
    </AuthPageLayout>
  )
}
