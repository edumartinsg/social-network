import { FeedPostView, PostCard } from './post-card'

interface FeedGridProps {
  posts: FeedPostView[]
}

export function FeedGrid({ posts }: FeedGridProps) {
  if (!posts || posts.length === 0) {
    return (
      <p className="text-sm text-[var(--color-ink-muted)] text-center py-16">
        Nothing here yet.
      </p>
    )
  }

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
