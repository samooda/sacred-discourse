import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'
import LoadingSpinner from '../components/LoadingSpinner'
import PrimaryButton from '../components/PrimaryButton'
import TopicGroupedPosts from '../components/TopicGroupedPosts'
import LoadMoreButton from '../components/LoadMoreButton'

const PAGE_SIZE = 10
const POST_SELECT = `
  id, title, views, topic_slug, created_at, author_id,
  profiles ( display_name ),
  replies ( id )
`

export default function ProfilePage() {
  const { userId } = useParams()
  const { user, refreshProfile } = useAuth()

  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [posts, setPosts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [postsLoading, setPostsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [postsError, setPostsError] = useState(null)

  const [showEditForm, setShowEditForm] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editFile, setEditFile] = useState(null)
  const [editPreview, setEditPreview] = useState(null)
  const [editFileError, setEditFileError] = useState(null)
  const [editError, setEditError] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const isOwnProfile = user && user.id === userId

  useEffect(() => {
    async function fetchProfile() {
      setProfileLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', userId)
        .single()
      if (error || !data) {
        setNotFound(true)
      } else {
        setProfile(data)
      }
      setProfileLoading(false)
    }
    fetchProfile()
  }, [userId])

  useEffect(() => {
    async function fetchPosts() {
      setPostsLoading(true)
      setPostsError(null)
      const { data, count, error } = await supabase
        .from('posts')
        .select(POST_SELECT, { count: 'exact' })
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1)
      if (error) {
        setPostsError(error.message)
      } else {
        setPosts(data || [])
        setTotalCount(count ?? 0)
      }
      setPostsLoading(false)
    }
    fetchPosts()
  }, [userId])

  async function loadMore() {
    setLoadingMore(true)
    setPostsError(null)
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .range(posts.length, posts.length + PAGE_SIZE - 1)
    if (error) {
      setPostsError(error.message)
    } else {
      setPosts((prev) => [...prev, ...(data || [])])
    }
    setLoadingMore(false)
  }

  function startEdit() {
    setEditDisplayName(profile.display_name || '')
    setEditFile(null)
    setEditPreview(profile.avatar_url || null)
    setEditFileError(null)
    setEditError(null)
    setShowEditForm(true)
  }

  function cancelEdit() {
    setShowEditForm(false)
    setEditFile(null)
    setEditPreview(null)
    setEditFileError(null)
    setEditError(null)
  }

  function handleFileChange(e) {
    setEditFileError(null)
    const file = e.target.files[0]
    if (!file) return
    const allowed = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
    const maxSize = 5 * 1024 * 1024
    if (!allowed.has(file.type)) {
      setEditFileError('File type not allowed. Use JPEG, PNG, GIF, or WebP.')
      e.target.value = ''
      return
    }
    if (file.size > maxSize) {
      setEditFileError('File exceeds the 5 MB size limit.')
      e.target.value = ''
      return
    }
    setEditFile(file)
    setEditPreview(URL.createObjectURL(file))
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    setEditError(null)
    setEditSubmitting(true)

    let newAvatarUrl = profile.avatar_url

    try {
      if (editFile) {
        if (profile.avatar_url) {
          const marker = '/avatars/'
          const idx = profile.avatar_url.indexOf(marker)
          if (idx !== -1) {
            const oldPath = profile.avatar_url.substring(idx + marker.length)
            await supabase.storage.from('avatars').remove([oldPath])
          }
        }
        const ext = editFile.name.split('.').pop()
        const path = `${userId}/avatar_${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, editFile)
        if (uploadErr) throw new Error(uploadErr.message)
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        newAvatarUrl = urlData.publicUrl
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          display_name: editDisplayName,
          avatar_url: newAvatarUrl,
        })
        .eq('id', userId)
      if (updateErr) throw new Error(updateErr.message)

      setProfile((p) => ({
        ...p,
        display_name: editDisplayName,
        avatar_url: newAvatarUrl,
      }))
      await refreshProfile()
      cancelEdit()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setEditSubmitting(false)
    }
  }

  if (notFound) return <Navigate to="/" replace />

  if (profileLoading || !profile) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="py-16 text-center">
          <LoadingSpinner />
          <p className="text-gray-600 text-sm mt-3">Loading profile…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 gap-3">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden flex-shrink-0"
          style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{profile.display_name?.[0]?.toUpperCase() ?? '?'}</span>
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold text-white break-words">{profile.display_name}</h1>
          {isOwnProfile && !showEditForm && (
            <button
              onClick={startEdit}
              className="mt-3 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors text-gray-400 hover:text-white"
              style={{ borderColor: '#374151', backgroundColor: 'transparent' }}
            >
              Edit profile
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {isOwnProfile && showEditForm && (
        <div
          className="rounded-xl border p-6 mb-10"
          style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
        >
          <h3 className="text-sm font-semibold text-white mb-4">Edit profile</h3>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Display name</label>
              <input
                type="text"
                required
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="w-full rounded-lg border border-[#2d3748] focus:border-indigo-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 bg-[#0a0a0f] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Profile picture</label>
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}
                >
                  {editPreview ? (
                    <img src={editPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>{editDisplayName?.[0]?.toUpperCase() ?? '?'}</span>
                  )}
                </div>
                <span className="text-xs text-gray-600">Preview</span>
              </div>
              {editFileError && <ErrorBanner className="mb-2">{editFileError}</ErrorBanner>}
              <label
                className="flex items-center gap-2 w-full rounded-lg border border-[#2d3748] hover:border-indigo-600 px-3 py-2.5 text-sm cursor-pointer transition-colors bg-[#0a0a0f] text-gray-500"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{editFile ? editFile.name : 'Choose image…'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <p className="text-xs text-gray-600 mt-1.5">JPEG, PNG, GIF, or WebP. Max 5 MB.</p>
            </div>
            {editError && <ErrorBanner>{editError}</ErrorBanner>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:text-white border"
                style={{ backgroundColor: 'transparent', borderColor: '#374151' }}
              >
                Cancel
              </button>
              <PrimaryButton type="submit" loading={editSubmitting} className="px-5 py-2">
                {editSubmitting ? 'Saving…' : 'Save'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      )}

      {/* Posts */}
      {postsLoading && (
        <div className="py-16 text-center">
          <LoadingSpinner />
          <p className="text-gray-600 text-sm mt-3">Loading posts…</p>
        </div>
      )}

      {!postsLoading && postsError && (
        <ErrorBanner>{postsError}</ErrorBanner>
      )}

      {!postsLoading && !postsError && posts.length > 0 && (
        <h2 className="text-lg font-semibold text-white mb-6 break-words">
          {profile.display_name}'s posts
          <span className="ml-2 text-sm font-normal text-gray-500">({totalCount})</span>
        </h2>
      )}

      {!postsLoading && !postsError && (
        <>
          <TopicGroupedPosts
            posts={posts}
            emptyState={
              <div
                className="rounded-xl border py-16 text-center"
                style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
              >
                <p className="text-gray-400 text-sm font-medium mb-1">No posts yet</p>
                <p className="text-gray-600 text-xs">
                  {isOwnProfile ? 'Your discussions will appear here.' : 'This user has not posted yet.'}
                </p>
              </div>
            }
          />
          {posts.length < totalCount && (
            <LoadMoreButton onClick={loadMore} loading={loadingMore} />
          )}
        </>
      )}
    </main>
  )
}
