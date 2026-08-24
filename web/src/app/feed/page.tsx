import { FeedGrid } from '@/components/feed-grid'
import { FeedPostView } from '@/components/post-card'
import { SearchBar } from '@/components/search-bar'
import { getToken } from '@/lib/auth'
import Link from 'next/link'

async function getFeed(token: string | null) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/feed`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  })

  return response.json() as Promise<{ posts: FeedPostView[]; nextCursor: string | null }>
}

// This one route renders both the discovery feed and the personalised
// feed with identical markup. The distinction is resolved server-side, in
// GetFeedUseCase branching on whether a verified token is present
// (Challenge 9's tryVerifyJwt), not by two separate frontend routes -- the
// two feeds are the same concept (a scored, chronological post stream)
// with different inputs, not two different UIs.
export default async function FeedPage() {
  const token = await getToken()
  const { posts } = await getFeed(token)

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <header className="max-w-5xl mx-auto px-4 pt-8 pb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-sm tracking-[var(--tracking-eyebrow)] uppercase text-[var(--color-ink-muted)]">
            Feed
          </span>
          <Link
            href="/create-post"
            className="rounded-full bg-[var(--color-ink)] text-[var(--color-ink-inverse)] text-sm px-4 py-1.5"
          >
            New post
          </Link>
        </div>
        <SearchBar />
      </header>
      <main className="max-w-5xl mx-auto px-4 pb-16">
        {!!posts && posts.length === 0 && (
          <p className="text-sm text-[var(--color-ink-muted)]">
            No posts yet. Be the first to{' '}
            <Link href="/create-post" className="text-[var(--color-ink)] hover:underline">
              create one
            </Link>
            !
          </p>
        )}
        <FeedGrid posts={posts} />
      </main>
    </div>
  )
}
