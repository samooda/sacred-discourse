import { Link } from 'react-router-dom'
import { topics, posts } from '../data/posts'

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b"
        style={{ borderColor: '#1f2937' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,70,229,0.18) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border"
            style={{
              backgroundColor: 'rgba(79,70,229,0.15)',
              borderColor: 'rgba(79,70,229,0.4)',
              color: '#a5b4fc',
            }}
          >
            Debate · Inquiry · Community
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Where every belief is tested{' '}
            <span style={{ color: '#818cf8' }}>by reason</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sacred Discourse is a debate forum where scholars, believers, skeptics, and
            seekers come together to challenge ideas, defend convictions, and pursue truth
            through honest, rigorous discourse across the world's great religious traditions.
          </p>
          <Link
              to="/topic/christianity"
              className="px-6 py-3 rounded-lg font-medium text-sm transition-colors"
              style={{ backgroundColor: '#4f46e5', color: '#e0e7ff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            >
              Browse discussions
            </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section
        className="border-b"
        style={{ borderColor: '#1f2937', backgroundColor: '#0d0d17' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-8 justify-center">
          {[
            { label: 'Topics', value: '4' },
            { label: 'Posts', value: '16' },
            { label: 'Traditions covered', value: '4' },
            { label: 'Open discussion', value: '∞' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Topic cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Explore traditions</h2>
          <p className="text-gray-500 text-sm">
            Select a section to view discussions, read posts, and join the conversation.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {topics.map((topic) => {
            const topicPosts = posts[topic.slug] || []
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
                          {topicPosts.length} posts
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
                  {/* Recent post preview */}
                  {topicPosts[0] && (
                    <div
                      className="rounded-lg p-3 border"
                      style={{ backgroundColor: '#0a0a0f', borderColor: '#1f2937' }}
                    >
                      <p className="text-xs text-gray-500 mb-1">Latest post</p>
                      <p className="text-sm text-gray-300 font-medium leading-snug line-clamp-2">
                        {topicPosts[0].title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-600">
                          {topicPosts[0].author}
                        </span>
                        <span className="text-xs text-gray-700">·</span>
                        <span className="text-xs text-gray-600">
                          {topicPosts[0].replies} replies
                        </span>
                      </div>
                    </div>
                  )}
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
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
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
