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
          <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="text-gray-200">{email}</span>. Click it to activate
            your account, then come back to sign in.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
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
            className="font-medium transition-colors"
            style={{ color: '#818cf8' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
          >
            Sign in
          </Link>
        </p>
      }
    >
      <div className="text-center mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-4"
          style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
        >
          SD
        </div>
        <h1 className="text-xl font-bold text-white">Join Sacred Discourse</h1>
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
            className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
            style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
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
            className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
            style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
            style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
            placeholder="Min. 8 characters"
          />
        </div>

        <PrimaryButton type="submit" loading={loading} className="w-full py-2.5 mt-2">
          {loading ? 'Creating account…' : 'Create account'}
        </PrimaryButton>
      </form>
    </AuthPageLayout>
  )
}
