'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface UserResult {
  id: string
  username: string
  avatarUrl: string | null
}

interface PostResult {
  postId: string
  title: string
  similarity: number
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<UserResult[]>([])
  const [posts, setPosts] = useState<PostResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setUsers([])
      setPosts([])
      setIsOpen(false)
      return
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const [userRes, postRes] = await Promise.all([
          fetch(`/api/search/users?q=${encodeURIComponent(query)}`),
          fetch(`/api/search/posts?query=${encodeURIComponent(query)}`),
        ])

        const userData = userRes.ok ? await userRes.json() : { results: [] }
        const postData = postRes.ok ? await postRes.json() : { results: [] }

        setUsers(userData.results ?? [])
        setPosts(postData.results ?? [])
        setIsOpen(true)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasResults = users.length > 0 || posts.length > 0

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)] pointer-events-none">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setIsOpen(true)}
          placeholder="Search people or photos"
          className="w-full rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-surface)] pl-9 pr-4 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)] focus:border-[var(--color-ink)]"
        />
      </div>

      {isOpen && (
        <div className="absolute z-30 mt-2 w-full rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-raised)] overflow-hidden max-h-96 overflow-y-auto">
          {!hasResults && !isSearching && (
            <p className="px-4 py-6 text-sm text-[var(--color-ink-muted)] text-center">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {users.length > 0 && (
            <div className="p-2 border-b border-[var(--color-line)]">
              <p className="px-2 py-1.5 text-[10px] uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-ink-faint)]">
                People
              </p>
              {users.map((user) => (
                <Link
                  key={user.username}
                  href={`/profile/${user.username}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-control)] hover:bg-[var(--color-surface-sunken)]"
                >
                  <span className="relative w-7 h-7 rounded-full overflow-hidden bg-[var(--color-surface-sunken)] block shrink-0">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt="" fill className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-[var(--color-ink-faint)]">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-[var(--color-ink)]">@{user.username}</span>
                </Link>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1.5 text-[10px] uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-ink-faint)]">
                Photos
              </p>
              {posts.map((post) => (
                <p
                  key={post.postId}
                  className="px-2 py-2 text-sm text-[var(--color-ink)] flex items-center justify-between gap-3"
                >
                  <span className="truncate">{post.title}</span>
                  <span className="text-[10px] text-[var(--color-ink-faint)] shrink-0 tabular-nums">
                    {(post.similarity * 100).toFixed(0)}%
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
