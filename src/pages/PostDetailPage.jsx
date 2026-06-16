import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { topics } from '../data/posts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'
import LoadingSpinner from '../components/LoadingSpinner'
import PrimaryButton from '../components/PrimaryButton'
import { formatDate } from '../utils/format'
import EditPostForm from '../components/post-detail/EditPostForm'
import AttachmentViewer from '../components/post-detail/AttachmentViewer'
import ReplyCard from '../components/post-detail/ReplyCard'
import FullscreenImageModal from '../components/post-detail/FullscreenImageModal'

const PostDetailContext = createContext(null)
export function usePostDetail() { return useContext(PostDetailContext) }

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
  const [postGone, setPostGone] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const [attachments, setAttachments] = useState([])
  const [expandedAttachment, setExpandedAttachment] = useState(null)
  const [fullscreenImage, setFullscreenImage] = useState(null)

  const [showEditForm, setShowEditForm] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editExistingAttachments, setEditExistingAttachments] = useState([])
  const [editNewFiles, setEditNewFiles] = useState([])
  const [editFileError, setEditFileError] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState(null)

  const [postLikeCount, setPostLikeCount] = useState(0)
  const [postLikedByUser, setPostLikedByUser] = useState(false)

  const [replyLikes, setReplyLikes] = useState({})
  const [deleteReplyErrors, setDeleteReplyErrors] = useState({})
  const [expandedReplies, setExpandedReplies] = useState(new Set())

  const repliesEndRef = useRef(null)

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
        .select('*, profiles ( display_name, avatar_url )')
        .eq('id', postId)
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setPost(data)

      // Increment views for every visitor except the post's own author —
      // logged-out (anon) visitors count too. Uses an RPC so the bump is
      // atomic and runs as owner, bypassing the author-only UPDATE policy.
      if (!user || user.id !== data.author_id) {
        try {
          await supabase.rpc('increment_post_views', { p_post_id: postId })
          setPost((prev) => ({ ...prev, views: (data.views ?? 0) + 1 }))
        } catch (_) {
          // A failed view bump is non-critical; ignore it.
        }
      }

      setLoading(false)
    }

    loadPost()
    // `user` is intentionally excluded: re-running on auth change would re-increment views.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, topicSlug])

  // Effect 2: fetch replies and their like counts.
  // repliesVersion is incremented by handleReply to reload after a new reply
  // without triggering Effect 1.
  useEffect(() => {
    if (!topic) return

    async function loadReplies() {
      setRepliesError(null)

      const { data, error } = await supabase
        .from('replies')
        .select('*, profiles ( display_name, avatar_url )')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        setRepliesError(error.message)
      } else {
        const replyData = data || []
        setReplies(replyData)

        if (replyData.length > 0) {
          const ids = replyData.map((r) => r.id)
          const { data: likesData } = await supabase
            .from('likes')
            .select('reply_id, user_id')
            .in('reply_id', ids)

          const likesMap = {}
          for (const id of ids) likesMap[id] = { count: 0, likedByUser: false }
          for (const like of (likesData || [])) {
            if (likesMap[like.reply_id]) {
              likesMap[like.reply_id].count++
              if (user && like.user_id === user.id) likesMap[like.reply_id].likedByUser = true
            }
          }
          setReplyLikes(likesMap)
        } else {
          setReplyLikes({})
        }
      }
    }

    loadReplies()
    // `user` is included so each reply's likedByUser flag recomputes on login/logout.
  }, [postId, topicSlug, repliesVersion, user, topic])

  // Effect 3: fetch file attachments for this post.
  useEffect(() => {
    async function loadAttachments() {
      const { data } = await supabase
        .from('file_attachments')
        .select('*')
        .eq('post_id', postId)
      setAttachments(data || [])
    }
    loadAttachments()
  }, [postId])

  // Effect 4: fetch like count and whether the current user has liked this post.
  useEffect(() => {
    async function loadLikes() {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
      setPostLikeCount(count ?? 0)

      if (user) {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()
        setPostLikedByUser(!!data)
      } else {
        setPostLikedByUser(false)
      }
    }
    loadLikes()
  }, [postId, user])

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
      if (error.message.toLowerCase().includes('foreign key constraint')) {
        setPostGone(true)
      } else {
        setReplyError(error.message)
      }
      setSubmitting(false)
    } else {
      setReplyText('')
      setSubmitting(false)
      setRepliesVersion((v) => v + 1)
      repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)

    // Fetch Storage paths for any files attached to this post
    const { data: attachments } = await supabase
      .from('file_attachments')
      .select('file_path')
      .eq('post_id', postId)

    // Delete files from Storage before removing the post row.
    // A failure here is logged but does not block the post deletion.
    if (attachments && attachments.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('post-attachments')
        .remove(attachments.map((a) => a.file_path))
      if (storageError) {
        console.error('Storage deletion failed:', storageError.message)
      }
    }

    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) {
      setDeleteError(error.message)
      setDeleting(false)
      setConfirmDelete(false)
    } else {
      navigate(`/topic/${topicSlug}`)
    }
  }

  function openEditForm() {
    setEditTitle(post.title)
    setEditDescription(post.description)
    setEditExistingAttachments([...attachments])
    setEditNewFiles([])
    setEditFileError(null)
    setShowEditForm(true)
  }

  function cancelEdit() {
    setShowEditForm(false)
    setEditTitle('')
    setEditDescription('')
    setEditExistingAttachments([])
    setEditNewFiles([])
    setEditFileError(null)
  }

  async function handleSaveEdit() {
    if (!editTitle.trim() || !editDescription.trim()) {
      setEditError('Title and description are required.')
      return
    }

    setEditError(null)
    setEditSubmitting(true)

    try {
      // Upload any new files
      const uploadedFiles = []
      for (const file of editNewFiles) {
        const path = `${topicSlug}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('post-attachments')
          .upload(path, file)
        if (uploadError) throw new Error(`"${file.name}": ${uploadError.message}`)
        uploadedFiles.push({
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          mime_type: file.type,
        })
      }

      // Delete removed attachments from Storage and file_attachments table
      const removedAttachments = attachments.filter(
        (a) => !editExistingAttachments.some((ea) => ea.id === a.id)
      )
      if (removedAttachments.length > 0) {
        await supabase.storage
          .from('post-attachments')
          .remove(removedAttachments.map((a) => a.file_path))
        const { error: deleteRowsError } = await supabase
          .from('file_attachments')
          .delete()
          .in('id', removedAttachments.map((a) => a.id))
        if (deleteRowsError) throw new Error(deleteRowsError.message)
      }

      // Update the post row
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim(),
          is_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
      if (updateError) throw new Error(updateError.message)

      // Insert metadata rows for newly uploaded files
      if (uploadedFiles.length > 0) {
        const records = uploadedFiles.map((f) => ({
          post_id: postId,
          file_name: f.file_name,
          file_path: f.file_path,
          file_size: f.file_size,
          mime_type: f.mime_type,
        }))
        const { error: insertError } = await supabase
          .from('file_attachments')
          .insert(records)
        if (insertError) throw new Error(insertError.message)
      }

      // Update local post state
      setPost((prev) => ({
        ...prev,
        title: editTitle.trim(),
        description: editDescription.trim(),
        is_edited: true,
      }))

      // Reload attachments from Supabase
      const { data: freshAttachments } = await supabase
        .from('file_attachments')
        .select('*')
        .eq('post_id', postId)
      setAttachments(freshAttachments || [])

      cancelEdit()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setEditSubmitting(false)
    }
  }

  async function toggleReplyLike(replyId) {
    if (!user) return

    const current = replyLikes[replyId] ?? { count: 0, likedByUser: false }
    const wasLiked = current.likedByUser

    setReplyLikes((prev) => ({
      ...prev,
      [replyId]: { count: wasLiked ? current.count - 1 : current.count + 1, likedByUser: !wasLiked },
    }))

    if (wasLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('reply_id', replyId)
        .eq('user_id', user.id)
      if (error) setReplyLikes((prev) => ({ ...prev, [replyId]: current }))
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ reply_id: replyId, user_id: user.id })
      // 23505 = like already exists (unique constraint); treat as a no-op success.
      if (error && error.code !== '23505') setReplyLikes((prev) => ({ ...prev, [replyId]: current }))
    }
  }

  async function togglePostLike() {
    if (!user) return

    const wasLiked = postLikedByUser
    setPostLikedByUser(!wasLiked)
    setPostLikeCount((c) => (wasLiked ? c - 1 : c + 1))

    if (wasLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      if (error) {
        setPostLikedByUser(wasLiked)
        setPostLikeCount((c) => (wasLiked ? c + 1 : c - 1))
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: user.id })
      // 23505 = like already exists (unique constraint); treat as a no-op success.
      if (error && error.code !== '23505') {
        setPostLikedByUser(wasLiked)
        setPostLikeCount((c) => (wasLiked ? c + 1 : c - 1))
      }
    }
  }

  async function deleteReply(replyId) {
    const { error } = await supabase
      .from('replies')
      .delete()
      .eq('id', replyId)

    if (error) {
      setDeleteReplyErrors((prev) => ({ ...prev, [replyId]: error.message }))
      setTimeout(() => {
        setDeleteReplyErrors((prev) => {
          const next = { ...prev }
          delete next[replyId]
          return next
        })
      }, 3000)
    } else {
      setReplies((prev) => prev.filter((r) => r.id !== replyId))
      setReplyLikes((prev) => {
        const next = { ...prev }
        delete next[replyId]
        return next
      })
    }
  }

  if (!topic) return <Navigate to="/" replace />
  if (!loading && notFound) return <Navigate to={`/topic/${topicSlug}`} replace />

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="py-24 text-center">
          <LoadingSpinner color={topic.accentColor} />
          <p className="text-gray-600 text-sm mt-3">Loading post…</p>
        </div>
      </main>
    )
  }

  const contextValue = {
    user, post, topic,
    replyLikes, toggleReplyLike,
    deleteReply, deleteReplyErrors,
    expandedReplies, setExpandedReplies,
    attachments, expandedAttachment, setExpandedAttachment,
    fullscreenImage, setFullscreenImage,
    editTitle, setEditTitle,
    editDescription, setEditDescription,
    editExistingAttachments, setEditExistingAttachments,
    editNewFiles, setEditNewFiles,
    editFileError, setEditFileError,
    editSubmitting, editError,
    handleSaveEdit, cancelEdit,
  }

  return (
    <PostDetailContext.Provider value={contextValue}>
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
        <span className="text-gray-400 truncate max-w-md">{post.title}</span>
      </nav>

      {/* Post header */}
      <div
        className="rounded-xl border overflow-hidden mb-6"
        style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
      >
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(to right, ${topic.gradientFrom}, ${topic.gradientTo})`,
          }}
        />
        <div className="p-6 sm:p-8">
          {/* Title */}
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white leading-tight mb-4 break-words">
            {post.title}
          </h1>

          {/* Meta — row 1: author + date */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: topic.accentColor + '33', color: topic.accentColor }}
            >
              {post.profiles?.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  alt={post.profiles.display_name ?? 'avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(post.profiles?.display_name ?? '?')[0].toUpperCase()}</span>
              )}
            </div>
            <Link
              to={`/profile/${post.author_id}`}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {post.profiles?.display_name ?? 'Unknown'}
            </Link>
            <span className="text-gray-600">·</span>
            <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
            {post.is_edited && (
              <span className="text-xs text-gray-600 italic">Edited</span>
            )}
          </div>

          {/* Meta — row 2: engagement stats */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{post.views ?? 0} views</span>
            <span className="text-gray-700">·</span>
            <span>{replies.length} replies</span>
            <span className="text-gray-700">·</span>
            <button
              onClick={togglePostLike}
              className="flex items-center gap-1.5 transition-colors"
              style={{ color: postLikedByUser ? '#ef4444' : '#6b7280' }}
              onMouseEnter={(e) => { if (!postLikedByUser) e.currentTarget.style.color = '#9ca3af' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = postLikedByUser ? '#ef4444' : '#6b7280' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                {postLikedByUser ? (
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
              <span>{postLikeCount}</span>
            </button>
          </div>

          {/* Delete — visible to post author only */}
          {user?.id === post.author_id && (
            <div className="mt-5 pt-5 border-t" style={{ borderColor: '#1f2937' }}>
              {!confirmDelete ? (
                <div className="flex items-center gap-2">
                  {!showEditForm && (
                    <button
                      onClick={openEditForm}
                      className="px-3 py-1.5 rounded-md text-xs font-medium border transition-colors text-gray-400 hover:text-gray-100 hover:border-gray-500"
                      style={{ borderColor: '#374151', backgroundColor: 'transparent' }}
                    >
                      Edit post
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
                    style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', backgroundColor: 'rgba(239,68,68,0.08)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)' }}
                  >
                    Delete post
                  </button>
                </div>
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
        {showEditForm ? (
          <EditPostForm />
        ) : (
          <>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-4">Discussion</p>
            <p className="text-gray-300 leading-relaxed text-base mb-6 break-words">
              {post.description}
            </p>
            <AttachmentViewer />
          </>
        )}
      </div>

      {/* Replies section */}
      <div
        className="rounded-xl border p-6 sm:p-8 mb-6"
        style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
      >
        <h2 className="font-display text-lg font-semibold text-white mb-6">
          Replies{' '}
          <span
            className="ml-1 px-2 py-0.5 rounded-full text-xs font-normal"
            style={{ backgroundColor: '#1f2937', color: '#9ca3af' }}
          >
            {replies.length}
          </span>
        </h2>

        {/* Reply form — logged-in users only */}
        {user ? (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Add a reply</h3>
            {postGone ? (
              <ErrorBanner className="mb-3">
                <p className="mb-2">This post no longer exists. It may have been deleted.</p>
                <Link
                  to={`/topic/${topicSlug}`}
                  className="underline underline-offset-2 transition-colors text-red-300 hover:text-white"
                >
                  Back to {topic.name}
                </Link>
              </ErrorBanner>
            ) : replyError ? (
              <ErrorBanner className="mb-3">{replyError}</ErrorBanner>
            ) : null}
            <form onSubmit={handleReply}>
              <textarea
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-4 py-3 text-sm resize-none focus:outline-none transition-colors text-gray-300 placeholder-gray-600 bg-[#0a0a0f]"
                style={{ minHeight: '100px' }}
                placeholder="Share your thoughts or scholarly perspective…"
                maxLength={2000}
              />
              <p
                className="text-xs text-right mt-1"
                style={{ color: 2000 - replyText.length < 100 ? '#ef4444' : '#6b7280' }}
              >
                {2000 - replyText.length} / 2000
              </p>
              <div className="flex justify-end mt-3">
                <PrimaryButton type="submit" loading={submitting} accent={topic.accentColor} className="px-4 py-2">
                  {submitting ? 'Posting…' : 'Post reply'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        ) : (
          <div
            className="mb-6 rounded-lg border px-4 py-4"
            style={{ borderColor: '#1f2937', backgroundColor: '#0d0d17' }}
          >
            <p className="text-sm text-gray-400 mb-3">Join the discussion</p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium transition-all text-white"
              style={{ backgroundColor: '#5c4ef8' }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.88)' }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = '' }}
            >
              Sign in to reply
            </Link>
          </div>
        )}

        {/* Replies fetch error */}
        {repliesError && (
          <ErrorBanner className="mb-4">Failed to load replies: {repliesError}</ErrorBanner>
        )}

        {/* Reply list */}
        {!repliesError && replies.length === 0 && (
          <p className="text-gray-600 text-sm">
            No replies yet. Be the first to respond.
          </p>
        )}
        {!repliesError && replies.length > 0 && (
          <div>
            {replies.map((reply, i) => (
              <ReplyCard key={reply.id} reply={reply} isLast={i === replies.length - 1} />
            ))}
          </div>
        )}
        <div ref={repliesEndRef} />
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

      <FullscreenImageModal />
    </main>
    </PostDetailContext.Provider>
  )
}
