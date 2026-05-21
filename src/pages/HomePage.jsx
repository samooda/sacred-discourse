import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { topics } from '../data/posts'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [postCounts, setPostCounts] = useState({})
  const [latestPosts, setLatestPosts] = useState({})

  useEffect(() => {
    async function fetchData() {
      // Single query for both post counts and latest-post previews.
      // Ordered newest-first so the first result per slug is the latest post.
      const { data } = await supabase
        .from('posts')
        .select('topic_slug, title, profiles ( display_name )')
        .order('created_at', { ascending: false })

      if (data) {
        const counts = {}
        const latest = {}
        for (const t of topics) {
          const forTopic = data.filter((p) => p.topic_slug === t.slug)
          counts[t.slug] = forTopic.length
          latest[t.slug] = forTopic[0] ?? null
        }
        setPostCounts(counts)
        setLatestPosts(latest)
      }
    }
    fetchData()
  }, [])

  return (
    <main>
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b"
        style={{ borderColor: '#1f2937' }}
      >
        {/* Background — indigo crown + topic color bleeds from bottom corners */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(79,70,229,0.22) 0%, transparent 65%)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 55% 45% at 5% 110%, rgba(34,197,94,0.1) 0%, transparent 55%)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 55% 45% at 95% 110%, rgba(59,130,246,0.1) 0%, transparent 55%)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 text-center relative">
          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white mb-6 leading-[1.1] tracking-tight">
            Where every belief is{' '}
            <span className="italic" style={{ color: '#a5b4fc' }}>tested by reason</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            A forum for scholars, believers, skeptics, and seekers — challenging ideas
            and pursuing truth across the world's great religious traditions.
          </p>

          {/* Per-topic CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                to={`/topic/${topic.slug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border"
                style={{
                  backgroundColor: `${topic.accentColor}12`,
                  borderColor: `${topic.accentColor}30`,
                  color: topic.accentColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${topic.accentColor}28`
                  e.currentTarget.style.borderColor = `${topic.accentColor}55`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${topic.accentColor}12`
                  e.currentTarget.style.borderColor = `${topic.accentColor}30`
                }}
              >
                <span>{topic.symbol}</span>
                <span>{topic.name.split(' ')[0]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Topic cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h2 className="font-display text-3xl font-semibold text-white">Explore traditions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {topics.map((topic) => {
            const latestPost = latestPosts[topic.slug]
            return (
              <Link
                key={topic.slug}
                to={`/topic/${topic.slug}`}
                className="group block rounded-xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: '#111118',
                  borderColor: '#1f2937',
                  boxShadow: '0 0 0 0 transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = topic.accentColor + '55'
                  e.currentTarget.style.boxShadow = `0 4px 24px ${topic.accentColor}18`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1f2937'
                  e.currentTarget.style.boxShadow = '0 0 0 0 transparent'
                }}
              >
                {/* Card header gradient */}
                <div
                  className="h-2 w-full"
                  style={{
                    background: `linear-gradient(to right, ${topic.gradientFrom}, ${topic.gradientTo})`,
                  }}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{
                          backgroundColor: topic.accentColor + '22',
                          color: topic.accentColor,
                        }}
                      >
                        {topic.symbol}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg group-hover:text-white transition-colors">
                          {topic.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {postCounts[topic.slug] ?? 0} posts
                        </span>
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors mt-1"
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
                  {/* Latest post preview */}
                  <div
                    className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: '#0a0a0f',
                      borderColor: '#1f2937',
                      borderLeftColor: `${topic.accentColor}55`,
                      borderLeftWidth: '3px',
                    }}
                  >
                    <p className="text-xs text-gray-500 mb-1">Latest post</p>
                    {latestPost ? (
                      <>
                        <p className="text-sm text-gray-300 font-medium leading-snug line-clamp-2">
                          {latestPost.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-600">
                            {latestPost.profiles?.display_name ?? 'Unknown'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">No posts yet</p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t mt-8"
        style={{ borderColor: '#1f2937', backgroundColor: '#0d0d17' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
            >
              SD
            </div>
            <span className="text-sm text-gray-500">Sacred Discourse</span>
          </div>
          <p className="text-xs text-gray-700">
            Respectful scholarly discussion of world religions and secular philosophy.
          </p>
        </div>
      </footer>
    </main>
  )
}
