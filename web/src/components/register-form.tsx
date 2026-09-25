'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RegisterForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, age: Number(age) }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message ?? 'Registration failed')
      }

      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)] focus:border-[var(--color-ink)]"
        required
        minLength={2}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)] focus:border-[var(--color-ink)]"
        required
      />

      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)] focus:border-[var(--color-ink)]"
        required
        min={18}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)] focus:border-[var(--color-ink)]"
        required
      />

      <p className="text-xs text-[var(--color-ink-faint)] -mt-1">
        At least 8 characters, with an uppercase letter, a number and a symbol.
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-[var(--radius-control)] bg-[var(--color-ink)] text-[var(--color-ink-inverse)] py-2.5 text-sm font-medium mt-1 disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {isSubmitting ? 'Creating account...' : 'Sign up'}
      </button>
    </form>
  )
}
