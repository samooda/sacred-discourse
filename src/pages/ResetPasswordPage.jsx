import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthPageLayout from '../components/AuthPageLayout'
import ErrorBanner from '../components/ErrorBanner'
import PrimaryButton from '../components/PrimaryButton'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate('/login'), 2000)
      return () => clearTimeout(timer)
    }
  }, [success, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

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
          <h2 className="text-lg font-bold text-white mb-2">Password updated</h2>
          <p className="text-sm text-gray-400">Redirecting you to sign in…</p>
        </div>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout>
      <div className="text-center mb-8">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold mx-auto mb-4"
          style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
        >
          SD
        </div>
        <h1 className="text-xl font-bold text-white">Choose a new password</h1>
        <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters</p>
      </div>

      {error && <ErrorBanner className="mb-5">{error}</ErrorBanner>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="new-password">
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="confirm-password">
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 pr-10 text-sm text-gray-200 placeholder-gray-500 bg-[#0a0a0f] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <PrimaryButton type="submit" loading={loading} className="w-full py-2.5 mt-2">
          {loading ? 'Updating…' : 'Update password'}
        </PrimaryButton>
      </form>
    </AuthPageLayout>
  )
}
