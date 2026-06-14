import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { topics } from '../data/posts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import ErrorBanner from '../components/ErrorBanner'
import LoadingSpinner from '../components/LoadingSpinner'
import PrimaryButton from '../components/PrimaryButton'
import { formatFileSize } from '../utils/format'
import { validateFiles } from '../utils/fileValidation'

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
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [fileError, setFileError] = useState(null)
  const [uploading, setUploading] = useState(false)

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
          id, title, views, created_at, author_id,
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

  useEffect(() => {
    setShowForm(false)
    setTitle('')
    setDescription('')
    setSelectedFiles([])
    setFileError(null)
    setFormError(null)
  }, [topicSlug])

  async function handleNewPost(e) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    if (selectedFiles.length === 0) {
      const { error } = await supabase.from('posts').insert({
        title,
        description,
        topic_slug: topicSlug,
        author_id: user.id,
      })
      if (error) {
        setFormError(error.message)
        setSubmitting(false)
      } else {
        resetForm()
        setPostsVersion((v) => v + 1)
      }
      return
    }

    // Upload files first
    let uploadedFiles = []
    try {
      uploadedFiles = await uploadFiles(selectedFiles)
    } catch (uploadErr) {
      setFormError(uploadErr.message)
      setSubmitting(false)
      return
    }

    // Insert post and retrieve its id
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        title,
        description,
        topic_slug: topicSlug,
        author_id: user.id,
      })
      .select('id')
      .single()

    if (postError) {
      // Clean up already-uploaded files to avoid orphans in Storage
      await supabase.storage
        .from('post-attachments')
        .remove(uploadedFiles.map((f) => f.file_path))
      setFormError(postError.message)
      setSubmitting(false)
      return
    }

    // Save file metadata to file_attachments table
    try {
      await saveFileAttachments(postData.id, uploadedFiles)
    } catch (saveErr) {
      setFormError(saveErr.message)
      setSubmitting(false)
      return
    }

    // Full success
    setSelectedFiles([])
    resetForm()
    setPostsVersion((v) => v + 1)
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setShowForm(false)
    setSubmitting(false)
  }

  function handleFileChange(e) {
    setFileError(null)
    const { valid, errors } = validateFiles(Array.from(e.target.files))
    if (errors.length > 0) setFileError(errors.join('\n'))
    if (valid.length > 0) setSelectedFiles((prev) => [...prev, ...valid])
    e.target.value = ''
  }

  function removeFile(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadFiles(files) {
    setUploading(true)
    try {
      const results = []
      for (const file of files) {
        const path = `${topicSlug}/${Date.now()}_${file.name}`
        const { error } = await supabase.storage
          .from('post-attachments')
          .upload(path, file)
        if (error) throw new Error(`"${file.name}": ${error.message}`)
        results.push({
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          mime_type: file.type,
        })
      }
      return results
    } finally {
      setUploading(false)
    }
  }

  async function saveFileAttachments(postId, uploadedFiles) {
    const records = uploadedFiles.map((f) => ({
      post_id: postId,
      file_name: f.file_name,
      file_path: f.file_path,
      file_size: f.file_size,
      mime_type: f.mime_type,
    }))
    const { error } = await supabase.from('file_attachments').insert(records)
    if (error) throw new Error(error.message)
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
            <h1 className="font-display text-2xl font-semibold text-white">{topic.name}</h1>
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
            className="px-4 py-2 text-xs font-medium rounded-md transition-all border"
            style={showForm
              ? { borderColor: '#374151', backgroundColor: 'transparent', color: '#9ca3af' }
              : { backgroundColor: topic.accentColor, borderColor: topic.accentColor, color: '#fff' }
            }
            onMouseEnter={(e) => {
              if (showForm) {
                e.currentTarget.style.color = '#fff'
              } else {
                e.currentTarget.style.filter = 'brightness(0.88)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = ''
              if (showForm) e.currentTarget.style.color = '#9ca3af'
            }}
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
          {formError && <ErrorBanner className="mb-4">{formError}</ErrorBanner>}
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
                className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 bg-[#0a0a0f] focus:outline-none transition-colors"
                placeholder="What do you want to discuss?"
                maxLength={100}
              />
              <p
                className="text-xs text-right mt-1"
                style={{ color: 100 - title.length < 20 ? '#ef4444' : '#6b7280' }}
              >
                {100 - title.length} / 100
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 bg-[#0a0a0f] focus:outline-none transition-colors resize-none"
                style={{ minHeight: '100px' }}
                placeholder="Provide context, background, or your argument…"
                maxLength={750}
              />
              <p
                className="text-xs text-right mt-1"
                style={{ color: 750 - description.length < 75 ? '#ef4444' : '#6b7280' }}
              >
                {750 - description.length} / 750
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Attachments <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              {fileError && <ErrorBanner preWrap className="mb-2">{fileError}</ErrorBanner>}
              <label
                className="flex items-center gap-2 w-full rounded-lg border border-[#2d3748] hover:border-indigo-600 px-3 py-2.5 text-sm cursor-pointer transition-colors bg-[#0a0a0f] text-gray-500"
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
              <PrimaryButton type="submit" loading={submitting} accent={topic.accentColor} className="px-5 py-2">
                {submitting ? 'Posting…' : 'Post discussion'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {postsLoading && (
        <div className="py-16 text-center">
          <LoadingSpinner color={topic.accentColor} />
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
            className="text-xs font-medium transition-colors text-indigo-400 hover:text-indigo-300"
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
          {user ? (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-medium transition-colors text-indigo-400 hover:text-indigo-300"
            >
              Start the first discussion →
            </button>
          ) : (
            <p className="text-gray-600 text-xs">Sign in to start the first discussion.</p>
          )}
        </div>
      )}

      {/* Posts */}
      {!postsLoading && !postsError && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} topicSlug={topicSlug} />
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
