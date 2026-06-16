import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { topics } from '../data/posts'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [postCounts, setPostCounts] = useState({})
  const [latestPosts, setLatestPosts] = useState({})

  useEffect(() => {
    async function fetchData() {
      // One RPC returns per-topic count + latest title/author, instead of
      // fetching every post row and grouping client-side.
      const { data } = await supabase.rpc('topic_summaries')

      if (data) {
        const counts = {}
        const latest = {}
        for (const row of data) {
          counts[row.topic_slug] = Number(row.post_count)
          latest[row.topic_slug] = row.latest_title
            ? { title: row.latest_title, author: row.latest_author }
            : null
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
        <div className="mb-8">
          <h2 className="font-display text-3xl font-semibold text-white">Explore traditions</h2>
        </div>
        <div className="space-y-4">
          {topics.map((topic) => {
            const latestPost = latestPosts[topic.slug]
            return (
              <Link
                key={topic.slug}
                to={`/topic/${topic.slug}`}
                className="group block rounded-xl border overflow-hidden transition-all duration-200"
                style={{
                  backgroundColor: '#111118',
                  borderColor: '#1f2937',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = topic.accentColor + '55'
                  e.currentTarget.style.boxShadow = `0 4px 24px ${topic.accentColor}14`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1f2937'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Thin gradient accent bar */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(to right, ${topic.gradientFrom}, ${topic.gradientTo})`,
                  }}
                />
                <div className="p-5 sm:p-6 flex items-start gap-4">
                  {/* Symbol */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: topic.accentColor + '22', color: topic.accentColor }}
                  >
                    {topic.symbol}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1.5">
                      <h3 className="font-display font-semibold text-lg text-white transition-colors">
                        {topic.name}
                      </h3>
                      <span className="text-xs text-gray-600 flex-shrink-0">
                        {postCounts[topic.slug] ?? 0} posts
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-2">
                      {topic.description}
                    </p>
                    {latestPost ? (
                      <p className="text-xs text-gray-600 truncate">
                        Latest: <span className="text-gray-400">{latestPost.title}</span>
                        {' · '}{latestPost.author ?? 'Unknown'}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-700">No posts yet</p>
                    )}
                  </div>
                  {/* Arrow */}
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors mt-1.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
              >
                SD
              </div>
              <span className="text-sm text-gray-500">Sacred Discourse</span>
            </div>
            <div className="flex items-center gap-5">
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  to={`/topic/${topic.slug}`}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  <span>{topic.symbol}</span>
                  <span>{topic.name.split(' ')[0]}</span>
                </Link>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-700 mt-5">
            Respectful scholarly discussion of world religions and secular philosophy.
          </p>
        </div>
      </footer>
    </main>
  )
}
