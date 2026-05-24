import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ErrorBanner from '../components/ErrorBanner'
import LoadingSpinner from '../components/LoadingSpinner'
import TopicGroupedPosts from '../components/TopicGroupedPosts'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 3) {
      setResults([])
      setError(null)
      return
    }

    async function runSearch() {
      setLoading(true)
      setResults([])
      setError(null)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, title, topic_slug, created_at, author_id,
          profiles ( display_name ),
          replies ( id )
        `)
        .textSearch('search_vector', q, { type: 'websearch', config: 'english' })
      if (error) {
        setError(error.message)
      } else {
        setResults(data || [])
      }
      setLoading(false)
    }

    runSearch()
  }, [query])

  if (query.trim().length < 3) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div
          className="rounded-xl border py-16 text-center"
          style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
        >
          <svg
            className="w-8 h-8 text-gray-600 mx-auto mb-3"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-400 text-sm font-medium mb-1">Search across all traditions</p>
          <p className="text-gray-600 text-xs">Type at least 3 characters and press Enter.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-8">
        {loading ? (
          <>Searching for <span style={{ color: '#a5b4fc' }}>'{query}'</span>…</>
        ) : error ? (
          <>Search failed</>
        ) : (
          <>
            {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
            <span style={{ color: '#a5b4fc' }}>'{query}'</span>
          </>
        )}
      </h1>

      {loading && (
        <div className="py-16 text-center">
          <LoadingSpinner />
          <p className="text-gray-600 text-sm mt-3">Searching…</p>
        </div>
      )}

      {!loading && error && (
        <ErrorBanner>Search failed. Please try again.</ErrorBanner>
      )}

      {!loading && !error && results.length === 0 && (
        <div
          className="rounded-xl border py-16 text-center"
          style={{ borderColor: '#1f2937', backgroundColor: '#111118' }}
        >
          <p className="text-gray-400 text-sm font-medium mb-1">No results for '{query}'</p>
          <p className="text-gray-600 text-xs">Try different keywords or check your spelling.</p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <TopicGroupedPosts posts={results} />
      )}
    </main>
  )
}
