import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { topics } from '../data/posts'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, profile } = useAuth()

  const topicMatch = location.pathname.match(/^\/topic\/([^/]+)/)
  const currentTopicSlug = topicMatch ? topicMatch[1] : null

  const [topicsOpen, setTopicsOpen] = useState(false)
  const topicsRef = useRef(null)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    function handleMouseDown(e) {
      if (topicsRef.current && !topicsRef.current.contains(e.target)) {
        setTopicsOpen(false)
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  function handleSearchKeyDown(e) {
    if (e.key !== 'Enter') return
    const q = searchQuery.trim()
    if (q.length < 3) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
    setSearchQuery('')
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: '#0d0d17', borderColor: '#1f2937' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
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

          {/* Center — Topics dropdown + Search */}
          <div className="hidden md:flex items-center gap-8">
            {/* Topics dropdown */}
            <div className="relative" ref={topicsRef}>
              <button
                onClick={() => setTopicsOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-gray-400 hover:text-gray-100 hover:bg-gray-800/60"
              >
                Topics
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${topicsOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {topicsOpen && (
                <div
                  className="absolute left-0 mt-1.5 w-52 rounded-md border py-1 shadow-xl z-[60]"
                  style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}
                >
                  {topics.map((topic) => {
                    const isActive = topic.slug === currentTopicSlug
                    return (
                      <button
                        key={topic.slug}
                        onClick={() => { setTopicsOpen(false); navigate(`/topic/${topic.slug}`) }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2.5"
                        style={{
                          color: isActive ? topic.accentColor : '#d1d5db',
                          backgroundColor: isActive ? `${topic.accentColor}18` : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.color = '#ffffff'
                            e.currentTarget.style.backgroundColor = '#1f2937'
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = isActive ? topic.accentColor : '#d1d5db'
                          e.currentTarget.style.backgroundColor = isActive ? `${topic.accentColor}18` : 'transparent'
                        }}
                      >
                        <span>{topic.symbol}</span>
                        <span>{topic.name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Search bar */}
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search posts…"
                className="w-64 pl-8 pr-3 py-1.5 rounded-md text-sm text-gray-300 placeholder-gray-600 focus:outline-none transition-colors bg-[#111827] border border-[#2d3748] focus:border-indigo-600"
              />
            </div>
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
                  className="px-4 py-1.5 text-sm font-medium rounded-md transition-all text-white"
                  style={{ backgroundColor: '#5c4ef8' }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.88)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = '' }}
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
