import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { topics } from '../data/posts'
import { supabase } from '../lib/supabase'
import PostCard from '../components/PostCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 3) {
      setResults([])
      return
    }

    async function runSearch() {
      setLoading(true)
      setResults([])
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, title, description, topic_slug, created_at, author_id,
          profiles ( display_name ),
          replies ( id )
        `)
        .textSearch('search_vector', q, { type: 'websearch', config: 'english' })
      if (!error) {
        setResults(data || [])
      }
      setLoading(false)
    }

    runSearch()
  }, [query])

  const resultsByTopic = topics
    .map((t) => ({ topic: t, posts: results.filter((p) => p.topic_slug === t.slug) }))
    .filter((g) => g.posts.length > 0)

  if (query.trim().length < 3) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="py-20 text-center">
          <p className="text-gray-400 text-sm font-medium mb-1">Enter a search term</p>
          <p className="text-gray-600 text-xs">Type at least 3 characters in the search bar and press Enter.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">
        {loading ? (
          <>Searching for <span style={{ color: '#818cf8' }}>'{query}'</span>…</>
        ) : (
          <>
            {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
            <span style={{ color: '#818cf8' }}>'{query}'</span>
          </>
        )}
      </h1>

      {loading && (
        <div className="py-16 text-center">
          <LoadingSpinner />
          <p className="text-gray-600 text-sm mt-3">Searching…</p>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div
          className="rounded-xl border py-16 text-center"
          style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
        >
          <p className="text-gray-400 text-sm font-medium mb-1">No results for '{query}'</p>
          <p className="text-gray-600 text-xs">Try different keywords or check your spelling.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-10">
          {resultsByTopic.map(({ topic, posts }) => (
            <section key={topic.slug}>
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: topic.accentColor }}
              >
                {topic.name}
              </h2>
              <div className="space-y-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} topicSlug={post.topic_slug} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
