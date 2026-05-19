import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { topics } from '../data/posts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / 1024).toFixed(1) + ' KB'
}

export default function TopicPage() {
  const { topicSlug } = useParams()
  const { user } = useAuth()
  const topic = topics.find((t) => t.slug === topicSlug)

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState(null)
  // Incrementing this triggers a re-fetch without re-running the slug effect.
  const [postsVersion, setPostsVersion] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])

  // Moved fetch logic inside the effect so all its dependencies are in scope
  // and the eslint-plugin-react-hooks dep array is correct.
  useEffect(() => {
    if (!topic) return

    async function fetchPosts() {
      setPostsLoading(true)
      setPostsError(null)

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, title, description, tags, views, created_at, author_id,
          profiles ( display_name ),
          replies ( id )
        `)
        .eq('topic_slug', topicSlug)
        .order('created_at', { ascending: false })

      if (error) {
        setPostsError(error.message)
      } else {
        setPosts(data || [])
      }
      setPostsLoading(false)
    }

    fetchPosts()
  }, [topicSlug, postsVersion]) // postsVersion lets handleNewPost trigger a reload

  async function handleNewPost(e) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const { error } = await supabase.from('posts').insert({
      title,
      description,
      topic_slug: topicSlug,
      author_id: user.id,
      tags: parsedTags,
    })

    if (error) {
      setFormError(error.message)
      setSubmitting(false)
    } else {
      setTitle('')
      setDescription('')
      setTags('')
      setShowForm(false)
      setSubmitting(false)
      setPostsVersion((v) => v + 1)
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    setSelectedFiles((prev) => [...prev, ...files])
    e.target.value = ''
  }

  function removeFile(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  if (!topic) return <Navigate to="/" replace />

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
            <span className="text-2xl font-bold text-white">{posts.length}</span>
            <span className="text-xs text-gray-500">discussions</span>
          </div>
        </div>
      </div>

      {/* Post list header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Discussions
        </h2>
        {user && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors text-gray-400 hover:text-white"
            style={{ borderColor: '#374151', backgroundColor: 'transparent' }}
          >
            {showForm ? 'Cancel' : '+ New post'}
          </button>
        )}
      </div>

      {/* New post form */}
      {showForm && (
        <div
          className="rounded-xl border p-6 mb-6"
          style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
        >
          <h3 className="text-sm font-semibold text-white mb-4">New discussion</h3>
          {formError && (
            <div
              className="rounded-lg px-4 py-3 mb-4 text-sm border"
              style={{
                backgroundColor: 'rgba(239,68,68,0.08)',
                borderColor: 'rgba(239,68,68,0.3)',
                color: '#fca5a5',
              }}
            >
              {formError}
            </div>
          )}
          <form onSubmit={handleNewPost} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
                placeholder="What do you want to discuss?"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors resize-none"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', minHeight: '100px' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
                placeholder="Provide context, background, or your argument…"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Tags{' '}
                <span className="text-gray-600 font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
                placeholder="History, Theology, Ethics"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Attachments <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <label
                className="flex items-center gap-2 w-full rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', color: '#6b7280' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>Choose files…</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.pptx,.docx"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              {selectedFiles.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {selectedFiles.map((file, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs border"
                      style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                    >
                      <span className="text-gray-300 truncate mr-2">{file.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-600">{formatFileSize(file.size)}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-gray-600 hover:text-gray-300 transition-colors leading-none"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#4338ca' }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
              >
                {submitting ? 'Posting…' : 'Post discussion'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {postsLoading && (
        <div className="py-16 text-center">
          <div
            className="inline-block w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: topic.accentColor, borderTopColor: 'transparent' }}
          />
          <p className="text-gray-600 text-sm mt-3">Loading discussions…</p>
        </div>
      )}

      {/* Fetch error state */}
      {!postsLoading && postsError && (
        <div
          className="rounded-xl border py-10 text-center"
          style={{ borderColor: 'rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.05)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: '#fca5a5' }}>
            Failed to load discussions
          </p>
          <p className="text-xs text-gray-600 mb-4">{postsError}</p>
          <button
            onClick={() => setPostsVersion((v) => v + 1)}
            className="text-xs font-medium transition-colors"
            style={{ color: '#818cf8' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!postsLoading && !postsError && posts.length === 0 && (
        <div
          className="rounded-xl border py-16 text-center"
          style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl mx-auto mb-4"
            style={{ backgroundColor: topic.accentColor + '22', color: topic.accentColor }}
          >
            {topic.symbol}
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">No discussions yet</p>
          <p className="text-gray-600 text-xs">
            {user
              ? 'Be the first to start a discussion.'
              : 'Sign in to start the first discussion.'}
          </p>
        </div>
      )}

      {/* Posts */}
      {!postsLoading && !postsError && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
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
                  <h3 className="font-semibold text-white text-base leading-snug mb-2 group-hover:text-indigo-300 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {(post.tags || []).map((tag) => (
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
                      <span className="text-gray-500">
                        {post.profiles?.display_name ?? 'Unknown'}
                      </span>
                      {' · '}
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
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
      )}

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
