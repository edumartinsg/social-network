import { FeedGrid } from '@/components/feed-grid'
import { FeedPostView } from '@/components/post-card'
import { SearchBar } from '@/components/search-bar'
import { apiFetch } from '@/lib/api'
import { getToken } from '@/lib/auth'
import Link from 'next/link'

async function getFeed(): Promise<{ posts: FeedPostView[] }> {
  const response = await apiFetch('/posts/feed', { auth: true })
  console.log('FEED FETCH STATUS:', response.status)
  if (!response.ok) {
    const body = await response.text()
    console.log('FEED FETCH BODY:', body)
    return { posts: [] }
  }
  return response.json()
}
export default async function FeedPage() {
  const [{ posts }, token] = await Promise.all([getFeed(), getToken()])

  return (
    <div className="min-h-screen">
      <header className="max-w-5xl mx-auto px-4 pt-6 pb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchBar />
        {token && (
          <Link
            href="/create-post"
            className="hidden md:inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-ink)] text-[var(--color-ink-inverse)] text-sm px-4 py-2 hover:opacity-90 transition-opacity"
          >
            New post
          </Link>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        <FeedGrid
          posts={posts}
          emptyMessage={
            token
              ? 'Nothing here yet. Share the first photo.'
              : 'Nothing here yet. Log in to start posting.'
          }
        />
      </main>
    </div>
  )
}
