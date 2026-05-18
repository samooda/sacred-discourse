import { useState, useEffect } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { topics } from '../data/posts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function PostDetailPage() {
  const { topicSlug, postId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const topic = topics.find((t) => t.slug === topicSlug)

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [replies, setReplies] = useState([])
  const [repliesError, setRepliesError] = useState(null)
  // Incrementing this triggers a replies re-fetch without re-fetching the post
  // (which would also re-increment the view count).
  const [repliesVersion, setRepliesVersion] = useState(0)

  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyError, setReplyError] = useState(null)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  // Effect 1: fetch the post and increment views.
  // Runs when postId or topicSlug changes. Kept separate from the replies
  // effect so that reloading replies after a new reply does not re-increment views.
  useEffect(() => {
    if (!topic) return

    async function loadPost() {
      setLoading(true)
      setNotFound(false)

      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles ( display_name )')
        .eq('id', postId)
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setPost(data)

      // Increment views only when a non-author is viewing.
      // Skips logged-out users and the post's own author.
      if (user && user.id !== data.author_id) {
        try {
          await supabase
            .from('posts')
            .update({ views: (data.views ?? 0) + 1 })
            .eq('id', postId)
        } catch (_) {}
      }

      setLoading(false)
    }

    loadPost()
  }, [postId, topicSlug])

  // Effect 2: fetch replies.
  // repliesVersion is incremented by handleReply to reload after a new reply
  // without triggering Effect 1.
  useEffect(() => {
    if (!topic) return

    async function loadReplies() {
      setRepliesError(null)

      const { data, error } = await supabase
        .from('replies')
        .select('*, profiles ( display_name )')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        setRepliesError(error.message)
      } else {
        setReplies(data || [])
      }
    }

    loadReplies()
  }, [postId, topicSlug, repliesVersion])

  async function handleReply(e) {
    e.preventDefault()
    setReplyError(null)
    setSubmitting(true)

    const { error } = await supabase.from('replies').insert({
      post_id: postId,
      author_id: user.id,
      content: replyText, // column is named 'content', not 'body'
    })

    if (error) {
      setReplyError(error.message)
      setSubmitting(false)
    } else {
      setReplyText('')
      setSubmitting(false)
      setRepliesVersion((v) => v + 1)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) {
      setDeleteError(error.message)
      setDeleting(false)
      setConfirmDelete(false)
    } else {
      navigate(`/topic/${topicSlug}`)
    }
  }

  if (!topic) return <Navigate to="/" replace />
  if (!loading && notFound) return <Navigate to={`/topic/${topicSlug}`} replace />

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="py-24 text-center">
          <div
            className="inline-block w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: topic.accentColor, borderTopColor: 'transparent' }}
          />
          <p className="text-gray-600 text-sm mt-3">Loading post…</p>
        </div>
      </main>
    )
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
                {(post.profiles?.display_name ?? '?')[0].toUpperCase()}
              </div>
              <span className="text-gray-400">{post.profiles?.display_name ?? 'Unknown'}</span>
            </div>
            <span>·</span>
            <span>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span>·</span>
            <span>{(post.views ?? 0) + 1} views</span>
            <span>·</span>
            <span>{replies.length} replies</span>
          </div>

          {/* Delete — visible to post author only */}
          {user?.id === post.author_id && (
            <div className="mt-5 pt-5 border-t" style={{ borderColor: '#1f2937' }}>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#f87171' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#f87171')}
                >
                  Delete post
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-gray-400">
                    Are you sure you want to delete this post?
                  </span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.12)',
                      color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.3)',
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  {deleteError && (
                    <span className="text-xs" style={{ color: '#fca5a5' }}>
                      {deleteError}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
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

      {/* Replies section */}
      <div
        className="rounded-xl border p-6 sm:p-8 mb-6"
        style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
      >
        <h2 className="font-semibold text-white mb-6">
          Replies{' '}
          <span
            className="ml-1 px-2 py-0.5 rounded-full text-xs font-normal"
            style={{ backgroundColor: '#1f2937', color: '#9ca3af' }}
          >
            {replies.length}
          </span>
        </h2>

        {/* Replies fetch error */}
        {repliesError && (
          <div
            className="rounded-lg px-4 py-3 mb-4 text-sm border"
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              borderColor: 'rgba(239,68,68,0.3)',
              color: '#fca5a5',
            }}
          >
            Failed to load replies: {repliesError}
          </div>
        )}

        {/* Reply list */}
        {!repliesError && replies.length === 0 && (
          <p className="text-gray-600 text-sm mb-6">
            No replies yet. Be the first to respond.
          </p>
        )}
        {!repliesError && replies.length > 0 && (
          <div>
            {replies.map((reply, i) => (
              <div
                key={reply.id}
                className={`pb-5 ${i < replies.length - 1 ? 'mb-5 border-b' : ''}`}
                style={{ borderColor: '#1f2937' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: topic.accentColor + '33', color: topic.accentColor }}
                  >
                    {(reply.profiles?.display_name ?? '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {reply.profiles?.display_name ?? 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(reply.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed pl-10">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reply form — logged-in users only */}
        {user ? (
          <div
            className={replies.length > 0 ? 'mt-4 pt-5 border-t' : ''}
            style={{ borderColor: '#1f2937' }}
          >
            <h3 className="text-sm font-medium text-gray-400 mb-3">Add a reply</h3>
            {replyError && (
              <div
                className="rounded-lg px-4 py-3 mb-3 text-sm border"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  borderColor: 'rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                }}
              >
                {replyError}
              </div>
            )}
            <form onSubmit={handleReply}>
              <textarea
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 text-sm resize-none focus:outline-none transition-colors text-gray-300 placeholder-gray-600"
                style={{
                  backgroundColor: '#0a0a0f',
                  borderColor: '#2d3748',
                  minHeight: '100px',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
                placeholder="Share your thoughts or scholarly perspective…"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#4338ca' }}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
                >
                  {submitting ? 'Posting…' : 'Post reply'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div
            className={replies.length > 0 ? 'mt-4 pt-5 border-t' : ''}
            style={{ borderColor: '#1f2937' }}
          >
            <p className="text-sm text-gray-600">
              <Link
                to="/login"
                className="transition-colors"
                style={{ color: '#818cf8' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
              >
                Sign in
              </Link>
              {' '}to join the discussion.
            </p>
          </div>
        )}
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
