import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthPageLayout from '../components/AuthPageLayout'
import ErrorBanner from '../components/ErrorBanner'
import PrimaryButton from '../components/PrimaryButton'

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
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
      <AuthPageLayout>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}
          >
            <svg className="w-6 h-6" style={{ color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Check your email</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="text-gray-200">{email}</span>. Click it to activate
            your account, then come back to sign in.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 px-5 py-2 rounded-lg text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-indigo-100"
          >
            Go to sign in
          </Link>
        </div>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout
      footer={
        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium transition-colors text-indigo-400 hover:text-indigo-300"
          >
            Sign in
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
        <h1 className="font-display text-2xl font-semibold text-white">Join Sacred Discourse</h1>
        <p className="text-sm text-gray-500 mt-1">Create your free account</p>
      </div>

      {error && <ErrorBanner className="mb-5">{error}</ErrorBanner>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="display_name">
            Display name
          </label>
          <input
            id="display_name"
            type="text"
            autoComplete="name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 bg-[#0a0a0f] focus:outline-none transition-colors"
            placeholder="Your full name or alias"
          />
        </div>

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
            className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 bg-[#0a0a0f] focus:outline-none transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 pr-10 text-sm text-gray-200 placeholder-gray-500 bg-[#0a0a0f] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1">Minimum 8 characters.</p>
        </div>

        <PrimaryButton type="submit" loading={loading} className="w-full py-2.5 mt-2">
          {loading ? 'Creating account…' : 'Create account'}
        </PrimaryButton>
      </form>
    </AuthPageLayout>
  )
}
