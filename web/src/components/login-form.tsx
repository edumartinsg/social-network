'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

// One field, two possible shapes. Whether identifier reads as an email or
// a username is resolved server-side (authenticate-user-use-case.ts), so
// this form has no client-side branching logic to keep in sync with that
// rule -- it just forwards whatever the person typed.
export function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      setError(data.message ?? 'Login failed')
      return
    }

    router.push('/feed')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto flex flex-col gap-3">
      <h1 className="text-xl font-medium text-[var(--color-ink)] mb-2">Log in</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        placeholder="Email or username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)]"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-md border border-[var(--color-line)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)]"
        required
      />
      <button
        type="submit"
        className="rounded-md bg-[var(--color-ink)] text-[var(--color-ink-inverse)] py-2 text-sm font-medium mt-1"
      >
        Log in
      </button>
      <a href="/register" className="text-center text-sm text-[var(--color-ink-muted)] mt-1">
        Don&apos;t have an account? Sign up
      </a>
    </form>
  )
}
