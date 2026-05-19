import { useState, useEffect } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { topics } from '../data/posts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / 1024).toFixed(1) + ' KB'
}

function getFileIcon(mimeType) {
  if (mimeType === 'application/pdf')
    return { color: '#ef4444', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  if (mimeType.startsWith('image/'))
    return { color: '#22c55e', path: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
    return { color: '#f97316', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    return { color: '#3b82f6', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  return { color: '#9ca3af', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
}

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
  const [editTags, setEditTags] = useState('')
  const [editExistingAttachments, setEditExistingAttachments] = useState([])
  const [editNewFiles, setEditNewFiles] = useState([])
  const [editFileError, setEditFileError] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState(null)

  const [postLikeCount, setPostLikeCount] = useState(0)
  const [postLikedByUser, setPostLikedByUser] = useState(false)

  const [replyLikes, setReplyLikes] = useState({})
  const [expandedReplies, setExpandedReplies] = useState(new Set())

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

  // Effect 2: fetch replies and their like counts.
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
  }, [postId, topicSlug, repliesVersion])

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
    setEditTags((post.tags || []).join(', '))
    setEditExistingAttachments([...attachments])
    setEditNewFiles([])
    setEditFileError(null)
    setShowEditForm(true)
  }

  function cancelEdit() {
    setShowEditForm(false)
    setEditTitle('')
    setEditDescription('')
    setEditTags('')
    setEditExistingAttachments([])
    setEditNewFiles([])
    setEditFileError(null)
  }

  function handleEditFileChange(e) {
    setEditFileError(null)
    const files = Array.from(e.target.files)
    const allowedTypes = new Set([
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])
    const maxSize = 50 * 1024 * 1024
    const errors = []
    const valid = []
    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`"${file.name}": exceeds the 50 MB size limit`)
      } else if (!allowedTypes.has(file.type)) {
        errors.push(`"${file.name}": file type not allowed`)
      } else {
        valid.push(file)
      }
    }
    if (errors.length > 0) setEditFileError(errors.join('\n'))
    if (valid.length > 0) setEditNewFiles((prev) => [...prev, ...valid])
    e.target.value = ''
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
      const parsedTags = editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim(),
          tags: parsedTags,
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
        tags: parsedTags,
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
      if (error) setReplyLikes((prev) => ({ ...prev, [replyId]: current }))
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
      if (error) {
        setPostLikedByUser(wasLiked)
        setPostLikeCount((c) => (wasLiked ? c + 1 : c - 1))
      }
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
            {post.is_edited && (
              <span className="text-xs text-gray-600">Edited</span>
            )}
            <span>·</span>
            <span>{(post.views ?? 0) + 1} views</span>
            <span>·</span>
            <span>{replies.length} replies</span>
            <span>·</span>
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
                <div className="flex items-center gap-4">
                  <button
                    onClick={openEditForm}
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#9ca3af' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#e5e7eb')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    Edit post
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#f87171' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#f87171')}
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
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Edit post</h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors resize-none"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', minHeight: '120px' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Tags <span className="text-gray-600 font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2d3748')}
                placeholder="History, Theology, Ethics"
              />
            </div>

            {/* Existing attachments */}
            {editExistingAttachments.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Existing attachments
                </label>
                <ul className="space-y-1">
                  {editExistingAttachments.map((att) => (
                    <li
                      key={att.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs border"
                      style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                    >
                      <span className="text-gray-300 truncate mr-2">{att.file_name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditExistingAttachments((prev) => prev.filter((a) => a.id !== att.id))
                        }
                        className="text-xs font-medium flex-shrink-0 transition-colors"
                        style={{ color: '#f87171' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#f87171')}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* New file picker */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Add attachments <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              {editFileError && (
                <div
                  className="rounded-lg px-4 py-3 mb-2 text-sm border"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    borderColor: 'rgba(239,68,68,0.3)',
                    color: '#fca5a5',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {editFileError}
                </div>
              )}
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
                  onChange={handleEditFileChange}
                  className="sr-only"
                />
              </label>
              {editNewFiles.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {editNewFiles.map((file, i) => (
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
                          onClick={() =>
                            setEditNewFiles((prev) => prev.filter((_, idx) => idx !== i))
                          }
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

            {/* Save / Cancel */}
            {editError && (
              <div
                className="rounded-lg px-4 py-3 text-sm border"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  borderColor: 'rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                }}
              >
                {editError}
              </div>
            )}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={editSubmitting}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
                onMouseEnter={(e) => { if (!editSubmitting) e.currentTarget.style.backgroundColor = '#4338ca' }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
              >
                {editSubmitting ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-300 leading-relaxed text-base mb-6">
              {post.description}
            </p>

            {attachments.length > 0 && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: '#1f2937' }}>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Attachments
                </h3>
                <div className="space-y-2">
                  {attachments.map((attachment) => {
                    const icon = getFileIcon(attachment.mime_type)
                    const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/post-attachments/${attachment.file_path}`
                    return (
                      <div key={attachment.id}>
                        <div
                          className="flex items-center gap-3 rounded-lg border px-4 py-3"
                          style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748' }}
                        >
                          <svg
                            className="w-5 h-5 flex-shrink-0"
                            style={{ color: icon.color }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon.path} />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 truncate">{attachment.file_name}</p>
                            <p className="text-xs text-gray-600">{formatFileSize(attachment.file_size)}</p>
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
                            style={{ borderColor: '#374151', backgroundColor: 'transparent', color: '#9ca3af' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#4f46e5'
                              e.currentTarget.style.color = '#ffffff'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#374151'
                              e.currentTarget.style.color = '#9ca3af'
                            }}
                          >
                            Download
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedAttachment(
                                expandedAttachment === attachment.id ? null : attachment.id
                              )
                            }
                            className="flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
                            style={{ borderColor: '#374151', backgroundColor: 'transparent', color: '#9ca3af' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#4f46e5'
                              e.currentTarget.style.color = '#ffffff'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#374151'
                              e.currentTarget.style.color = '#9ca3af'
                            }}
                          >
                            {expandedAttachment === attachment.id ? 'Close' : 'Preview'}
                          </button>
                        </div>
                        {expandedAttachment === attachment.id && (
                          attachment.mime_type === 'application/pdf' ? (
                            <div
                              className="rounded-lg border overflow-hidden"
                              style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', marginTop: '8px' }}
                            >
                              <p className="text-xs text-gray-600 px-3 pt-2 pb-1">Loading PDF…</p>
                              <iframe
                                src={url}
                                style={{ width: '100%', height: '500px', border: 'none' }}
                              />
                            </div>
                          ) : attachment.mime_type.startsWith('image/') ? (
                            <div
                              className="rounded-lg border p-4"
                              style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', marginTop: '8px' }}
                            >
                              <img
                                src={url}
                                alt={attachment.file_name}
                                className="rounded-lg"
                                style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }}
                                onClick={() => setFullscreenImage(url)}
                              />
                            </div>
                          ) : attachment.mime_type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || attachment.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                            <div
                              className="rounded-lg border overflow-hidden"
                              style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', marginTop: '8px' }}
                            >
                              <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                                style={{ width: '100%', height: '500px', border: 'none' }}
                              />
                            </div>
                          ) : (
                            <div
                              className="rounded-lg border flex items-center justify-center"
                              style={{ backgroundColor: '#0a0a0f', borderColor: '#2d3748', marginTop: '8px', padding: '24px' }}
                            >
                              <p className="text-gray-600 text-sm">Preview not available for this file type</p>
                            </div>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
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
                </div>
                <p className="text-gray-400 text-sm leading-relaxed pl-10 break-all">
                  {reply.content.length > 300 ? (
                    <>
                      {expandedReplies.has(reply.id)
                        ? reply.content
                        : reply.content.slice(0, 300) + '…'}
                      {' '}
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
                        className="text-xs font-medium transition-colors"
                        style={{ color: '#818cf8' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
                      >
                        {expandedReplies.has(reply.id) ? 'Show less' : 'Show more'}
                      </button>
                    </>
                  ) : reply.content}
                </p>
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
            {postGone ? (
              <div
                className="rounded-lg px-4 py-3 mb-3 text-sm border"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  borderColor: 'rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                }}
              >
                <p className="mb-2">This post no longer exists. It may have been deleted.</p>
                <Link
                  to={`/topic/${topicSlug}`}
                  className="underline underline-offset-2 transition-colors"
                  style={{ color: '#fca5a5' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#fca5a5')}
                >
                  Back to {topic.name}
                </Link>
              </div>
            ) : replyError ? (
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
            ) : null}
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
                maxLength={2000}
              />
              <p
                className="text-xs text-right mt-1"
                style={{ color: 2000 - replyText.length < 100 ? '#ef4444' : '#6b7280' }}
              >
                {2000 - replyText.length} / 2000
              </p>
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

      {/* Fullscreen image modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white text-3xl font-light leading-none hover:text-gray-300 transition-colors"
          >
            ×
          </button>
          <img
            src={fullscreenImage}
            alt=""
            style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  )
}
