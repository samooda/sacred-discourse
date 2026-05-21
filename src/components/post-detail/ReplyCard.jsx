import { Link } from 'react-router-dom'
import { usePostDetail } from '../../pages/PostDetailPage'
import { formatDate } from '../../utils/format'

export default function ReplyCard({ reply, isLast }) {
  const {
    user, post, topic,
    replyLikes, toggleReplyLike,
    deleteReply, deleteReplyErrors,
    expandedReplies, setExpandedReplies,
  } = usePostDetail()

  return (
    <div
      className={`pb-5 ${!isLast ? 'mb-5 border-b' : ''}`}
      style={{ borderColor: '#1f2937' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: topic.accentColor + '33', color: topic.accentColor }}
        >
          {(reply.profiles?.display_name ?? '?')[0].toUpperCase()}
        </div>
        <Link
          to={`/profile/${reply.author_id}`}
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          {reply.profiles?.display_name ?? 'Unknown'}
        </Link>
        <span className="text-xs text-gray-600">{formatDate(reply.created_at)}</span>
        <button
          onClick={() => toggleReplyLike(reply.id)}
          className="ml-auto flex items-center gap-1.5 transition-colors"
          style={{ color: replyLikes[reply.id]?.likedByUser ? '#ef4444' : '#6b7280' }}
          onMouseEnter={(e) => { if (!replyLikes[reply.id]?.likedByUser) e.currentTarget.style.color = '#9ca3af' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = replyLikes[reply.id]?.likedByUser ? '#ef4444' : '#6b7280' }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            {replyLikes[reply.id]?.likedByUser ? (
              <path
                fill="currentColor"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            ) : (
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            )}
          </svg>
          <span className="text-xs">{replyLikes[reply.id]?.count ?? 0}</span>
        </button>
        {(user?.id === reply.author_id || user?.id === post.author_id) && (
          <button
            type="button"
            onClick={() => deleteReply(reply.id)}
            className="text-xs font-medium transition-colors text-red-400 hover:text-red-500"
          >
            Delete
          </button>
        )}
        {deleteReplyErrors[reply.id] && (
          <span className="text-xs" style={{ color: '#fca5a5' }}>
            {deleteReplyErrors[reply.id]}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm leading-relaxed pl-10 break-words">
        {reply.content.length > 300
          ? expandedReplies.has(reply.id)
            ? reply.content
            : reply.content.slice(0, 300) + '…'
          : reply.content}
      </p>
      {reply.content.length > 300 && (
        <div className="pl-10 mt-1">
          <button
            type="button"
            onClick={() =>
              setExpandedReplies((prev) => {
                const next = new Set(prev)
                if (prev.has(reply.id)) next.delete(reply.id)
                else next.add(reply.id)
                return next
              })
            }
            className="text-xs font-medium transition-colors text-indigo-400 hover:text-indigo-300"
          >
            {expandedReplies.has(reply.id) ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}
    </div>
  )
}
