import { FeedPostView, PostCard } from './post-card'

interface FeedGridProps {
  posts: FeedPostView[] | undefined
  linkToProfile?: boolean
  emptyMessage?: string
}

export function FeedGrid({
  posts,
  linkToProfile = true,
  emptyMessage = 'Nothing here yet.',
}: FeedGridProps) {
  if (!posts || posts.length === 0) {
    return (
      <p className="text-sm text-[var(--color-ink-muted)] text-center py-20">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} linkToProfile={linkToProfile} />
      ))}
    </div>
  )
}
