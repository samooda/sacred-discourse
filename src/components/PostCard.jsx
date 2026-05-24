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
      className="group block rounded-xl border px-4 pt-4 pb-3 transition-all duration-150 cursor-pointer"
      style={{
        backgroundColor: '#111118',
        borderColor: '#1f2937',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}50`
        e.currentTarget.style.backgroundColor = '#0f0f1a'
        e.currentTarget.querySelector('h3').style.color = accentColor
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1f2937'
        e.currentTarget.style.backgroundColor = '#111118'
        e.currentTarget.querySelector('h3').style.color = ''
      }}
    >
      <div className="flex items-start gap-5">
        {/* Left metadata column */}
        <div className="hidden sm:flex flex-col items-center gap-1.5 min-w-[44px]">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-300">
              {(post.replies ?? []).length}
            </div>
            <div className="text-xs text-gray-600">replies</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-400">
              {post.views ?? 0}
            </div>
            <div className="text-xs text-gray-600">views</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base leading-snug mb-2 break-words transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500">
            by{' '}
            <Link
              to={`/profile/${post.author_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              {post.profiles?.display_name ?? 'Unknown'}
            </Link>
            {' · '}
            {formatDate(post.created_at)}
          </p>
        </div>

        <svg
          className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors mt-1 flex-shrink-0"
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
