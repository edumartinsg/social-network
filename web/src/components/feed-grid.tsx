import { PostCard, FeedPostView } from './post-card'

interface FeedGridProps {
  posts: FeedPostView[]
}

// CSS columns, not a JS masonry library. A true masonry layout solves a
// bin-packing problem, reordering items to minimise gaps -- this feed never
// needs that, since reading order (top to bottom, left to right) matters
// more here than perfect packing. That makes the zero-dependency native
// approach the correct trade-off, not just the cheaper one.
export function FeedGrid({ posts }: FeedGridProps) {
  if (posts.length === 0) {
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
