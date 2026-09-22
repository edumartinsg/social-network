import { FeedGrid } from '@/components/feed-grid'
import { FeedPostView } from '@/components/post-card'
import { ProfileHeader } from '@/components/profile-header'
import { apiFetch } from '@/lib/api'
import { getToken } from '@/lib/auth'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

interface ProfileResponse {
  author: { id: string; username: string; avatarUrl: string | null }
  isFollowing: boolean
  isOwnProfile: boolean
  posts: FeedPostView[]
}

async function getProfile(username: string): Promise<ProfileResponse | null> {
  const response = await apiFetch(`/users/${username}/posts`, { auth: true })
  if (response.status === 404) return null
  if (!response.ok) return null
  return response.json()
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params
  return { title: `@${username}` }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const [data, token] = await Promise.all([getProfile(username), getToken()])

  if (!data) notFound()
  if (data.isOwnProfile) redirect('/me')

  return (
    <div className="min-h-screen">
      <ProfileHeader
        username={data.author.username}
        avatarUrl={data.author.avatarUrl}
        postCount={data.posts.length}
        isOwnProfile={false}
        canFollow={Boolean(token)}
        userId={data.author.id}
        isFollowing={data.isFollowing}
      />

      <div className="max-w-5xl mx-auto px-4 border-t border-[var(--color-line)] pt-6">
        <span className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-ink-faint)]">
          Posts
        </span>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-16">
        <FeedGrid
          posts={data.posts}
          linkToProfile={false}
          emptyMessage={`@${data.author.username} hasn't posted anything yet.`}
        />
      </main>
    </div>
  )
}
