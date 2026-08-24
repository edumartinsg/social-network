import { FeedGrid } from '@/components/feed-grid'
import { FeedPostView } from '@/components/post-card'
import { notFound } from 'next/navigation'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

async function getPostsByAuthor(username: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${username}/posts`,
    { cache: 'no-store' },
  )

  if (response.status === 404) return null
  return response.json() as Promise<{
    author: { username: string; avatarUrl: string | null }
    posts: FeedPostView[]
  }>
}

// Same FeedGrid, same PostCard, different data source -- the brief's own
// requirement that the logged-in user's feed and this profile share one
// visual model, with the route (not the component) doing the distinguishing.
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const data = await getPostsByAuthor(username)

  if (!data) notFound()

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <header className="max-w-5xl mx-auto px-4 pt-10 pb-6 flex flex-col items-center gap-3">
        <span className="w-20 h-20 rounded-full bg-[var(--color-line)] overflow-hidden block relative" />
        <p className="text-sm text-[var(--color-ink)]">@{data.author.username}</p>
      </header>
      <main className="max-w-5xl mx-auto px-4 pb-16">
        <FeedGrid posts={data.posts} />
      </main>
    </div>
  )
}
