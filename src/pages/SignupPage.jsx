import { Link } from 'react-router-dom'
import { topics } from '../data/posts'

export default function SignupPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Card */}
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
            <h1 className="text-xl font-bold text-white">Join Sacred Discourse</h1>
            <p className="text-sm text-gray-500 mt-1">Create your free account</p>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
                placeholder="ScholasticMind"
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
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
                placeholder="Min. 8 characters"
              />
            </div>

            {/* Interest selector */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Interests{' '}
                <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic.slug}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors text-gray-400 hover:text-white"
                    style={{ borderColor: '#2d3748', backgroundColor: '#0a0a0f' }}
                    onClick={(e) => {
                      const isSelected = e.currentTarget.dataset.selected === 'true'
                      if (isSelected) {
                        e.currentTarget.dataset.selected = 'false'
                        e.currentTarget.style.borderColor = '#2d3748'
                        e.currentTarget.style.backgroundColor = '#0a0a0f'
                        e.currentTarget.style.color = '#9ca3af'
                      } else {
                        e.currentTarget.dataset.selected = 'true'
                        e.currentTarget.style.borderColor = topic.accentColor + '66'
                        e.currentTarget.style.backgroundColor = topic.accentColor + '11'
                        e.currentTarget.style.color = topic.accentColor
                      }
                    }}
                  >
                    <span>{topic.symbol}</span>
                    <span>{topic.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors mt-2"
              style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            >
              Create account
            </button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-gray-700 mt-4 leading-relaxed">
            By creating an account you agree to our{' '}
            <button type="button" className="text-gray-500 hover:text-gray-400 transition-colors underline underline-offset-2">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-gray-500 hover:text-gray-400 transition-colors underline underline-offset-2">
              Community Guidelines
            </button>
            .
          </p>
        </div>

        {/* Log in link */}
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
      </div>
    </main>
  )
}
