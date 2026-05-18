import { useParams, Link, Navigate } from 'react-router-dom'
import { topics, posts } from '../data/posts'

export default function PostDetailPage() {
  const { topicSlug, postId } = useParams()
  const topic = topics.find((t) => t.slug === topicSlug)
  const topicPosts = posts[topicSlug]
  const post = topicPosts?.find((p) => String(p.id) === String(postId))

  if (!topic || !post) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link to="/" className="hover:text-gray-300 transition-colors">
          Home
        </Link>
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link to={`/topic/${topicSlug}`} className="hover:text-gray-300 transition-colors">
          {topic.name}
        </Link>
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-400 truncate max-w-xs">{post.title}</span>
      </nav>

      {/* Post header */}
      <div
        className="rounded-xl border overflow-hidden mb-6"
        style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
      >
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(to right, ${topic.gradientFrom}, ${topic.gradientTo})`,
          }}
        />
        <div className="p-6 sm:p-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
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
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: topic.accentColor + '33', color: topic.accentColor }}
              >
                {post.author[0].toUpperCase()}
              </div>
              <span className="text-gray-400">{post.author}</span>
            </div>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.views} views</span>
            <span>·</span>
            <span>{post.replies} replies</span>
          </div>
        </div>
      </div>

      {/* Post body */}
      <div
        className="rounded-xl border p-6 sm:p-8 mb-6"
        style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
      >
        <p className="text-gray-300 leading-relaxed text-base mb-6">
          {post.description}
        </p>

        {/* File attachment placeholder */}
        <div
          className="rounded-lg border-2 border-dashed p-8 text-center"
          style={{ borderColor: '#2d3748' }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#1e293b' }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: '#475569' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Attached resources</p>
              <p className="text-gray-700 text-xs mt-1">
                File attachments will appear here (PDFs, images, documents)
              </p>
            </div>
            <button
              className="mt-1 px-4 py-1.5 rounded-lg text-xs font-medium border transition-colors text-gray-500 hover:text-gray-300"
              style={{ borderColor: '#2d3748', backgroundColor: 'transparent' }}
            >
              Upload file
            </button>
          </div>
        </div>
      </div>

      {/* Replies section placeholder */}
      <div
        className="rounded-xl border p-6 sm:p-8 mb-6"
        style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-white">
            Replies{' '}
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-xs font-normal"
              style={{ backgroundColor: '#1f2937', color: '#9ca3af' }}
            >
              {post.replies}
            </span>
          </h2>
        </div>

        {/* Placeholder replies */}
        {[
          {
            author: 'ScholasticMind',
            time: '2 days ago',
            body: 'Excellent framing of the issue. I would add that the historiography here is contested — Eusebius of Caesarea\'s account has been questioned by revisionist scholars who argue the political dimension was more decisive than the theological one.',
          },
          {
            author: 'PhilosophyFirst',
            time: '1 day ago',
            body: 'This connects interestingly to the broader question of how imperial power shaped doctrinal orthodoxy. The parallel with the Council of Chalcedon (451) is worth exploring — same structural dynamic, very different reception.',
          },
        ].map((reply, i) => (
          <div
            key={i}
            className={`pb-5 ${i < 1 ? 'mb-5 border-b' : ''}`}
            style={{ borderColor: '#1f2937' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: topic.accentColor + '33', color: topic.accentColor }}
              >
                {reply.author[0]}
              </div>
              <span className="text-sm font-medium text-gray-300">{reply.author}</span>
              <span className="text-xs text-gray-600">{reply.time}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed pl-10">{reply.body}</p>
          </div>
        ))}

        {/* Reply box */}
        <div className="mt-4 pt-5 border-t" style={{ borderColor: '#1f2937' }}>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Add a reply</h3>
          <textarea
            className="w-full rounded-lg border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 transition-colors text-gray-300 placeholder-gray-600"
            style={{
              backgroundColor: '#0a0a0f',
              borderColor: '#2d3748',
              minHeight: '100px',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
            placeholder="Share your thoughts or scholarly perspective..."
          />
          <div className="flex justify-end mt-3">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            >
              Post reply
            </button>
          </div>
        </div>
      </div>

      {/* Back link */}
      <Link
        to={`/topic/${topicSlug}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to {topic.name}
      </Link>
    </main>
  )
}
