import { useParams, Link, Navigate } from 'react-router-dom'
import { topics, posts } from '../data/posts'

export default function TopicPage() {
  const { topicSlug } = useParams()
  const topic = topics.find((t) => t.slug === topicSlug)
  const topicPosts = posts[topicSlug]

  if (!topic || !topicPosts) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-gray-300 transition-colors">
          Home
        </Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-300">{topic.name}</span>
      </nav>

      {/* Topic header */}
      <div
        className="rounded-xl border overflow-hidden mb-8"
        style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
      >
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(to right, ${topic.gradientFrom}, ${topic.gradientTo})`,
          }}
        />
        <div className="p-6 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: topic.accentColor + '22', color: topic.accentColor }}
          >
            {topic.symbol}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{topic.name}</h1>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{topic.description}</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-2xl font-bold text-white">{topicPosts.length}</span>
            <span className="text-xs text-gray-500">discussions</span>
          </div>
        </div>
      </div>

      {/* Post list header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Discussions
        </h2>
        <button
          className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors text-gray-400 hover:text-white"
          style={{ borderColor: '#374151', backgroundColor: 'transparent' }}
        >
          + New post
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {topicPosts.map((post) => (
          <Link
            key={post.id}
            to={`/topic/${topicSlug}/post/${post.id}`}
            className="group block rounded-xl border p-5 transition-all duration-150"
            style={{ backgroundColor: '#111118', borderColor: '#1f2937' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = topic.accentColor + '44'
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
                  <div className="text-sm font-semibold text-gray-300">{post.replies}</div>
                  <div className="text-xs text-gray-600">replies</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-500">{post.views}</div>
                  <div className="text-xs text-gray-600">views</div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-base leading-snug mb-2 group-hover:text-indigo-300 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">
                  {post.description}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-xs border"
                      style={{
                        backgroundColor: topic.accentColor + '11',
                        borderColor: topic.accentColor + '33',
                        color: topic.accentColor,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-gray-600 ml-auto">
                    by{' '}
                    <span className="text-gray-500">{post.author}</span>
                    {' · '}
                    {post.date}
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
          </Link>
        ))}
      </div>

      {/* Other topics */}
      <div className="mt-12 pt-8 border-t" style={{ borderColor: '#1f2937' }}>
        <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
          Other traditions
        </h3>
        <div className="flex flex-wrap gap-2">
          {topics
            .filter((t) => t.slug !== topicSlug)
            .map((t) => (
              <Link
                key={t.slug}
                to={`/topic/${t.slug}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors hover:text-white"
                style={{
                  borderColor: '#1f2937',
                  backgroundColor: '#111118',
                  color: '#9ca3af',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.accentColor + '44'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1f2937'
                  e.currentTarget.style.color = '#9ca3af'
                }}
              >
                <span>{t.symbol}</span>
                <span>{t.name.split(' ')[0]}</span>
              </Link>
            ))}
        </div>
      </div>
    </main>
  )
}
