import { topics } from '../data/posts'
import PostCard from './PostCard'

export default function TopicGroupedPosts({ posts, emptyState }) {
  const groups = topics
    .map((t) => ({ topic: t, posts: posts.filter((p) => p.topic_slug === t.slug) }))
    .filter((g) => g.posts.length > 0)

  if (groups.length === 0) return emptyState ?? null

  return (
    <div className="space-y-10">
      {groups.map(({ topic, posts: topicPosts }) => (
        <section key={topic.slug}>
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: topic.accentColor }}
          >
            {topic.name}
          </h3>
          <div className="space-y-3">
            {topicPosts.map((post) => (
              <PostCard key={post.id} post={post} topicSlug={post.topic_slug} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
