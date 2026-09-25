'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface FollowButtonProps {
  userId: string
  initialIsFollowing: boolean
}

export function FollowButton({ userId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleClick() {
    const previous = isFollowing
    setIsFollowing(!previous)

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: previous ? 'DELETE' : 'POST',
      })

      if (!response.ok) throw new Error('Request failed')

      startTransition(() => router.refresh())
    } catch {
      setIsFollowing(previous)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-[var(--radius-pill)] px-5 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
        isFollowing
          ? 'border border-[var(--color-line-strong)] text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]'
          : 'bg-[var(--color-ink)] text-[var(--color-ink-inverse)] hover:opacity-90'
      }`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
