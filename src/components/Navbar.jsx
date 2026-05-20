import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { topics } from '../data/posts'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, signOut, profile } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleMouseDown(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

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

          {/* Right — auth */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden focus:outline-none ring-2 ring-transparent hover:ring-gray-600 transition-all"
                  style={{ backgroundColor: '#1f2937' }}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-100">
                      {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 rounded-md border py-1 shadow-lg"
                    style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}
                  >
                    <button
                      onClick={() => { setDropdownOpen(false); navigate(`/profile/${user.id}`) }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      Profile
                    </button>
                    <button
                      onClick={async () => { setDropdownOpen(false); await signOut(); navigate('/') }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
