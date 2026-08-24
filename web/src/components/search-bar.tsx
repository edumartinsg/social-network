'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface UserResult {
  username: string
  avatarUrl: string | null
}

interface PostResult {
  postId: string
  title: string
  similarity: number
}

// One input, two result kinds, fetched in parallel. Splitting this into
// separate "search posts" and "search users" bars would put the backend's
// own taxonomy on display: someone looking for something does not know or
// care that one result type is pgvector similarity and the other a
// username lookup. That distinction stays an implementation detail.
export function SearchBar() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<UserResult[]>([])
  const [posts, setPosts] = useState<PostResult[]>([])
  const [isOpen, setIsOpen] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    const [userRes, postRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/search?q=${encodeURIComponent(query)}`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/search?q=${encodeURIComponent(query)}`),
    ])

    const userData = await userRes.json()
    const postData = await postRes.json()

    setUsers(userData.results ?? [])
    setPosts(postData.results ?? [])
    setIsOpen(true)
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(Boolean(users.length || posts.length))}
          placeholder="Search people or photos"
          className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)]"
        />
      </form>

      {isOpen && (users.length > 0 || posts.length > 0) && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg overflow-hidden">
          {users.length > 0 && (
            <div className="p-3 border-b border-[var(--color-line)]">
              <p className="text-xs uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-ink-muted)] mb-2">
                People
              </p>
              {users.map((user) => (
                <Link
                  key={user.username}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2 py-1.5"
                >
                  <span className="w-6 h-6 rounded-full bg-[var(--color-line)] overflow-hidden block relative">
                    {user.avatarUrl && (
                      <Image src={user.avatarUrl} alt="" fill className="object-cover" />
                    )}
                  </span>
                  <span className="text-sm text-[var(--color-ink)]">@{user.username}</span>
                </Link>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div className="p-3">
              <p className="text-xs uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-ink-muted)] mb-2">
                Photos
              </p>
              {posts.map((post) => (
                <p key={post.postId} className="text-sm text-[var(--color-ink)] py-1">
                  {post.title}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
