import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: '#111118', borderColor: '#1f2937' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-4"
              style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
            >
              SD
            </div>
            <h1 className="text-xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="rounded-lg px-4 py-3 mb-5 text-sm border"
              style={{
                backgroundColor: 'rgba(239,68,68,0.08)',
                borderColor: 'rgba(239,68,68,0.3)',
                color: '#fca5a5',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
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
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
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
                  className="text-xs transition-colors"
                  style={{ color: '#818cf8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
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
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#4338ca' }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium transition-colors"
            style={{ color: '#818cf8' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}
