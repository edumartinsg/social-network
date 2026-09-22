import { FeedGrid } from '@/components/feed-grid'
import { FeedPostView } from '@/components/post-card'
import { ProfileHeader } from '@/components/profile-header'
import { apiFetch } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface ProfileResponse {
  author: { id: string; username: string; avatarUrl: string | null }
  posts: FeedPostView[]
}

export default async function MePage() {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  const response = await apiFetch(`/users/${user.username}/posts`, { auth: true })
  const data: ProfileResponse | null = response.ok ? await response.json() : null

  const posts = data?.posts ?? []

  return (
    <div className="min-h-screen">
      <ProfileHeader
        username={user.username}
        avatarUrl={user.avatarUrl}
        postCount={posts.length}
        isOwnProfile
        canFollow={false}
        userId={user.id}
        isFollowing={false}
      />

      <div className="max-w-5xl mx-auto px-4 border-t border-[var(--color-line)] pt-6 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-ink-faint)]">
          Your posts
        </span>
        <Link
          href="/create-post"
          className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          New post
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-16">
        <FeedGrid
          posts={posts}
          linkToProfile={false}
          emptyMessage="You haven't posted anything yet."
        />
      </main>
    </div>
  )
}
