import { Link, useNavigate } from 'react-router-dom'
import { topics } from '../data/posts'
import { formatDate } from '../utils/format'

export default function PostCard({ post, topicSlug }) {
  const navigate = useNavigate()
  const topic = topics.find((t) => t.slug === topicSlug)
  const accentColor = topic?.accentColor ?? '#9ca3af'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/topic/${topicSlug}/post/${post.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/topic/${topicSlug}/post/${post.id}`)
        }
      }}
      className="group block rounded-xl border p-5 transition-all duration-150 cursor-pointer"
      style={{ backgroundColor: '#111118', borderColor: '#1f2937' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor + '44'
        e.currentTarget.style.backgroundColor = '#131320'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1f2937'
        e.currentTarget.style.backgroundColor = '#111118'
      }}
    >
      <div className="flex items-start gap-4">
        {/* Left metadata column */}
        <div className="hidden sm:flex flex-col items-center gap-3 pt-0.5 min-w-[48px]">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-300">
              {(post.replies ?? []).length}
            </div>
            <div className="text-xs text-gray-600">replies</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500">
              {post.views ?? 0}
            </div>
            <div className="text-xs text-gray-600">views</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base leading-snug mb-2 group-hover:text-indigo-300 transition-colors break-words">
            {post.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-600 ml-auto">
              by{' '}
              <Link
                to={`/profile/${post.author_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                {post.profiles?.display_name ?? 'Unknown'}
              </Link>
              {' · '}
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>

        <svg
          className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors mt-1 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  )
}
