import { Link, NavLink, useLocation } from 'react-router-dom'
import { topics } from '../data/posts'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: '#0d0d17', borderColor: '#1f2937' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
            >
              SD
            </div>
            <span className="font-semibold text-lg tracking-tight text-gray-100 group-hover:text-white transition-colors">
              Sacred Discourse
            </span>
          </Link>

          {/* Center nav — topic links */}
          <div className="hidden md:flex items-center gap-1">
            {topics.map((topic) => (
              <NavLink
                key={topic.slug}
                to={`/topic/${topic.slug}`}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-gray-800'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                  }`
                }
              >
                {topic.name.split(' ')[0]}
              </NavLink>
            ))}
          </div>

          {/* Right — auth links */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors rounded-md hover:bg-gray-800/60"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
              style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
