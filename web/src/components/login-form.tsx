'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message ?? 'Login failed')
      }

      router.push('/feed')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <input
        placeholder="Email or username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        autoComplete="username"
        className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)] focus:border-[var(--color-ink)]"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)] focus:border-[var(--color-ink)]"
        required
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-[var(--radius-control)] bg-[var(--color-ink)] text-[var(--color-ink-inverse)] py-2.5 text-sm font-medium mt-1 disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}
