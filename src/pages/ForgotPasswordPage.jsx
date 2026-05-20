import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ backgroundColor: '#111118', borderColor: '#1f2937' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}
            >
              <svg className="w-6 h-6" style={{ color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              We sent a password reset link to{' '}
              <span className="text-gray-200">{email}</span>. Click it to choose a new password.
            </p>
            <Link
              to="/login"
              className="text-sm font-medium transition-colors"
              style={{ color: '#818cf8' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    )
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
            <h1 className="text-xl font-bold text-white">Reset your password</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {/* Error */}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#4338ca' }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          <Link
            to="/login"
            className="font-medium transition-colors"
            style={{ color: '#818cf8' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
